import { AlertCircle, ArrowRight, Factory, Lock, ShieldCheck, User } from 'lucide-react';
import React, { useState } from 'react';
import { storageService } from '../../services/storageService';
import { Usuario } from '../../types';

interface LoginScreenProps {
  onLoginSucesso: (usuario: Usuario) => void;
  tema?: 'dark' | 'light';
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSucesso, tema = 'dark' }) => {
  const [loginInput, setLoginInput] = useState('');
  const [senhaInput, setSenhaInput] = useState('');
  const [erroMsg, setErroMsg] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErroMsg('');
    setCarregando(true);

    setTimeout(() => {
      const resultado = storageService.fazerLogin(loginInput, senhaInput);
      setCarregando(false);

      if (resultado.sucesso && resultado.usuario) {
        onLoginSucesso(resultado.usuario);
      } else {
        setErroMsg(resultado.erro || 'Credenciais inválidas. Verifique seu login e senha.');
      }
    }, 300);
  };

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center p-4 transition-colors ${
        tema === 'light'
          ? 'bg-slate-100 text-slate-800'
          : 'bg-slate-950 text-slate-100'
      }`}
    >
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-30">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Logo Card */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3.5 bg-blue-600/10 dark:bg-blue-500/20 border border-blue-500/30 rounded-2xl text-blue-500 dark:text-blue-400 mb-2 shadow-inner">
            <Factory className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-blue-600 dark:text-blue-500 uppercase">
            Virtude Big Bags
          </h1>
          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 tracking-wider uppercase">
            Sistema Integrado PCP &amp; Controle Industrial MES
          </p>
        </div>

        {/* Login Box */}
        <div
          className={`p-6 sm:p-8 rounded-2xl border shadow-2xl backdrop-blur-md transition-all ${
            tema === 'light'
              ? 'bg-white/90 border-slate-200 text-slate-800 shadow-slate-200/50'
              : 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-black/80'
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
            <div>
              <h2 className="text-lg font-bold">Acesso Restrito ao Sistema</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Informe suas credenciais para acessar os módulos permitidos
              </p>
            </div>
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
          </div>

          {erroMsg && (
            <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800 rounded-xl text-xs font-semibold text-red-700 dark:text-red-300 flex items-start space-x-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{erroMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Login Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Usuário do Sistema:
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  placeholder="Digite seu nome ou usuário (ex: Jacques Silva, admin)"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    tema === 'light'
                      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                      : 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                  }`}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Senha de Acesso:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={senhaInput}
                  onChange={(e) => setSenhaInput(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium border font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    tema === 'light'
                      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                      : 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                  }`}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={carregando}
              className="w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              <span>{carregando ? 'Autenticando...' : 'Entrar no Sistema'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-slate-500 dark:text-slate-500 font-medium">
          &copy; {new Date().getFullYear()} Virtude Big Bag's &bull; Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};
