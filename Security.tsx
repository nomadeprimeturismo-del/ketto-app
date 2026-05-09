import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ShieldCheck, Share2, AlertOctagon, Heart, UserCheck, Eye, MapPin, ChevronRight, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Security() {
  const navigate = useNavigate();

  const safetyActions = [
    { title: 'Compartilhar Rota', description: 'Amigos e família podem seguir sua viagem.', icon: Share2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Contatos de Emergência', description: 'Configure quem devemos avisar em perigo.', icon: Heart, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Verificação de Identidade', description: 'Reconhecimento facial para sua segurança.', icon: UserCheck, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Monitoramento 24h', description: 'Todas as corridas são monitoradas por GPS.', icon: Eye, color: 'text-blue-500', bg: 'bg-blue-500/10' },
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
          <h1 className="text-xl font-black uppercase tracking-tighter italic text-blue-400">Segurança</h1>
        </div>
      </div>

      <div className="px-6 py-8 space-y-8">
        {/* Main Status */}
        <div className="p-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-[40px] shadow-2xl shadow-blue-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <ShieldCheck className="w-32 h-32 text-white" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white italic tracking-tighter mb-2">Central de Segurança</h2>
            <p className="text-xs font-bold text-white/70 leading-relaxed max-w-[200px]">
              Sua proteção é nossa maior prioridade. Configure e monitore sua segurança.
            </p>
          </div>
        </div>

        {/* SOS Button */}
        <button className="w-full p-6 bg-red-500 hover:bg-red-600 text-white rounded-[32px] flex items-center justify-between transition-all group shadow-xl shadow-red-500/20">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md group-hover:scale-110 transition-transform">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-black uppercase tracking-widest italic">Botão SOS</h3>
                <p className="text-[10px] font-bold opacity-70">Ligar para a polícia e equipe ketto</p>
              </div>
           </div>
           <Phone className="w-5 h-5 mx-2" />
        </button>

        {/* Action List */}
        <div className="space-y-3">
          {safetyActions.map((action, i) => (
            <button 
              key={i}
              className="w-full p-5 bg-neutral-900 border border-neutral-800 rounded-[32px] flex items-center justify-between group hover:border-blue-500/30 transition-all"
            >
              <div className="flex items-center gap-4">
                 <div className={`p-3 rounded-2xl ${action.bg} ${action.color} group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-5 h-5" />
                 </div>
                 <div className="text-left">
                    <h4 className="text-xs font-black text-white uppercase tracking-tight">{action.title}</h4>
                    <p className="text-[10px] font-medium text-neutral-500 mt-0.5">{action.description}</p>
                 </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-700 group-hover:text-white transition-colors" />
            </button>
          ))}
        </div>

        {/* Tip Card */}
        <div className="p-6 bg-neutral-900/50 border border-neutral-800 rounded-3xl flex items-start gap-4">
           <MapPin className="w-5 h-5 text-blue-500 mt-1 shrink-0" />
           <p className="text-[10px] font-bold text-neutral-500 leading-relaxed italic">
             "Ao entrar no veículo, verifique se a placa e o motorista coincidem com o app. Nunca embarque se os dados forem diferentes."
           </p>
        </div>
      </div>
    </div>
  );
}
