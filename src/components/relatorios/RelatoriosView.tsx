import {
  BarChart2,
  Calendar,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  TrendingUp,
} from 'lucide-react';
import React, { useState } from 'react';
import { excelService } from '../../services/excelService';
import { pdfService } from '../../services/pdfService';
import { storageService } from '../../services/storageService';

export const RelatoriosView: React.FC = () => {
  const [tipoRelatorio, setTipoRelatorio] = useState<
    'DIARIO' | 'MENSAL' | 'CLIENTES' | 'PRODUTOS' | 'EFICIENCIA'
  >('DIARIO');

  const kpis = storageService.calcularKpis();
  const ops = storageService.getOps();

  const handleExportPDF = () => {
    pdfService.gerarRelatorioProducaoPDF(
      `Relatório de Produção - Tipo: ${tipoRelatorio}`,
      "VIRTUDE BIG BAG'S - Sistema de Gestão Visual MES/PCP",
      ops,
      kpis
    );
  };

  const handleExportExcel = () => {
    excelService.exportarOpsParaExcel(
      ops,
      `Relatorio_Virtude_${tipoRelatorio}_${Date.now()}.xlsx`
    );
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <span>Central de Relatórios Gerenciais de Produção</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gere demonstrativos detalhados de eficiência, volume por cliente e histórico mensal.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar Excel</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center space-x-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Baixar PDF</span>
          </button>

          <button
            onClick={() => window.print()}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-colors"
            title="Imprimir"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-slate-900 p-1.5 border border-slate-800 rounded-2xl">
        {[
          { id: 'DIARIO', label: 'Produção Diária' },
          { id: 'MENSAL', label: 'Produção Mensal' },
          { id: 'CLIENTES', label: 'Por Cliente' },
          { id: 'PRODUTOS', label: 'Por Produto' },
          { id: 'EFICIENCIA', label: 'Eficiência / OEE' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTipoRelatorio(tab.id as any)}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              tipoRelatorio === tab.id
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Report Data Preview Table */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-100">
            Resumo do Relatório: {tipoRelatorio}
          </h3>
          <span className="text-xs text-amber-400 font-mono font-semibold">
            {ops.length} Registros Processados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px]">
                <th className="p-3">OP</th>
                <th className="p-3">Cliente</th>
                <th className="p-3">Produto</th>
                <th className="p-3">Qtd Produzida / Meta</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Eficiência</th>
                <th className="p-3">Data Entrega</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {ops.map((op) => (
                <tr key={op.id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-mono font-bold text-amber-400">{op.opNumber}</td>
                  <td className="p-3 font-semibold text-slate-100">{op.cliente}</td>
                  <td className="p-3 text-slate-300">{op.produto}</td>
                  <td className="p-3 font-mono">
                    {op.quantidadeProduzida} / {op.quantidade}
                  </td>
                  <td className="p-3 text-center font-bold text-slate-200">{op.status}</td>
                  <td className="p-3 text-center font-bold text-amber-400">{op.eficiencia}%</td>
                  <td className="p-3 font-mono text-slate-400">{op.dataEntrega}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
