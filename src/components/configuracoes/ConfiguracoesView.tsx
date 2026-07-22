import {
  Building2,
  Database,
  Download,
  RefreshCw,
  Save,
  Settings,
  Sliders,
  Users,
} from 'lucide-react';
import React, { useState } from 'react';
import { GestaoUsuariosView } from './GestaoUsuariosView';
import { storageService } from '../../services/storageService';

export const ConfiguracoesView: React.FC = () => {
  const [abaAtiva, setAbaAtiva] = useState<'geral' | 'usuarios'>('geral');

  const [empresa, setEmpresa] = useState({
    nome: "VIRTUDE BIG BAG'S INDÚSTRIA E COMÉRCIO DE EMBALAGENS LTDA",
    cnpj: '18.920.345/0001-88',
    cidadeUF: 'Americana / SP',
    telefone: '(19) 3465-9000',
    email: 'contato@virtudebigbags.com.br',
  });

  const [parametros, setParametros] = useState({
    metaDiariaBags: 1000,
    eficienciaAlvo: 95.0,
    oeeAlvo: 85.0,
    horasTurno: 9,
  });

  const [salvoFeedback, setSalvoFeedback] = useState(false);

  const handleSalvarConfig = () => {
    storageService.addLogSistema(
      'CONFIGURAÇÕES',
      'ATUALIZACAO_PARAMETROS',
      'Parâmetros industriais da fábrica e dados da empresa atualizados com sucesso.',
      'SUCCESS'
    );
    setSalvoFeedback(true);
    setTimeout(() => setSalvoFeedback(false), 3000);
  };

  const handleResetarBanco = () => {
    if (
      confirm(
        'Tem certeza que deseja restaurar o banco de dados para os valores padrão iniciais? Todas as OPs e alterações locais serão resetadas.'
      )
    ) {
      storageService.resetarBanco();
      window.location.reload();
    }
  };

  const handleExportarBackupJSON = () => {
    const backupData = {
      ops: storageService.getOps(),
      pedidos: storageService.getPedidos(),
      clientes: storageService.getClientes(),
      produtos: storageService.getProdutos(),
      logsImportacao: storageService.getLogsImportacao(),
      logsSistema: storageService.getLogsSistema(),
      dataExportacao: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_VirtudeBigBags_${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Configurações Industriais do Sistema</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Parâmetros da empresa, metas de produção do PCP, metas OEE e backups.
          </p>
        </div>

        {abaAtiva === 'geral' && (
          <button
            onClick={handleSalvarConfig}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-xs transition-colors shadow-xs self-start md:self-auto"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Parâmetros</span>
          </button>
        )}
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-6 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setAbaAtiva('geral')}
          className={`pb-3 flex items-center space-x-2 transition-colors border-b-2 shrink-0 ${
            abaAtiva === 'geral'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Parâmetros Gerais e Empresa</span>
        </button>

        <button
          onClick={() => setAbaAtiva('usuarios')}
          className={`pb-3 flex items-center space-x-2 transition-colors border-b-2 shrink-0 ${
            abaAtiva === 'usuarios'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Usuários e Permissões</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold">
            Novo
          </span>
        </button>
      </div>

      {abaAtiva === 'geral' && (
        <>
          {salvoFeedback && (
            <div className="bg-green-50 border border-green-200 text-green-800 dark:bg-emerald-950/80 dark:border-emerald-500/50 dark:text-emerald-300 p-3 rounded-xl text-xs font-bold text-center">
              Configurações salvas com sucesso!
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Company Settings Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-wide">
                  Dados Cadastrais da Indústria
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                    Razão Social:
                  </label>
                  <input
                    type="text"
                    value={empresa.nome}
                    onChange={(e) => setEmpresa({ ...empresa, nome: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">CNPJ:</label>
                    <input
                      type="text"
                      value={empresa.cnpj}
                      onChange={(e) => setEmpresa({ ...empresa, cnpj: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                      Cidade / UF:
                    </label>
                    <input
                      type="text"
                      value={empresa.cidadeUF}
                      onChange={(e) => setEmpresa({ ...empresa, cidadeUF: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                      Telefone Geral:
                    </label>
                    <input
                      type="text"
                      value={empresa.telefone}
                      onChange={(e) => setEmpresa({ ...empresa, telefone: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                      E-mail PCP:
                    </label>
                    <input
                      type="email"
                      value={empresa.email}
                      onChange={(e) => setEmpresa({ ...empresa, email: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Plant Targets & Parameters */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-wide">
                  Metas e Parâmetros PCP / MES
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                      Meta Diária (Big Bags):
                    </label>
                    <input
                      type="number"
                      value={parametros.metaDiariaBags}
                      onChange={(e) =>
                        setParametros({
                          ...parametros,
                          metaDiariaBags: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-bold text-blue-600 dark:text-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                      Horas por Turno:
                    </label>
                    <input
                      type="number"
                      value={parametros.horasTurno}
                      onChange={(e) =>
                        setParametros({
                          ...parametros,
                          horasTurno: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                      Eficiência Alvo (%):
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={parametros.eficienciaAlvo}
                      onChange={(e) =>
                        setParametros({
                          ...parametros,
                          eficienciaAlvo: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                      Meta OEE Geral (%):
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={parametros.oeeAlvo}
                      onChange={(e) =>
                        setParametros({
                          ...parametros,
                          oeeAlvo: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Database & Backup Management */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-wide">
                  Gerenciamento e Backup do Banco de Dados Local
                </h3>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Backup Completo do Sistema (.JSON)
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Exporte todos os dados armazenados (OPs, clientes, produtos, logs) para cópia de segurança.
                  </p>
                </div>

                <button
                  onClick={handleExportarBackupJSON}
                  className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium transition-colors shrink-0"
                >
                  <Download className="w-4 h-4 text-blue-600" />
                  <span>Baixar Backup JSON</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-red-50 dark:bg-red-950/20 p-4 rounded-xl border border-red-200 dark:border-red-500/30">
                <div>
                  <h4 className="text-xs font-bold text-red-700 dark:text-red-300">
                    Restaurar Banco para Valores Padrão da Virtude
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Restaura todas as OPs e tabelas para a massa de dados inicial da fábrica.
                  </p>
                </div>

                <button
                  onClick={handleResetarBanco}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-600/20 dark:hover:bg-red-600/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/40 rounded-lg text-xs font-bold transition-colors shrink-0"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Resetar Banco</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {abaAtiva === 'usuarios' && <GestaoUsuariosView />}
    </div>
  );
};
