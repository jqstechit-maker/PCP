import {
  AlertOctagon,
  CheckCircle2,
  Clock,
  Factory,
  FileDown,
  FileText,
  History,
  Printer,
  Scissors,
  ShieldCheck,
  User,
  Wrench,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { formatarDataBR } from '../../services/excelService';
import { pdfService } from '../../services/pdfService';
import { OrdemProducao, StatusProducao } from '../../types';

interface ModalDetalhesOpFinalizadaProps {
  op: OrdemProducao;
  aoFechar: () => void;
}

export const ModalDetalhesOpFinalizada: React.FC<ModalDetalhesOpFinalizadaProps> = ({
  op,
  aoFechar,
}) => {
  const [gerandoPdf, setGerandoPdf] = useState(false);
  const apontamentos = op.apontamentos || [];

  // Calcular total de peças refugadas acumuladas
  const totalRefugadas =
    op.quantidadeRefugada ??
    apontamentos.reduce((acc, apt) => acc + (apt.quantidadeRefugada || 0), 0);

  // Total de etapas com apontamento
  const etapasComRefugo = apontamentos.filter(
    (apt) => apt.pecasRefugadas || (apt.quantidadeRefugada && apt.quantidadeRefugada > 0)
  );

  const getEtapaIcon = (status: StatusProducao) => {
    switch (status) {
      case 'CORTE':
        return Scissors;
      case 'PREPARAÇÃO':
        return Wrench;
      case 'CONFECÇÃO':
        return Factory;
      case 'FINALIZADO':
        return CheckCircle2;
      default:
        return Clock;
    }
  };

  const getEtapaNome = (status: StatusProducao) => {
    switch (status) {
      case 'AGUARDANDO':
        return '1. Aguardando Início';
      case 'CORTE':
        return '2. Corte de Ráfia';
      case 'PREPARAÇÃO':
        return '3. Preparação & Alças';
      case 'CONFECÇÃO':
        return '4. Confecção Final';
      case 'FINALIZADO':
        return '5. Finalizado (Expedição)';
      case 'ATRASADO':
        return 'Atrasado';
      default:
        return status;
    }
  };

  const handleImprimir = () => {
    window.print();
  };

  const handleExportarPdf = () => {
    try {
      setGerandoPdf(true);
      pdfService.gerarDossieOpPDF(op);
    } catch (err) {
      console.error('Erro ao gerar PDF do dossiê:', err);
    } finally {
      setTimeout(() => setGerandoPdf(false), 800);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto"
      onClick={aoFechar}
    >
      <div
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-100">
                  Registro da Produção — OP #{op.opNumber}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  FINALIZADO
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Detalhamento de peças produzidas por etapa, controle de refugo e justificativas
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportarPdf}
              disabled={gerandoPdf}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
              title="Exportar Registro da Produção para PDF"
            >
              <FileDown className="w-4 h-4" />
              <span>{gerandoPdf ? 'Exportando...' : 'Exportar PDF'}</span>
            </button>
            <button
              onClick={handleImprimir}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
              title="Imprimir relatório da OP"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={aoFechar}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 max-h-[calc(85vh-120px)] overflow-y-auto pr-3">
          {/* Card Resumo do Pedido & Produto */}
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">
                Cliente
              </span>
              <span className="font-semibold text-slate-100 truncate block mt-0.5" title={op.cliente}>
                {op.cliente}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">
                Número do Pedido
              </span>
              <span className="font-mono font-bold text-amber-400 block mt-0.5">
                {op.pedidoNumber || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">
                Produto / Dimensões
              </span>
              <span className="text-slate-200 font-medium truncate block mt-0.5" title={op.produto}>
                {op.produto} {op.dimensoes ? `(${op.dimensoes})` : ''}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">
                Data Conclusão
              </span>
              <span className="font-mono text-slate-300 block mt-0.5">
                {formatarDataBR(op.dataFimReal || op.alteradoEm || op.dataProgramada)}
              </span>
            </div>
          </div>

          {/* Cards de Métricas: Peças Produzidas vs Peças Refugadas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Produção Aprovada */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  Peças Produzidas / Concluídas
                </span>
                <div className="flex items-baseline space-x-1.5 mt-1">
                  <span className="text-xl font-bold font-mono text-emerald-300">
                    {op.quantidadeProduzida}
                  </span>
                  <span className="text-xs text-emerald-400/80">/ {op.quantidade} un</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-medium">100% da meta da OP</span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            {/* 2. Peças Refugadas */}
            <div
              className={`rounded-xl p-3.5 flex items-center justify-between border ${
                totalRefugadas > 0
                  ? 'bg-red-500/10 border-red-500/30 text-red-300'
                  : 'bg-slate-950 border-slate-800 text-slate-300'
              }`}
            >
              <div>
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider ${
                    totalRefugadas > 0 ? 'text-red-400' : 'text-slate-400'
                  }`}
                >
                  Total de Peças Refugadas
                </span>
                <div className="flex items-baseline space-x-1.5 mt-1">
                  <span
                    className={`text-xl font-bold font-mono ${
                      totalRefugadas > 0 ? 'text-red-400' : 'text-slate-200'
                    }`}
                  >
                    {totalRefugadas}
                  </span>
                  <span className="text-xs text-slate-400">unidades</span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  {totalRefugadas > 0
                    ? `${etapasComRefugo.length} etapa(s) com apontamento de refugo`
                    : 'Nenhum refugo registrado no processo'}
                </span>
              </div>
              <div
                className={`p-2.5 rounded-xl ${
                  totalRefugadas > 0
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {totalRefugadas > 0 ? (
                  <AlertOctagon className="w-5 h-5" />
                ) : (
                  <ShieldCheck className="w-5 h-5" />
                )}
              </div>
            </div>

            {/* 3. Inspeção de Qualidade */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Controle de Qualidade
                </span>
                <div className="flex items-center space-x-1.5 mt-1">
                  <span className="text-sm font-bold text-slate-100">
                    {op.revisadoQualidade !== false ? 'Aprovado & Revisado' : 'Pendente de Revisão'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  Auditoria de Chão de Fábrica
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Histórico e Peças Produzidas em Cada Etapa do Processo */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <History className="w-4 h-4 text-amber-400" />
                <span>Rastreabilidade de Etapas & Apontamentos de Produção</span>
              </h4>
              <span className="text-[10px] text-slate-500 font-mono">
                {apontamentos.length} registro(s) no histórico
              </span>
            </div>

            {apontamentos.length > 0 ? (
              <div className="space-y-3">
                {apontamentos.map((apt, index) => {
                  const IconeEtapa = getEtapaIcon(apt.novoStatus);
                  const teveRefugo =
                    apt.pecasRefugadas || (apt.quantidadeRefugada && apt.quantidadeRefugada > 0);

                  return (
                    <div
                      key={apt.id || index}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 hover:border-slate-700 transition-colors"
                    >
                      {/* Linha 1: Etapa, Quantidade Produzida e Metadados */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
                        <div className="flex items-center space-x-2.5">
                          <div className="p-2 rounded-lg bg-slate-900 border border-slate-700/80 text-amber-400">
                            <IconeEtapa className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-slate-100">
                                Etapa: {getEtapaNome(apt.novoStatus)}
                              </span>
                              {apt.statusAnterior && apt.statusAnterior !== apt.novoStatus && (
                                <span className="text-[10px] text-slate-500">
                                  (Origem: {apt.statusAnterior})
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                              <span className="flex items-center space-x-1">
                                <Clock className="w-3 h-3 text-slate-500" />
                                <span>{apt.dataHora}</span>
                              </span>
                              <span>&bull;</span>
                              <span className="flex items-center space-x-1">
                                <User className="w-3 h-3 text-slate-500" />
                                <span>Operador: {apt.operador || 'PCP'}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Indicador de Quantidade Produzida na Etapa */}
                        <div className="flex items-center space-x-3 text-right">
                          <div>
                            <span className="text-[10px] text-slate-500 block uppercase font-medium">
                              Produzido na Etapa
                            </span>
                            <span className="text-sm font-bold font-mono text-emerald-400">
                              +{apt.quantidadeApontada} un
                            </span>
                          </div>
                          <div className="pl-3 border-l border-slate-800">
                            <span className="text-[10px] text-slate-500 block uppercase font-medium">
                              Total Acumulado
                            </span>
                            <span className="text-xs font-bold font-mono text-slate-200">
                              {apt.quantidadeTotalApos} / {op.quantidade} un
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Linha 2: Badges de Inspeção e Refugo */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {/* Qualidade */}
                        <div className="flex items-center space-x-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
                          <ShieldCheck
                            className={`w-4 h-4 shrink-0 ${
                              apt.revisadoQualidade !== false ? 'text-emerald-400' : 'text-slate-500'
                            }`}
                          />
                          <div className="min-w-0">
                            <span className="text-[10px] text-slate-400 block font-semibold">
                              Revisado pela Qualidade
                            </span>
                            <span
                              className={`text-xs font-bold ${
                                apt.revisadoQualidade !== false ? 'text-emerald-300' : 'text-slate-400'
                              }`}
                            >
                              {apt.revisadoQualidade !== false ? 'SIM — Inspecionado' : 'NÃO REVISADO'}
                            </span>
                          </div>
                        </div>

                        {/* Peças Refugadas */}
                        <div
                          className={`flex items-center space-x-2 p-2 rounded-lg border ${
                            teveRefugo
                              ? 'bg-red-500/10 border-red-500/30'
                              : 'bg-slate-900/80 border-slate-800/80'
                          }`}
                        >
                          {teveRefugo ? (
                            <AlertOctagon className="w-4 h-4 text-red-400 shrink-0" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <span
                              className={`text-[10px] block font-semibold ${
                                teveRefugo ? 'text-red-300' : 'text-slate-400'
                              }`}
                            >
                              Peças Refugadas
                            </span>
                            <span
                              className={`text-xs font-bold font-mono ${
                                teveRefugo ? 'text-red-400' : 'text-emerald-400'
                              }`}
                            >
                              {teveRefugo
                                ? `SIM — ${apt.quantidadeRefugada || 1} peça(s) com refugo/defeito`
                                : 'NÃO — Zero refugos'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Linha 3: Justificativa do Refugo / Inspeção por Escrito */}
                      {apt.justificativaRefugo ? (
                        <div className="bg-amber-500/10 border border-amber-500/25 rounded-lg p-2.5 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center space-x-1.5">
                            <FileText className="w-3.5 h-3.5" />
                            <span>Justificativa registrada por escrito:</span>
                          </span>
                          <p className="text-xs text-amber-200/90 leading-relaxed font-normal pl-5">
                            "{apt.justificativaRefugo}"
                          </p>
                        </div>
                      ) : teveRefugo ? (
                        <div className="text-[11px] text-red-400/80 italic pl-1">
                          * Nenhuma justificativa detalhada foi digitada para este refugo.
                        </div>
                      ) : null}

                      {/* Linha 4: Observações adicionais do apontamento */}
                      {apt.observacoes && (
                        <div className="text-xs text-slate-400 bg-slate-900/50 p-2 rounded-lg border border-slate-800/60">
                          <span className="text-[10px] font-bold text-slate-500 block uppercase">
                            Observações Gerais:
                          </span>
                          <p className="italic mt-0.5">{apt.observacoes}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Fallback para OPs finalizadas sem registros individuais na matriz de apontamentos */
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center space-x-3 text-xs text-slate-300">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-100 block">
                      Produção Consolidada e Finalizada
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      A ordem de produção completou todas as etapas fabris ({op.quantidadeProduzida} de{' '}
                      {op.quantidade} Big Bags produzidos).
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-900">
                  <div className="p-2 bg-slate-900/70 rounded-lg">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">
                      Controle de Qualidade
                    </span>
                    <span className="text-xs font-semibold text-emerald-400">
                      {op.revisadoQualidade !== false ? 'SIM — Inspecionado e Liberado' : 'NÃO REVISADO'}
                    </span>
                  </div>
                  <div className="p-2 bg-slate-900/70 rounded-lg">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">
                      Peças Refugadas
                    </span>
                    <span className="text-xs font-semibold text-slate-300 font-mono">
                      {totalRefugadas > 0
                        ? `SIM — ${totalRefugadas} peça(s) refugadas`
                        : 'NÃO — Zero refugos no processo'}
                    </span>
                  </div>
                </div>

                {op.observacoes && (
                  <div className="p-2.5 bg-slate-900/50 rounded-lg text-xs text-slate-400">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">
                      Observações da OP:
                    </span>
                    <p className="italic mt-0.5">{op.observacoes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            OP #{op.opNumber} &bull; Pedido {op.pedidoNumber || 'N/A'}
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportarPdf}
              disabled={gerandoPdf}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <FileDown className="w-4 h-4" />
              <span>{gerandoPdf ? 'Gerando PDF...' : 'Exportar PDF'}</span>
            </button>
            <button
              onClick={aoFechar}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Fechar Registro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
