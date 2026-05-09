import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { Car, ChevronLeft, Shield, User } from 'lucide-react';

export default function RegisterDriver() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    data_nascimento: '',
    senha: '',
    confirmarSenha: '',
    // Vehicle
    cnh: '',
    placa: '',
    modelo_veiculo: '',
    cor_veiculo: '',
    ano_veiculo: '',
    marca_veiculo: '',
    tipo_veiculo: 'carro',
    chave_pix: '',
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

      // Base user profile
      await setDoc(doc(db, 'users', user.uid), {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        cpf: formData.cpf,
        data_nascimento: formData.data_nascimento,
        tipo_usuario: 'motorista',
        criado_em: serverTimestamp(),
      });

      // Driver specific profile
      await setDoc(doc(db, 'drivers', user.uid), {
        user_id: user.uid,
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        cnh: formData.cnh,
        placa: formData.placa,
        marca_veiculo: formData.marca_veiculo,
        modelo_veiculo: formData.modelo_veiculo,
        cor_veiculo: formData.cor_veiculo,
        ano_veiculo: formData.ano_veiculo,
        tipo_veiculo: formData.tipo_veiculo,
        chave_pix: formData.chave_pix,
        status_aprovacao: 'em_analise', // Change to manual approval
        online: false,
        avaliacao_media: 5.0,
        foto_cnh: '', // Placeholder for document photos
        foto_veiculo: '',
        antecedentes_criminais: '',
        criado_em: serverTimestamp(),
      });

      setStep(3); // Go to success step
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está em uso por outro motorista ou passageiro.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('O cadastro com e-mail/senha não está ativado no Firebase Console. Por favor, ative-o nas configurações de Autenticação.');
      } else if (err.code === 'auth/weak-password') {
        setError('Escolha uma senha mais forte (mínimo 6 caracteres).');
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
      
      <div className="w-full max-w-2xl relative z-10">
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
          <span className="text-2xl font-black tracking-tighter text-white">KETTO<span className="text-yellow-400">MOTORISTA</span></span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-10 rounded-[32px] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400"></div>
          
          <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-extrabold text-white mb-1 tracking-tight">
                  {step === 1 ? 'Dados Pessoais' : step === 2 ? 'Seu Veículo' : 'Quase lá!'}
                </h2>
                <p className="text-neutral-500 text-sm font-medium">
                  {step === 1 ? 'Primeiro, identifique-se.' : step === 2 ? 'Agora, os detalhes da sua ferramenta de trabalho.' : 'Seu cadastro está sendo processado.'}
                </p>
             </div>
             <div className="flex gap-2">
                <div className={`w-8 h-1 rounded-full transition-all ${step === 1 ? 'bg-yellow-400' : 'bg-neutral-800'}`}></div>
                <div className={`w-8 h-1 rounded-full transition-all ${step === 2 ? 'bg-yellow-400' : 'bg-neutral-800'}`}></div>
                <div className={`w-8 h-1 rounded-full transition-all ${step === 3 ? 'bg-yellow-400' : 'bg-neutral-800'}`}></div>
             </div>
          </div>

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

          <form onSubmit={step === 2 ? handleRegister : (e) => { e.preventDefault(); setStep(2); }} className="space-y-6">
            {step === 1 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-xs font-black uppercase tracking-widest text-neutral-500 mb-2">Nome Completo</label>
                  <input
                    type="text" required
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-5 py-4 focus:outline-none focus:border-yellow-400 transition-all font-medium"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-neutral-500 mb-2">E-mail</label>
                  <input
                    type="email" required
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-5 py-4 focus:outline-none focus:border-yellow-400 transition-all font-medium"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-neutral-500 mb-2">Telefone</label>
                  <input
                    type="tel" required
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-5 py-4 focus:outline-none focus:border-yellow-400 transition-all font-medium"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-neutral-500 mb-2">CPF</label>
                  <input
                    type="text" required
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-5 py-4 focus:outline-none focus:border-yellow-400 transition-all font-medium"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-neutral-500 mb-2">Nascimento</label>
                  <input
                    type="date" required
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-5 py-4 focus:outline-none focus:border-yellow-400 transition-all font-medium h-[58px]"
                    value={formData.data_nascimento}
                    onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                  />
                </div>
                <div>
                   <label className="block text-xs font-black uppercase tracking-widest text-neutral-500 mb-2">Senha</label>
                   <input
                     type="password" required
                     className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-5 py-4 focus:outline-none focus:border-yellow-400 transition-all font-medium"
                     value={formData.senha}
                     onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                   />
                </div>
                <div>
                   <label className="block text-xs font-black uppercase tracking-widest text-neutral-500 mb-2">Confirmar</label>
                   <input
                     type="password" required
                     className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-5 py-4 focus:outline-none focus:border-yellow-400 transition-all font-medium"
                     value={formData.confirmarSenha}
                     onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
                   />
                </div>
                <div className="md:col-span-2 pt-6">
                  <button type="submit" className="w-full bg-white text-black py-5 rounded-2xl font-black text-lg uppercase tracking-tighter hover:bg-neutral-200 transition-all active:scale-[0.98] shadow-xl shadow-white/5">
                    PRÓXIMO PASSO
                  </button>
                </div>
              </div>
            ) : step === 2 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in slide-in-from-right-4 transition-all duration-300">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-neutral-500 mb-2">CNH (Número)</label>
                  <input
                    type="text" required
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-5 py-4 focus:outline-none focus:border-yellow-400 transition-all font-medium"
                    value={formData.cnh}
                    onChange={(e) => setFormData({ ...formData, cnh: e.target.value })}
                  />
                </div>
                <div>
                   <label className="block text-xs font-black uppercase tracking-widest text-neutral-500 mb-2">Marca</label>
                   <input
                     type="text" required
                     className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-5 py-4 focus:outline-none focus:border-yellow-400 transition-all font-medium"
                     placeholder="Ex: Toyota"
                     value={formData.marca_veiculo}
                     onChange={(e) => setFormData({ ...formData, marca_veiculo: e.target.value })}
                   />
                </div>
                <div>
                   <label className="block text-xs font-black uppercase tracking-widest text-neutral-500 mb-2">Tipo de Veículo</label>
                   <select
                     className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-5 py-4 focus:outline-none focus:border-yellow-400 transition-all font-medium h-[58px]"
                     value={formData.tipo_veiculo}
                     onChange={(e) => setFormData({ ...formData, tipo_veiculo: e.target.value as any })}
                   >
                     <option value="carro">Carro</option>
                     <option value="moto">Moto</option>
                     <option value="outro">Outro</option>
                   </select>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-neutral-500 mb-2">Modelo</label>
                  <input
                    type="text" required
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-5 py-4 focus:outline-none focus:border-yellow-400 transition-all font-medium"
                    placeholder="Ex: Toyota Corolla"
                    value={formData.modelo_veiculo}
                    onChange={(e) => setFormData({ ...formData, modelo_veiculo: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-neutral-500 mb-2">Placa</label>
                  <input
                    type="text" required
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-5 py-4 focus:outline-none focus:border-yellow-400 transition-all font-medium"
                    placeholder="ABC-1234"
                    value={formData.placa}
                    onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-neutral-500 mb-2">Cor</label>
                  <input
                    type="text" required
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-5 py-4 focus:outline-none focus:border-yellow-400 transition-all font-medium"
                    value={formData.cor_veiculo}
                    onChange={(e) => setFormData({ ...formData, cor_veiculo: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-neutral-500 mb-2">Ano</label>
                  <input
                    type="text" required
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-5 py-4 focus:outline-none focus:border-yellow-400 transition-all font-medium"
                    value={formData.ano_veiculo}
                    onChange={(e) => setFormData({ ...formData, ano_veiculo: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-black uppercase tracking-widest text-neutral-500 mb-2">Chave Pix (Recebimento)</label>
                  <input
                    type="text" required
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-5 py-4 focus:outline-none focus:border-yellow-400 transition-all font-medium"
                    value={formData.chave_pix}
                    onChange={(e) => setFormData({ ...formData, chave_pix: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2 grid grid-cols-2 gap-4 mt-8">
                  <button type="button" onClick={() => setStep(1)} className="w-full bg-neutral-950 border border-neutral-800 text-neutral-500 py-5 rounded-2xl font-black uppercase tracking-tighter hover:bg-neutral-800 hover:text-white transition-all">
                    VOLTAR
                  </button>
                  <button type="submit" disabled={loading} className="w-full bg-yellow-400 text-black py-5 rounded-2xl font-black text-lg uppercase tracking-tighter hover:bg-yellow-300 transition-all shadow-xl shadow-yellow-400/10 active:scale-[0.98]">
                    {loading ? 'PROCESSANDO...' : 'FINALIZAR'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center py-10 animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                   <Shield className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-4">Cadastro Enviado!</h3>
                <p className="text-sm text-neutral-500 font-medium leading-relaxed mb-10 max-w-xs">
                  Sua conta foi criada com sucesso e agora passará por uma <span className="text-yellow-400">análise manual</span> pela nossa equipe. 
                  <br /><br />
                  Você receberá uma notificação assim que for aprovado.
                </p>
                <button 
                  onClick={() => navigate('/login')}
                  className="px-10 py-4 bg-yellow-400 text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-yellow-400/10"
                >
                  Entrar na Conta
                </button>
              </div>
            )}
          </form>

          <p className="mt-10 text-center text-neutral-500 text-sm font-medium">
            Já tem uma conta? <Link to="/login" className="text-yellow-400 font-bold hover:underline underline-offset-4">Entre aqui</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
