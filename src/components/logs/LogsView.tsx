import { Filter, History, Search, ShieldAlert } from 'lucide-react';
import React, { useState } from 'react';
import { storageService } from '../../services/storageService';
import { LogSistema } from '../../types';

export const LogsView: React.FC = () => {
  const [logs] = useState<LogSistema[]>(() => storageService.getLogsSistema());
  const [busca, setBusca] = useState('');
  const [filtroModulo, setFiltroModulo] = useState('TODOS');

  const logsFiltrados = logs.filter((log) => {
    const termo = busca.toLowerCase();
    const bateTexto =
      !termo ||
      log.descricao.toLowerCase().includes(termo) ||
      log.usuario.toLowerCase().includes(termo) ||
      log.acao.toLowerCase().includes(termo);

    const bateModulo = filtroModulo === 'TODOS' || log.modulo === filtroModulo;
    return bateTexto && bateModulo;
  });

  return (
    <div className="space-y-6 pb-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <History className="w-5 h-5 text-amber-400" />
            <span>Audit Trail & Logs do Sistema MES</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Registro imutável de todas as ações de importação, alterações de OP e logins efetuados.
          </p>
        </div>
      </div>

      {/* Toolbar Search */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pesquisar descrição, usuário, ação..."
            className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500"
          />
        </div>

        <select
          value={filtroModulo}
          onChange={(e) => setFiltroModulo(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
        >
          <option value="TODOS">Todos os Módulos</option>
          <option value="PROGRAMAÇÃO">PROGRAMAÇÃO</option>
          <option value="IMPORTADOR_EXCEL">IMPORTADOR_EXCEL</option>
          <option value="AUTENTICACAO">AUTENTICACAO</option>
          <option value="CONFIGURAÇÕES">CONFIGURAÇÕES</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px]">
                <th className="p-3">Data / Hora</th>
                <th className="p-3">Usuário</th>
                <th className="p-3">Módulo</th>
                <th className="p-3">Ação</th>
                <th className="p-3">Descrição da Atividade</th>
                <th className="p-3">IP</th>
                <th className="p-3 text-center">Nível</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {logsFiltrados.length > 0 ? (
                logsFiltrados.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-mono text-slate-400 whitespace-nowrap">
                      {log.dataHora}
                    </td>
                    <td className="p-3 font-semibold text-slate-200 whitespace-nowrap">
                      {log.usuario}
                    </td>
                    <td className="p-3 font-mono text-amber-400">{log.modulo}</td>
                    <td className="p-3 font-bold text-slate-300">{log.acao}</td>
                    <td className="p-3 text-slate-300 max-w-md">{log.descricao}</td>
                    <td className="p-3 font-mono text-slate-500">{log.ip}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          log.nivel === 'SUCCESS'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : log.nivel === 'WARNING'
                            ? 'bg-amber-500/20 text-amber-400'
                            : log.nivel === 'ERROR'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {log.nivel}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Nenhum log encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
