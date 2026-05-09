import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp, 
  onSnapshot, 
  query, 
  where,
  orderBy,
  limit,
  getDoc,
  increment
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/utils';
import { Ride, RideStatus, RideCategory, PaymentMethod } from '../types';
import { recordPayment } from './paymentService';
import { addPointsAfterRide } from './clubKettoService';
import { payRideWithKettoPay } from './walletService';

export const requestRide = async (rideData: Omit<Ride, 'id' | 'status' | 'criado_em'>) => {
  try {
    const rideRef = await addDoc(collection(db, 'rides'), {
      ...rideData,
      status: 'solicitada',
      criado_em: serverTimestamp(),
    });
    return rideRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'rides');
  }
};

export const payForRide = async (rideId: string, userId: string, amount: number, method: PaymentMethod) => {
  if (method === 'kettopay') {
    return await payRideWithKettoPay(rideId, userId, amount);
  }
  return true;
};

export const updateRideStatus = async (rideId: string, status: RideStatus, extraData: Partial<Ride> = {}, currentRide?: Ride) => {
  try {
    const rideDoc = doc(db, 'rides', rideId);
    
    // Logic for finished ride
    let paymentUpdate = {};
    if (status === 'finalizada') {
      let ride = currentRide;
      if (!ride) {
        const snap = await getDoc(rideDoc);
        if (snap.exists()) ride = snap.data() as Ride;
      }

      if (ride) {
        const total = ride.valor_estimado;
        const appCommission = total * 0.2;
        const driverGain = total * 0.8;
        
        // Handle KettoPay deduction if selected
        if (ride.forma_pagamento === 'kettopay' && !ride.pagamento_confirmado) {
          try {
            await payRideWithKettoPay(rideId, ride.passageiro_id, total);
          } catch (e) {
            console.error("Dedução KettoPay falhou:", e);
            throw new Error("Erro no pagamento da carteira KettoPay: Saldo Insuficiente.");
          }
        }

        paymentUpdate = {
          app_commission: appCommission,
          driver_gain: driverGain,
          pagamento_confirmado: true,
          finalizado_em: serverTimestamp()
        };

        // 1. Record Payment
        await recordPayment(rideId, ride.passageiro_id, ride.motorista_id, total, ride.forma_pagamento).catch(e => console.error('Payment record failed:', e));

        // 2. Add Club Ketto Points (Transaction safe + Anti-duplication)
        // We update the status FIRST to 'finalizada' so addPointsAfterRide sees the correct state
        extraData.status = 'finalizada'; 
        // Note: we'll call addPointsAfterRide AFTER the main update or handle it carefully.
        // Actually, let's just make the main update first, then call the point system.
      }
    }

    // MAIN UPDATE
    await updateDoc(rideDoc, {
      status,
      ...extraData,
      ...paymentUpdate,
      updatedAt: serverTimestamp(),
    });

    // 3. Process Loyalties and Missions if finished
    if (status === 'finalizada') {
      const snap = await getDoc(rideDoc);
      const ride = snap?.data() as Ride;
      
      if (ride) {
        const passengerId = ride.passageiro_id;
        
        // Add Points
        await addPointsAfterRide(rideId).catch(e => console.error('Loyalties failed:', e));
        
        // Update Missions (Daily Streak)
        try {
          const passengerRef = doc(db, 'users', passengerId);
          const passengerSnap = await getDoc(passengerRef);
          if (passengerSnap.exists()) {
            const passengerData = passengerSnap.data();
            const today = new Date().toISOString().split('T')[0];
            const isNewDay = (passengerData.ultima_corrida_data || '') !== today;
            
            const updates: any = {
              saldo: increment(-(ride.valor_estimado || 0)),
              ultima_corrida_data: today,
              updatedAt: serverTimestamp()
            };
            if (isNewDay) updates.corridas_hoje = 1;
            else updates.corridas_hoje = increment(1);
            
            await updateDoc(passengerRef, updates);
          }
        } catch (e) {
          console.error('Mission update failed:', e);
        }

        // Update Driver Stats
        if (ride.motorista_id) {
          const driverRef = doc(db, 'drivers', ride.motorista_id);
          const gain = (ride.valor_estimado || 0) * 0.8;
          await updateDoc(driverRef, {
            total_ganhos: increment(gain),
            total_corridas: increment(1),
            saldo: increment(gain),
            updatedAt: serverTimestamp()
          }).catch(e => console.error('Driver update failed:', e));
        }

        // Send Notifications
        await sendInAppNotification(ride.passageiro_id, 'Viagem Concluída', `Obrigado por usar o Ketto! Valor: R$ ${ride.valor_estimado.toFixed(2)}`, 'success');
      }
    } else if (status === 'aceita') {
      const snap = await getDoc(rideDoc);
      const ride = snap?.data() as Ride;
      if (ride) await sendInAppNotification(ride.passageiro_id, 'Motorista a caminho!', 'Seu motorista aceitou a corrida.', 'success');
    } else if (status === 'motorista_chegando') {
      const snap = await getDoc(rideDoc);
      const ride = snap?.data() as Ride;
      if (ride) await sendInAppNotification(ride.passageiro_id, 'Motorista chegou!', 'Seu motorista está te esperando.', 'warning');
    }

  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `rides/${rideId}`);
  }
};

const sendInAppNotification = async (userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' = 'info') => {
  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      title,
      message,
      type,
      read: false,
      timestamp: serverTimestamp()
    });
  } catch (e) {
    console.error('Error sending notification:', e);
  }
};

export const calculateFare = (distanciaKm: number, tempoMinutos: number, categoria: RideCategory) => {
  // Simple formula: base + (km * dist) + (min * time)
  const rates = {
    economico: { base: 2.0, km: 1.5, min: 0.2 },
    conforto: { base: 4.0, km: 2.0, min: 0.3 },
    moto: { base: 1.5, km: 1.0, min: 0.1 },
    entrega: { base: 3.0, km: 1.2, min: 0.15 },
  };

  const rate = rates[categoria];
  let price = rate.base + (distanciaKm * rate.km) + (tempoMinutos * rate.min);
  return Number(Math.max(price, 5.0).toFixed(2)); // Return number instead of string
};
