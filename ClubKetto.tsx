import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, Gift, Zap, Star, ShieldCheck, 
  TrendingUp, ChevronRight, Crown, History, 
  Target, Trophy, Flame, CheckCircle2, Award,
  Sparkles, Gem, Diamond, Medal, Clock, ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ClubKettoLevel, PointsHistory } from '../../types';
import confetti from 'canvas-confetti';
import { onSnapshot, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface Tier {
  name: string;
  minPoints: number;
  color: string;
  icon: any;
  cashback: string;
  benefits: string[];
  gradient: string;
  badge?: string;
}

const TIERS: Tier[] = [
  {
    name: 'BRONZE',
    minPoints: 0,
    color: 'text-orange-400',
    icon: Medal,
    cashback: '1%',
    gradient: 'from-orange-950/20 via-neutral-900 to-neutral-950',
    benefits: [
      'Cupons básicos',
      'Promoções ocasionais',
      'Participação no programa de pontos',
      'Cashback de 1%',
      'Convites para campanhas'
    ]
  },
  {
    name: 'PRATA',
    minPoints: 5000,
    color: 'text-slate-300',
    icon: Award,
    cashback: '3%',
    gradient: 'from-slate-800/20 via-neutral-900 to-neutral-950',
    benefits: [
      'Cashback 3%',
      'Cupom mensal',
      'Descontos em horários específicos',
      'Prioridade leve no suporte',
      'Acúmulo de pontos mais rápido em campanhas'
    ]
  },
  {
    name: 'OURO',
    minPoints: 20000,
    color: 'text-yellow-400',
    icon: Trophy,
    cashback: '5%',
    gradient: 'from-yellow-600/10 via-neutral-900 to-neutral-950',
    benefits: [
      'Cashback 5%',
      'Motoristas mais bem avaliados primeiro',
      'Cancelamento grátis limitado',
      'Cupons premium',
      'Promoções exclusivas',
      'Prioridade média no suporte',
      'Descontos em parceiros'
    ]
  },
  {
    name: 'DIAMANTE',
    minPoints: 50000,
    color: 'text-cyan-400',
    icon: Diamond,
    cashback: '10%',
    badge: '💎',
    gradient: 'from-cyan-600/10 via-neutral-900 to-neutral-950',
    benefits: [
      'Cashback 10%',
      'Atendimento VIP',
      'Prioridade alta para encontrar motorista',
      'Corridas promocionais exclusivas',
      'Cupons grandes',
      'Suporte ultra rápido',
      'Taxas reduzidas no KettoPay',
      'Benefícios parceiros premium',
      'Descontos em delivery',
      'Badge Diamante no perfil'
    ]
  },
  {
    name: 'BLACK',
    minPoints: 120000,
    color: 'text-purple-500',
    icon: Crown,
    cashback: '15%',
    badge: '🎩',
    gradient: 'from-purple-900/20 via-neutral-900 to-neutral-800',
    benefits: [
      'Cashback 15%',
      'Prioridade máxima na busca de motorista',
      'Motoristas VIP primeiro',
      'Atendimento exclusivo',
      'Gerente de suporte prioritário',
      'Corridas especiais e executivas',
      'Cupons muito maiores',
      'Benefícios secretos/exclusivos',
      'Convites para eventos',
      'Sorteios premium',
      'Badge BLACK animada',
      'Taxas reduzidas em tudo',
      'Atendimento sem fila',
      'Promoções antecipadas',
      'Maior ganho de pontos em campanhas',
      '“Missões VIP” exclusivas'
    ]
  }
];

export default function ClubKetto() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const [history, setHistory] = useState<PointsHistory[]>([]);
  const [lastLevel, setLastLevel] = useState<ClubKettoLevel | null>(null);
  const [lastPoints, setLastPoints] = useState<number>(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showPointsToast, setShowPointsToast] = useState(false);
  const [earnedAmount, setEarnedAmount] = useState(0);
  
  const points = profile?.clubPoints || profile?.pontos || 0;
  const currentLevel = profile?.clubLevel || (profile?.nivel as ClubKettoLevel) || 'BRONZE';
  
  const currentTier = TIERS.find(t => t.name === currentLevel) || TIERS[0];
  const nextTier = TIERS[TIERS.indexOf(currentTier) + 1];

  const progress = nextTier 
    ? ((points - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100 
    : 100;

  useEffect(() => {
    if (!user?.uid) return;

    // Real-time Points History
    const q = query(
      collection(db, 'pointsHistory'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const historyItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PointsHistory[];
      setHistory(historyItems);
    }, (error) => {
      console.error("[ClubKetto] Error in history listener:", error);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  useEffect(() => {
    // Detect Level Change
    if (profile?.clubLevel && lastLevel && profile.clubLevel !== lastLevel) {
      setShowLevelUp(true);
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#FFD400', '#8B5CF6', '#3B82F6']
      });
    }
    if (profile?.clubLevel) setLastLevel(profile.clubLevel);

    // Detect Points Gain
    if (profile?.clubPoints && lastPoints && profile.clubPoints > lastPoints) {
      const diff = profile.clubPoints - lastPoints;
      setEarnedAmount(diff);
      setShowPointsToast(true);
      setTimeout(() => setShowPointsToast(false), 5000);
      
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.8 },
        colors: ['#FFD400']
      });
    }
    if (profile?.clubPoints) setLastPoints(profile.clubPoints);
  }, [profile?.clubLevel, profile?.clubPoints]);

  const handleClaimReward = () => {
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#FFD400', '#8B5CF6', '#3B82F6']
    });
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans pb-32 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-800 px-6 py-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/passenger')}
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-xl font-black uppercase tracking-tighter italic text-yellow-400 leading-none">Clube Ketto</h1>
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em]">Fidelidade de Elite</span>
          </div>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-full flex items-center gap-2">
           <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400" />
           <span className="text-xs font-black tracking-tighter">{points.toLocaleString()} PTS</span>
        </div>
      </div>

      <div className="px-6 py-8 space-y-8">
        
        {/* Tier Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-10 bg-gradient-to-br ${currentTier.gradient} border border-neutral-700/50 rounded-[48px] shadow-2xl relative overflow-hidden group`}
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
             <currentTier.icon className="w-56 h-56 rotate-12" />
          </div>
          
          {currentTier.name === 'BLACK' && (
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
          )}

          <div className="relative z-10 flex flex-col items-center text-center">
             <motion.div 
               animate={currentTier.name === 'BLACK' ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
               transition={{ duration: 4, repeat: Infinity }}
               className="w-24 h-24 bg-neutral-950/80 backdrop-blur-xl rounded-[24px] flex items-center justify-center border border-white/10 mb-8 shadow-2xl rotate-3"
             >
                <currentTier.icon className={`w-12 h-12 ${currentTier.color}`} />
             </motion.div>
             
             <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-500 mb-3">Status de Membro</h2>
             <div className={`text-5xl font-black italic tracking-tighter mb-6 flex items-center gap-3 ${currentTier.color === 'text-purple-500' ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-600' : ''}`}>
               {currentTier.name} {currentTier.badge}
             </div>
             
             <div className="w-full space-y-3">
               <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-neutral-500 px-1">
                 <span>{points.toLocaleString()} PTS</span>
                 {nextTier && <span>{nextTier.minPoints.toLocaleString()} PTS</span>}
               </div>
               <div className="w-full bg-neutral-900 h-3 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={`h-full bg-gradient-to-r ${currentTier.name === 'BLACK' ? 'from-purple-500 to-fuchsia-600' : 'from-yellow-400 to-yellow-600'} shadow-[0_0_20px_rgba(250,204,21,0.3)]`}
                  ></motion.div>
               </div>
               {nextTier ? (
                 <p className="text-[11px] font-bold text-neutral-400 italic">
                   Faltam apenas <span className="text-white px-1 font-black">{(nextTier.minPoints - points).toLocaleString()}</span> pontos para virar <span className="text-yellow-400 font-black tracking-tighter">{nextTier.name} {nextTier.badge}</span>
                 </p>
               ) : (
                 <p className="text-[11px] font-black text-purple-400 italic animate-pulse">Você atingiu o topo! Status Máximo Alcançado.</p>
               )}
             </div>
          </div>
        </motion.div>

        {/* Daily Mission / Points in Double */}
        <div className="grid grid-cols-2 gap-4">
           <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-[32px] relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12 group-hover:scale-125 transition-transform">
                 <Target className="w-20 h-20 text-emerald-500" />
              </div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2">Missão Diária</h4>
              <p className="text-xs font-bold text-white leading-tight mb-3">Faça 2 corridas hoje</p>
              <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                 {profile?.corridas_hoje || 0}/2 CONCLUÍDO
              </div>
           </div>
           
           <div className="p-6 bg-yellow-400/10 border border-yellow-400/20 rounded-[32px] relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-10 -rotate-12 group-hover:scale-125 transition-transform">
                 <Flame className="w-20 h-20 text-yellow-500" />
              </div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-yellow-500 mb-2">Pontos em Dobro</h4>
              <p className="text-xs font-bold text-white leading-tight mb-3">Ativo em corridas Comfort</p>
              <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">2.0X ATIVO</span>
           </div>
        </div>

        {/* Benefits Section */}
        <div className="space-y-6">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-black uppercase tracking-tighter italic flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400" /> Seus Benefícios {currentTier.name}
              </h3>
              <div className="px-3 py-1 bg-emerald-500/20 rounded-full text-[9px] font-black text-emerald-400 border border-emerald-500/10 uppercase tracking-widest">
                CASHBACK {currentTier.cashback}
              </div>
           </div>
           
           <div className="grid grid-cols-1 gap-3">
              {currentTier.benefits.map((benefit, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={i} 
                  className="p-5 bg-neutral-900 border border-neutral-800 rounded-[28px] flex items-center gap-4 group hover:bg-neutral-800 transition-colors"
                >
                   <div className="w-10 h-10 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                   </div>
                   <span className="text-xs font-black text-neutral-300 uppercase tracking-tight">{benefit}</span>
                </motion.div>
              ))}
           </div>
        </div>

        {/* History List */}
        <div className="space-y-6">
           <h3 className="text-sm font-black uppercase tracking-tighter italic flex items-center gap-2 px-2">
              <Clock className="w-4 h-4 text-yellow-400" /> Histórico de Pontos
           </h3>
           <div className="bg-neutral-900 border border-neutral-800 rounded-[32px] overflow-hidden">
              {history.length > 0 ? (
                history.map((item, i) => (
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    key={item.id} 
                    className={`p-5 flex items-center gap-4 ${i !== history.length - 1 ? 'border-b border-neutral-800' : ''} hover:bg-white/5 transition-colors`}
                  >
                     <div className="w-10 h-10 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center shrink-0">
                       <Star className="w-5 h-5 text-yellow-400" />
                     </div>
                     <div className="flex-1">
                        <div className="text-xs font-black uppercase tracking-tight">Viagem Concluída</div>
                        <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                          {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString('pt-BR') : 'Recentemente'}
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="text-sm font-black tracking-tighter text-yellow-400">+{item.points}</div>
                        <div className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">PONTOS</div>
                     </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-10 text-center space-y-2 opacity-50">
                   <Clock className="w-8 h-8 mx-auto text-neutral-600" />
                   <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">Nenhum ponto acumulado ainda</p>
                </div>
              )}
           </div>
        </div>

        {/* Action Button: Instant Reward */}
        <div className="pt-4">
           <button 
             onClick={handleClaimReward}
             className="w-full py-6 bg-yellow-400 text-black rounded-[32px] font-black uppercase tracking-widest text-sm shadow-2xl shadow-yellow-400/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 group"
           >
              <Gift className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              Resgatar Recompensa Diária
           </button>
           <p className="text-center text-[10px] font-bold text-neutral-600 mt-4 uppercase tracking-[0.2em]">Disponível a cada 24 horas</p>
        </div>

      </div>

      {/* Points Toast */}
      <AnimatePresence>
        {showPointsToast && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="fixed bottom-12 left-6 right-6 z-[110]"
          >
            <div className="bg-yellow-400 text-black p-4 rounded-3xl shadow-2xl flex items-center gap-4">
               <div className="bg-black/20 w-10 h-10 rounded-full flex items-center justify-center">
                 <Star className="w-5 h-5" />
               </div>
               <div className="flex-1">
                 <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Parabéns!</div>
                 <div className="text-sm font-black leading-none">+{earnedAmount} Pontos Adicionados!</div>
               </div>
               <button onClick={() => setShowPointsToast(false)} className="opacity-40 hover:opacity-100 transition-opacity p-2">
                 <ArrowLeft className="w-4 h-4 rotate-90" />
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level Up Modal */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 50, opacity: 0 }}
              className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-[48px] p-10 text-center space-y-8 shadow-[0_0_100px_rgba(250,204,21,0.2)]"
            >
              <div className="relative mx-auto w-32 h-32 bg-yellow-400 rounded-[32px] flex items-center justify-center rotate-6 shadow-2xl">
                 <Trophy className="w-16 h-16 text-black" />
                 <motion.div 
                   animate={{ scale: [1, 1.5, 1], opacity: [0, 1, 0] }}
                   transition={{ duration: 2, repeat: Infinity }}
                   className="absolute inset-0 bg-white rounded-[32px]"
                 ></motion.div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-tight">
                  PARABÉNS!<br/>
                  NÍVEL <span className="text-yellow-400">{currentLevel}</span>
                </h2>
                <p className="text-sm font-bold text-neutral-400">Você desbloqueou novos benefícios exclusivos e seu cashback aumentou!</p>
              </div>

              <div className="p-6 bg-neutral-950 rounded-[32px] border border-neutral-800 flex items-center justify-center gap-4">
                 <div className="text-left flex-1 text-xs font-black uppercase tracking-widest text-neutral-500">Novo Cashback</div>
                 <div className="text-2xl font-black text-emerald-400 tracking-tighter">{currentTier.cashback}</div>
              </div>

              <button 
                onClick={() => setShowLevelUp(false)}
                className="w-full py-5 bg-white text-black rounded-[24px] font-black uppercase tracking-widest hover:bg-neutral-200 transition-colors"
              >
                VAMOS NESSA!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

