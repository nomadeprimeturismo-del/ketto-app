import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Map from '../../components/Map';
import { auth, db } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import { Power, MapPin, Navigation, Car, DollarSign, LogOut, User, CheckCircle2, X, Clock, Calendar, ArrowRight, Flame, Star, CreditCard, AlertCircle, Wallet, Banknote, Zap } from 'lucide-react';
import { updateRideStatus } from '../../services/rideService';
import { Ride, DriverProfile } from '../../types';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';

import { startLocationTracking, stopLocationTracking } from '../../lib/geolocation';
import RouteDisplay from '../../components/RouteDisplay';
import CarMarker from '../../components/CarMarker';

export default function DriverHome() {
  const { profile, driverProfile } = useAuth();
  const [online, setOnline] = useState(false);
  const [availableRides, setAvailableRides] = useState<Ride[]>([]);
  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(false);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [passengerLocation, setPassengerLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (driverProfile) {
      setOnline(driverProfile.online);
    }
  }, [driverProfile]);

  // Geolocation Tracking
  useEffect(() => {
    if (!profile || !online) return;

    const watchId = startLocationTracking(profile.uid, 'motorista');
    
    // Also update local state for real-time map feedback
    const watchIdLocal = navigator.geolocation.watchPosition(
      (pos) => setDriverLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true }
    );

    return () => {
      if (watchId) stopLocationTracking(watchId);
      navigator.geolocation.clearWatch(watchIdLocal);
    };
  }, [profile, online]);

  // Monitor available rides when online
  useEffect(() => {
    if (!online || activeRide) {
      setAvailableRides([]);
      return;
    }

    const categories = driverProfile?.tipo_veiculo === 'carro' 
      ? ['economico', 'conforto', 'entrega'] 
      : driverProfile?.tipo_veiculo === 'moto' 
        ? ['moto', 'entrega'] 
        : ['economico', 'moto', 'entrega', 'conforto'];

    const q = query(
      collection(db, 'rides'),
      where('status', '==', 'solicitada'),
      where('categoria', 'in', categories)
    );

    return onSnapshot(q, (snapshot) => {
      const rides = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ride));
      setAvailableRides(rides);
    });
  }, [online, activeRide, driverProfile]);

  // Monitor active ride
  useEffect(() => {
    if (!profile) return;
    const q = query(
      collection(db, 'rides'),
      where('motorista_id', '==', profile.uid),
      where('status', 'in', ['aceita', 'motorista_chegando', 'em_andamento'])
    );

    return onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setActiveRide({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Ride);
      } else {
        setActiveRide(null);
      }
    });
  }, [profile]);

  // Monitor passenger location in real-time
  useEffect(() => {
    if (!activeRide?.passageiro_id || activeRide.status === 'finalizada' || activeRide.status === 'cancelada') {
      setPassengerLocation(null);
      return;
    }

    const unsubPassenger = onSnapshot(doc(db, 'users', activeRide.passageiro_id), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.latitude && data.longitude) {
          setPassengerLocation({ lat: data.latitude, lng: data.longitude });
        }
      }
    });

    return () => unsubPassenger();
  }, [activeRide?.passageiro_id, activeRide?.status]);

  const toggleOnline = async () => {
    if (!profile) return;
    const newStatus = !online;
    setOnline(newStatus);
    await updateDoc(doc(db, 'drivers', profile.uid), {
      online: newStatus
    });
  };

  const handleAcceptRide = async (rideId: string) => {
    if (!profile) return;
    setLoading(true);
    await updateRideStatus(rideId, 'aceita', { motorista_id: profile.uid });
    setLoading(false);
  };

  const handleStatusUpdate = async (newStatus: any) => {
    console.log('handleStatusUpdate called with:', newStatus);
    if (!activeRide) {
      console.log('No active ride found in state');
      return;
    }
    setLoading(true);
    try {
      console.log('Updating ride:', activeRide.id, 'to status:', newStatus);
      await updateRideStatus(activeRide.id, newStatus, {}, activeRide);
      console.log('Ride update success');
    } catch (error) {
      console.error('Error updating ride status:', error);
      alert('Erro ao atualizar status da viagem: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  const getPaymentInfo = (method: string) => {
    switch (method) {
      case 'dinheiro':
        return { icon: <Banknote className="w-4 h-4" />, label: 'Dinheiro', color: 'text-emerald-400' };
      case 'pix':
        return { icon: <Zap className="w-4 h-4" />, label: 'PIX', color: 'text-blue-400' };
      case 'debito':
        return { icon: <CreditCard className="w-4 h-4" />, label: 'Débito', color: 'text-zinc-400' };
      case 'kettopay':
        return { icon: <Wallet className="w-4 h-4" />, label: 'KettoPay', color: 'text-yellow-400' };
      default:
        return { icon: <CreditCard className="w-4 h-4" />, label: 'Cartão', color: 'text-blue-400' };
    }
  };

  if (driverProfile?.status_aprovacao !== 'aprovado') {
    return (
      <div className="h-screen w-full bg-zinc-950 flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-3xl flex items-center justify-center mb-6">
          <Clock className="w-10 h-10 text-yellow-500 animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Perfil em Análise</h2>
        <p className="text-zinc-500 max-w-xs mx-auto mb-8">
          Seu cadastro foi recebido com sucesso! Nossa equipe está revisando seus documentos. Em breve você poderá começar a dirigir.
        </p>
        <button 
          onClick={async () => {
            if (profile) {
              await updateDoc(doc(db, 'drivers', profile.uid), { status_aprovacao: 'aprovado' });
            }
          }} 
          className="px-8 py-3 bg-yellow-400 text-black rounded-xl font-black uppercase tracking-tighter shadow-lg shadow-yellow-400/20 active:scale-95 transition-all mb-4"
        >
          Auto-Aprovar para Testes
        </button>
        <button onClick={() => signOut(auth)} className="px-8 py-3 bg-zinc-800 border border-zinc-700 rounded-xl font-bold flex items-center gap-2 text-zinc-400">
          <LogOut className="w-4 h-4" /> Sair
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-neutral-950 flex flex-col font-sans text-neutral-100 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5 pointer-events-none grid-pattern z-0"></div>

      {/* Top Controller Bar */}
      <div className="absolute top-0 left-0 w-full z-50 p-6 flex items-start justify-between">
        <div className="flex flex-col gap-4">
          <div className="bg-neutral-900/90 backdrop-blur-xl border border-neutral-800 p-2 pl-6 rounded-[28px] shadow-2xl flex items-center gap-6 min-w-[240px]">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${online ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]'}`}></div>
                <span className={`font-black text-[10px] uppercase tracking-[0.2em] ${online ? 'text-emerald-400' : 'text-red-500'}`}>
                  {online ? 'Operando' : 'Offline'}
                </span>
              </div>
              <div className="text-[14px] font-black italic tracking-tighter text-white uppercase mt-0.5">
                {online ? 'Buscando Corridas' : 'Fora de Serviço'}
              </div>
            </div>
            <button 
              onClick={toggleOnline}
              className={`ml-auto w-14 h-14 rounded-[22px] flex items-center justify-center transition-all shadow-xl active:scale-90 ${online ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-yellow-400 text-black border-4 border-neutral-900'}`}
            >
              <Power className="w-6 h-6 stroke-[3px]" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 h-fit">
          <div className="bg-neutral-900/90 backdrop-blur-xl border border-neutral-800 p-3 rounded-2xl shadow-xl flex flex-col items-center gap-3">
             <div className="w-12 h-12 bg-neutral-950 rounded-xl flex items-center justify-center border border-neutral-800 group hover:border-yellow-400/50 transition-colors">
               <User className="text-neutral-500 w-6 h-6 group-hover:text-yellow-400 transition-colors" />
             </div>
             <div className="w-full h-px bg-neutral-800 mx-2"></div>
             <button 
               onClick={() => signOut(auth)} 
               className="w-12 h-12 flex items-center justify-center text-neutral-500 hover:text-red-500 transition-all rounded-xl hover:bg-red-500/10"
               title="Sair da Conta"
             >
               <LogOut className="w-6 h-6" />
             </button>
          </div>
        </div>
      </div>

      <div className="flex-1 relative z-10">
        <Map 
           center={driverLocation || { lat: -23.5505, lng: -46.6333 }}
           followDriver={true}
           markers={activeRide ? [
             { id: 'pickup', lat: passengerLocation?.lat || activeRide.latitude_origem, lng: passengerLocation?.lng || activeRide.longitude_origem, color: '#FACC15', label: 'Passageiro' },
             { id: 'dest', lat: activeRide.latitude_destino, lng: activeRide.longitude_destino, color: '#ef4444', label: 'Destino' }
           ] : []}
        >
          {driverLocation && (
            <CarMarker 
              position={driverLocation} 
              label="Você (Motorista)"
            />
          )}

          {activeRide && (
            <>
              {/* Route to Pickup */}
              {(activeRide.status === 'aceita' || activeRide.status === 'motorista_chegando') && driverLocation && (
                <RouteDisplay 
                  origin={driverLocation} 
                  destination={passengerLocation || { lat: activeRide.latitude_origem, lng: activeRide.longitude_origem }} 
                  color="#eab308"
                />
              )}
              {/* Route to Destination */}
              {activeRide.status === 'em_andamento' && driverLocation && (
                <RouteDisplay 
                  origin={driverLocation} 
                  destination={{ lat: activeRide.latitude_destino, lng: activeRide.longitude_destino }} 
                  color="#3b82f6"
                />
              )}
            </>
          )}
        </Map>

        {/* Floating UI Panels */}
        <div className="absolute bottom-0 left-0 w-full p-8 z-50 pointer-events-none pb-12">
          <div className="max-w-xl mx-auto w-full pointer-events-auto">
            <AnimatePresence mode="wait">
              {activeRide ? (
                <motion.div 
                  initial={{ y: 200, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 200, opacity: 0 }}
                  className="bg-neutral-900 border border-neutral-800 rounded-[40px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden backdrop-blur-md"
                >
                   <div className="absolute top-0 left-0 w-full h-1.5 bg-yellow-400"></div>
                   
                   <div className="flex items-center justify-between mb-8">
                       <div>
                         <div className="flex items-center gap-2 mb-2">
                           <button 
                             onClick={() => {
                               const target = activeRide.status === 'em_andamento' ? activeRide.destino : activeRide.origem;
                               const encodedAddress = encodeURIComponent(target);
                               window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
                             }}
                             className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-400/10 rounded-full border border-yellow-400/20 hover:bg-yellow-400/20 transition-colors"
                           >
                             <Navigation className="w-3 h-3 text-yellow-400" />
                             <span className="text-[10px] text-yellow-400 uppercase font-black tracking-widest italic">Navegar</span>
                           </button>
                           <div className={`flex items-center gap-2 px-3 py-1 bg-neutral-800 rounded-full border border-neutral-700 ${getPaymentInfo(activeRide.forma_pagamento).color}`}>
                             {getPaymentInfo(activeRide.forma_pagamento).icon}
                             <span className="text-[9px] font-black uppercase tracking-widest">{getPaymentInfo(activeRide.forma_pagamento).label}</span>
                           </div>
                         </div>
                         <h4 className="font-black text-3xl uppercase italic tracking-tighter text-white leading-tight">
                          {activeRide.status === 'aceita' ? 'BUSCAR PASSAGEIRO' : 
                           activeRide.status === 'motorista_chegando' ? 'AGUARDANDO EMBARQUE' : 'EM TRÂNSITO'}
                         </h4>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mb-1 italic">VFRETE LÍQUIDO</div>
                        <div className="text-3xl font-black text-white italic tracking-tighter decoration-yellow-400/30 underline underline-offset-4 flex flex-col items-end">
                           <span className="text-[10px] text-neutral-600 line-through font-bold">R$ {activeRide.valor_estimado.toFixed(2)}</span>
                           R$ {(activeRide.valor_estimado * 0.8).toFixed(2)}
                        </div>
                      </div>
                   </div>

                   <div className="space-y-4 mb-8">
                      <div className="relative pl-8 border-l-2 border-dashed border-neutral-800 ml-4 pb-4">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-yellow-400 border-4 border-neutral-900 shadow-[0_0_15px_rgba(250,204,21,0.3)]"></div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1">Partida</div>
                        <div className="text-sm font-bold text-neutral-200 line-clamp-1">{activeRide.origem}</div>
                      </div>
                      <div className="relative pl-8 ml-4">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-red-500 border-4 border-neutral-900 shadow-[0_0_15px_rgba(239,68,68,0.3)]"></div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1">Destino</div>
                        <div className="text-sm font-bold text-neutral-200 line-clamp-1">{activeRide.destino}</div>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 gap-4">
                     {activeRide.status === 'aceita' && (
                       <button disabled={loading} onClick={() => handleStatusUpdate('motorista_chegando')} className="w-full bg-yellow-400 text-black py-6 rounded-[24px] font-black uppercase tracking-tighter text-xl shadow-2xl shadow-yellow-400/20 hover:bg-yellow-300 transition-all active:scale-95 group disabled:opacity-50">
                         <div className="flex items-center justify-center gap-3">
                           <span>{loading ? 'PROCESSANDO...' : 'CHEGUEI NO LOCAL'}</span>
                           <CheckCircle2 className="w-6 h-6" />
                         </div>
                       </button>
                     )}
                     {activeRide.status === 'motorista_chegando' && (
                       <button disabled={loading} onClick={() => handleStatusUpdate('em_andamento')} className="w-full bg-white text-black py-6 rounded-[24px] font-black uppercase tracking-tighter text-xl shadow-2xl shadow-white/20 hover:bg-neutral-200 transition-all active:scale-95 disabled:opacity-50">
                         {loading ? 'PROCESSANDO...' : 'INICIAR CORRIDA'}
                       </button>
                     )}
                      {activeRide.status === 'em_andamento' && (
                        <button 
                          disabled={loading} 
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('FINALIZAR VIAGEM - CLICKED');
                            try {
                              await handleStatusUpdate('finalizada');
                            } catch (err) {
                              console.error('Finalizar action error:', err);
                              alert('Erro ao processar: ' + (err instanceof Error ? err.message : String(err)));
                            }
                          }} 
                          className="w-full bg-emerald-500 text-black py-6 rounded-[24px] font-black uppercase tracking-tighter text-xl shadow-2xl shadow-emerald-500/20 hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-50 relative z-[9999] cursor-pointer pointer-events-auto"
                        >
                          {loading ? 'PROCESSANDO...' : 'FINALIZAR VIAGEM'}
                        </button>
                      )}
                   </div>
                </motion.div>
              ) : availableRides.length > 0 ? (
                <motion.div 
                   initial={{ y: 300, opacity: 0, scale: 0.95 }}
                   animate={{ y: 0, opacity: 1, scale: 1 }}
                   exit={{ y: 300, opacity: 0, scale: 0.95 }}
                   className="bg-zinc-900/95 backdrop-blur-2xl border border-white/10 rounded-[40px] shadow-[0_40px_80px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden w-full max-w-sm mx-auto"
                >
                   {/* Top Header - Status */}
                   <div className="pt-6 pb-4 px-8 flex flex-col items-center gap-2">
                     <div className="flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
                        <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500/80 italic">Corrida Prioritária</span>
                     </div>
                     
                     <div className="text-center mt-2">
                        <div className="text-5xl font-black text-white italic tracking-tighter leading-tight">
                           R$ {(availableRides[0].valor_estimado * 0.8).toFixed(2)}
                        </div>
                        <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                           R$ {(availableRides[0].valor_estimado * 0.8 / availableRides[0].distancia_km).toFixed(2)} por km
                        </div>
                     </div>

                     <div className="flex gap-4 mt-4">
                        <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                           <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                           <span className="text-[10px] font-black text-white">x1.5</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                           <DollarSign className="w-3 h-3 text-emerald-400" />
                           <span className="text-[10px] font-black text-emerald-400">+R$ 4,50</span>
                        </div>
                     </div>
                   </div>

                   {/* The Yellow Divider Line */}
                   <div className="h-1.5 bg-yellow-400 w-full mb-6"></div>

                  {/* Body Info */}
                   <div className="px-8 flex flex-col gap-8 pb-10 max-h-[60vh] overflow-y-auto no-scrollbar">
                      {/* Passenger Meta */}
                      <div className="flex items-center gap-4 text-zinc-400 shrink-0">
                         <div className="flex items-center gap-1.5">
                            <Star className="w-4 h-4 text-zinc-600 fill-zinc-600" />
                            <span className="text-xs font-black">4.8</span>
                         </div>
                         <div className="w-1 h-1 rounded-full bg-zinc-800"></div>
                         <span className="text-xs font-black uppercase tracking-widest">Recorrente</span>
                         <div className="w-1 h-1 rounded-full bg-zinc-800"></div>
                         <div className={`flex items-center gap-1.5 ${getPaymentInfo(availableRides[0].forma_pagamento).color}`}>
                            {getPaymentInfo(availableRides[0].forma_pagamento).icon}
                            <span className="text-[10px] font-black uppercase tracking-widest">{getPaymentInfo(availableRides[0].forma_pagamento).label}</span>
                         </div>
                      </div>

                      {/* Route Details */}
                      <div className="space-y-8 relative shrink-0">
                        {/* Connection Line */}
                        <div className="absolute left-[15px] top-6 bottom-4 w-0.5 border-l-2 border-dashed border-zinc-800"></div>

                        {/* Pickup */}
                        <div className="flex gap-6 relative">
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 z-10 border-4 border-zinc-900 shadow-xl">
                            <div className="w-2 h-2 rounded-full bg-black"></div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-3">
                              <span className="text-white font-black text-sm italic">5 Min</span>
                              <span className="text-zinc-500 font-bold text-xs leading-none">(2.5km)</span>
                            </div>
                            <div className="text-zinc-400 text-[11px] font-bold leading-relaxed line-clamp-1">
                               {availableRides[0].origem}
                            </div>
                          </div>
                        </div>

                        {/* Destination */}
                        <div className="flex gap-6 relative">
                          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center shrink-0 z-10 border-4 border-zinc-900 shadow-xl">
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-3">
                              <span className="text-white font-black text-sm italic">32 Min</span>
                              <span className="text-zinc-500 font-bold text-xs leading-none">({availableRides[0].distancia_km}km)</span>
                            </div>
                            <div className="text-orange-500/80 text-[11px] font-bold leading-relaxed flex items-center gap-2">
                               <AlertCircle className="w-3 h-3 shrink-0" />
                               <span className="line-clamp-1">{availableRides[0].destino}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="grid grid-cols-2 gap-4 mt-2 shrink-0">
                        <button 
                          onClick={() => setAvailableRides(prev => prev.slice(1))}
                          className="py-5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-black uppercase text-xs tracking-widest rounded-3xl transition-all"
                        >
                           Ignorar
                        </button>
                        <button 
                          onClick={() => handleAcceptRide(availableRides[0].id)}
                          disabled={loading}
                          className="py-5 bg-white hover:bg-zinc-200 text-black font-black uppercase text-xs tracking-widest rounded-3xl transition-all shadow-xl shadow-white/5 active:scale-95 flex items-center justify-center gap-2"
                        >
                           {loading ? '...' : (
                             <>
                               <span>ACEITAR</span>
                               <ArrowRight className="w-4 h-4" />
                             </>
                           )}
                        </button>
                      </div>
                   </div>
                </motion.div>
              ) : (
                <div className="flex flex-col gap-4">
                  <motion.div 
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-neutral-900/95 backdrop-blur-xl border border-white/5 p-8 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
                  >
                    <div className="flex justify-between items-center mb-8">
                      <div className="flex items-center gap-3 px-4 py-1.5 bg-neutral-800/80 rounded-full border border-neutral-700/50">
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Resumo Hoje</span>
                        <div className="w-1 h-1 rounded-full bg-neutral-600"></div>
                        <Calendar className="w-3 h-3 text-neutral-500" />
                      </div>
                      <div className="text-[10px] font-black text-neutral-500 uppercase tracking-widest italic">{new Date().toLocaleDateString('pt-BR', { weekday: 'long' })}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-px bg-neutral-800/50 rounded-[32px] overflow-hidden border border-neutral-800">
                      <div className="bg-neutral-950 p-8 flex flex-col gap-1">
                        <div className="flex items-center gap-2 mb-2">
                           <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                             <DollarSign className="w-4 h-4 text-emerald-500" />
                           </div>
                           <div className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.2em]">Faturamento</div>
                        </div>
                        <div className="text-3xl font-black text-white italic tracking-tighter">R$ {driverProfile?.total_ganhos?.toFixed(2) || '0,00'}</div>
                      </div>
                      <div className="bg-neutral-950 p-8 flex flex-col gap-1">
                        <div className="flex items-center gap-2 mb-2">
                           <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                             <Car className="w-4 h-4 text-blue-500" />
                           </div>
                           <div className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.2em]">Serviços</div>
                        </div>
                        <div className="text-3xl font-black text-white italic tracking-tighter">{driverProfile?.total_corridas || '0'}</div>
                      </div>
                    </div>
                  </motion.div>
                  
                  <div className="flex justify-center">
                     <div className="bg-black/80 backdrop-blur-md border border-neutral-800 px-6 py-2.5 rounded-full flex items-center gap-3 shadow-xl">
                       <div className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-red-500'}`}></div>
                       <span className="text-neutral-500 text-[10px] font-black uppercase tracking-widest italic">
                         {online ? 'Monitorando Localização em Tempo Real' : 'Sistema em Modo de Espera'}
                       </span>
                     </div>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
