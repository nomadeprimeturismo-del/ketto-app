import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Plus, CreditCard, Banknote, Zap, Wallet, Apple, Smartphone, Check, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Payments() {
  const navigate = useNavigate();

  const methods = [
    { id: 'credito-1', type: 'Cartão de Crédito', label: '•••• 4429', brand: 'Visa', icon: CreditCard, default: true },
    { id: 'pix-1', type: 'Pix Instantâneo', label: 'nomade***@gmail.com', icon: Zap, color: 'text-blue-500' },
    { id: 'dinheiro-1', type: 'Dinheiro', label: 'Pagamento local', icon: Banknote, color: 'text-emerald-500' },
  ];

  const digitalWallets = [
    { name: 'Google Pay', icon: Smartphone, bg: 'bg-white text-black' },
    { name: 'Apple Pay', icon: Apple, bg: 'bg-black text-white' },
    { name: 'KettoPay', icon: Wallet, bg: 'bg-yellow-400 text-black' },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans pb-20 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/passenger')}
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-black uppercase tracking-tighter italic">Pagamentos</h1>
        </div>
        <button className="p-2 bg-yellow-400 text-black rounded-xl hover:scale-105 active:scale-95 transition-all">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="px-6 py-8 space-y-10">
        {/* Saved Methods */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500 px-2">Métodos Salvos</h3>
          <div className="space-y-3">
            {methods.map((item) => (
              <div key={item.id} className="p-5 bg-neutral-900 border border-neutral-800 rounded-[32px] flex items-center justify-between group hover:border-neutral-700 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-center justify-center text-neutral-400">
                    <item.icon className={`w-5 h-5 ${item.color || 'text-white'}`} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-tight">{item.type}</h4>
                    <p className="text-[10px] font-bold text-neutral-600 mt-0.5">{item.label}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                   {item.default && (
                     <div className="px-2 py-1 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
                       <span className="text-[8px] font-black text-yellow-400 uppercase tracking-widest">Padrão</span>
                     </div>
                   )}
                   <button className="p-2 text-neutral-600 hover:text-white">
                      <MoreVertical className="w-4 h-4" />
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Digital Wallets */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500 px-2">Carteiras Digitais</h3>
          <div className="grid grid-cols-1 gap-2">
            {digitalWallets.map((wallet, i) => (
              <button key={i} className={`p-5 rounded-[24px] flex items-center justify-between transition-all hover:scale-[1.02] active:scale-95 border-b-4 border-black/20 ${wallet.bg}`}>
                <div className="flex items-center gap-3">
                   <wallet.icon className="w-5 h-5" />
                   <span className="text-xs font-black uppercase tracking-widest italic">{wallet.name}</span>
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-black/10 flex items-center justify-center">
                   <div className="w-2 h-2 rounded-full bg-black opacity-20"></div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Security Info */}
        <div className="p-8 bg-neutral-900/50 border border-neutral-800 rounded-[40px] text-center">
           <Zap className="w-8 h-8 text-neutral-800 mx-auto mb-4" />
           <p className="text-[10px] font-bold text-neutral-600 leading-relaxed max-w-[200px] mx-auto opacity-70">
             Suas informações de pagamento são criptografadas e protegidas pelo sistema Ketto SafePay.
           </p>
        </div>
      </div>
    </div>
  );
}
