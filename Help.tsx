import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, MessageCircle, Phone, Mail, HelpCircle, FileText, ShieldAlert, CreditCard, ChevronRight, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Help() {
  const navigate = useNavigate();

  const helpTopics = [
    { title: 'Problemas com uma corrida', icon: Zap, color: 'text-yellow-400' },
    { title: 'Opções de Pagamento e Promoções', icon: CreditCard, color: 'text-emerald-400' },
    { title: 'Guia do Passageiro', icon: FileText, color: 'text-blue-400' },
    { title: 'Segurança e Acessibilidade', icon: ShieldAlert, color: 'text-red-400' },
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
          <h1 className="text-xl font-black uppercase tracking-tighter italic">Ajuda</h1>
        </div>
      </div>

      <div className="px-6 py-8 space-y-8">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-600" />
          <input 
            type="text"
            placeholder="Como podemos ajudar?"
            className="w-full bg-neutral-900 border border-neutral-800 rounded-3xl py-5 pl-12 pr-6 text-sm font-bold focus:border-yellow-400 outline-none transition-all placeholder:text-neutral-700"
          />
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-4">
           <button className="p-6 bg-neutral-900 border border-neutral-800 rounded-[32px] flex flex-col items-center gap-4 hover:border-yellow-400/50 transition-all shadow-xl hover:bg-neutral-800/50">
              <div className="w-12 h-12 bg-yellow-400/10 rounded-2xl flex items-center justify-center border border-yellow-400/20">
                <MessageCircle className="w-6 h-6 text-yellow-400" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Chat Suporte</span>
           </button>
           <button className="p-6 bg-neutral-900 border border-neutral-800 rounded-[32px] flex flex-col items-center gap-4 hover:border-blue-400/50 transition-all shadow-xl hover:bg-neutral-800/50">
              <div className="w-12 h-12 bg-blue-400/10 rounded-2xl flex items-center justify-center border border-blue-400/20">
                <Phone className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Telefone</span>
           </button>
        </div>

        {/* FAQ Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-tighter italic px-2">Principais Tópicos</h3>
          <div className="space-y-2">
            {helpTopics.map((item, i) => (
              <button key={i} className="w-full p-5 bg-neutral-900 border border-neutral-800 rounded-3xl flex items-center justify-between group hover:border-neutral-700 transition-colors">
                <div className="flex items-center gap-4 text-left">
                  <div className={`p-2 bg-neutral-950 border border-neutral-800 rounded-xl ${item.color}`}>
                     <item.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-neutral-300 leading-tight">{item.title}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-white transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Contact info card */}
        <div className="p-8 bg-neutral-900/50 border border-dashed border-neutral-800 rounded-[40px] text-center">
           <Mail className="w-8 h-8 text-neutral-700 mx-auto mb-4" />
           <p className="text-xs font-black text-neutral-500 uppercase tracking-widest leading-relaxed">
             Envie um e-mail para:<br />
             <span className="text-white">contato@ketto.com.br</span>
           </p>
        </div>
      </div>
    </div>
  );
}

// Re-defining Zap since I used it above
const Zap = HelpCircle;
