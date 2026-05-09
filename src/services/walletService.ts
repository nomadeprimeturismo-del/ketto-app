import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  increment, 
  serverTimestamp, 
  runTransaction,
  collection,
  addDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Wallet, WalletTransaction, TransactionType, Ride } from '../types';

/**
 * Ensures a user has a wallet
 */
export const ensureWallet = async (userId: string) => {
  const walletRef = doc(db, 'wallets', userId);
  const snap = await getDoc(walletRef);
  
  if (!snap.exists()) {
    const newWallet: Wallet = {
      userId,
      balance: 0,
      cashbackBalance: 0,
      totalAdded: 0,
      totalCashbackReceived: 0,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    await setDoc(walletRef, newWallet);
    
    // Also update user profile with wallet info
    await updateDoc(doc(db, 'users', userId), {
      walletId: userId,
      kettopayBalance: 0
    });
    
    return newWallet;
  }
  return snap.data() as Wallet;
};

/**
 * Records a transaction and updates the wallet balance using a transaction
 */
export const recordWalletTransaction = async (
  userId: string, 
  amount: number, 
  type: TransactionType, 
  description: string,
  referenceId?: string
) => {
  try {
    await runTransaction(db, async (transaction) => {
      const walletRef = doc(db, 'wallets', userId);
      const userRef = doc(db, 'users', userId);
      const walletSnap = await transaction.get(walletRef);
      
      if (!walletSnap.exists()) {
        throw new Error("Carteira não encontrada.");
      }

      // Update balances
      const updates: any = {
        balance: increment(amount),
        updatedAt: serverTimestamp()
      };

      if (type === 'deposit') {
        updates.totalAdded = increment(amount);
      } else if (type === 'cashback') {
        updates.totalCashbackReceived = increment(amount);
        updates.cashbackBalance = increment(amount);
      }

      transaction.update(walletRef, updates);
      
      // Keep user profile in sync for fast display
      transaction.update(userRef, {
        kettopayBalance: increment(amount)
      });

      // Log transaction
      const transRef = doc(collection(db, 'wallet_transactions'));
      const transData: WalletTransaction = {
        userId,
        walletId: userId,
        type,
        amount,
        description,
        status: 'completed',
        referenceId,
        createdAt: serverTimestamp()
      };
      transaction.set(transRef, transData);
    });
    
    return true;
  } catch (error) {
    console.error("Erro na transação financeira:", error);
    throw error;
  }
};

/**
 * Special function to pay for a ride with KettoPay
 */
export const payRideWithKettoPay = async (rideId: string, userId: string, amount: number) => {
  try {
    await runTransaction(db, async (transaction) => {
      const walletRef = doc(db, 'wallets', userId);
      const walletSnap = await transaction.get(walletRef);
      const rideRef = doc(db, 'rides', rideId);
      const rideSnap = await transaction.get(rideRef);

      if (!walletSnap.exists()) throw new Error("Carteira não encontrada.");
      if (!rideSnap.exists()) throw new Error("Corrida não encontrada.");

      const wallet = walletSnap.data() as Wallet;
      const ride = rideSnap.data() as Ride;

      if (wallet.balance < amount) {
        throw new Error("Saldo insuficiente no KettoPay.");
      }

      if (ride.pagamento_confirmado) {
        throw new Error("Esta corrida já foi paga.");
      }

      // 1. Deduct from wallet
      transaction.update(walletRef, {
        balance: increment(-amount),
        updatedAt: serverTimestamp()
      });
      
      // 2. Sync profile
      transaction.update(doc(db, 'users', userId), {
        kettopayBalance: increment(-amount)
      });

      // 3. Mark ride as paid
      transaction.update(rideRef, {
        pagamento_confirmado: true,
        forma_pagamento: 'kettopay',
        updatedAt: serverTimestamp()
      });

      // 4. Record transaction
      const transRef = doc(collection(db, 'wallet_transactions'));
      transaction.set(transRef, {
        userId,
        walletId: userId,
        type: 'ride_payment',
        amount: -amount,
        description: "Pagamento de Corrida",
        status: 'completed',
        referenceId: rideId,
        createdAt: serverTimestamp()
      });
    });
    return true;
  } catch (error) {
    console.error("Erro no pagamento da corrida:", error);
    throw error;
  }
};

/**
 * Confirms a deposit (called after gateway confirmation)
 */
export const confirmDeposit = async (depositId: string) => {
  const depositRef = doc(db, 'wallet_deposits', depositId);
  const snap = await getDoc(depositRef);
  
  if (snap.exists() && snap.data().status === 'pending') {
    const data = snap.data();
    await recordWalletTransaction(
      data.userId, 
      data.amount, 
      'deposit', 
      "Adição de Saldo via PIX", 
      depositId
    );
    
    await updateDoc(depositRef, {
      status: 'paid',
      paidAt: serverTimestamp()
    });
  }
};
