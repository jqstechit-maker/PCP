import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Gauge,
  Layers,
  PackageCheck,
  TrendingUp,
  Zap,
} from 'lucide-react';
import React from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { storageService } from '../../services/storageService';
import { OrdemProducao, StatusProducao } from '../../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardViewProps {
  onNavegarProgramacao: () => void;
  onAvancarStatusOp: (opId: string, novoStatus: StatusProducao) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavegarProgramacao,
  onAvancarStatusOp,
}) => {
  const kpis = storageService.calcularKpis();
  const ops = storageService.getOps();

  // Delayed and Urgent OPs list
  const opsCriticas = ops.filter(
    (op) => op.status === 'ATRASADO' || op.prioridade === 'URGENTE'
  );

  // --- Chart 1: Status Breakdown (Doughnut) ---
  const statusCounts = {
    AGUARDANDO: ops.filter((o) => o.status === 'AGUARDANDO').length,
    CORTE: ops.filter((o) => o.status === 'CORTE').length,
    PREPARAÇÃO: ops.filter((o) => o.status === 'PREPARAÇÃO').length,
    CONFECÇÃO: ops.filter((o) => o.status === 'CONFECÇÃO').length,
    FINALIZADO: ops.filter((o) => o.status === 'FINALIZADO').length,
    ATRASADO: ops.filter((o) => o.status === 'ATRASADO').length,
  };

  const doughnutData = {
    labels: [
      'Aguardando',
      'Corte',
      'Preparação',
      'Confecção',
      'Finalizado',
      'Atrasado',
    ],
    datasets: [
      {
        data: [
          statusCounts.AGUARDANDO,
          statusCounts.CORTE,
          statusCounts.PREPARAÇÃO,
          statusCounts.CONFECÇÃO,
          statusCounts.FINALIZADO,
          statusCounts.ATRASADO,
        ],
        backgroundColor: [
          '#64748B', // Slate
          '#F59E0B', // Amber
          '#06B6D4', // Cyan
          '#6366F1', // Indigo
          '#10B981', // Emerald
          '#EF4444', // Red
        ],
        borderWidth: 2,
        borderColor: '#0F172A',
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#94A3B8',
          font: { size: 11 },
          padding: 12,
        },
      },
    },
    cutout: '68%',
  };

  // --- Chart 2: Daily Production Trend (Line Chart) ---
  const lineData = {
    labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    datasets: [
      {
        label: 'Produção Realizada (Big Bags)',
        data: [680, 750, 890, 810, 920, 650],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Meta PCP (1.000 un)',
        data: [1000, 1000, 1000, 1000, 1000, 1000],
        borderColor: '#94A3B8',
        borderDash: [5, 5],
        borderWidth: 2,
        pointRadius: 0,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: '#94A3B8', font: { size: 11 } },
      },
    },
    scales: {
      x: {
        ticks: { color: '#94A3B8', font: { size: 10 } },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
      y: {
        ticks: { color: '#94A3B8', font: { size: 10 } },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
    },
  };

  // --- Chart 3: Client Volume Breakdown (Bar Chart) ---
  const barData = {
    labels: [
      'Agroquímica',
      'Safra Forte',
      'Vale Dourado',
      'Santa Clara',
      'Planalto Alim.',
    ],
    datasets: [
      {
        label: 'Qtd Big Bags Programados',
        data: [2100, 1900, 1500, 600, 1000],
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        ticks: { color: '#94A3B8', font: { size: 10 } },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
      y: {
        ticks: { color: '#94A3B8', font: { size: 10 } },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
    },
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Page Title & Industrial Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
              VIRTUDE BIG BAG'S - MES & PCP
            </span>
            <span className="text-slate-400 text-xs">• Gestão Visual da Produção</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
            Painel Executivo de Produção Industrial
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Acompanhamento em tempo real das ordens de fabricação de Big Bags, taxas de eficiência e OEE.
          </p>
        </div>

        <button
          onClick={onNavegarProgramacao}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-xs shadow-xs transition-all self-start md:self-auto"
        >
          <span>Ver Programação Completa</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Critical OPs Alert Banner */}
      {opsCriticas.length > 0 && (
        <div className="bg-red-50 dark:bg-slate-900 border-2 border-red-500 dark:border-red-600 p-4 sm:p-5 rounded-xl shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2.5">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 animate-bounce shrink-0" />
              <h3 className="text-sm sm:text-base font-extrabold text-red-950 dark:text-red-100 tracking-tight">
                Alerta PCP: {opsCriticas.length} Ordem(ns) de Produção Requerem Atenção Imediata
              </h3>
            </div>
            <span className="self-start sm:self-auto text-xs bg-red-700 text-white dark:bg-red-600 dark:text-white px-3 py-1 rounded-full font-extrabold shadow-xs border border-red-800 dark:border-red-500 shrink-0">
              Prioridade Alta
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {opsCriticas.map((op) => (
              <div
                key={op.id}
                className="bg-white dark:bg-slate-950 border border-red-200 dark:border-red-900/60 p-3.5 rounded-xl flex flex-col justify-between shadow-xs hover:border-red-400 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100">
                    <span className="text-blue-600 dark:text-blue-400 font-mono font-extrabold">{op.opNumber}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        op.status === 'ATRASADO'
                          ? 'bg-red-600 text-white border border-red-700 dark:bg-red-700 dark:text-white'
                          : 'bg-amber-500 text-slate-950 border border-amber-600 dark:bg-amber-500 dark:text-slate-950'
                      }`}
                    >
                      {op.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-900 dark:text-slate-100 font-bold mt-1.5 truncate">
                    {op.cliente}
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium truncate">{op.produto}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Progresso: {op.quantidadeProduzida}/{op.quantidade}
                  </span>
                  <button
                    onClick={() =>
                      onAvancarStatusOp(
                        op.id,
                        op.status === 'AGUARDANDO'
                          ? 'CORTE'
                          : op.status === 'CORTE'
                          ? 'PREPARAÇÃO'
                          : op.status === 'PREPARAÇÃO'
                          ? 'CONFECÇÃO'
                          : 'FINALIZADO'
                      )
                    }
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-medium rounded-lg transition-colors"
                  >
                    Avançar Etapa
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards Row 1 - Clean Minimalist Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Card 1: Programados */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Programados</p>
            <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-slate-100">{kpis.pedidosProgramados}</p>
          </div>
          <div className="mt-3 h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-[60%]" />
          </div>
        </div>

        {/* Card 2: Em Produção */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Em Produção</p>
            <p className="text-2xl font-bold mt-1 text-orange-600 dark:text-amber-400">{kpis.pedidosProduzindo}</p>
          </div>
          <div className="mt-3 h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 w-[40%]" />
          </div>
        </div>

        {/* Card 3: Finalizados */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Finalizados</p>
            <p className="text-2xl font-bold mt-1 text-green-600 dark:text-emerald-400">{kpis.pedidosFinalizados}</p>
          </div>
          <div className="mt-3 h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 w-[80%]" />
          </div>
        </div>

        {/* Card 4: Atrasados */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 ring-2 ring-red-500/20 p-4 rounded-xl shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Atrasados</p>
            <p className="text-2xl font-bold mt-1 text-red-600 dark:text-red-400">{kpis.pedidosAtrasados}</p>
          </div>
          <div className="mt-3 h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 w-[15%]" />
          </div>
        </div>

        {/* Card 5: Dark Accent OEE Box */}
        <div className="bg-[#0f172a] p-4 rounded-xl shadow-sm text-white col-span-2 lg:col-span-1 flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Eficiência OEE</p>
            <p className="text-2xl font-bold mt-1">{kpis.eficienciaGlobal}%</p>
          </div>
          <p className="text-[10px] text-green-400 font-mono mt-2 tracking-tight">+2.4% vs ONTÉM</p>
        </div>
      </div>

      {/* MES OEE Indicators Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Gauge className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
              Indicadores Industriais MES & OEE (Overall Equipment Effectiveness)
            </h3>
          </div>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
            Turno Atual: 07:00 - 17:00
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* OEE Disponibilidade */}
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>Disponibilidade</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {kpis.oeeDisponibilidade}%
              </span>
            </div>
            <div className="mt-2 w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${kpis.oeeDisponibilidade}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">
              Tempo operacional / Tempo disponível
            </p>
          </div>

          {/* OEE Desempenho */}
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>Desempenho</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">{kpis.oeeDesempenho}%</span>
            </div>
            <div className="mt-2 w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full"
                style={{ width: `${kpis.oeeDesempenho}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">
              Velocidade real vs Cadência padrão
            </p>
          </div>

          {/* OEE Qualidade */}
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>Qualidade</span>
              <span className="text-blue-600 dark:text-cyan-400 font-bold">{kpis.oeeQualidade}%</span>
            </div>
            <div className="mt-2 w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full"
                style={{ width: `${kpis.oeeQualidade}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">
              Big Bags aprovados de 1ª vez
            </p>
          </div>

          {/* OEE Geral */}
          <div className="bg-[#0f172a] text-white p-3.5 rounded-xl relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200">
              <span>OEE Geral Planta</span>
              <span className="text-blue-400 text-sm font-extrabold">
                {kpis.oeeGeral}%
              </span>
            </div>
            <div className="mt-2 w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full"
                style={{ width: `${kpis.oeeGeral}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
              Desempenho da fábrica VIRTUDE
            </p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doughnut Chart: Status Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300 flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Distribuição por Etapa</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">OPs PCP</span>
          </div>
          <div className="h-64 relative flex items-center justify-center">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>

        {/* Line Chart: Daily Production Trend */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Ritmo Diário de Produção</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Unidades/Dia</span>
          </div>
          <div className="h-64 relative">
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>

        {/* Bar Chart: Client Volume */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Volume por Cliente</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Big Bags</span>
          </div>
          <div className="h-64 relative">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};
