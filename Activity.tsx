import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Calendar, MapPin, Star, MoreVertical, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Ride } from '../../types';

export default function Activity() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    const fetchRides = async () => {
      if (!user) return;
      try {
        const ridesRef = collection(db, 'rides');
        const q = query(
          ridesRef, 
          where('passageiro_id', '==', user.uid),
          orderBy('criado_em', 'desc')
        );
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ride));
        setRides(data);
      } catch (error) {
        console.error('Error fetching rides:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRides();
  }, [user]);

  const filteredRides = rides.filter(ride => {
    if (filter === 'completed') return ride.status === 'finalizada';
    if (filter === 'cancelled') return ride.status === 'cancelada';
    return true;
  });

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
          <h1 className="text-xl font-black uppercase tracking-tighter italic">Atividade</h1>
        </div>
        <button className="p-2 text-neutral-500 hover:text-white transition-colors">
          <Search className="w-5 h-5" />
        </button>
      </div>

      <div className="px-6 py-6 space-y-8">
        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {[
            { id: 'all', label: 'Tudo' },
            { id: 'completed', label: 'Concluídas' },
            { id: 'cancelled', label: 'Canceladas' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id as any)}
              className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                filter === item.id 
                ? 'bg-yellow-400 border-black text-black' 
                : 'bg-neutral-900 border-neutral-800 text-neutral-500'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-neutral-900/50 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredRides.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mb-6 border border-neutral-800">
               <Calendar className="w-8 h-8 text-neutral-700" />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight text-neutral-400">Nenhuma atividade</h3>
            <p className="text-xs text-neutral-600 font-bold mt-2">Suas corridas aparecerão aqui.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRides.map((ride) => (
              <motion.div
                key={ride.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-neutral-900 border border-neutral-800 rounded-[32px] p-6 group hover:border-neutral-700 transition-colors"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center shadow-inner">
                      <MapPin className={`w-6 h-6 ${ride.status === 'cancelada' ? 'text-red-500' : 'text-yellow-400'}`} />
                    </div>
                    <div>
                      <div className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-1">
                        {ride.status === 'finalizada' ? 'Corrida Concluída' : ride.status === 'cancelada' ? 'Corrida Cancelada' : 'Em Andamento'}
                      </div>
                      <div className="text-[10px] font-bold text-neutral-600">
                        {ride.criado_em?.toDate ? ride.criado_em.toDate().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Recentemente'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-white italic tracking-tighter">R$ {ride.valor_estimado.toFixed(2)}</div>
                    <div className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">{ride.forma_pagamento}</div>
                  </div>
                </div>

                <div className="space-y-3 relative mb-6">
                  <div className="absolute left-[7px] top-4 bottom-4 w-0.5 bg-neutral-800"></div>
                  <div className="flex items-center gap-4 relative">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-yellow-400 bg-neutral-900 z-10"></div>
                    <div className="text-xs font-bold text-neutral-400 truncate">{ride.endereco_origem}</div>
                  </div>
                  <div className="flex items-center gap-4 relative">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-red-500 bg-neutral-900 z-10"></div>
                    <div className="text-xs font-bold text-neutral-400 truncate">{ride.endereco_destino}</div>
                  </div>
                </div>

                {ride.status === 'finalizada' && (
                  <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                       <span className="text-xs font-black text-white">5.0</span>
                    </div>
                    <button className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 hover:text-white transition-colors">Recibo</button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
