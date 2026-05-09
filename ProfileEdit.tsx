import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Camera, User, Mail, Phone, Hash, Calendar, Lock, MapPin, Save, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function ProfileEdit() {
  const navigate = useNavigate();
  const { profile, clubKetto } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const displayLevel = clubKetto?.currentLevel || profile?.nivel || 'BRONZE';

  const [formData, setFormData] = useState({
    nome: profile?.nome || '',
    email: profile?.email || '',
    telefone: profile?.telefone || '',
    cpf: profile?.cpf || '',
    data_nascimento: profile?.data_nascimento || '',
    endereco: profile?.endereco || '',
    foto_perfil: profile?.foto_perfil || '',
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, foto_perfil: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.uid) {
      console.error('No profile UID found');
      return;
    }

    setLoading(true);
    try {
      const userRef = doc(db, 'users', profile.uid);
      await updateDoc(userRef, {
        nome: formData.nome,
        telefone: formData.telefone,
        cpf: formData.cpf,
        data_nascimento: formData.data_nascimento,
        endereco: formData.endereco,
        foto_perfil: formData.foto_perfil,
        atualizado_em: new Date().toISOString()
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Erro ao salvar alterações. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans pb-20 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-800 px-6 py-4 flex items-center gap-4">
        <button 
          onClick={() => navigate('/passenger')}
          className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-black uppercase tracking-tighter italic">Editar Perfil</h1>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <form onSubmit={handleSave} className="space-y-8">
          {/* Photo Section */}
          <div className="flex flex-col items-center gap-4 mb-10">
            <div className="relative group">
              <div 
                onClick={handlePhotoClick}
                className="w-32 h-32 rounded-full border-4 border-yellow-400 bg-neutral-900 overflow-hidden shadow-2xl relative cursor-pointer group-hover:opacity-80 transition-opacity"
              >
                {formData.foto_perfil ? (
                  <img src={formData.foto_perfil} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-600">
                    <User className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                   <Camera className="w-8 h-8 text-white" />
                </div>
              </div>
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <button 
                type="button"
                onClick={handlePhotoClick}
                className="absolute bottom-0 right-0 p-3 bg-yellow-400 rounded-full text-black shadow-xl hover:scale-110 transition-transform"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>
            <div className="text-center">
              <h2 className="text-lg font-bold text-white">{formData.nome}</h2>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">Nível {displayLevel} • Clube Ketto</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                <input 
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:border-yellow-400 outline-none transition-all"
                  placeholder="Seu nome"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                <input 
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-neutral-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Telefone</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                <input 
                  type="text"
                  value={formData.telefone}
                  onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:border-yellow-400 outline-none transition-all"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">CPF</label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                <input 
                  type="text"
                  value={formData.cpf}
                  onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:border-yellow-400 outline-none transition-all"
                  placeholder="000.000.000-00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Data de Nascimento</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                <input 
                  type="date"
                  value={formData.data_nascimento}
                  onChange={(e) => setFormData({...formData, data_nascimento: e.target.value})}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:border-yellow-400 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                <input 
                  type="password"
                  disabled
                  value="********"
                  className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-neutral-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Endereço Principal</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
              <input 
                type="text"
                value={formData.endereco}
                onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:border-yellow-400 outline-none transition-all"
                placeholder="Ex: Av. Paulista, 1000 - São Paulo"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6">
            <button 
              type="submit"
              disabled={loading}
              className={`w-full py-5 rounded-[24px] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all ${success ? 'bg-emerald-500 text-white' : 'bg-yellow-400 text-black hover:scale-[1.02] active:scale-95 shadow-xl shadow-yellow-400/10'}`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
              ) : success ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Salvo com Sucesso!
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
