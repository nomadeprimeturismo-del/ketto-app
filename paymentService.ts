import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  doc, 
  getDoc 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/utils';
import { PaymentMethod } from '../types';

export interface PaymentTransaction {
  id?: string;
  ride_id: string;
  user_id: string;
  driver_id?: string;
  valor: number;
  metodo: PaymentMethod;
  status: 'pendente' | 'concluido' | 'falho';
  criado_em: any;
}

export const recordPayment = async (rideId: string, userId: string, driverId: string | undefined, amount: number, method: PaymentMethod) => {
  try {
    const paymentRef = await addDoc(collection(db, 'payments'), {
      ride_id: rideId,
      user_id: userId,
      driver_id: driverId,
      valor: amount,
      metodo: method,
      status: method === 'dinheiro' ? 'pendente' : 'concluido', // Money is usually confirmed manually, but for now we label accordingly
      criado_em: serverTimestamp(),
    });
    return paymentRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'payments');
  }
};
