import { useState } from "react";
import { GraduationCap, User, Lock, ChevronRight, AlertCircle } from 'lucide-react';
import { API_URL } from '../../api/client';

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });
      if (!response.ok) throw new Error('Credenciais inválidas');
      const data = await response.json();
      onLogin(data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-100 overflow-hidden">

      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl border border-slate-200 m-4 relative z-10">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/20">
             <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Gestão Acadêmica</h1>
          <p className="text-slate-500 font-medium">IFSP System • Login</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center animate-pulse">
            <AlertCircle className="w-5 h-5 mr-3 shrink-0"/>
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Email Institucional</label>
            <div className="relative group">
                <User className="w-5 h-5 text-slate-400 absolute left-3 top-3.5 transition-colors group-focus-within:text-blue-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-slate-900 bg-slate-50 transition-all placeholder:text-slate-300"
                  placeholder="ex: admin@ifsp.edu.br"
                  required
                />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Senha</label>
            <div className="relative group">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-3.5 transition-colors group-focus-within:text-blue-600" />
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-slate-900 bg-slate-50 transition-all placeholder:text-slate-300"
                  placeholder="••••••••"
                  required
                />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 rounded-xl hover:bg-slate-800 transition-all font-bold shadow-lg hover:shadow-slate-900/20 disabled:opacity-70 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
          >
            {loading ? 'Autenticando...' : 'Acessar Sistema'} 
            {!loading && <ChevronRight className="w-4 h-4"/>}
          </button>
        </form>
      </div>
    </div>
  );
};
