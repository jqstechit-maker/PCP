import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Download,
  FileCheck,
  FileSpreadsheet,
  History,
  Upload,
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import { excelService, ResultadoImportacaoExcel } from '../../services/excelService';
import { storageService } from '../../services/storageService';
import { LogImportacao } from '../../types';

interface ImportadorExcelViewProps {
  onSucessoImportacao: () => void;
}

export const ImportadorExcelView: React.FC<ImportadorExcelViewProps> = ({
  onSucessoImportacao,
}) => {
  const [carregando, setCarregando] = useState(false);
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null);
  const [resultado, setResultado] = useState<ResultadoImportacaoExcel | null>(null);
  const [logsHistorico, setLogsHistorico] = useState<LogImportacao[]>(() =>
    storageService.getLogsImportacao()
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (
        file.name.endsWith('.xlsx') ||
        file.name.endsWith('.xls') ||
        file.name.endsWith('.csv')
      ) {
        setArquivoSelecionado(file);
        setResultado(null);
      } else {
        alert('Por favor, selecione um arquivo válido no formato .xlsx, .xls ou .csv.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setArquivoSelecionado(e.target.files[0]);
      setResultado(null);
    }
  };

  const executarImportacao = async () => {
    if (!arquivoSelecionado) return;

    setCarregando(true);
    try {
      const res = await excelService.importarPlanilhaExcel(arquivoSelecionado);
      setResultado(res);
      setLogsHistorico(storageService.getLogsImportacao());

      if (res.sucesso) {
        onSucessoImportacao();
      }
    } catch (err: any) {
      alert(`Falha na importação: ${err.message}`);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <span>Módulo Importador de Planilha PCP Excel</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Mantenha a planilha Excel do PCP como origem única dos dados. O sistema lerá e sincronizará automaticamente sem duplicações.
          </p>
        </div>

        <button
          onClick={() => excelService.gerarPlanilhaModeloPCP()}
          className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md self-start md:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Baixar Modelo PCP (.xlsx)</span>
        </button>
      </div>

      {/* Main Upload Zone & Process Result */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Drop Zone Card */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-slate-100">
            1. Selecionar ou Arrastar Planilha Diária do PCP
          </h3>

          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-amber-500/60 bg-slate-950/60 p-8 rounded-2xl text-center cursor-pointer transition-all space-y-3 group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx, .xls, .csv"
              className="hidden"
            />

            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-7 h-7" />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-200">
                {arquivoSelecionado
                  ? arquivoSelecionado.name
                  : 'Clique ou arraste seu arquivo Excel aqui'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Formatos suportados: .xlsx, .xls ou .csv (até 25 MB)
              </p>
            </div>
          </div>

          {arquivoSelecionado && (
            <div className="flex items-center justify-between bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-xs">
              <div className="flex items-center space-x-2 text-slate-200 font-medium">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>{arquivoSelecionado.name}</span>
                <span className="text-slate-400 font-mono">
                  ({(arquivoSelecionado.size / 1024).toFixed(1)} KB)
                </span>
              </div>

              <button
                disabled={carregando}
                onClick={executarImportacao}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-md"
              >
                {carregando ? 'Processando...' : 'Executar Sincronização'}
              </button>
            </div>
          )}

          {/* Import Result Feedback Card */}
          {resultado && (
            <div
              className={`p-4 rounded-xl border space-y-3 ${
                resultado.sucesso
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                  : 'bg-red-950/30 border-red-500/40 text-red-200'
              }`}
            >
              <div className="flex items-center space-x-2 font-bold text-sm">
                {resultado.sucesso ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                )}
                <span>{resultado.mensagem}</span>
              </div>

              {resultado.log && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs pt-2 border-t border-emerald-500/20">
                  <div className="bg-slate-900/80 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Lidos</span>
                    <span className="font-bold text-slate-100">
                      {resultado.log.registrosLidos}
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Novos</span>
                    <span className="font-bold text-emerald-400">
                      {resultado.log.registrosNovos}
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Atualizados</span>
                    <span className="font-bold text-amber-400">
                      {resultado.log.registrosAtualizados}
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Sem Alteração</span>
                    <span className="font-bold text-slate-300">
                      {resultado.log.registrosSemAlteracao}
                    </span>
                  </div>
                </div>
              )}

              {resultado.log?.detalhesErros && resultado.log.detalhesErros.length > 0 && (
                <div className="bg-red-950/60 p-3 rounded-lg border border-red-500/30 space-y-1 text-xs">
                  <span className="font-bold text-red-300">Avisos/Inconsistências:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-red-200/90 text-[11px]">
                    {resultado.log.detalhesErros.map((e, idx) => (
                      <li key={idx}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Import History Card */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-3">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <History className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100">Histórico de Importações</h3>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {logsHistorico.length > 0 ? (
              logsHistorico.map((log) => (
                <div
                  key={log.id}
                  className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-bold text-slate-200">
                    <span className="truncate max-w-[180px]">{log.nomeArquivo}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                        log.status === 'SUCESSO'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">{log.dataHora}</p>
                  <p className="text-[11px] text-slate-300">
                    {log.registrosLidos} lidos | {log.registrosNovos} novos |{' '}
                    {log.registrosAtualizados} atualizados
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 py-4 text-center">
                Nenhum histórico registrado.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
