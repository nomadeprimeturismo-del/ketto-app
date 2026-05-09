import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Car, User, ArrowRight, Shield, HelpCircle } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans flex flex-col overflow-y-auto">
      {/* Header Navigation */}
      <nav className="h-20 border-b border-neutral-800 px-10 flex items-center justify-between glass z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
             <div className="w-5 h-5 bg-black rounded-sm transform rotate-45"></div>
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-white">KETTO<span className="text-yellow-400">MOBILIDADE</span></h1>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <a href="#" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors flex items-center gap-2">
            <HelpCircle className="w-4 h-4" /> Suporte
          </a>
          <a href="#" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors flex items-center gap-2">
            <Shield className="w-4 h-4" /> Segurança
          </a>
          <button 
            onClick={() => navigate('/login')}
            className="px-6 py-2 border border-yellow-400/30 text-yellow-400 rounded-full text-sm font-bold hover:bg-yellow-400/10 transition-all"
          >
            Entrar
          </button>
        </div>
      </nav>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Section: Main Hero & Interaction */}
        <div className="flex-1 p-12 flex flex-col justify-center relative overflow-y-auto">
          {/* Grid Decoration */}
          <div className="absolute inset-0 opacity-5 pointer-events-none grid-pattern"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto lg:mx-0">
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-yellow-400 text-xs font-bold uppercase tracking-[0.3em] mb-4 block"
            >
              Bem-vindo ao futuro da mobilidade
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl lg:text-7xl font-extrabold text-white leading-tight mb-6 tracking-tighter"
            >
              Movimente-se com <span className="text-yellow-400">liberdade</span> e estilo.
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-neutral-400 text-lg mb-10 leading-relaxed max-w-lg"
            >
              Seja para cruzar a cidade ou para ganhar dinheiro dirigindo, o Ketto é a plataforma mais completa, segura e justa da região.
            </motion.p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Option: Passenger */}
              <motion.button 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => navigate('/register/passenger')}
                className="group p-8 bg-neutral-900 border border-neutral-800 rounded-2xl text-left hover:border-yellow-400 transition-all shadow-2xl relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-neutral-800 rounded-xl mb-6 flex items-center justify-center group-hover:bg-yellow-400 transition-colors">
                    <User className="w-6 h-6 text-yellow-400 group-hover:text-black transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Sou Passageiro</h3>
                  <p className="text-xs text-neutral-500">Vá para qualquer lugar com segurança e o melhor preço.</p>
                  <div className="mt-6 flex items-center text-yellow-400 font-bold text-sm">
                    Cadastrar <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </motion.button>

              {/* Option: Driver */}
              <motion.button 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={() => navigate('/register/driver')}
                className="group p-8 bg-neutral-900 border border-neutral-800 rounded-2xl text-left hover:border-yellow-400 transition-all shadow-2xl relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-neutral-800 rounded-xl mb-6 flex items-center justify-center group-hover:bg-yellow-400 transition-colors">
                    <Car className="w-6 h-6 text-yellow-400 group-hover:text-black transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Sou Motorista</h3>
                  <p className="text-xs text-neutral-500">Ganhe dinheiro com o seu tempo. As menores taxas do mercado.</p>
                  <div className="mt-6 flex items-center text-yellow-400 font-bold text-sm">
                    Seja Parceiro <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </motion.button>
            </div>

            <div className="mt-12 flex items-center gap-4 py-4 border-t border-neutral-800">
              <p className="text-xs text-neutral-500">Gerenciamento administrativo?</p>
              <button 
                onClick={() => navigate('/login')}
                className="text-xs font-bold text-white underline underline-offset-4 hover:text-yellow-400 transition-colors"
              >
                Acessar Painel Admin
              </button>
            </div>
          </div>
        </div>

        {/* Right Section: Visual Accent (Desktop only) */}
        <div className="hidden lg:flex w-[450px] bg-neutral-900 border-l border-neutral-800 p-12 flex-col justify-center items-center relative overflow-hidden">
           {/* Abstract Circle Decoration */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-400/5 rounded-full blur-[100px]"></div>
           
           <div className="relative z-10 space-y-8 w-full">
              <div className="bg-neutral-800 p-6 rounded-3xl border border-neutral-700 shadow-2xl transform hover:scale-[1.02] transition-transform">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Atividade Recente</span>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-neutral-700 animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-2 w-24 bg-neutral-700 rounded animate-pulse"></div>
                        <div className="h-1.5 w-16 bg-neutral-800 rounded animate-pulse"></div>
                      </div>
                      <div className="h-3 w-10 bg-neutral-700 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-yellow-400 p-6 rounded-3xl border border-black shadow-2xl">
                <div className="flex justify-between items-center mb-2">
                   <h4 className="font-black text-black uppercase italic tracking-tighter">Live Stats</h4>
                   <Car className="text-black/40 w-5 h-5" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] font-bold text-black/60 uppercase">Viagens hoje</div>
                    <div className="text-2xl font-black text-black tracking-tighter">+1,280</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-black/60 uppercase">Motoristas</div>
                    <div className="text-2xl font-black text-black tracking-tighter">842</div>
                  </div>
                </div>
              </div>
           </div>
        </div>
      </main>

      <footer className="h-12 border-t border-neutral-900 px-10 flex items-center justify-between text-[10px] text-neutral-600">
        <div>© 2026 Ketto Mobilidade Tecnologia. Todos os direitos reservados.</div>
        <div className="flex gap-4">
          <a href="#" className="hover:text-neutral-400 transition-colors">Privacidade</a>
          <a href="#" className="hover:text-neutral-400 transition-colors">Termos de Uso</a>
          <a href="#" className="hover:text-neutral-400 transition-colors">Cidades Atendidas</a>
        </div>
      </footer>
    </div>
  );
}
