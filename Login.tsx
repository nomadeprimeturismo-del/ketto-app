import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Car, ChevronLeft } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('E-mail ou senha incorretos. Verifique suas credenciais.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('O login com e-mail/senha não está ativado no Firebase Console. Por favor, ative-o nas configurações de Autenticação.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Muitas tentativas sem sucesso. Tente novamente mais tarde.');
      } else {
        setError('Erro ao entrar. Verifique sua conexão e tente novamente.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-neutral-100 font-sans relative overflow-y-auto py-12">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5 pointer-events-none grid-pattern"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-400/5 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-md relative z-10">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-neutral-500 hover:text-white transition-colors mb-8 group"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-bold uppercase tracking-widest">Voltar</span>
        </button>

        <div className="flex items-center gap-3 mb-10 justify-center">
          <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
             <div className="w-5 h-5 bg-black rounded-sm transform rotate-45"></div>
          </div>
          <span className="text-2xl font-black tracking-tighter text-white">KETTO<span className="text-yellow-400">MOBILIDADE</span></span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-10 rounded-[32px] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400"></div>
          
          <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Login</h2>
          <p className="text-neutral-500 mb-8 text-sm font-medium">Acesse sua conta para continuar.</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl mb-6 text-sm font-bold italic">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-neutral-500 mb-2">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-5 py-4 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/20 transition-all font-medium placeholder:text-neutral-700"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-neutral-500 mb-2">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-5 py-4 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/20 transition-all font-medium placeholder:text-neutral-700"
                placeholder="••••••••"
              />
            </div>
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-yellow-400 text-black py-5 rounded-2xl font-black text-lg uppercase tracking-tighter hover:bg-yellow-300 active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-yellow-400/10"
              >
                {loading ? 'Validando...' : 'Entrar'}
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-neutral-500 text-sm font-medium">
            Ainda não tem conta? <Link to="/" className="text-yellow-400 font-bold hover:underline underline-offset-4">Cadastre-se</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
