import {
  ArrowRight,
  CheckCircle,
  ClipboardCheck,
  Clock,
  Factory,
  Layers,
  Scissors,
  Search,
  Shield,
  Wrench,
  X,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { storageService } from '../../services/storageService';
import { DadosQualidadeApontamento, OrdemProducao, StatusProducao } from '../../types';
import { ModalApontamentoProducao } from './ModalApontamentoProducao';

interface ProducaoKanbanViewProps {
  onAvancarStatusOp?: (opId: string, novoStatus: StatusProducao) => void;
}

export const ProducaoKanbanView: React.FC<ProducaoKanbanViewProps> = () => {
  const [ops, setOps] = useState<OrdemProducao[]>(() => storageService.getOps());
  const [opParaApontamento, setOpParaApontamento] = useState<OrdemProducao | null>(null);
  const [statusDestinoDesejado, setStatusDestinoDesejado] = useState<StatusProducao | undefined>(undefined);
  const [podeEditar, setPodeEditar] = useState<boolean>(() => storageService.podeEditar());
  const [termoBusca, setTermoBusca] = useState<string>('');

  const recarregar = () => {
    setOps(storageService.getOps());
    setPodeEditar(storageService.podeEditar());
  };

  useEffect(() => {
    window.addEventListener('virtude_data_synced', recarregar);
    window.addEventListener('storage', recarregar);
    return () => {
      window.removeEventListener('virtude_data_synced', recarregar);
      window.removeEventListener('storage', recarregar);
    };
  }, []);

  const handleIniciarApontamento = (op: OrdemProducao, proximoStatus?: StatusProducao) => {
    setOpParaApontamento(op);
    setStatusDestinoDesejado(proximoStatus);
  };

  const handleConfirmarApontamento = (
    opId: string,
    novoStatus: StatusProducao,
    quantidadeApontada: number,
    observacoes?: string,
    operador?: string,
    dadosQualidade?: DadosQualidadeApontamento
  ) => {
    storageService.atualizarStatusOp(
      opId,
      novoStatus,
      quantidadeApontada,
      observacoes,
      operador,
      dadosQualidade
    );
    setOpParaApontamento(null);
    recarregar();
  };

  const colunas: {
    id: StatusProducao;
    titulo: string;
    subtitulo: string;
    icon: React.ElementType;
    cor: string;
    borderCor: string;
    badgeCor: string;
    proximaEtapa?: StatusProducao;
  }[] = [
    {
      id: 'AGUARDANDO',
      titulo: '1. Aguardando Início',
      subtitulo: 'Aguardando Tecido / Bobina',
      icon: Clock,
      cor: 'bg-slate-800 text-slate-300',
      borderCor: 'border-slate-700/80',
      badgeCor: 'bg-slate-800 text-slate-300',
      proximaEtapa: 'CORTE',
    },
    {
      id: 'CORTE',
      titulo: '2. Corte de Ráfia',
      subtitulo: 'Corte a Quente / Dimensionamento',
      icon: Scissors,
      cor: 'bg-amber-500/15 text-amber-400',
      borderCor: 'border-amber-500/30',
      badgeCor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      proximaEtapa: 'PREPARAÇÃO',
    },
    {
      id: 'PREPARAÇÃO',
      titulo: '3. Preparação & Alças',
      subtitulo: 'Dobras, Válvulas e Costura Alças',
      icon: Wrench,
      cor: 'bg-cyan-500/15 text-cyan-400',
      borderCor: 'border-cyan-500/30',
      badgeCor: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
      proximaEtapa: 'CONFECÇÃO',
    },
    {
      id: 'CONFECÇÃO',
      titulo: '4. Confecção Final',
      subtitulo: 'Fechamento do Corpo / Inspeção',
      icon: Factory,
      cor: 'bg-indigo-500/15 text-indigo-400',
      borderCor: 'border-indigo-500/30',
      badgeCor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
      proximaEtapa: 'FINALIZADO',
    },
    {
      id: 'FINALIZADO',
      titulo: '5. Finalizado',
      subtitulo: 'Aguardando Logística',
      icon: CheckCircle,
      cor: 'bg-emerald-500/15 text-emerald-400',
      borderCor: 'border-emerald-500/30',
      badgeCor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    },
  ];

  // Métricas rápidas do pipeline
  const metricasPipeline = useMemo(() => {
    const totalOps = ops.length;
    const totalBags = ops.reduce((acc, o) => acc + (o.quantidade || 0), 0);
    const totalProduzido = ops.reduce((acc, o) => acc + (o.quantidadeProduzida || 0), 0);
    const concluidas = ops.filter((o) => o.status === 'FINALIZADO').length;
    const emProcesso = ops.filter((o) => ['CORTE', 'PREPARAÇÃO', 'CONFECÇÃO'].includes(o.status)).length;
    return { totalOps, totalBags, totalProduzido, concluidas, emProcesso };
  }, [ops]);

  // Filtro de busca
  const opsFiltradas = useMemo(() => {
    if (!termoBusca.trim()) return ops;
    const t = termoBusca.toLowerCase().trim();
    return ops.filter(
      (o) =>
        o.opNumber.toLowerCase().includes(t) ||
        o.cliente.toLowerCase().includes(t) ||
        (o.pedidoNumber && o.pedidoNumber.toLowerCase().includes(t)) ||
        (o.produto && o.produto.toLowerCase().includes(t))
    );
  }, [ops, termoBusca]);

  return (
    <div className="w-full space-y-4 pb-6">
      {/* Top Header Bar - Full Width Responsive Layout */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-lg">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2.5">
            <Factory className="w-5 h-5 text-amber-400 shrink-0" />
            <span>Gestão Visual de Chão de Fábrica (Pipeline MES)</span>
          </h2>
          <p className="text-xs text-slate-400">
            Acompanhe o fluxo físico de transformação do Big Bag desde o corte da matéria-prima até a expedição final.
          </p>
        </div>

        {/* Search & Status Badges */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Search */}
          <div className="relative min-w-[240px] sm:min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              placeholder="Buscar OP, Cliente ou Pedido..."
              className="w-full pl-9 pr-8 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
            {termoBusca && (
              <button
                onClick={() => setTermoBusca('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Counters Pill */}
          <div className="hidden sm:flex items-center space-x-2 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs">
            <span className="text-slate-400">Total:</span>
            <span className="font-mono font-bold text-slate-100">{metricasPipeline.totalOps} OPs</span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-amber-400 font-semibold">{metricasPipeline.emProcesso} em fábrica</span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-emerald-400 font-semibold">{metricasPipeline.concluidas} prontas</span>
          </div>

          {!podeEditar && (
            <div className="px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center space-x-2 text-xs text-amber-400 shrink-0">
              <Shield className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="leading-tight">
                <span className="font-bold">Somente Leitura</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Kanban Pipeline Columns - Full Fluid 5-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5 xl:gap-4 2xl:gap-5 items-start">
        {colunas.map((col) => {
          const Icone = col.icon;
          const opsColuna = opsFiltradas.filter(
            (o) => o.status === col.id || (col.id === 'AGUARDANDO' && o.status === 'ATRASADO')
          );

          return (
            <div
              key={col.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between shadow-lg h-full min-w-0"
            >
              {/* Column Header */}
              <div className="pb-3 border-b border-slate-800">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2 min-w-0">
                    <div className={`p-1.5 rounded-lg shrink-0 ${col.cor}`}>
                      <Icone className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-100 truncate">{col.titulo}</h3>
                  </div>
                  <span className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded-full shrink-0 ${col.badgeCor}`}>
                    {opsColuna.length}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 truncate">{col.subtitulo}</p>
              </div>

              {/* OP Cards List - Maximized height to fill available monitor viewport */}
              <div className="my-3 space-y-3 flex-1 overflow-y-auto min-h-[580px] max-h-[calc(100vh-235px)] pr-1.5 scrollbar-thin">
                {opsColuna.length > 0 ? (
                  opsColuna.map((op) => {
                    // Coluna 5: Finalizado -> layout limpo contendo estritamente: número do pedido, cliente e quantidade produzida
                    if (col.id === 'FINALIZADO') {
                      return (
                        <div
                          key={op.id}
                          className="bg-slate-950/90 border border-emerald-500/40 p-3.5 rounded-xl space-y-2.5 transition-all shadow-sm hover:border-emerald-500/70"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">
                                Número do Pedido
                              </span>
                              <span className="font-mono font-bold text-amber-400 text-sm sm:text-base">
                                {op.pedidoNumber || op.opNumber}
                              </span>
                            </div>
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold">
                              FINALIZADO
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">
                              Cliente
                            </span>
                            <p className="text-sm font-semibold text-slate-100 truncate" title={op.cliente}>
                              {op.cliente}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                              Quantidade Produzida
                            </span>
                            <span className="font-mono font-bold text-emerald-400 text-sm">
                              {op.quantidadeProduzida} un
                            </span>
                          </div>
                        </div>
                      );
                    }

                    const pct = Math.round(
                      (op.quantidadeProduzida / (op.quantidade || 1)) * 100
                    );

                    return (
                      <div
                        key={op.id}
                        className={`bg-slate-950/90 border ${
                          op.status === 'ATRASADO'
                            ? 'border-red-500/60 shadow-red-950/20'
                            : 'border-slate-800 hover:border-amber-500/50 hover:shadow-md'
                        } p-3.5 rounded-xl space-y-2.5 transition-all shadow-sm`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-1.5 min-w-0">
                            <span className="font-mono font-bold text-amber-400 text-sm tracking-wide">
                              #{op.opNumber}
                            </span>
                            {op.pedidoNumber && (
                              <span className="text-[10px] text-slate-400 font-mono bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded truncate">
                                Ped: {op.pedidoNumber}
                              </span>
                            )}
                          </div>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold shrink-0 ${
                              op.prioridade === 'ALTA' || op.prioridade === 'URGENTE'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {op.prioridade}
                          </span>
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-100 truncate" title={op.cliente}>
                            {op.cliente}
                          </p>
                          <p className="text-xs text-slate-400 truncate mt-0.5" title={op.produto}>
                            {op.produto}
                          </p>
                          {(op.modelo || op.dimensoes) && (
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              {[op.modelo, op.dimensoes].filter(Boolean).join(' • ')}
                            </p>
                          )}
                        </div>

                        <div className="pt-2 border-t border-slate-900 space-y-1.5">
                          <div className="flex justify-between text-xs text-slate-300 font-medium">
                            <span>Qtd: {op.quantidadeProduzida} / {op.quantidade} un</span>
                            <span className="font-bold text-amber-400 font-mono">{pct}%</span>
                          </div>
                          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-amber-500 h-full rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(100, pct)}%` }}
                            />
                          </div>
                        </div>

                        {podeEditar && col.proximaEtapa && (
                          <div className="pt-1">
                            <button
                              onClick={() => handleIniciarApontamento(op, col.proximaEtapa)}
                              className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-all shadow-sm cursor-pointer"
                              title={`Apontar quantidade e avançar para ${col.proximaEtapa}`}
                            >
                              <ClipboardCheck className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">Avançar para {col.proximaEtapa} (Apontar)</span>
                              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-xs text-slate-500 border border-dashed border-slate-800/80 rounded-xl flex flex-col items-center justify-center space-y-1">
                    <span>Sem OPs nesta etapa</span>
                    {termoBusca && <span className="text-[10px] text-slate-600">com o filtro atual</span>}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Apontamento Obrigatório para Mudança de Status */}
      {opParaApontamento && (
        <ModalApontamentoProducao
          op={opParaApontamento}
          statusDestinoInicial={statusDestinoDesejado}
          aoFechar={() => setOpParaApontamento(null)}
          aoConfirmar={handleConfirmarApontamento}
          titulo="Apontamento de Produção - Chão de Fábrica (MES)"
        />
      )}
    </div>
  );
};
