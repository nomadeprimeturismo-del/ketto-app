import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, Plus, Send, Landmark, History, Zap, 
  CreditCard, Wallet, ArrowUpRight, ArrowDownLeft,
  Copy, Check, Loader2, QrCode, X, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  doc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Wallet as WalletType, WalletTransaction, WalletDeposit } from '../../types';
import { confirmDeposit } from '../../services/walletService';

export default function KettoPay() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  // PIX Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [amount, setAmount] = useState('50');
  const [generating, setGenerating] = useState(false);
  const [generatedPix, setGeneratedPix] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [depositStatus, setDepositStatus] = useState<'pending' | 'paid'>('pending');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) return;

    // 1. Real-time Wallet Listener
    const walletUnsub = onSnapshot(doc(db, 'wallets', user.uid), (snap) => {
      if (snap.exists()) {
        setWallet(snap.data() as WalletType);
      }
      setLoading(false);
    });

    // 2. Real-time Transactions Listener
    const q = query(
      collection(db, 'wallet_transactions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const transUnsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() })) as WalletTransaction[];
      setTransactions(docs);
    });

    return () => {
      walletUnsub();
      transUnsub();
    };
  }, [user?.uid]);

  // Listener for specific deposit
  useEffect(() => {
    if (!generatedPix?.depositId) return;

    const unsub = onSnapshot(doc(db, 'wallet_deposits', generatedPix.depositId), (snap) => {
      if (snap.exists() && snap.data().status === 'paid') {
        setDepositStatus('paid');
        setTimeout(() => {
          setShowAddModal(false);
          setGeneratedPix(null);
          setDepositStatus('pending');
        }, 3000);
      }
    });

    return () => unsub();
  }, [generatedPix?.depositId]);

  const handleGeneratePix = async () => {
    if (!user?.uid) return;
    const value = parseFloat(amount);
    if (isNaN(value) || value < 5) return;

    setGenerating(true);
    setError(null);
    console.log("Generating PIX for:", { userId: user.uid, amount: value, email: user.email });
    
    try {
      const response = await fetch('/api/payments/pix', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          userId: user.uid, 
          amount: value,
          email: user.email || 'passageiro@kettopay.com'
        })
      });

      const data = await response.json();
      console.log("PIX API Response:", data);
      
      if (!response.ok) {
        throw new Error(data.details || data.error || `Erro do servidor (${response.status})`);
      }

      if (data.success) {
        // Create pending deposit in Firestore
        const depositRef = await addDoc(collection(db, 'wallet_deposits'), {
          userId: user.uid,
          walletId: user.uid,
          amount: value,
          paymentMethod: 'pix',
          status: 'pending',
          pixQrCode: data.pixQrCode,
          pixCopyPaste: data.pixCopyPaste,
          externalPaymentId: data.externalPaymentId,
          createdAt: serverTimestamp()
        });

        setGeneratedPix({ ...data, depositId: depositRef.id });
        
        // SIMULATION ONLY: For demo purposes, we'll give a "Pay PIX" button
        // In reality, this would happen via Webhook
      }
    } catch (error) {
      console.error("Error generating PIX:", error);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // UI Helper for simulation
  const simulatePaymentConfirm = async () => {
    if (generatedPix?.depositId) {
      await confirmDeposit(generatedPix.depositId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans pb-20 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-800 px-6 py-4 flex items-center gap-4">
        <button 
          onClick={() => navigate('/passenger')}
          className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-black uppercase tracking-tighter italic">KettoPay</h1>
      </div>

      <div className="px-6 py-8 space-y-8">
        {/* Balance Card */}
        <div className="relative p-8 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-[40px] shadow-2xl shadow-yellow-400/20 overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Wallet className="w-32 h-32 text-black" />
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/60 mb-2 font-sans">Saldo Disponível</span>
            <div className="text-5xl font-black text-black italic tracking-tighter flex items-center gap-2 mb-8 font-sans">
              <span className="text-xl mt-4 opacity-70">R$</span>
              {wallet?.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            
            <div className="grid grid-cols-3 gap-6 w-full">
               <button 
                 onClick={() => setShowAddModal(true)}
                 className="flex flex-col items-center gap-2 group cursor-pointer"
               >
                  <div className="w-12 h-12 bg-black/10 rounded-2xl flex items-center justify-center backdrop-blur-md group-hover:bg-black/20 transition-all">
                    <Plus className="w-5 h-5 text-black" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-black/70 font-sans">Adicionar</span>
               </button>
               <button 
                 onClick={() => setShowAddModal(true)}
                 className="flex flex-col items-center gap-2 group cursor-pointer"
               >
                  <div className="w-12 h-12 bg-black/10 rounded-2xl flex items-center justify-center backdrop-blur-md group-hover:bg-black/20 transition-all">
                    <Zap className="w-5 h-5 text-black" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-black/70 font-sans">Pix</span>
               </button>
               <button className="flex flex-col items-center gap-2 group cursor-pointer">
                  <div className="w-12 h-12 bg-black/10 rounded-2xl flex items-center justify-center backdrop-blur-md group-hover:bg-black/20 transition-all">
                    <Landmark className="w-5 h-5 text-black" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-black/70 font-sans">Transferir</span>
               </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
           <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-3xl flex flex-col gap-4">
              <div className="w-10 h-10 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 text-yellow-400" />
              </div>
              <div>
                 <h4 className="text-xs font-black uppercase tracking-widest text-white">Total Adicionado</h4>
                 <p className="text-lg font-black text-white italic tracking-tighter mt-1">R$ {wallet?.totalAdded.toFixed(2)}</p>
              </div>
           </div>
           <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-3xl flex flex-col gap-4">
              <div className="w-10 h-10 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-center">
                <ArrowDownLeft className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                 <h4 className="text-xs font-black uppercase tracking-widest text-white">Total Cashback</h4>
                 <p className="text-lg font-black text-white italic tracking-tighter mt-1">R$ {wallet?.totalCashbackReceived.toFixed(2)}</p>
              </div>
           </div>
        </div>

        {/* Recent Transactions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-black uppercase tracking-tighter italic">Histórico de Transações</h3>
          </div>
          
          <div className="space-y-2">
            {transactions.length > 0 ? (
              transactions.map((t) => (
                <div key={t.id} className="p-5 bg-neutral-900 border border-neutral-800 rounded-3xl flex items-center justify-between group hover:border-neutral-700 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                      t.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-500' :
                      t.type === 'cashback' ? 'bg-blue-500/10 text-blue-500' :
                      'bg-neutral-800 text-neutral-400'
                    }`}>
                      {t.type === 'deposit' ? <ArrowUpRight className="w-5 h-5" /> :
                       t.type === 'cashback' ? <ArrowDownLeft className="w-5 h-5" /> :
                       <Zap className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-tight">{t.description}</h4>
                      <p className="text-[10px] font-bold text-neutral-600 mt-0.5">
                        {t.createdAt?.toDate ? t.createdAt.toDate().toLocaleString('pt-BR') : 'Processando...'}
                      </p>
                    </div>
                  </div>
                  <div className={`text-sm font-black italic tracking-tighter ${t.amount > 0 ? 'text-emerald-500' : 'text-white'}`}>
                    {t.amount > 0 ? '+' : ''} R$ {Math.abs(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center bg-neutral-900/50 border border-dashed border-neutral-800 rounded-[40px] space-y-4">
                 <History className="w-12 h-12 text-neutral-800 mx-auto" />
                 <p className="text-xs font-bold text-neutral-600 uppercase tracking-widest">Nenhuma transação registrada</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PIX Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !generating && setShowAddModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-800 rounded-t-[40px] z-[110] px-8 py-10"
            >
               <div className="w-12 h-1 bg-neutral-800 rounded-full mx-auto mb-8" />
               
               {!generatedPix ? (
                 <div className="space-y-8">
                   <div className="text-center">
                     <h2 className="text-xl font-black uppercase tracking-tighter italic italic">Adicionar Saldo</h2>
                     <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-2">Informe o valor para gerar o PIX</p>
                   </div>

                   <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-black text-yellow-400 italic">R$</span>
                      <input 
                         type="number"
                         value={amount}
                         onChange={(e) => setAmount(e.target.value)}
                         className="w-full bg-neutral-950 border border-neutral-800 rounded-3xl py-6 pl-16 pr-6 text-2xl font-black italic tracking-tighter focus:border-yellow-400 focus:outline-none transition-colors"
                         placeholder="0,00"
                      />
                   </div>

                   <div className="grid grid-cols-4 gap-2">
                      {['20', '50', '100', '200'].map(val => (
                        <button 
                          key={val}
                          onClick={() => setAmount(val)}
                          className={`py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                            amount === val ? 'bg-yellow-400 border-yellow-400 text-black' : 'bg-neutral-950 border-neutral-800 text-neutral-500'
                          }`}
                        >
                          R$ {val}
                        </button>
                      ))}
                   </div>

                   <button 
                     onClick={(e) => {
                       e.preventDefault();
                       handleGeneratePix();
                     }}
                     disabled={generating || !amount || parseFloat(amount) < 5}
                     className="w-full bg-yellow-400 text-black py-5 rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-yellow-400/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 transition-transform active:scale-95"
                   >
                     {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                     {generating ? 'Gerando...' : 'Gerar Pix'}
                   </button>

                   {error && (
                     <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black uppercase tracking-widest">
                       <AlertCircle className="w-4 h-4 shrink-0" />
                       <span>{error}</span>
                     </div>
                   )}
                 </div>
               ) : (
                 <div className="space-y-8 pb-4">
                   <div className="text-center">
                     <div className="flex items-center justify-center gap-2 mb-2">
                       {depositStatus === 'paid' ? (
                         <div className="bg-emerald-500 p-2 rounded-full">
                           <Check className="w-6 h-6 text-white" />
                         </div>
                       ) : (
                         <div className="relative">
                            <QrCode className="w-12 h-12 text-yellow-400" />
                            <motion.div 
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ repeat: Infinity, duration: 2 }}
                              className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-4 border-neutral-900" 
                            />
                         </div>
                       )}
                     </div>
                     <h2 className="text-xl font-black uppercase tracking-tighter italic">
                        {depositStatus === 'paid' ? 'Pagamento Confirmado!' : 'Aguardando Pagamento'}
                     </h2>
                     <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-1 italic">
                        {depositStatus === 'paid' ? 'Seu saldo já foi atualizado' : 'Escaneie o código PIX abaixo'}
                     </p>
                   </div>

                   {depositStatus === 'pending' && (
                     <>
                        <div className="bg-white p-6 rounded-3xl flex items-center justify-center relative overflow-hidden group">
                           <img src={generatedPix.pixQrCode} alt="PIX QR Code" className="w-48 h-48" />
                        </div>

                        <div className="space-y-3">
                           <div className="flex items-center justify-between px-2">
                             <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 italic">Pix Copia e Cola</span>
                           </div>
                           <button 
                             onClick={() => copyToClipboard(generatedPix.pixCopyPaste)}
                             className="w-full bg-neutral-950 border border-neutral-800 p-4 rounded-2xl flex items-center gap-3 group text-left transition-colors hover:border-neutral-700"
                           >
                              <div className="flex-1 truncate text-xs font-mono text-neutral-500">
                                {generatedPix.pixCopyPaste}
                              </div>
                              <div className="p-2 bg-neutral-900 rounded-lg text-yellow-400 group-active:scale-95 transition-all">
                                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                              </div>
                           </button>
                        </div>

                        <div className="flex gap-4">
                           <button 
                             onClick={() => { setGeneratedPix(null); setShowAddModal(false); }}
                             className="flex-1 bg-neutral-900 border border-neutral-800 text-neutral-400 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px]"
                           >
                             Cancelar
                           </button>
                           {/* ADMIN/DEMO ONLY BUTTON */}
                           <button 
                             onClick={simulatePaymentConfirm}
                             className="flex-1 bg-white/5 border border-white/10 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                           >
                             <Check className="w-4 h-4" /> [Simular Pago]
                           </button>
                        </div>
                     </>
                   )}
                 </div>
               )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
