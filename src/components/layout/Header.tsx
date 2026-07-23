import {
  Bell,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  LogOut,
  Moon,
  Search,
  Sun,
  User,
} from 'lucide-react';
import React, { useState } from 'react';
import { excelService } from '../../services/excelService';
import { storageService } from '../../services/storageService';
import { Usuario } from '../../types';

interface HeaderProps {
  usuario: Usuario;
  tema: 'dark' | 'light';
  onAlternarTema: () => void;
  onAbrirImportador: () => void;
  onAbrirPerfil: () => void;
  onLogout?: () => void;
  buscaGlobal: string;
  onBuscaChange: (val: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  usuario,
  tema,
  onAlternarTema,
  onAbrirImportador,
  onAbrirPerfil,
  onLogout,
  buscaGlobal,
  onBuscaChange,
}) => {

  const [notificacoesAbertas, setNotificacoesAbertas] = useState(false);
  const kpis = storageService.calcularKpis();

  return (
    <header
      className={`h-16 border-b sticky top-0 z-30 px-6 flex items-center justify-between transition-colors ${
        tema === 'light'
          ? 'bg-white border-slate-200 text-slate-800 shadow-xs'
          : 'bg-slate-900 border-slate-800 text-slate-100 shadow-xs'
      }`}
    >
      {/* Search Bar */}
      <div className="flex items-center space-x-4 flex-1 max-w-xl">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={buscaGlobal}
            onChange={(e) => onBuscaChange(e.target.value)}
            placeholder="Pesquisar OP, Pedido, Cliente ou Produto..."
            className={`w-full pl-9 pr-4 py-1.5 rounded-lg text-xs transition-colors focus:outline-none focus:ring-1 ${
              tema === 'light'
                ? 'bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500'
                : 'bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500'
            }`}
          />
        </div>
      </div>

      {/* Action Buttons & Profile */}
      <div className="flex items-center space-x-3">
        {/* Download Excel PCP Template Button */}
        <button
          onClick={() => excelService.gerarPlanilhaModeloPCP()}
          title="Baixar Planilha Modelo PCP em Excel (.xlsx)"
          className={`hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            tema === 'light'
              ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700'
          }`}
        >
          <Download className="w-3.5 h-3.5 text-blue-500" />
          <span>Modelo PCP (.xlsx)</span>
        </button>

        {/* Quick Excel Import Button */}
        <button
          onClick={onAbrirImportador}
          className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-xs shadow-xs transition-all"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span className="hidden sm:inline">Importar Planilha</span>
        </button>

        {/* Theme Switcher */}
        <button
          onClick={onAlternarTema}
          title={tema === 'dark' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
          className={`p-2 rounded-lg transition-colors ${
            tema === 'light'
              ? 'text-slate-600 hover:bg-slate-100'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          {tema === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificacoesAbertas(!notificacoesAbertas)}
            className={`p-2 rounded-lg relative transition-colors ${
              tema === 'light'
                ? 'text-slate-600 hover:bg-slate-100'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Bell className="w-4 h-4" />
            {kpis.pedidosAtrasados > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
            )}
            {kpis.pedidosAtrasados > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {notificacoesAbertas && (
            <div
              className={`absolute right-0 mt-2 w-80 rounded-xl shadow-xl z-50 p-3 text-xs border ${
                tema === 'light'
                  ? 'bg-white border-slate-200 text-slate-800'
                  : 'bg-slate-800 border-slate-700 text-slate-200'
              }`}
            >
              <div
                className={`flex items-center justify-between pb-2 border-b font-semibold ${
                  tema === 'light'
                    ? 'border-slate-100 text-slate-800'
                    : 'border-slate-700 text-slate-100'
                }`}
              >
                <span>Alertas do Sistema MES</span>
                <span className="text-[10px] bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 px-2 py-0.5 rounded font-semibold">
                  PCP Live
                </span>
              </div>
              <div className="py-2 space-y-2">
                {kpis.pedidosAtrasados > 0 ? (
                  <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/50 dark:border-red-500/30 dark:text-red-300 rounded-lg flex items-start space-x-2">
                    <span className="font-bold text-red-500">🚨</span>
                    <div>
                      <p className="font-semibold">Atenção PCP:</p>
                      <p className="text-[11px] opacity-90">
                        Existem {kpis.pedidosAtrasados} pedido(s) com atraso no cronograma de produção!
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 text-center py-2">
                    Nenhum alerta de atraso no momento.
                  </p>
                )}
                <div
                  className={`p-2.5 rounded-lg ${
                    tema === 'light' ? 'bg-slate-50' : 'bg-slate-900/60'
                  }`}
                >
                  <p className="font-semibold text-blue-600 dark:text-blue-400">Meta Diária:</p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    {kpis.producaoDiaAtual} / {kpis.metaDiaAtual} Big Bags produzidos hoje.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Info */}
        <div className="flex items-center space-x-1 pl-3 border-l border-slate-200 dark:border-slate-800">
          <button
            onClick={onAbrirPerfil}
            className={`flex items-center space-x-2.5 p-1.5 rounded-lg transition-colors ${
              tema === 'light'
                ? 'hover:bg-slate-100'
                : 'hover:bg-slate-800'
            }`}
          >
            {usuario.avatar ? (
              <img
                src={usuario.avatar}
                alt={usuario.nome}
                className="w-7 h-7 rounded-full object-cover border border-slate-300 dark:border-slate-700"
              />
            ) : (
              <div className="w-7 h-7 bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 rounded-full flex items-center justify-center font-bold text-xs">
                <User className="w-4 h-4" />
              </div>
            )}
            <div className="hidden lg:block text-left">
              <div className="flex items-center space-x-1">
                <p className="text-xs font-semibold leading-tight">{usuario.nome}</p>
                {(usuario.permissao === 'VISUALIZACAO' || usuario.perfil === 'VISUALIZADOR') && (
                  <span className="px-1.5 py-0.2 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded text-[9px] font-bold">
                    Só Visualização
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 leading-tight font-medium">
                {usuario.cargo}
              </p>
            </div>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              title="Sair do Sistema (Logout)"
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};


