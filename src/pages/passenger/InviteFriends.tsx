import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Share2, MessageCircle, Copy, Gift, TrendingUp, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function InviteFriends() {
  const navigate = useNavigate();

  const shareViaWhatsApp = () => {
    const text = 'Partiu viajar com desconto no Ketto? Use meu código KETTO2026 e ganhe R$ 20,00 na sua primeira corrida! 🚕✨';
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

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
          <h1 className="text-xl font-black uppercase tracking-tighter italic">Convide Amigos</h1>
        </div>
      </div>

      <div className="px-6 py-8 space-y-10">
        {/* Banner Card */}
        <div className="p-8 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-[40px] shadow-2xl shadow-yellow-400/20 relative overflow-hidden text-black">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Gift className="w-40 h-40 text-black rotate-12" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-black/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-black italic tracking-tighter mb-2 leading-tight">Ganhe R$ 20 em sua carteira</h2>
            <p className="text-xs font-bold text-black/70 leading-relaxed max-w-[200px]">
              Cada amigo que se cadastrar e realizar a primeira corrida com seu código, você ganha saldo!
            </p>
          </div>
        </div>

        {/* Invite Code */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500 px-2">Seu Código de Indicação</h3>
          <div className="p-8 bg-neutral-900 border border-neutral-800 border-dashed rounded-[40px] flex flex-col items-center gap-6 group hover:border-yellow-400/30 transition-all">
             <div className="text-4xl font-black text-white italic tracking-[0.2em] uppercase">KETTO2026</div>
             <button className="flex items-center gap-2 px-6 py-3 bg-neutral-950 border border-neutral-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-yellow-400 transition-colors">
                <Copy className="w-4 h-4" />
                Copiar Código
             </button>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="grid grid-cols-2 gap-4">
           <button 
             onClick={shareViaWhatsApp}
             className="p-6 bg-[#25D366]/10 border border-[#25D366]/20 rounded-[32px] flex flex-col items-center gap-4 hover:bg-[#25D366]/20 transition-all shadow-xl group"
           >
              <div className="w-12 h-12 bg-[#25D366] text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-white">WhatsApp</span>
           </button>
           <button className="p-6 bg-neutral-900 border border-neutral-800 rounded-[32px] flex flex-col items-center gap-4 hover:border-white/20 transition-all shadow-xl group">
              <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Share2 className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Outros</span>
           </button>
        </div>

        {/* Info List */}
        <div className="space-y-4 pt-4 border-t border-neutral-800">
           <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center shrink-0 border border-neutral-800">
                 <Users className="w-4 h-4 text-yellow-400" />
              </div>
              <div>
                 <h4 className="text-xs font-black text-white uppercase tracking-tight">Amigos que usaram</h4>
                 <p className="text-[10px] font-bold text-neutral-600 mt-1">Nenhum amigo utilizou seu código ainda.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
