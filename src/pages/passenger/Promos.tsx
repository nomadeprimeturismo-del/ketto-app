import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Tag, Gift, Car, Landmark, Zap, ChevronRight, Search, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Promos() {
  const navigate = useNavigate();

  const activePromos = [
    { title: 'Primeira Corrida', description: 'Ganhe 50% de desconto (máx. R$ 15,00).', code: 'PRIMEIRAKETTO', type: 'Cupom', color: 'bg-yellow-400 text-black' },
    { title: 'Parceria Burguer King', description: 'Vá de Ketto e ganhe 1 Whopper grátis.', code: 'KETTOBK', type: 'Oferta', color: 'bg-red-500 text-white' },
    { title: 'Cashback KettoPay', description: '5% de volta em todas as corridas pagas com saldo.', code: 'AUTOPAY', type: 'Cashback', color: 'bg-emerald-500 text-white' },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans pb-20 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-800 px-6 py-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/passenger')}
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-black uppercase tracking-tighter italic">Descontos</h1>
        </div>
        <button className="p-2 text-neutral-500 hover:text-white">
          <History className="w-5 h-5" />
        </button>
      </div>

      <div className="px-6 py-8 space-y-10">
        {/* Input Cupom */}
        <div className="relative">
          <input 
            type="text"
            placeholder="Digite o código promocional"
            className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl py-5 pl-6 pr-24 text-sm font-bold uppercase tracking-widest focus:border-yellow-400 outline-none transition-all placeholder:normal-case placeholder:text-neutral-700"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-200 transition-all">
            Aplicar
          </button>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 gap-4">
           <div className="p-6 bg-gradient-to-br from-yellow-400/10 to-yellow-400/5 border border-yellow-400/20 rounded-[32px] flex flex-col gap-4 group hover:bg-yellow-400/10 transition-all">
              <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-black shadow-lg">
                 <Ticket className="w-5 h-5" />
              </div>
              <div>
                 <h3 className="text-xs font-black uppercase tracking-widest text-white italic">Cupons</h3>
                 <p className="text-[10px] font-bold text-neutral-500 mt-1">2 cupons ativos</p>
              </div>
           </div>
           <div className="p-6 bg-gradient-to-br from-blue-400/10 to-blue-400/5 border border-blue-400/20 rounded-[32px] flex flex-col gap-4 group hover:bg-blue-400/10 transition-all">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                 <Zap className="w-5 h-5" />
              </div>
              <div>
                 <h3 className="text-xs font-black uppercase tracking-widest text-white italic">Ofertas</h3>
                 <p className="text-[10px] font-bold text-neutral-500 mt-1">Benefícios ketto</p>
              </div>
           </div>
        </div>

        {/* Active Promos */}
        <div className="space-y-4">
           <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500 px-2">Disponível para você</h3>
           <div className="space-y-4">
              {activePromos.map((promo, i) => (
                <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-[32px] overflow-hidden group hover:border-neutral-700 transition-all">
                   <div className="p-6 border-b border-neutral-800 flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${promo.color}`}>
                         <Tag className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                         <div className="flex justify-between items-center mb-1">
                            <h4 className="text-xs font-black text-white uppercase tracking-tight">{promo.title}</h4>
                            <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-500">{promo.type}</span>
                         </div>
                         <p className="text-[10px] font-medium text-neutral-500 italic">{promo.description}</p>
                      </div>
                   </div>
                   <div className="px-6 py-4 bg-neutral-950/50 flex items-center justify-between">
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600">Código: <span className="text-yellow-400">{promo.code}</span></div>
                      <button className="text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-white transition-colors flex items-center gap-2">Detalhes <ChevronRight className="w-3 h-3" /></button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}

// Re-defining History since I used it but didn't import correctly (I'll fix import manually)
import { History } from 'lucide-react';
