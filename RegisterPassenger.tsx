import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { Car, User, ChevronLeft } from 'lucide-react';

export default function RegisterPassenger() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    data_nascimento: '',
    senha: '',
    confirmarSenha: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.senha !== formData.confirmarSenha) {
      return setError('As senhas não coincidem.');
    }
    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.senha);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        cpf: formData.cpf,
        data_nascimento: formData.data_nascimento,
        tipo_usuario: 'passageiro',
        pontos: 0,
        criado_em: serverTimestamp(),
      });

      navigate('/passenger');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está em uso. Tente outro ou faça login.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('O cadastro com e-mail/senha não está ativado no Firebase Console. Por favor, ative-o nas configurações de Autenticação.');
      } else if (err.code === 'auth/weak-password') {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else {
        setError('Erro ao cadastrar. Verifique os dados e tente novamente.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-neutral-100 font-sans py-20 relative overflow-y-auto">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5 pointer-events-none grid-pattern"></div>
      
      <div className="w-full max-w-xl relative z-10">
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
          <span className="text-2xl font-black tracking-tighter text-white">KETTO<span className="text-yellow-400">PASSAGEIRO</span></span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-10 rounded-[32px] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400"></div>
          <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Cadastro</h2>
          <p className="text-neutral-500 mb-8 text-sm font-medium">Preencha os campos abaixo para começar a viajar.</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl mb-6 text-sm font-bold italic flex flex-col gap-2">
              <span>{error}</span>
              {error.includes('em uso') && (
                <Link to="/login" className="text-yellow-400 underline underline-offset-2 hover:text-yellow-300">
                  Ir para página de Login →
                </Link>
              )}
            </div>
          )}

          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs font-black uppercase tracking-widest text-neutral-500 mb-2">Nome Completo</label>
              <input
                type="text"
                required
                className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-5 py-4 focus:outline-none focus:border-yellow-400 transition-all font-medium"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-neutral-500 mb-2">E-mail</label>
              <input
                type="email"
                required
                className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-5 py-4 focus:outline-none focus:border-yellow-400 transition-all font-medium"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-neutral-500 mb-2">Telefone</label>
              <input
                type="tel"
                required
                className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-5 py-4 focus:outline-none focus:border-yellow-400 transition-all font-medium"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-neutral-500 mb-2">CPF</label>
              <input
                type="text"
                required
                className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-5 py-4 focus:outline-none focus:border-yellow-400 transition-all font-medium"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-neutral-500 mb-2">Nascimento</label>
              <input
                type="date"
                required
                className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-5 py-4 focus:outline-none focus:border-yellow-400 transition-all font-medium h-[58px]"
                value={formData.data_nascimento}
                onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-neutral-500 mb-2">Senha</label>
              <input
                type="password"
                required
                className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-5 py-4 focus:outline-none focus:border-yellow-400 transition-all font-medium"
                value={formData.senha}
                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-neutral-500 mb-2">Confirmar</label>
              <input
                type="password"
                required
                className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-5 py-4 focus:outline-none focus:border-yellow-400 transition-all font-medium"
                value={formData.confirmarSenha}
                onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
              />
            </div>
            <div className="md:col-span-2 pt-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" required className="w-5 h-5 rounded border-neutral-800 bg-neutral-950 text-yellow-400" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 group-hover:text-neutral-300 transition-colors">
                  Aceito os termos e políticas da Ketto Mobilidade.
                </span>
              </label>
            </div>
            <div className="md:col-span-2 mt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black py-5 rounded-2xl font-black text-lg uppercase tracking-tighter hover:bg-neutral-200 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? 'Processando...' : 'Finalizar Cadastro'}
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-neutral-500 text-sm font-medium">
            Já tem uma conta? <Link to="/login" className="text-yellow-400 font-bold hover:underline underline-offset-4 font-bold">Entre aqui</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
