import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Search, MessageSquare, Car, ShieldAlert, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Messages() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const chats = [
    { id: 1, title: 'Carlos (Motorista)', lastMessage: 'Estou chegando no local de embarque.', time: '14:20', unread: 2, icon: Car, color: 'bg-yellow-400 text-black' },
    { id: 2, title: 'Suporte Ketto', lastMessage: 'Olá! Como podemos ajudar hoje?', time: 'Ontem', unread: 0, icon: MessageSquare, color: 'bg-emerald-500 text-white' },
    { id: 3, title: 'Segurança Ketto', lastMessage: 'Seu código de verificação é 8829.', time: '08 Mai', unread: 0, icon: ShieldAlert, color: 'bg-red-500 text-white' },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans pb-20 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-800 px-6 py-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/passenger')}
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-black uppercase tracking-tighter italic">Mensagens</h1>
        </div>
      </div>

      <div className="px-6 py-8 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
          <input 
            type="text"
            placeholder="Buscar conversas..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl py-4 pl-12 pr-6 text-xs font-bold focus:border-yellow-400 outline-none transition-all placeholder:text-neutral-700"
          />
        </div>

        {/* Chat List */}
        <div className="space-y-3">
          {chats.map((chat) => (
            <button 
              key={chat.id}
              className="w-full p-5 bg-neutral-900 border border-neutral-800 rounded-[32px] flex items-center gap-4 hover:border-neutral-700 transition-all group"
            >
              <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center shrink-0 shadow-lg ${chat.color}`}>
                 <chat.icon className="w-6 h-6" />
              </div>
              <div className="flex-1 text-left">
                 <div className="flex justify-between items-center mb-1">
                    <h4 className="text-xs font-black text-white uppercase tracking-tight">{chat.title}</h4>
                    <span className="text-[10px] font-bold text-neutral-600">{chat.time}</span>
                 </div>
                 <p className="text-[11px] font-medium text-neutral-500 line-clamp-1 leading-relaxed">
                   {chat.lastMessage}
                 </p>
              </div>
              {chat.unread > 0 ? (
                <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center font-black text-[9px] text-black shrink-0">
                  {chat.unread}
                </div>
              ) : (
                <ChevronRight className="w-4 h-4 text-neutral-700 group-hover:text-white transition-colors shrink-0" />
              )}
            </button>
          ))}
        </div>

        {/* Empty State / Suggestion */}
        <div className="pt-10 flex flex-col items-center">
           <div className="w-16 h-1 bg-neutral-900 rounded-full mb-8"></div>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600 text-center leading-loose">
             Mantenha contato com seus motoristas<br />e com o suporte ketto.
           </p>
        </div>
      </div>
    </div>
  );
}
