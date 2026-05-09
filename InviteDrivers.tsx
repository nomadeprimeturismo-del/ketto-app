import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Car, Users, Landmark, TrendingUp, ChevronRight, Share2, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function InviteDrivers() {
  const navigate = useNavigate();

  const shareViaWhatsApp = () => {
    const text = 'Venha ser um motorista Ketto e ganhe mais com taxas justas! Cadastre-se com meu código de parceiro e comece a faturar hoje. 🚗💰';
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

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
          <h1 className="text-xl font-black uppercase tracking-tighter italic">Convide Motoristas</h1>
        </div>
      </div>

      <div className="px-6 py-8 space-y-10">
        {/* Banner Section */}
        <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-[40px] relative overflow-hidden shadow-2xl">
          <div className="absolute -top-10 -right-10 opacity-5">
             <Car className="w-48 h-48 rotate-12" />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl font-black text-white italic tracking-tighter mb-4 leading-tight">Ganhe comissões por indicação</h2>
            <p className="text-xs font-bold text-neutral-500 leading-relaxed max-w-[200px]">
              Indique novos motoristas parceiros e receba uma comissão de R$ 50,00 quando eles completarem as primeiras 10 corridas.
            </p>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 gap-4">
           <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-3xl flex flex-col gap-4">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                <Users className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Indicados</h4>
                 <div className="text-2xl font-black text-white italic">0</div>
              </div>
           </div>
           <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-3xl flex flex-col gap-4">
              <div className="w-10 h-10 bg-yellow-400/10 rounded-xl flex items-center justify-center border border-yellow-400/20">
                <Landmark className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Total Ganho</h4>
                 <div className="text-2xl font-black text-white italic">R$ 0,00</div>
              </div>
           </div>
        </div>

        {/* Benefits List */}
        <div className="space-y-4">
           <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500 px-2">Vantagens para o Motorista</h3>
           <div className="space-y-3">
              {[
                { title: 'Taxa Preferencial', description: 'Até 15% de taxa nos primeiros 3 meses.', icon: TrendingUp },
                { title: 'Pagamento Diário', description: 'Receba seus ganhos no mesmo dia via KettoPay.', icon: Landmark },
                { title: 'Suporte VIP', description: 'Canal exclusivo de atendimento 24/7.', icon: Users }
              ].map((benefit, i) => (
                <div key={i} className="p-5 bg-neutral-900/50 border border-neutral-800 rounded-[28px] flex items-center gap-4">
                   <div className="w-10 h-10 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-center shrink-0">
                      <benefit.icon className="w-4 h-4 text-yellow-400" />
                   </div>
                   <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-tight">{benefit.title}</h4>
                      <p className="text-[10px] font-bold text-neutral-600 mt-0.5">{benefit.description}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Action Button */}
        <div className="pt-6">
           <button 
             onClick={shareViaWhatsApp}
             className="w-full py-5 bg-yellow-400 text-black rounded-[24px] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-yellow-400/10"
           >
              <MessageCircle className="w-5 h-5" />
              Indicar no WhatsApp
           </button>
           <button className="w-full py-4 bg-neutral-900 text-neutral-400 rounded-[24px] font-black uppercase tracking-widest text-[10px] mt-3 hover:text-white transition-colors">
              Copiar Link de Convite
           </button>
        </div>
      </div>
    </div>
  );
}
