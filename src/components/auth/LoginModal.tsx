import { Check, Key, LogOut, Shield, User } from 'lucide-react';
import React, { useState } from 'react';
import { storageService } from '../../services/storageService';
import { Usuario } from '../../types';

interface LoginModalProps {
  usuarioAtual: Usuario;
  onFechar: () => void;
  onAtualizarUsuario: (u: Usuario) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  usuarioAtual,
  onFechar,
  onAtualizarUsuario,
}) => {
  const [senhaAntiga, setSenhaAntiga] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [feedbackSenha, setFeedbackSenha] = useState(false);

  const handleMudarSenha = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaSenha || novaSenha.length < 6) {
      alert('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    storageService.addLogSistema(
      'AUTENTICACAO',
      'TROCA_SENHA',
      `Senha do usuário ${usuarioAtual.nome} alterada com sucesso.`,
      'INFO'
    );

    setFeedbackSenha(true);
    setTimeout(() => {
      setFeedbackSenha(false);
      onFechar();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-5 text-slate-100 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold">Perfil do Usuário / Autenticação</h3>
          </div>
          <button
            onClick={onFechar}
            className="text-slate-400 hover:text-slate-100 font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* User Card */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center space-x-3">
          {usuarioAtual.avatar ? (
            <img
              src={usuarioAtual.avatar}
              alt={usuarioAtual.nome}
              className="w-12 h-12 rounded-full object-cover border-2 border-amber-500"
            />
          ) : (
            <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center font-bold text-lg">
              <User className="w-6 h-6" />
            </div>
          )}

          <div>
            <h4 className="font-bold text-sm text-slate-100">{usuarioAtual.nome}</h4>
            <p className="text-xs text-amber-400 font-medium">{usuarioAtual.cargo}</p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              {usuarioAtual.email}
            </p>
          </div>
        </div>

        {/* Change Password Form */}
        <form onSubmit={handleMudarSenha} className="space-y-3 text-xs">
          <h4 className="font-bold text-slate-200 flex items-center space-x-1.5">
            <Key className="w-4 h-4 text-amber-400" />
            <span>Alterar Senha do Sistema</span>
          </h4>

          {feedbackSenha && (
            <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 font-bold text-center">
              Senha atualizada com sucesso!
            </div>
          )}

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">
              Senha Atual:
            </label>
            <input
              type="password"
              required
              value={senhaAntiga}
              onChange={(e) => setSenhaAntiga(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Nova Senha:</label>
            <input
              type="password"
              required
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onFechar}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
            >
              Fechar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition-colors shadow-md"
            >
              Atualizar Senha
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
