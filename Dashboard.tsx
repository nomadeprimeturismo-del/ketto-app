import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, onSnapshot, doc, updateDoc, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { UserProfile, DriverProfile, Ride } from '../../types';
import { Users, Car, MapPin, DollarSign, CheckCircle, XCircle, Ban, ArrowRight, BarChart3, RefreshCw, ArrowLeft, Tag, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function AdminDashboard() {
  const [drivers, setDrivers] = useState<(UserProfile & DriverProfile)[]>([]);
  const [filter, setFilter] = useState<'pendente' | 'todos'>('pendente');
  const [rides, setRides] = useState<Ride[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState({ totalRevenue: 0, appCommission: 0, driversCount: 0, passengersCount: 0, pendingDriversCount: 0 });

  const [refreshKey, setRefreshKey] = useState(0);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'drivers' | 'passengers' | 'rides' | 'promos' | 'support'>('dashboard');

  useEffect(() => {
    // Load drivers, users and rides in parallel and join them reactively
    let driversRaw: DriverProfile[] = [];
    let usersRaw: UserProfile[] = [];
    let ridesRaw: Ride[] = [];

    const combineData = () => {
      const userMap = usersRaw.reduce((acc, user) => ({ ...acc, [user.uid]: user }), {} as Record<string, UserProfile>);
      
      const combined = driversRaw.map(driver => {
        const user = userMap[driver.uid];
        return {
          ...user,
          ...driver,
          uid: driver.uid,
          nome: user?.nome || (driver as any).nome || (driver as any).name || 'Cadastro Incompleto',
          email: user?.email || (driver as any).email || '(sem email)',
          telefone: user?.telefone || (driver as any).telefone || '(sem telefone)',
          status_aprovacao: driver.status_aprovacao || 'pendente'
        };
      }) as (UserProfile & DriverProfile)[];
      
      setDrivers(combined);
      setUsers(usersRaw);
      
      const revenue = ridesRaw.reduce((acc, ride) => acc + (ride.valor_final || ride.valor_estimado || 0), 0);
      setStats({
        totalRevenue: revenue,
        appCommission: revenue * 0.2,
        driversCount: combined.filter(d => d.status_aprovacao === 'aprovado').length,
        passengersCount: usersRaw.filter(u => u.tipo_usuario === 'passageiro').length,
        pendingDriversCount: combined.filter(d => d.status_aprovacao === 'pendente' || d.status_aprovacao === 'em_analise').length
      });
    };

    const unsubDrivers = onSnapshot(collection(db, 'drivers'), (snap) => {
      driversRaw = snap.docs.map(d => ({ ...d.data(), uid: d.id } as DriverProfile));
      combineData();
    }, (err) => {
      console.error("Erro ao carregar motoristas:", err);
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      usersRaw = snap.docs.map(d => ({ ...d.data(), uid: d.id } as UserProfile));
      combineData();
    }, (err) => {
      console.error("Erro ao carregar usuários:", err);
    });

    const unsubRides = onSnapshot(collection(db, 'rides'), (snap) => {
      ridesRaw = snap.docs.map(d => ({ id: d.id, ...d.data() } as Ride));
      setRides(ridesRaw);
      combineData();
    }, (err) => {
      console.error("Erro ao carregar corridas:", err);
    });

    return () => { unsubDrivers(); unsubUsers(); unsubRides(); };
  }, [refreshKey]);

  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleUpdateStatus = async (uid: string, status: string) => {
    try {
      setProcessingId(uid);
      await updateDoc(doc(db, 'drivers', uid), {
        status_aprovacao: status
      });
      // Small toast-like feedback could go here if we had one
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      alert("Erro ao atualizar status do motorista. Verifique as permissões.");
    } finally {
      setProcessingId(null);
    }
  };

  const chartData = [
    { name: 'Seg', v: 400 }, { name: 'Ter', v: 300 }, { name: 'Qua', v: 600 },
    { name: 'Qui', v: 800 }, { name: 'Sex', v: 500 }, { name: 'Sab', v: 900 }, { name: 'Dom', v: 1200 }
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans flex flex-col md:flex-row relative">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5 pointer-events-none grid-pattern z-0"></div>

      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-neutral-950 border-r border-neutral-800 p-8 flex flex-col gap-10 z-10 relative">
        <div className="flex items-center gap-3 py-2">
          <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center shadow-lg shadow-yellow-400/10">
            <BarChart3 className="text-black w-6 h-6" />
          </div>
          <span className="text-xl font-black tracking-tighter text-white">KETTO<span className="text-yellow-400">ADMIN</span></span>
        </div>
        
        <nav className="flex flex-col gap-3">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'drivers', label: 'Motoristas', icon: Car },
            { id: 'passengers', label: 'Passageiros', icon: Users },
            { id: 'rides', label: 'Corridas', icon: MapPin },
            { id: 'promos', label: 'Cupons', icon: Tag },
            { id: 'support', label: 'Denúncias', icon: ShieldAlert },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-tighter transition-all ${
                activeTab === item.id 
                ? 'bg-yellow-400 text-black shadow-xl shadow-yellow-400/10' 
                : 'text-neutral-500 hover:bg-neutral-900 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" /> {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto p-6 bg-neutral-900 border border-neutral-800 rounded-3xl relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400 transition-all group-hover:w-full group-hover:opacity-10 opacity-30"></div>
           <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">Suporte Direto</p>
           <button className="text-white font-black italic uppercase tracking-tighter hover:text-yellow-400 transition-colors">Abrir Chamado</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-14 overflow-y-auto z-10 relative">
        {activeTab === 'dashboard' && (
          <>
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
              <div className="flex items-center gap-6">
                <Link 
                  to="/?noredirect=true" 
                  className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl text-neutral-500 hover:text-white transition-all shadow-xl active:scale-95 group"
                  title="Voltar ao Início / Cadastro"
                >
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </Link>
                <div>
                  <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white mb-2 underline underline-offset-[12px] decoration-yellow-400 decoration-4">Visão Geral</h1>
                  <p className="text-neutral-500 font-bold text-sm tracking-wide">Inteligência de mercado e controle operacional.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="bg-neutral-900 border border-neutral-800 px-8 py-6 rounded-[32px] shadow-2xl relative overflow-hidden group">
                   <div className="absolute right-[-10px] top-[-10px] opacity-10 blur-xl w-20 h-20 bg-yellow-400 rounded-full group-hover:scale-150 transition-transform"></div>
                   <div className="text-[10px] text-neutral-500 uppercase font-black tracking-widest mb-2 italic">Total Bruto</div>
                   <div className="text-3xl font-black italic tracking-tighter text-white">R$ {stats.totalRevenue.toFixed(2)}</div>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 px-8 py-6 rounded-[32px] shadow-2xl relative overflow-hidden group border-emerald-500/10">
                   <div className="absolute right-[-10px] top-[-10px] opacity-10 blur-xl w-20 h-20 bg-emerald-500 rounded-full group-hover:scale-150 transition-transform"></div>
                   <div className="text-[10px] text-neutral-600 uppercase font-black tracking-widest mb-2 italic">Net App</div>
                   <div className="text-3xl font-black italic tracking-tighter text-emerald-400">R$ {stats.appCommission.toFixed(2)}</div>
                </div>
              </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
                <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-[40px] relative overflow-hidden shadow-2xl">
                   <div className="absolute left-0 bottom-0 w-full h-24 opacity-20">
                     <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={chartData}>
                         <Area type="monotone" dataKey="v" stroke="#FACC15" fill="#FACC15" />
                       </AreaChart>
                     </ResponsiveContainer>
                   </div>
                   <h3 className="text-neutral-500 font-black text-[10px] uppercase tracking-widest mb-3 italic">Motoristas Ativos</h3>
                   <div className="text-5xl font-black text-white italic tracking-tighter">{stats.driversCount}</div>
                </div>
                <div className="bg-neutral-900 border border-emerald-500/20 p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
                   {stats.pendingDriversCount > 0 && (
                     <div className="absolute top-4 right-4 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
                   )}
                   <h3 className="text-neutral-500 font-black text-[10px] uppercase tracking-widest mb-3 italic text-yellow-400">Pendentes para Aprovação</h3>
                   <div className="text-5xl font-black text-white italic tracking-tighter">{stats.pendingDriversCount}</div>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-[40px] shadow-2xl">
                   <h3 className="text-neutral-500 font-black text-[10px] uppercase tracking-widest mb-3 italic">Base Passageiros</h3>
                   <div className="text-5xl font-black text-white italic tracking-tighter">{stats.passengersCount}</div>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-[40px] shadow-2xl">
                   <h3 className="text-neutral-500 font-black text-[10px] uppercase tracking-widest mb-3 italic">Demandas Confirmadas</h3>
                   <div className="text-5xl font-black text-white italic tracking-tighter">{rides.length}</div>
                </div>
            </div>

            {/* Charts */}
            <div className="bg-neutral-900 border border-neutral-800 p-10 rounded-[56px] mb-16 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Fluxo de Mobilidade</h3>
                <select className="bg-neutral-950 border border-neutral-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-yellow-400 px-4 py-2 focus:outline-none">
                   <option>Últimos 7 dias</option>
                   <option>Últimos 30 dias</option>
                </select>
              </div>
              <div className="h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                    <XAxis dataKey="name" stroke="#525252" fontSize={10} fontWeight="900" tickLine={false} axisLine={false} tick={{ dy: 10 }} />
                    <YAxis stroke="#525252" fontSize={10} fontWeight="900" tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #262626', borderRadius: '16px', padding: '12px' }}
                      itemStyle={{ color: '#FACC15', fontWeight: '900', fontSize: '12px', textTransform: 'uppercase' }}
                      cursor={{ stroke: '#FACC15', strokeWidth: 1 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="v" 
                      stroke="#FACC15" 
                      strokeWidth={6} 
                      dot={{ r: 6, fill: "#FACC15", stroke: "#000", strokeWidth: 2 }} 
                      activeDot={{ r: 8, stroke: "#fff", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {(activeTab === 'drivers' || activeTab === 'dashboard') && (
          <section className="bg-neutral-900 border border-neutral-800 rounded-[56px] overflow-hidden shadow-2xl mb-16">
            <div className="p-10 border-b border-neutral-800 flex flex-col md:flex-row justify-between items-start md:items-center bg-neutral-950/50 gap-6">
              <div>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Triagem de Parceiros</h3>
                <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest mt-1">Gerenciamento de motoristas e frotas.</p>
              </div>
              
              <div className="flex bg-neutral-950 p-1.5 rounded-2xl border border-neutral-800">
                 <button 
                  onClick={() => setRefreshKey(k => k + 1)}
                  className="px-4 py-3 rounded-xl text-neutral-500 hover:text-white transition-all"
                  title="Sincronizar Dados"
                 >
                   <RefreshCw className={`w-4 h-4 ${processingId ? 'animate-spin' : ''}`} />
                 </button>
                 <div className="w-px h-8 bg-neutral-800 my-auto mx-2"></div>
                 <button 
                  onClick={() => setFilter('pendente')}
                  className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'pendente' ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/10' : 'text-neutral-500 hover:text-white'}`}
                 >
                   Pendentes ({stats.pendingDriversCount})
                 </button>
                 <button 
                  onClick={() => setFilter('todos')}
                  className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'todos' ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/10' : 'text-neutral-500 hover:text-white'}`}
                 >
                   Todos
                 </button>
              </div>
            </div>

            <div className="p-6 md:p-10">
              <div className="hidden md:grid grid-cols-4 gap-4 px-10 py-6 text-neutral-500 font-black text-[10px] uppercase tracking-widest italic border-b border-neutral-800/50">
                <div className="col-span-1">Identidade & Contato</div>
                <div className="col-span-1">Patrimônio / Frota</div>
                <div className="col-span-1 text-center">Estado</div>
                <div className="col-span-1 text-right pr-10">Decisão / Ação</div>
              </div>

              <div className="divide-y divide-neutral-800/30">
                {drivers.filter(d => filter === 'todos' || d.status_aprovacao === 'pendente' || d.status_aprovacao === 'em_analise').map((driver) => (
                  <div key={driver.uid} className="py-8 px-6 md:px-0 hover:bg-neutral-800/30 transition-all group lg:px-10">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-center">
                      {/* Identity */}
                      <div className="col-span-1">
                        <div className="md:hidden text-[10px] font-black uppercase tracking-widest text-neutral-600 mb-2">Identidade & Contato</div>
                        <div className="font-black group-hover:text-yellow-400 transition-colors uppercase italic text-xl tracking-tighter text-white leading-tight">{driver.nome}</div>
                        <div className="text-neutral-500 text-[10px] font-bold tracking-widest uppercase mt-1">{driver.email}</div>
                        <div className="text-neutral-600 text-[10px] font-bold mt-0.5 tracking-widest">{driver.telefone}</div>
                      </div>

                      {/* Asset */}
                      <div className="col-span-1">
                        <div className="md:hidden text-[10px] font-black uppercase tracking-widest text-neutral-600 mb-2">Patrimônio / Frota</div>
                        <div className="font-black text-xs text-neutral-300 uppercase tracking-tight italic">{driver.modelo_veiculo}</div>
                        <div className="text-neutral-600 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">{driver.placa} • {driver.cor_veiculo}</div>
                      </div>

                      {/* Status */}
                      <div className="col-span-1 md:text-center">
                        <div className="md:hidden text-[10px] font-black uppercase tracking-widest text-neutral-600 mb-3">Estado</div>
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-lg inline-block ${
                          driver.status_aprovacao === 'aprovado' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          driver.status_aprovacao === 'reprovado' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          'bg-neutral-950 text-yellow-400 border-yellow-400/20'
                        }`}>
                          {driver.status_aprovacao === 'aprovado' ? 'Ativo' : 
                           driver.status_aprovacao === 'reprovado' ? 'Inativo' : (driver.status_aprovacao === 'em_analise' ? 'Em Análise' : 'Pendente')}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="col-span-1 md:text-right">
                        <div className="md:hidden text-[10px] font-black uppercase tracking-widest text-neutral-600 mb-4">Decisão / Ação</div>
                        <div className="flex gap-3 md:justify-end items-center">
                          {(driver.status_aprovacao === 'pendente' || driver.status_aprovacao === 'em_analise' || driver.status_aprovacao === 'reprovado') && (
                            <button 
                             onClick={() => handleUpdateStatus(driver.uid, 'aprovado')}
                             disabled={processingId === driver.uid}
                             className="flex-1 md:flex-none px-6 py-3 bg-emerald-500 text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg active:scale-95 whitespace-nowrap disabled:opacity-50 disabled:cursor-wait"
                            >
                              {processingId === driver.uid ? '...' : 'Aprovar'}
                            </button>
                          )}
                          {(driver.status_aprovacao === 'pendente' || driver.status_aprovacao === 'em_analise' || driver.status_aprovacao === 'aprovado') && (
                            <button 
                             onClick={() => handleUpdateStatus(driver.uid, 'reprovado')}
                             disabled={processingId === driver.uid}
                             className="flex-1 md:flex-none px-6 py-3 bg-neutral-800 text-red-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-95 border border-red-500/20 whitespace-nowrap disabled:opacity-50 disabled:cursor-wait"
                            >
                              {processingId === driver.uid ? '...' : (driver.status_aprovacao === 'aprovado' ? 'Bloquear' : 'Negar')}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {drivers.filter(d => filter === 'todos' || d.status_aprovacao === 'pendente' || d.status_aprovacao === 'em_analise').length === 0 && (
                  <div className="py-32 text-center text-neutral-700 font-black uppercase italic tracking-[0.4em] opacity-40 text-[10px]">
                    Fila de Triagem Limpa.
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
        {activeTab === 'passengers' && (
          <section className="bg-neutral-900 border border-neutral-800 rounded-[56px] overflow-hidden shadow-2xl">
            <div className="p-10 border-b border-neutral-800 bg-neutral-950/50">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Base de Usuários</h3>
              <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest mt-1">Gestão de passageiros cadastrados.</p>
            </div>
            <div className="p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.filter(u => u.tipo_usuario === 'passageiro').map((user) => (
                  <div key={user.uid} className="bg-neutral-950 border border-neutral-800 p-6 rounded-3xl hover:border-yellow-400/50 transition-all group">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-neutral-900 rounded-2xl flex items-center justify-center text-xl font-black text-white group-hover:bg-yellow-400 group-hover:text-black transition-all">
                        {user.nome.charAt(0)}
                      </div>
                      <div>
                        <div className="font-black text-white uppercase italic tracking-tighter leading-tight">{user.nome}</div>
                        <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest leading-none mt-1">{user.email}</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-neutral-600">
                      <span>{user.telefone}</span>
                      <button className="text-red-500 hover:text-white transition-colors">Banir</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'promos' && (
          <section className="bg-neutral-900 border border-neutral-800 rounded-[56px] overflow-hidden shadow-2xl">
            <div className="p-10 border-b border-neutral-800 bg-neutral-950/50 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Gestão de Ofertas</h3>
                <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest mt-1">Cupons, descontos e campanhas.</p>
              </div>
              <button className="bg-yellow-400 text-black px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                Novo Cupom
              </button>
            </div>
            <div className="p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { code: 'KETTO50', desc: '50% de desconto na primeira corrida', usage: '1.245x', status: 'ativo' },
                  { code: 'VERAO24', desc: 'R$ 10,00 fixo em corridas de praia', usage: '840x', status: 'expirado' },
                  { code: 'WELCOMEBACK', desc: 'Cupom de retorno para inativos', usage: '3.100x', status: 'ativo' },
                ].map((promo) => (
                  <div key={promo.code} className="bg-neutral-950 border border-neutral-800 p-8 rounded-[40px] flex justify-between items-center group hover:border-yellow-400/30 transition-all">
                    <div>
                      <div className="text-2xl font-black text-white italic tracking-tighter mb-1 uppercase group-hover:text-yellow-400 transition-colors">{promo.code}</div>
                      <p className="text-neutral-500 text-xs font-medium mb-4">{promo.desc}</p>
                      <div className="flex gap-4">
                        <div className="text-[10px] font-black uppercase tracking-widest text-neutral-600">Usos: <span className="text-white">{promo.usage}</span></div>
                        <div className={`text-[10px] font-black uppercase tracking-widest ${promo.status === 'ativo' ? 'text-emerald-500' : 'text-red-500'}`}>{promo.status}</div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                       <button className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-500 hover:text-white transition-all"><RefreshCw className="w-4 h-4" /></button>
                       <button className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-500 hover:text-red-500 transition-all"><XCircle className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'support' && (
          <section className="bg-neutral-900 border border-neutral-800 rounded-[56px] overflow-hidden shadow-2xl">
            <div className="p-10 border-b border-neutral-800 bg-neutral-950/50">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Central de Ocorrências</h3>
              <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest mt-1">Denúncias, incidentes e solicitações.</p>
            </div>
            <div className="p-10 text-center py-32">
               <div className="w-20 h-20 bg-neutral-950 border border-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6 text-neutral-700">
                  <ShieldAlert className="w-10 h-10" />
               </div>
               <h4 className="text-xl font-black text-white italic uppercase tracking-tighter mb-2">Monitoramento Ativo</h4>
               <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest max-w-xs mx-auto">Nenhuma denúncia crítica pendente de análise no momento.</p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
