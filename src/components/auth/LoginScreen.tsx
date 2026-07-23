import { AlertCircle, ArrowRight, Factory, KeyRound, Lock, ShieldCheck, User } from 'lucide-react';
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

  const handleQuickLogin = (usuarioOuLogin: string, senhaPadrao: string) => {
    setLoginInput(usuarioOuLogin);
    setSenhaInput(senhaPadrao);
    setErroMsg('');

    const resultado = storageService.fazerLogin(usuarioOuLogin, senhaPadrao);
    if (resultado.sucesso && resultado.usuario) {
      onLoginSucesso(resultado.usuario);
    } else {
      setErroMsg(resultado.erro || 'Falha ao autenticar com o usuário selecionado.');
    }
  };

  const usuariosCadastrados = storageService.getUsuariosSistema();

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
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
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

          {/* Quick Login Options for Convenience */}
          <div className="mt-8 pt-5 border-t border-slate-200 dark:border-slate-800">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5 flex items-center space-x-1">
              <KeyRound className="w-3.5 h-3.5 text-amber-500" />
              <span>Acesso Rápido de Demonstração:</span>
            </p>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('Jacques Silva', 'Virtude@2026')}
                className={`w-full p-2.5 rounded-xl text-left border transition-all text-xs flex items-center justify-between ${
                  tema === 'light'
                    ? 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                    : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700'
                }`}
              >
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-100">Jacques Silva (Administrador Master)</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Acesso Total (Todos os 10 Módulos)</p>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded-md">
                  ADM
                </span>
              </button>

              {usuariosCadastrados.map((usr) => (
                <button
                  key={usr.id}
                  type="button"
                  onClick={() => handleQuickLogin(usr.nome, usr.senha || '123456')}
                  className={`w-full p-2.5 rounded-xl text-left border transition-all text-xs flex items-center justify-between ${
                    tema === 'light'
                      ? 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                      : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700'
                  }`}
                >
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-100">{usr.nome}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Dept: {usr.departamento} | Permissão: {usr.permissao}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-md">
                    {usr.departamento}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-slate-500 dark:text-slate-500 font-medium">
          &copy; {new Date().getFullYear()} Virtude Big Bag's &bull; Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};
