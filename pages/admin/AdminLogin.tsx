import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Lock, User } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error(err);
      let msg = "Erro na autenticação.";
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        msg = "E-mail ou senha incorretos.";
      } else if (err.code === 'auth/too-many-requests') {
        msg = "Muitas tentativas falhas. Tente novamente mais tarde.";
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4 relative overflow-hidden">
       {/* Background Effects */}
       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20"></div>
       <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-stone-950 via-transparent to-stone-950 z-0"></div>

      <div className="w-full max-w-md bg-stone-900 border border-stone-800 p-8 rounded-2xl shadow-2xl relative z-10 animate-fadeIn">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-umbanda-red/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-umbanda-red/30">
            <Flame className="w-8 h-8 text-umbanda-redBright" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-widest">UMBANDA CUIABÁ</h1>
          <p className="text-stone-500 text-sm mt-2 uppercase tracking-wide">
            Acesso Restrito à Curimba
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-800 text-red-300 text-xs rounded text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label className="block text-stone-400 text-xs font-bold uppercase mb-2 ml-1">E-mail</label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 text-stone-600 w-5 h-5" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg py-3 pl-10 pr-4 text-white focus:border-umbanda-gold focus:ring-1 focus:ring-umbanda-gold focus:outline-none transition-all placeholder-stone-700"
                placeholder="admin@umbandacuiaba.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-stone-400 text-xs font-bold uppercase mb-2 ml-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-stone-600 w-5 h-5" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg py-3 pl-10 pr-4 text-white focus:border-umbanda-gold focus:ring-1 focus:ring-umbanda-gold focus:outline-none transition-all placeholder-stone-700"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-umbanda-red to-red-900 text-white font-bold py-3 rounded-lg hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
            ) : (
              'Entrar no Sistema'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-stone-800 text-center">
          <a href="/" className="text-xs text-stone-600 hover:text-stone-400 transition-colors">
            Voltar ao site principal
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;