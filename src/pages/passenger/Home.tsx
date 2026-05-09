import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Map from '../../components/Map';
import { auth, db } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import { Search, MapPin, Navigation, Car, Clock, DollarSign, LogOut, History, User, MessageSquare, Menu, CreditCard, Banknote, Zap, Wallet, AlertCircle } from 'lucide-react';
import { requestRide, calculateFare, updateRideStatus } from '../../services/rideService';
import { Ride, RideCategory, PaymentMethod, RideStatus, DriverProfile } from '../../types';
import { startLocationTracking, stopLocationTracking } from '../../lib/geolocation';
import { collection, query, where, onSnapshot, orderBy, limit, doc, onSnapshot as docSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';

import AutocompleteInput from '../../components/AutocompleteInput';
import PassengerDrawer from '../../components/PassengerDrawer';
import RouteDisplay from '../../components/RouteDisplay';
import CarMarker from '../../components/CarMarker';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

export default function PassengerHome() {
  const { profile } = useAuth();
  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const [step, setStep] = useState<'idle' | 'category' | 'checkout' | 'searching' | 'ongoing'>('idle');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const [origin, setOrigin] = useState('Minha localização atual');
  const [destination, setDestination] = useState('');
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [destCoords, setDestCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [distanceKm, setDistanceKm] = useState(0);
  const [durationMin, setDurationMin] = useState(0);

  const [selectedCategory, setSelectedCategory] = useState<RideCategory>('economico');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('dinheiro');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null);

  const maps = useMapsLibrary('maps');

  // Monitor Driver Location and Profile in real-time
  useEffect(() => {
    if (!activeRide?.motorista_id || activeRide.status === 'finalizada' || activeRide.status === 'cancelada') {
      setDriverLocation(null);
      setDriverProfile(null);
      return;
    }

    const unsubDriver = docSnapshot(doc(db, 'drivers', activeRide.motorista_id), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as DriverProfile;
        if (data.latitude !== undefined && data.longitude !== undefined) {
          setDriverLocation({ lat: data.latitude, lng: data.longitude });
        } else if (data.latitude_atual && data.longitude_atual) {
          setDriverLocation({ lat: data.latitude_atual, lng: data.longitude_atual });
        }
        setDriverProfile(data);
      }
    });

    return () => unsubDriver();
  }, [activeRide?.motorista_id, activeRide?.status]);

  // Geolocation Tracking for User
  useEffect(() => {
    if (!profile) return;
    const watchId = startLocationTracking(profile.uid, 'passageiro');
    
    const watchIdLocal = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        if (!originCoords) setOriginCoords(coords);
      },
      () => {},
      { enableHighAccuracy: true }
    );

    return () => {
      if (watchId) stopLocationTracking(watchId);
      navigator.geolocation.clearWatch(watchIdLocal);
    };
  }, [profile]);

  // Calculate distance when coordinates change
  useEffect(() => {
    if (!originCoords || !destCoords) return;

    const service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [new google.maps.LatLng(originCoords.lat, originCoords.lng)],
        destinations: [new google.maps.LatLng(destCoords.lat, destCoords.lng)],
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        if (status === 'OK' && response?.rows[0].elements[0]) {
          const element = response.rows[0].elements[0];
          if (element.status === 'OK') {
            setDistanceKm(element.distance.value / 1000);
            setDurationMin(Math.ceil(element.duration.value / 60));
          }
        }
      }
    );
  }, [originCoords, destCoords]);

  useEffect(() => {
    if (!profile) return;
    const q = query(
      collection(db, 'rides'),
      where('passageiro_id', '==', profile.uid),
      where('status', 'in', ['solicitada', 'procurando_motorista', 'aceita', 'motorista_chegando', 'em_andamento']),
      orderBy('criado_em', 'desc'),
      limit(1)
    );
    
    return onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const ride = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Ride;
        setActiveRide(ride);
        if (ride.status === 'solicitada' || ride.status === 'procurando_motorista') setStep('searching');
        else setStep('ongoing');
      } else {
        setActiveRide(null);
        if (step !== 'category' && step !== 'checkout') setStep('idle');
      }
    });
  }, [profile]);

  const handleRequestRide = async () => {
    if (!profile || !originCoords || !destCoords) return;
    const fareNumerator = calculateFare(distanceKm, durationMin, selectedCategory);
    const fare = Number(fareNumerator);

    // KettoPay Balance Check
    if (paymentMethod === 'kettopay') {
      const currentBalance = profile.kettopayBalance || 0;
      if (currentBalance < fare) {
        setErrorMessage(`Saldo insuficiente no KettoPay. Você tem R$ ${currentBalance.toFixed(2)}, mas a corrida custa R$ ${fare.toFixed(2)}.`);
        setTimeout(() => setErrorMessage(null), 5000);
        return;
      }
    }
    
    await requestRide({
      passageiro_id: profile.uid,
      origem: origin,
      destino: destination,
      latitude_origem: originCoords.lat,
      longitude_origem: originCoords.lng,
      latitude_destino: destCoords.lat,
      longitude_destino: destCoords.lng,
      distancia_km: distanceKm,
      tempo_estimado: durationMin,
      valor_estimado: fare,
      forma_pagamento: paymentMethod,
      categoria: selectedCategory
    });
  };

  const categories = [
    { id: 'economico', name: 'Econômico', icon: Car, priceMul: 1 },
    { id: 'conforto', name: 'Conforto', icon: Car, priceMul: 1.5, color: 'text-blue-500' },
    { id: 'moto', name: 'Moto', icon: Navigation, priceMul: 0.7, color: 'text-yellow-500' },
    { id: 'entrega', name: 'Entrega', icon: Clock, priceMul: 0.9, color: 'text-green-500' },
  ];

  return (
    <div className="h-screen w-full bg-neutral-950 flex flex-col font-sans text-neutral-100 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5 pointer-events-none grid-pattern z-0"></div>

      {/* Sidebar / Menu Trigger */}
      <div className="absolute top-6 left-6 z-20">
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="w-12 h-12 bg-white border border-zinc-200 rounded-2xl flex items-center justify-center shadow-xl hover:bg-zinc-50 active:scale-95 transition-all text-zinc-900"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <PassengerDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />

      <div className="flex-1 relative z-10 flex flex-col">
        <div className="flex-1 relative">
          <Map 
            center={driverLocation || userLocation || { lat: -23.5505, lng: -46.6333 }}
            followDriver={!!activeRide && !!driverLocation}
            markers={[
              ...(userLocation ? [{ id: 'me', lat: userLocation.lat, lng: userLocation.lng, label: 'Você', color: '#3b82f6' }] : []),
              ...(activeRide ? [
                { id: 'pickup', lat: activeRide.latitude_origem, lng: activeRide.longitude_origem, label: 'Ponto de Coleta', color: '#eab308' },
                { id: 'dest', lat: activeRide.latitude_destino, lng: activeRide.longitude_destino, color: '#ef4444', label: 'Destino' }
              ] : []),
              ...(originCoords && !activeRide ? [{ id: 'origin_sel', lat: originCoords.lat, lng: originCoords.lng, label: 'Partida', color: '#eab308' }] : []),
              ...(destCoords && !activeRide ? [{ id: 'dest_sel', lat: destCoords.lat, lng: destCoords.lng, label: 'Destino', color: '#ef4444' }] : []),
            ]}
          >
            {/* Real-time Driver Car */}
            {driverLocation && (
              <CarMarker 
                position={driverLocation} 
                label={driverProfile ? `${driverProfile.modelo_veiculo}` : 'Seu Motorista'} 
              />
            )}

            {activeRide && (
              <>
                {/* Route to Pickup if driver is accepted but not yet picked up */}
                {(activeRide.status === 'aceita' || activeRide.status === 'motorista_chegando') && driverLocation && (
                  <RouteDisplay 
                    origin={driverLocation} 
                    destination={{ lat: activeRide.latitude_origem, lng: activeRide.longitude_origem }} 
                    color="#facc15"
                  />
                )}
                {/* Route to Destination if ride is in progress - From Driver current location to final destination */}
                {activeRide.status === 'em_andamento' && driverLocation && (
                  <RouteDisplay 
                    origin={driverLocation} 
                    destination={{ lat: activeRide.latitude_destino, lng: activeRide.longitude_destino }} 
                    color="#3b82f6"
                  />
                )}
              </>
            )}
            {/* Show preview route when selecting */}
            {originCoords && destCoords && step === 'category' && (
              <RouteDisplay origin={originCoords} destination={destCoords} color="#eab308" />
            )}
          </Map>
        </div>

        {/* Floating Controls */}
        <div className="absolute bottom-0 left-0 w-full p-6 z-20 pointer-events-none">
          <div className="max-w-xl mx-auto w-full pointer-events-auto">
            <AnimatePresence mode="wait">
              {step === 'idle' && (
                <motion.div 
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 100, opacity: 0 }}
                  className="bg-neutral-900 border border-neutral-800 rounded-[32px] p-8 shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400"></div>
                  <h3 className="text-2xl font-black mb-6 tracking-tighter text-white uppercase italic">Para onde vamos, {profile?.nome.split(' ')[0]}?</h3>
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar py-2">
                    <div className="relative">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-yellow-500"></div>
                      <AutocompleteInput
                        placeholder="Local de partida"
                        defaultValue={origin}
                        onChange={(val) => setOrigin(val)}
                        onPlaceSelect={(place) => {
                          setOrigin(place.formatted_address || '');
                          if (place.geometry?.location) {
                            setOriginCoords({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
                          }
                        }}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl pl-12 pr-5 py-4 text-sm text-neutral-300 font-medium focus:border-yellow-400 focus:outline-none transition-all"
                      />
                    </div>
                    <div className="relative">
                      <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-600" />
                      <AutocompleteInput
                        placeholder="Insira o seu destino..."
                        defaultValue={destination}
                        onChange={(val) => {
                          setDestination(val);
                          if (val === '') setDestCoords(null);
                        }}
                        onPlaceSelect={(place) => {
                          setDestination(place.formatted_address || '');
                          if (place.geometry?.location) {
                            setDestCoords({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
                          }
                        }}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl pl-12 pr-5 py-5 text-white focus:outline-none focus:border-yellow-400 transition-all font-bold placeholder:text-neutral-700"
                      />
                    </div>

                    {destination.length > 0 && (
                      <motion.button 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => {
                          if (destCoords) {
                            setStep('category');
                          } else {
                            // If they typed but didn't select from list, try to focus the input 
                            // or remind them to select from the suggestions
                            const inputElem = document.querySelector('input[placeholder="Insira o seu destino..."]') as HTMLInputElement;
                            if (inputElem) {
                              inputElem.focus();
                              // Could also implement geocoding here, but selecting from list is safer for precise coordinates
                            }
                          }
                        }}
                        className={`w-full py-5 rounded-2xl font-black text-xl uppercase tracking-tighter transition-all active:scale-95 shadow-xl relative z-10 ${destCoords ? 'bg-yellow-400 text-black shadow-yellow-400/20' : 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed'}`}
                      >
                        {destCoords ? 'Ver Preços da Viagem' : 'Selecione na lista acima'}
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )}

              {step === 'category' && (
                <motion.div 
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 100, opacity: 0 }}
                  className="bg-neutral-900 border border-neutral-800 rounded-[32px] p-8 shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400"></div>
                  <div className="flex items-center justify-between mb-8">
                    <button onClick={() => setStep('idle')} className="text-neutral-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">Voltar</button>
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Categoria</h3>
                    <div className="w-10"></div>
                  </div>

                  <div className="max-h-[70vh] overflow-y-auto no-scrollbar pr-1">
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id as RideCategory)}
                          className={`p-6 rounded-[24px] border text-left transition-all ${selectedCategory === cat.id ? 'bg-yellow-400 border-black shadow-xl scale-[1.02]' : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'}`}
                        >
                          <cat.icon className={`w-6 h-6 mb-4 ${selectedCategory === cat.id ? 'text-black' : 'text-neutral-500'}`} />
                          <div className={`font-black text-xs uppercase tracking-tight ${selectedCategory === cat.id ? 'text-black' : 'text-white'}`}>{cat.name}</div>
                          <div className={`text-[10px] font-bold ${selectedCategory === cat.id ? 'text-black/60' : 'text-neutral-600'}`}>R$ {calculateFare(distanceKm, durationMin, cat.id as RideCategory)}</div>
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-col gap-3 mb-8">
                      {[
                        { id: 'dinheiro', name: 'Dinheiro', icon: Banknote },
                        { id: 'pix', name: 'Pix Instantâneo', icon: Zap },
                        { id: 'kettopay', name: `KettoPay (R$ ${(profile?.kettopayBalance || 0).toFixed(2)})`, icon: Wallet },
                        { id: 'credito', name: 'Cartão de Crédito', icon: CreditCard },
                      ].map((method) => (
                        <button
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                          className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${paymentMethod === method.id ? 'bg-yellow-400 border-black' : 'bg-neutral-950 border-neutral-800'}`}
                        >
                           <div className="flex items-center gap-3">
                             <method.icon className={`w-4 h-4 ${paymentMethod === method.id ? 'text-black' : 'text-neutral-500'}`} />
                             <span className={`text-[10px] font-black uppercase tracking-widest ${paymentMethod === method.id ? 'text-black' : 'text-white'}`}>{method.name}</span>
                           </div>
                           {paymentMethod === method.id && <div className="w-2 h-2 rounded-full bg-black"></div>}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={() => setStep('checkout')}
                    className="w-full bg-white text-black py-5 rounded-2xl font-black text-lg uppercase tracking-tighter hover:bg-neutral-200 transition-all active:scale-95 shadow-xl shadow-white/5"
                  >
                    Confirmar Seleção
                  </button>
                </motion.div>
              )}

              {step === 'checkout' && (
                <motion.div 
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 100, opacity: 0 }}
                  className="bg-neutral-900 border border-neutral-800 rounded-[32px] p-8 shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400"></div>
                  <div className="flex items-center justify-between mb-8">
                    <button onClick={() => setStep('category')} className="text-neutral-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">Voltar</button>
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Resumo</h3>
                    <div className="w-10"></div>
                  </div>

                  <div className="max-h-[70vh] overflow-y-auto no-scrollbar pr-1">
                    <div className="space-y-4 mb-8">
                      <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-3xl">
                        <div className="text-[10px] font-black uppercase tracking-widest text-neutral-600 mb-4">Itinerário</div>
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-2 h-2 rounded-full bg-yellow-400 mt-1.5 shrink-0"></div>
                          <div className="text-xs font-bold text-neutral-300 line-clamp-1">{origin}</div>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
                          <div className="text-xs font-bold text-neutral-300 line-clamp-1">{destination}</div>
                        </div>
                      </div>

                      <div className="flex gap-4">
                         <div className="flex-1 p-5 bg-neutral-950 border border-neutral-800 rounded-3xl">
                            <div className="text-[10px] font-black uppercase tracking-widest text-neutral-600 mb-1">Total ({distanceKm.toFixed(1)}km)</div>
                            <div className="text-2xl font-black text-white italic tracking-tighter">R$ {calculateFare(distanceKm, durationMin, selectedCategory)}</div>
                         </div>
                         <div className="flex-1 p-5 bg-neutral-950 border border-neutral-800 rounded-3xl">
                            <div className="text-[10px] font-black uppercase tracking-widest text-neutral-600 mb-1">Pagamento</div>
                            <div className="text-xs font-black text-yellow-400 uppercase tracking-widest">{paymentMethod}</div>
                         </div>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleRequestRide}
                    className="w-full bg-yellow-400 text-black py-5 rounded-2xl font-black text-xl uppercase tracking-tighter hover:bg-yellow-300 transition-all active:scale-95 shadow-xl shadow-yellow-400/10"
                  >
                    Confirmar Corrida
                  </button>
                  
                  {errorMessage && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-[10px] font-black uppercase tracking-widest"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {errorMessage}
                    </motion.div>
                  )}
                </motion.div>
              )}

              {step === 'searching' && (
                <motion.div 
                   initial={{ scale: 0.9, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   className="bg-neutral-900 border border-neutral-800 rounded-[32px] p-10 shadow-2xl text-center relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400"></div>
                  <div className="flex justify-center mb-8">
                    <div className="relative">
                      <div className="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-10"></div>
                      <div className="relative w-20 h-20 bg-neutral-950 border border-neutral-800 rounded-full flex items-center justify-center shadow-2xl">
                        <Car className="text-yellow-400 w-10 h-10" />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-black mb-2 tracking-tighter text-white">PROCURANDO MOTORISTA...</h3>
                  <p className="text-neutral-500 mb-10 text-sm font-medium max-w-[240px] mx-auto">Sua corrida está sendo processada por nossa rede de parceiros.</p>
                  <button 
                    onClick={() => activeRide && updateRideStatus(activeRide.id, 'cancelada')}
                    className="w-full py-4 border border-neutral-800 rounded-2xl text-neutral-500 text-xs font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 transition-all"
                  >
                    Cancelar Solicitação
                  </button>
                </motion.div>
              )}

              {step === 'ongoing' && activeRide && (
                <motion.div 
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="bg-neutral-900 border border-neutral-800 rounded-[32px] p-8 shadow-2xl relative overflow-hidden"
                >
                   <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400"></div>
                   <div className="flex items-center gap-5 border-b border-neutral-800 pb-6 mb-6">
                      <div className="w-16 h-16 bg-neutral-950 rounded-2xl flex items-center justify-center border border-neutral-800 shadow-xl">
                        <User className="text-neutral-500 w-8 h-8" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-lg tracking-tight leading-none mb-1 text-white uppercase italic">
                          {activeRide.status === 'aceita' ? 'Motorista Confirmado' : 
                           activeRide.status === 'motorista_chegando' ? 'Chegando agora' :
                           activeRide.status === 'em_andamento' ? 'Em Viagem' : 'Chegou!'}
                        </h4>
                        <div className="flex flex-col">
                          <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest leading-normal">
                            {driverProfile ? `${driverProfile.marca_veiculo} ${driverProfile.modelo_veiculo}` : 'Carregando veículo...'}
                          </p>
                          <p className="text-[10px] font-black uppercase tracking-widest leading-normal">
                             <span className="text-neutral-500">{driverProfile?.cor_veiculo || ''}</span> • <span className="text-yellow-400">{driverProfile?.placa || ''}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-center bg-yellow-400 px-4 py-2 rounded-xl shadow-lg border border-black transform -rotate-3">
                        <div className="text-[10px] text-black font-black uppercase">Nota</div>
                        <div className="font-black text-black leading-none">4.9</div>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4 mb-8">
                      <button className="flex flex-col items-center justify-center gap-2 p-5 bg-neutral-950 border border-neutral-800 rounded-2xl hover:bg-neutral-800 transition-all group">
                        <MessageSquare className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform" />
                        <span className="font-black text-[10px] uppercase tracking-widest text-neutral-500 group-hover:text-white">Mensagem</span>
                      </button>
                      <button className="flex flex-col items-center justify-center gap-2 p-5 bg-neutral-950 border border-neutral-800 rounded-2xl hover:bg-neutral-800 transition-all group">
                        <Navigation className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform" />
                        <span className="font-black text-[10px] uppercase tracking-widest text-neutral-500 group-hover:text-white">Rota</span>
                      </button>
                   </div>

                   <div className="flex items-center justify-between p-5 bg-neutral-950 border border-neutral-800 rounded-2xl mb-4">
                     <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Estimado</span>
                     <span className="font-black text-white text-xl italic tracking-tighter">R$ {activeRide.valor_estimado.toFixed(2)}</span>
                   </div>

                   <button 
                    onClick={() => activeRide && updateRideStatus(activeRide.id, 'cancelada')}
                    className="w-full py-4 text-red-500/50 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-all mt-2"
                  >
                    Socorro / Emergência
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
