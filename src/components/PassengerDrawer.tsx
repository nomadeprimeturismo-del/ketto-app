import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { 
  X, 
  History, 
  Wallet, 
  HelpCircle, 
  MessageSquare, 
  Shield, 
  CreditCard, 
  Settings, 
  Users, 
  UserPlus, 
  Car, 
  Tag,
  CheckCircle2,
  ChevronRight,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface PassengerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const PassengerDrawer: React.FC<PassengerDrawerProps> = ({ isOpen, onClose }) => {
  const { profile, clubKetto } = useAuth();
  const navigate = useNavigate();

  const getTier = (level: string) => {
    switch (level) {
      case 'BLACK': return { name: 'Black', color: 'text-purple-600', badge: '🎩' };
      case 'DIAMANTE': return { name: 'Diamante', color: 'text-cyan-600', badge: '💎' };
      case 'OURO': return { name: 'Ouro', color: 'text-yellow-600', badge: '🏆' };
      case 'PRATA': return { name: 'Prata', color: 'text-slate-500', badge: '🥈' };
      default: return { name: 'Bronze', color: 'text-orange-600', badge: '🥉' };
    }
  };

  const points = clubKetto?.totalPoints || profile?.pontos || 0;
  const level = clubKetto?.currentLevel || profile?.nivel || 'BRONZE';
  const tier = getTier(level);

  const menuItems = [
    { id: 'atividade', name: 'Atividade', icon: History, color: 'text-zinc-900', path: '/passenger/activity' },
    { id: 'carteira', name: 'Carteira / KettoPay', icon: Wallet, color: 'text-zinc-900', path: '/passenger/wallet' },
    { id: 'ajuda', name: 'Ajuda', icon: HelpCircle, color: 'text-zinc-900', path: '/passenger/help' },
    { id: 'mensagens', name: 'Mensagens', icon: MessageSquare, color: 'text-zinc-900', path: '/passenger/messages' },
    { id: 'seguranca', name: 'Central de Segurança', icon: Shield, color: 'text-blue-500', path: '/passenger/security' },
    { id: 'pagamentos', name: 'Métodos de Pagamento', icon: CreditCard, color: 'text-zinc-900', path: '/passenger/payments' },
    { id: 'configuracoes', name: 'Configurações', icon: Settings, color: 'text-zinc-900', path: '/passenger/settings' },
    { id: 'convide-amigos', name: 'Convide amigos', icon: Users, color: 'text-zinc-900', path: '/passenger/invite' },
    { id: 'convide-motoristas', name: 'Convide motoristas', icon: UserPlus, color: 'text-zinc-900', path: '/passenger/invite-driver' },
    { id: 'seja-motorista', name: 'Seja motorista', icon: Car, color: 'text-emerald-500', path: '/register/driver' },
    { id: 'descontos', name: 'Descontos', icon: Tag, color: 'text-zinc-900', path: '/passenger/promos' },
  ];

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[999] pointer-events-auto"
          />

          {/* Drawer Wrapper */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-[85%] max-w-[360px] bg-white z-[1000] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header / Profile Section */}
            <div className="pt-14 pb-6 px-6 bg-white border-b border-zinc-100 relative">
              <button 
                onClick={onClose}
                className="absolute top-4 left-4 p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-4 mt-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center overflow-hidden border border-zinc-200">
                    {profile?.foto_perfil ? (
                      <img src={profile.foto_perfil} alt={profile.nome} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-zinc-400">
                        <UserIcon className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-zinc-900 text-lg tracking-tight truncate max-w-[160px]">
                      {profile?.nome || 'Passageiro'}
                    </h3>
                    <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-500/10" />
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${tier.color}`}>
                      {tier.name} {tier.badge}
                    </span>
                    <span className="w-1 h-1 bg-zinc-300 rounded-full"></span>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                      {points.toLocaleString()} PTS
                    </span>
                  </div>
                  <button 
                    onClick={() => { navigate('/passenger/profile'); onClose(); }}
                    className="text-[10px] font-bold text-zinc-400 hover:text-yellow-500 transition-colors mt-2 uppercase tracking-tighter"
                  >
                    Editar informações
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar py-6">
              {/* Premium Card */}
              <div className="px-6 mb-8">
                <div className="bg-[#FFFCE8] border border-[#FFD400]/20 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                  <div>
                    <h4 className="font-black text-[#FFD400] text-sm uppercase italic tracking-tighter leading-none">Clube Ketto</h4>
                    <p className="text-[10px] text-zinc-500 font-medium mt-1">Receba cupons e benefícios exclusivos</p>
                  </div>
                  <button 
                    onClick={() => { navigate('/passenger/club'); onClose(); }}
                    className="bg-[#FFD400] text-black px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-sm"
                  >
                    Ver
                  </button>
                </div>
              </div>

              {/* Menu List */}
              <div className="px-3 space-y-1">
                {menuItems.map((item) => (
                  <motion.button
                    key={item.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { navigate(item.path); onClose(); }}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-zinc-50 transition-colors group relative overflow-hidden"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg bg-zinc-50 group-hover:bg-white transition-colors ${item.color}`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-semibold text-zinc-700 tracking-tight">{item.name}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-400 transition-colors" />
                    
                    {/* Ripple Effect Placeholder - Could be implemented with more complex logic if needed */}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-zinc-100 bg-zinc-50/50">
              <button 
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 py-4 bg-zinc-100 text-zinc-500 rounded-2xl font-bold text-sm tracking-tight hover:bg-red-50 hover:text-red-500 transition-all border border-zinc-200"
              >
                <LogOut className="w-4 h-4" />
                Sair da conta
              </button>
              <p className="text-[10px] text-zinc-400 text-center mt-4 font-medium italic opacity-50">Versão 2.4.0 • Ketto Mobility</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PassengerDrawer;
