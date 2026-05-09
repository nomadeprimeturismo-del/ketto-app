/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { MapPin, AlertTriangle, ExternalLink, ShieldCheck } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import RegisterPassenger from './pages/auth/RegisterPassenger';
import RegisterDriver from './pages/auth/RegisterDriver';
import PassengerHome from './pages/passenger/Home';
import DriverHome from './pages/driver/Home';
import AdminDashboard from './pages/admin/Dashboard';

// Passenger Subpages
import ProfileEdit from './pages/passenger/ProfileEdit';
import Activity from './pages/passenger/Activity';
import KettoPay from './pages/passenger/KettoPay';
import Help from './pages/passenger/Help';
import Messages from './pages/passenger/Messages';
import Security from './pages/passenger/Security';
import Payments from './pages/passenger/Payments';
import Settings from './pages/passenger/Settings';
import InviteFriends from './pages/passenger/InviteFriends';
import InviteDrivers from './pages/passenger/InviteDrivers';
import Promos from './pages/passenger/Promos';
import ClubKetto from './pages/passenger/ClubKetto';

import { APIProvider } from '@vis.gl/react-google-maps';

// Tries multiple possible environment variable names to be flexible
const GOOGLE_MAPS_API_KEY = 
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 
  import.meta.env.VITE_GOOGLE_MAPS_ || 
  import.meta.env.VITE_MAPS_API_KEY || 
  '';

function MapsSetupGuide() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-neutral-950 p-6 text-center font-sans">
      <div className="max-w-md w-full p-8 bg-neutral-900 border border-neutral-800 rounded-[32px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-yellow-400"></div>
        
        <div className="w-20 h-20 bg-yellow-400/10 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner border border-yellow-400/20">
          <MapPin className="w-10 h-10 text-yellow-400" />
        </div>
        
        <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4 leading-tight">Configuração de Mapa</h2>
        <p className="text-neutral-400 text-sm leading-relaxed mb-8 font-medium">
          O erro <span className="text-white">"Esta página não carregou o Google Maps corretamente"</span> é um aviso oficial do Google. Siga estes passos exatos:
        </p>

        <div className="space-y-4 mb-8">
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 text-left flex gap-4 items-start group transition-colors">
            <div className="w-7 h-7 rounded-lg bg-red-500 text-white flex items-center justify-center text-[11px] font-black shrink-0">!</div>
            <div>
              <p className="text-xs font-black text-red-400 uppercase tracking-tight mb-1 flex items-center gap-2">
                1. Link de Faturamento (Obrigatório)
              </p>
              <p className="text-[10px] text-neutral-400 leading-tight">Mesmo com crédito grátis, o Google exige um <strong className="text-neutral-300">Cartão de Crédito</strong> vinculado ao projeto. Sem isso, o mapa fica cinza com erro.</p>
            </div>
          </div>

          <div className="bg-neutral-950/50 border border-neutral-800 rounded-2xl p-5 text-left flex gap-4 items-start group hover:border-yellow-400/30 transition-colors">
            <div className="w-7 h-7 rounded-lg bg-yellow-400 text-black flex items-center justify-center text-[11px] font-black shrink-0">2</div>
            <div>
              <p className="text-xs font-black text-white uppercase tracking-tight mb-1">2. Ativar "Maps JavaScript API"</p>
              <p className="text-[10px] text-neutral-500 leading-tight">Vá na Biblioteca e verifique se a <strong className="text-neutral-300">Maps JavaScript API</strong> está com o status <span className="text-green-500 font-bold">ATIVADA</span>.</p>
            </div>
          </div>

          <div className="bg-neutral-950/50 border border-neutral-800 rounded-2xl p-5 text-left flex gap-4 items-start group hover:border-yellow-400/30 transition-colors">
            <div className="w-7 h-7 rounded-lg bg-yellow-400 text-black flex items-center justify-center text-[11px] font-black shrink-0">3</div>
            <div>
              <p className="text-xs font-black text-white uppercase tracking-tight mb-1">3. Ativar "Places API"</p>
              <p className="text-[10px] text-neutral-500 leading-tight">Para a busca de endereços funcionar, ative também a <strong className="text-neutral-300">Places API (New)</strong>.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <a 
            href="https://console.cloud.google.com/google/maps-apis/overview" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full py-4 bg-white text-black rounded-2xl font-black text-base uppercase tracking-tighter shadow-xl hover:bg-neutral-200 transition-all flex items-center justify-center gap-2"
          >
            Configurar no Google Cloud <ExternalLink className="w-4 h-4" />
          </a>
          
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-neutral-950 text-white border border-neutral-800 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-neutral-900 transition-all active:scale-95"
          >
            Recarregar Aplicativo
          </button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-[9px] text-neutral-600 font-mono uppercase tracking-widest bg-neutral-950/50 py-2 rounded-lg border border-neutral-800/50">
          <ShieldCheck className="w-3 h-3 text-green-500" />
          Chave Detectada: {GOOGLE_MAPS_API_KEY.substring(0, 10)}...
        </div>
      </div>
    </div>
  );
}


function AppRoutes() {
  const { user, profile, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const noRedirect = searchParams.get('noredirect') === 'true';

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-neutral-950 text-white font-sans relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 grid-pattern pointer-events-none"></div>
        <div className="relative flex flex-col items-center gap-6">
           <div className="w-16 h-1 bg-neutral-900 rounded-full overflow-hidden">
             <div className="w-1/2 h-full bg-yellow-400 animate-[loading_1.5s_infinite]"></div>
           </div>
           <div className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-500 animate-pulse">Sincronizando</div>
        </div>
      </div>
    );
  }

  if (!GOOGLE_MAPS_API_KEY && user) {
    return <MapsSetupGuide />;
  }

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY} version="weekly" libraries={['places', 'routes']}>
      <Routes>
        <Route path="/" element={(!user || noRedirect) ? <Landing /> : (
          profile?.tipo_usuario === 'admin' ? <Navigate to="/admin" /> :
          profile?.tipo_usuario === 'motorista' ? <Navigate to="/driver" /> :
          <Navigate to="/passenger" />
        )} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/register/passenger" element={<RegisterPassenger />} />
        <Route path="/register/driver" element={<RegisterDriver />} />
        
        {/* Passenger Routes */}
        <Route path="/passenger" element={user && profile?.tipo_usuario === 'passageiro' ? <PassengerHome /> : <Navigate to="/" />} />
        <Route path="/passenger/profile" element={user ? <ProfileEdit /> : <Navigate to="/login" />} />
        <Route path="/passenger/activity" element={user ? <Activity /> : <Navigate to="/login" />} />
        <Route path="/passenger/wallet" element={user ? <KettoPay /> : <Navigate to="/login" />} />
        <Route path="/passenger/help" element={user ? <Help /> : <Navigate to="/login" />} />
        <Route path="/passenger/messages" element={user ? <Messages /> : <Navigate to="/login" />} />
        <Route path="/passenger/security" element={user ? <Security /> : <Navigate to="/login" />} />
        <Route path="/passenger/payments" element={user ? <Payments /> : <Navigate to="/login" />} />
        <Route path="/passenger/settings" element={user ? <Settings /> : <Navigate to="/login" />} />
        <Route path="/passenger/invite" element={user ? <InviteFriends /> : <Navigate to="/login" />} />
        <Route path="/passenger/invite-driver" element={user ? <InviteDrivers /> : <Navigate to="/login" />} />
        <Route path="/passenger/promos" element={user ? <Promos /> : <Navigate to="/login" />} />
        <Route path="/passenger/club" element={user ? <ClubKetto /> : <Navigate to="/login" />} />

        {/* Driver Routes */}
        <Route path="/driver/*" element={user && profile?.tipo_usuario === 'motorista' ? <DriverHome /> : <Navigate to="/" />} />
        <Route path="/admin/*" element={user && profile?.tipo_usuario === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </APIProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <AppRoutes />
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

