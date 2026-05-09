import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Moon, Bell, Shield, Globe, Volume2, Fingerprint, LogOut, ChevronRight, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Settings() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const sections = [
    { title: 'Preferências', items: [
      { id: 'theme', label: 'Tema Escuro', icon: Moon, detail: 'Ativado' },
      { id: 'notifications', label: 'Notificações', icon: Bell, detail: 'Configurar' },
      { id: 'sound', label: 'Som do Aplicativo', icon: Volume2, detail: 'Médio' },
    ]},
    { title: 'Privacidade e Segurança', items: [
      { id: 'privacy', label: 'Privacidade de Dados', icon: Shield },
      { id: 'biometrics', label: 'Biometria', icon: Fingerprint, detail: 'Ativado' },
      { id: 'permissions', label: 'Permissões do Sistema', icon: Info },
    ]},
    { title: 'Conta', items: [
      { id: 'language', label: 'Idioma', icon: Globe, detail: 'Português' },
    ]}
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
          <h1 className="text-xl font-black uppercase tracking-tighter italic">Configurações</h1>
        </div>
      </div>

      <div className="px-6 py-8 space-y-10">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500 px-2">{section.title}</h3>
            <div className="bg-neutral-900 border border-neutral-800 rounded-[32px] overflow-hidden divide-y divide-neutral-800/50 shadow-xl">
              {section.items.map((item) => (
                <button 
                  key={item.id}
                  className="w-full p-6 flex items-center justify-between hover:bg-neutral-800/50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-400 group-hover:text-yellow-400 transition-colors">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold text-neutral-200">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {item.detail && <span className="text-[10px] font-black uppercase tracking-widest text-neutral-600">{item.detail}</span>}
                    <ChevronRight className="w-4 h-4 text-neutral-700 group-hover:text-white transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Logout Button */}
        <div className="pt-6">
          <button 
            onClick={async () => { await signOut(); navigate('/'); }}
            className="w-full py-5 bg-red-500/5 border border-red-500/20 rounded-[24px] flex items-center justify-center gap-3 text-red-500 hover:bg-red-500 hover:text-white hover:scale-[1.02] active:scale-95 transition-all font-black uppercase tracking-widest text-xs shadow-xl shadow-red-500/5"
          >
            <LogOut className="w-5 h-5" />
            Sair da Conta
          </button>
          <p className="text-[10px] text-neutral-700 text-center mt-6 font-mono font-bold tracking-widest uppercase">ID: KET-7729-PAS • VERSÃO 2.4.0</p>
        </div>
      </div>
    </div>
  );
}
