import { doc, getDoc, updateDoc, increment, serverTimestamp, addDoc, collection, runTransaction } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ClubKettoLevel, PointsHistory, Ride, UserProfile } from '../types';
import { recordWalletTransaction } from './walletService';

export const KETTO_TIERS: Record<ClubKettoLevel, { minPoints: number; name: string; cashback: number }> = {
  BRONZE: { minPoints: 0, name: 'Bronze', cashback: 0.01 },
  PRATA: { minPoints: 5000, name: 'Prata', cashback: 0.03 },
  OURO: { minPoints: 20000, name: 'Ouro', cashback: 0.05 },
  DIAMANTE: { minPoints: 50000, name: 'Diamante', cashback: 0.10 },
  BLACK: { minPoints: 120000, name: 'Black', cashback: 0.15 }
};

export const calculateLevel = (points: number): ClubKettoLevel => {
  if (points >= KETTO_TIERS.BLACK.minPoints) return 'BLACK';
  if (points >= KETTO_TIERS.DIAMANTE.minPoints) return 'DIAMANTE';
  if (points >= KETTO_TIERS.OURO.minPoints) return 'OURO';
  if (points >= KETTO_TIERS.PRATA.minPoints) return 'PRATA';
  return 'BRONZE';
};

/**
 * Professional real-time points addition after ride completion
 * Implements anti-fraud/anti-duplication with a transaction
 */
export const addPointsAfterRide = async (rideId: string) => {
  try {
    console.log(`[ClubKetto] Processando pontos para a corrida: ${rideId}`);
    
    await runTransaction(db, async (transaction) => {
      const rideRef = doc(db, 'rides', rideId);
      const rideSnap = await transaction.get(rideRef);
      
      if (!rideSnap.exists()) {
        throw new Error("Corrida não encontrada.");
      }
      
      const ride = rideSnap.data() as Ride;
      
      // Verification Rules
      if (ride.status !== 'finalizada') {
        console.warn(`[ClubKetto] Corrida ${rideId} ainda não está finalizada.`);
        return;
      }
      
      // Check if already processed
      if (ride.pointsAdded) {
        console.warn(`[ClubKetto] Pontos já foram adicionados para a corrida ${rideId}.`);
        return;
      }

      const passengerId = ride.passageiro_id;
      const rawAmount = ride.valor_final || ride.valor_estimado || 0;
      const amount = typeof rawAmount === 'string' ? parseFloat(rawAmount) : rawAmount;
      const pointsEarned = Math.floor(amount * 10);
      
      if (pointsEarned <= 0) {
        console.log(`[ClubKetto] Valor da corrida insuficiente para gerar pontos.`);
        transaction.update(rideRef, { pointsAdded: true });
        return;
      }

      const userRef = doc(db, 'users', passengerId);
      const userSnap = await transaction.get(userRef);
      
      if (!userSnap.exists()) {
        throw new Error("Usuário não encontrado.");
      }
      
      const userData = userSnap.data() as UserProfile;
      const currentPoints = userData.clubPoints || 0;
      const newTotalPoints = currentPoints + pointsEarned;
      const newLevel = calculateLevel(newTotalPoints);
      const tierData = KETTO_TIERS[newLevel];

      // 1. Calculate Cashback if not already added
      let cashbackAmount = 0;
      if (!ride.cashbackAdded) {
        cashbackAmount = amount * tierData.cashback;
        // Optimization: Use the transaction to mark ride as cashback processed too
        transaction.update(rideRef, {
          cashbackAdded: true,
          cashbackAmount: cashbackAmount
        });
        
        // We will add the money to wallet via a separate call or part of this transaction
        // Since recordWalletTransaction is also a transaction, we should inline 
        // the wallet logic HERE to keep it in a single atomic operation
        const walletRef = doc(db, 'wallets', passengerId);
        transaction.update(walletRef, {
          balance: increment(cashbackAmount),
          cashbackBalance: increment(cashbackAmount),
          totalCashbackReceived: increment(cashbackAmount),
          updatedAt: serverTimestamp()
        });

        transaction.update(userRef, {
          kettopayBalance: increment(cashbackAmount)
        });

        // Create Cashback Transaction
        const cashRef = doc(collection(db, 'wallet_transactions'));
        transaction.set(cashRef, {
          userId: passengerId,
          walletId: passengerId,
          type: 'cashback',
          amount: cashbackAmount,
          description: `Cashback Clube Ketto (${newLevel})`,
          status: 'completed',
          referenceId: rideId,
          createdAt: serverTimestamp()
        });
      }

      // 2. Update User Profile (Loyalty)
      transaction.update(userRef, {
        clubPoints: increment(pointsEarned),
        pontos: increment(pointsEarned), // Legacy
        totalSpent: increment(amount),
        clubLevel: newLevel,
        nivel: newLevel, // Legacy
        updatedAt: serverTimestamp()
      });
      
      // 3. Mark ride as processed for points
      transaction.update(rideRef, { 
        pointsAdded: true,
        updatedAt: serverTimestamp() 
      });
      
      // 4. Create Points History
      const historyRef = doc(collection(db, 'pointsHistory'));
      const historyEntry: PointsHistory = {
        userId: passengerId,
        rideId: rideId,
        points: pointsEarned,
        amountSpent: amount,
        type: "ride_completed",
        createdAt: serverTimestamp()
      };
      
      transaction.set(historyRef, historyEntry);
      
      console.log(`[ClubKetto] SUCESSO: Points + Cashback (${cashbackAmount.toFixed(2)}) for user ${passengerId}.`);
    });
    
  } catch (error) {
    console.error('[ClubKetto] Erro crítico ao adicionar pontos:', error);
    throw error;
  }
};
