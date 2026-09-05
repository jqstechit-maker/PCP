import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Factory,
  History,
  Info,
  Package,
  User,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { storageService } from '../../services/storageService';
import { OrdemProducao, StatusProducao } from '../../types';

interface ModalApontamentoProducaoProps {
  op: OrdemProducao;
  statusDestinoInicial?: StatusProducao;
  aoFechar: () => void;
  aoConfirmar: (
    opId: string,
    novoStatus: StatusProducao,
    quantidadeApontada: number,
    observacoes?: string,
    operador?: string
  ) => void;
  titulo?: string;
}

export const ModalApontamentoProducao: React.FC<ModalApontamentoProducaoProps> = ({
  op,
  statusDestinoInicial,
  aoFechar,
  aoConfirmar,
  titulo = 'Apontamento de Produção & Mudança de Status',
}) => {
  const usuarioLogado = storageService.getUsuarioSessao() || storageService.getUsuario();

  // Next status defaults to passed status or next sequential status
  const proximoPadrao = (): StatusProducao => {
    if (statusDestinoInicial) return statusDestinoInicial;
    switch (op.status) {
      case 'AGUARDANDO':
        return 'CORTE';
      case 'CORTE':
        return 'PREPARAÇÃO';
      case 'PREPARAÇÃO':
        return 'CONFECÇÃO';
      case 'CONFECÇÃO':
        return 'FINALIZADO';
      default:
        return op.status;
    }
  };

  const [novoStatus, setNovoStatus] = useState<StatusProducao>(proximoPadrao);
  const [qtdApontadaStr, setQtdApontadaStr] = useState<string>('');
  const [observacoes, setObservacoes] = useState<string>('');
  const [operador, setOperador] = useState<string>(usuarioLogado.nome || 'Operador');
  const [mostrarHistorico, setMostrarHistorico] = useState<boolean>(false);
  const [tentouSalvar, setTentouSalvar] = useState<boolean>(false);

  const saldoRestante = Math.max(0, op.quantidade - (op.quantidadeProduzida || 0));
  const qtdApontadaNum = parseInt(qtdApontadaStr, 10);
  const qtdValida = !isNaN(qtdApontadaNum) && qtdApontadaNum > 0;

  // Real-time calculation
  const totalAposApontamento = (op.quantidadeProduzida || 0) + (qtdValida ? qtdApontadaNum : 0);
  const percentualApos = op.quantidade > 0 ? Math.round((totalAposApontamento / op.quantidade) * 100) : 0;
  const percentualAtual = op.quantidade > 0 ? Math.round(((op.quantidadeProduzida || 0) / op.quantidade) * 100) : 0;

  const handlePreencherQtd = (valor: number) => {
    setQtdApontadaStr(valor.toString());
  };

  const handleAdicionarQtd = (adicional: number) => {
    const atual = parseInt(qtdApontadaStr, 10) || 0;
    setQtdApontadaStr((atual + adicional).toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTentouSalvar(true);

    if (!qtdValida) {
      return;
    }

    aoConfirmar(op.id, novoStatus, qtdApontadaNum, observacoes, operador);
  };

  const statusColors: Record<StatusProducao, { bg: string; text: string; border: string }> = {
    AGUARDANDO: { bg: 'bg-slate-800', text: 'text-slate-300', border: 'border-slate-700' },
    CORTE: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/40' },
    PREPARAÇÃO: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/40' },
    CONFECÇÃO: { bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/40' },
    FINALIZADO: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/40' },
    ATRASADO: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/40' },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl text-slate-100 shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <span>{titulo}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Regra de fabricação: toda mudança de status exige o apontamento da quantidade produzida
              </p>
            </div>
          </div>
          <button
            onClick={aoFechar}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Card Detalhes da OP */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  {op.opNumber}
                </span>
                <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                  {op.pedidoNumber}
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-200">{op.cliente}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Produto / Modelo:</span>
                <span className="font-medium text-slate-200 line-clamp-1" title={op.produto}>
                  {op.produto}
                </span>
                {op.modelo && (
                  <span className="text-[10px] text-slate-400 block line-clamp-1">{op.modelo}</span>
                )}
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[11px]">Progresso da Ordem:</span>
                <span className="font-bold text-slate-200">
                  {op.quantidadeProduzida} / {op.quantidade} un ({percentualAtual}%)
                </span>
                <span className="text-[10px] text-amber-400/90 block font-medium">
                  Saldo Restante: {saldoRestante} un
                </span>
              </div>
            </div>

            {/* Barra de progresso atual */}
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, percentualAtual)}%` }}
              />
            </div>
          </div>

          {/* Mudança de Status */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300">
              Fluxo da Etapa de Produção:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              {/* Status Atual */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                  Status Atual
                </span>
                <div className="mt-1 flex items-center space-x-2">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
                      statusColors[op.status]?.bg || 'bg-slate-800'
                    } ${statusColors[op.status]?.text || 'text-slate-300'} ${
                      statusColors[op.status]?.border || 'border-slate-700'
                    }`}
                  >
                    {op.status}
                  </span>
                </div>
              </div>

              {/* Novo Status */}
              <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-3">
                <label
                  htmlFor="select-novo-status"
                  className="text-[10px] text-amber-400 uppercase tracking-wider block font-bold"
                >
                  Novo Status de Destino *
                </label>
                <select
                  id="select-novo-status"
                  value={novoStatus}
                  onChange={(e) => setNovoStatus(e.target.value as StatusProducao)}
                  className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-bold focus:outline-hidden focus:border-amber-500"
                >
                  <option value="AGUARDANDO">1. AGUARDANDO (Início)</option>
                  <option value="CORTE">2. CORTE (Corte de Ráfia)</option>
                  <option value="PREPARAÇÃO">3. PREPARAÇÃO (Alças / Dobras)</option>
                  <option value="CONFECÇÃO">4. CONFECÇÃO (Costura Final)</option>
                  <option value="FINALIZADO">5. FINALIZADO</option>
                  <option value="ATRASADO">ATRASADO (Interrupção / Alerta)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Campo OBRIGATÓRIO: Quantidade Produzida no Apontamento */}
          <div className="bg-amber-500/5 border border-amber-500/30 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="input-qtd-apontamento"
                className="text-xs font-bold text-amber-300 flex items-center space-x-1.5"
              >
                <span>Quantidade de Itens Produzidos neste Apontamento</span>
                <span className="text-red-400 font-bold">*</span>
              </label>
              <span className="text-[10px] text-slate-400">Obrigatório informar</span>
            </div>

            <div className="relative">
              <input
                id="input-qtd-apontamento"
                type="number"
                min="1"
                step="1"
                value={qtdApontadaStr}
                onChange={(e) => setQtdApontadaStr(e.target.value)}
                placeholder="Ex: 50"
                autoFocus
                className={`w-full bg-slate-950 border text-lg font-mono font-bold text-slate-100 px-4 py-2.5 rounded-xl focus:outline-hidden transition-colors ${
                  tentouSalvar && !qtdValida
                    ? 'border-red-500 ring-2 ring-red-500/20'
                    : 'border-amber-500/50 focus:border-amber-400'
                }`}
              />
              <div className="absolute right-3 top-3 text-xs font-bold text-slate-400 font-mono">
                peças / bags
              </div>
            </div>

            {/* Validação de obrigatoriedade */}
            {tentouSalvar && !qtdValida && (
              <div className="flex items-center space-x-2 text-xs text-red-400 font-medium bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  O apontamento é obrigatório. Por favor, digite uma quantidade produzida maior que zero (1 ou mais).
                </span>
              </div>
            )}

            {/* Botões de Preenchimento Rápido */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400 mr-1 font-medium">Atalhos rápidos:</span>
              {saldoRestante > 0 && (
                <button
                  type="button"
                  onClick={() => handlePreencherQtd(saldoRestante)}
                  className="px-2.5 py-1 text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 rounded-lg transition-colors shadow-xs"
                >
                  Saldo Restante ({saldoRestante} un)
                </button>
              )}
              <button
                type="button"
                onClick={() => handleAdicionarQtd(10)}
                className="px-2 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
              >
                +10
              </button>
              <button
                type="button"
                onClick={() => handleAdicionarQtd(25)}
                className="px-2 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
              >
                +25
              </button>
              <button
                type="button"
                onClick={() => handleAdicionarQtd(50)}
                className="px-2 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
              >
                +50
              </button>
              <button
                type="button"
                onClick={() => handleAdicionarQtd(100)}
                className="px-2 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
              >
                +100
              </button>
            </div>

            {/* Simulação em tempo real */}
            {qtdValida && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Previsão Acumulada da OP:</span>
                  <span className="font-bold text-emerald-400">
                    {totalAposApontamento} / {op.quantidade} un ({percentualApos}%)
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      percentualApos >= 100 ? 'bg-emerald-500' : 'bg-amber-400'
                    }`}
                    style={{ width: `${Math.min(100, percentualApos)}%` }}
                  />
                </div>
                {totalAposApontamento >= op.quantidade && (
                  <p className="text-[11px] text-emerald-400 font-medium flex items-center space-x-1 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Meta de produção total desta OP atingida!</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Dados Complementares (Operador e Observações) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="input-operador"
                className="block text-xs font-semibold text-slate-400 mb-1"
              >
                Operador Responsável:
              </label>
              <div className="relative">
                <input
                  id="input-operador"
                  type="text"
                  value={operador}
                  onChange={(e) => setOperador(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-amber-500"
                  placeholder="Nome do operador..."
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="input-observacoes"
                className="block text-xs font-semibold text-slate-400 mb-1"
              >
                Observação do Apontamento (opcional):
              </label>
              <input
                id="input-observacoes"
                type="text"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-amber-500"
                placeholder="Ex: Turno manhã, sem defeitos..."
              />
            </div>
          </div>

          {/* Histórico Anterior de Apontamentos da OP (se existir) */}
          {op.apontamentos && op.apontamentos.length > 0 && (
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setMostrarHistorico(!mostrarHistorico)}
                className="w-full px-3 py-2 bg-slate-950 hover:bg-slate-900 flex items-center justify-between text-xs text-slate-400 font-medium transition-colors"
              >
                <div className="flex items-center space-x-1.5">
                  <History className="w-3.5 h-3.5 text-amber-400" />
                  <span>Histórico de Apontamentos Desta OP ({op.apontamentos.length})</span>
                </div>
                {mostrarHistorico ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {mostrarHistorico && (
                <div className="p-3 bg-slate-950/90 space-y-2 max-h-40 overflow-y-auto">
                  {op.apontamentos.map((ap) => (
                    <div
                      key={ap.id}
                      className="text-[11px] p-2 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-slate-200 flex items-center space-x-1.5">
                          <span>{ap.statusAnterior}</span>
                          <ArrowRight className="w-3 h-3 text-slate-500" />
                          <span className="text-amber-400">{ap.novoStatus}</span>
                        </div>
                        <span className="text-slate-500 text-[10px]">
                          {ap.dataHora} • Por: {ap.operador}
                        </span>
                        {ap.observacoes && (
                          <p className="text-[10px] text-slate-400 italic mt-0.5">{ap.observacoes}</p>
                        )}
                      </div>
                      <div className="text-right font-mono">
                        <span className="font-bold text-amber-400">+{ap.quantidadeApontada} un</span>
                        <span className="block text-[10px] text-slate-500">
                          Total: {ap.quantidadeTotalApos} un
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer Ações */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={aoFechar}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!qtdValida}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-2 ${
                qtdValida
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Confirmar Apontamento & Mudar Status</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
