import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Package,
  PlusCircle,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { storageService } from '../../services/storageService';
import { Pedido } from '../../types';
import { ModalInserirPedidoManual } from './ModalInserirPedidoManual';

interface ModalManutencaoPedidosProps {
  aoFechar: () => void;
  aoAtualizar?: () => void;
}

type FiltroManutencao = 'TODOS' | 'PENDENTE' | 'EM_PRODUCAO' | 'CONCLUIDO' | 'CANCELADO';

export const ModalManutencaoPedidos: React.FC<ModalManutencaoPedidosProps> = ({
  aoFechar,
  aoAtualizar,
}) => {
  const [pedidos, setPedidos] = useState<Pedido[]>(() => storageService.getPedidos());
  const [podeEditar] = useState<boolean>(() => storageService.podeEditar());
  const [busca, setBusca] = useState<string>('');
  const [filtro, setFiltro] = useState<FiltroManutencao>('TODOS');

  // Estados de Controle dos Modais
  const [modalInserirAberto, setModalInserirAberto] = useState<boolean>(false);
  const [pedidoParaExcluir, setPedidoParaExcluir] = useState<Pedido | null>(null);
  const [excluirOpsVinculadas, setExcluirOpsVinculadas] = useState<boolean>(true);

  // Estado para Duplicação de Pedido
  const [pedidoParaDuplicar, setPedidoParaDuplicar] = useState<Pedido | null>(null);
  const [duplicarNovoPedido, setDuplicarNovoPedido] = useState<string>('');
  const [duplicarNovaOp, setDuplicarNovaOp] = useState<string>('');
  const [duplicarNovaQtd, setDuplicarNovaQtd] = useState<number>(100);

  const [feedbackAcao, setFeedbackAcao] = useState<string | null>(null);

  const recarregar = () => {
    setPedidos(storageService.getPedidos());
    if (aoAtualizar) aoAtualizar();
  };

  const contagens = useMemo(() => {
    return {
      todos: pedidos.length,
      pendentes: pedidos.filter((p) => p.status === 'PENDENTE').length,
      emProducao: pedidos.filter((p) => p.status === 'EM_PRODUCAO').length,
      concluidos: pedidos.filter((p) => p.status === 'CONCLUIDO').length,
      cancelados: pedidos.filter((p) => p.status === 'CANCELADO').length,
    };
  }, [pedidos]);

  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((p) => {
      if (filtro !== 'TODOS' && p.status !== filtro) return false;
      if (busca.trim()) {
        const termo = busca.toLowerCase().trim();
        const matchNum = p.pedidoNumber.toLowerCase().includes(termo);
        const matchCli = p.cliente.toLowerCase().includes(termo);
        const matchOps = p.ops?.some((op) => op.toLowerCase().includes(termo));
        if (!matchNum && !matchCli && !matchOps) return false;
      }
      return true;
    });
  }, [pedidos, filtro, busca]);

  // Abrir diálogo de Duplicação pré-calculando valores sugeridos
  const handleAbrirDuplicacao = (ped: Pedido) => {
    setPedidoParaDuplicar(ped);
    const sugestaoPedido = `${ped.pedidoNumber}-C`;
    const sugestaoOp = ped.ops && ped.ops.length > 0 ? `${ped.ops[0]}-C` : `OP-${ped.pedidoNumber}-C`;
    setDuplicarNovoPedido(sugestaoPedido);
    setDuplicarNovaOp(sugestaoOp);
    setDuplicarNovaQtd(ped.totalItens || 100);
  };

  // Confirmar Duplicação
  const handleConfirmarDuplicacao = () => {
    if (!pedidoParaDuplicar) return;

    if (!duplicarNovoPedido.trim()) {
      alert('Por favor, informe o número para o novo pedido.');
      return;
    }

    const res = storageService.duplicarPedido(
      pedidoParaDuplicar.id,
      duplicarNovoPedido.trim(),
      duplicarNovaOp.trim() || undefined,
      Number(duplicarNovaQtd) || pedidoParaDuplicar.totalItens
    );

    if (res.sucesso) {
      setFeedbackAcao(res.mensagem);
      setPedidoParaDuplicar(null);
      recarregar();
      setTimeout(() => setFeedbackAcao(null), 4000);
    } else {
      alert(res.mensagem);
    }
  };

  // Confirmar Remoção do Pedido
  const handleConfirmarExclusao = () => {
    if (!pedidoParaExcluir) return;
    const res = storageService.excluirPedido(pedidoParaExcluir.id, excluirOpsVinculadas);
    setPedidoParaExcluir(null);
    if (res.sucesso) {
      setFeedbackAcao(res.mensagem);
      recarregar();
      setTimeout(() => setFeedbackAcao(null), 3000);
    } else {
      alert(res.mensagem);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto"
      onClick={aoFechar}
    >
      <div
        className="relative w-full max-w-6xl xl:max-w-7xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header da Janela */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-100">
                  Manutenção de Pedidos
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {pedidos.length} REGISTRADOS
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Cadastro manual, duplicação e remoção de pedidos na carteira industrial.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {podeEditar && (
              <button
                onClick={() => setModalInserirAberto(true)}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Inserir Pedido Manualmente</span>
              </button>
            )}
            <button
              onClick={aoFechar}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
              title="Fechar Janela"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback visual de ação realizada */}
        {feedbackAcao && (
          <div className="bg-emerald-500/15 border-b border-emerald-500/30 px-6 py-2.5 flex items-center space-x-2 text-emerald-400 text-xs font-medium animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedbackAcao}</span>
          </div>
        )}

        {/* Barra de Filtros e Busca Rápida */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/50 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setFiltro('TODOS')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  filtro === 'TODOS'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                TODOS ({contagens.todos})
              </button>
              <button
                onClick={() => setFiltro('PENDENTE')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  filtro === 'PENDENTE'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                PENDENTES ({contagens.pendentes})
              </button>
              <button
                onClick={() => setFiltro('EM_PRODUCAO')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  filtro === 'EM_PRODUCAO'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                EM PRODUÇÃO ({contagens.emProducao})
              </button>
              <button
                onClick={() => setFiltro('CONCLUIDO')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  filtro === 'CONCLUIDO'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                CONCLUÍDOS ({contagens.concluidos})
              </button>
              <button
                onClick={() => setFiltro('CANCELADO')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  filtro === 'CANCELADO'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                CANCELADOS ({contagens.cancelados})
              </button>
            </div>

            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar pedido, cliente ou OP..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Tabela de Pedidos */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {pedidosFiltrados.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Package className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-300">Nenhum pedido localizado</p>
              <p className="text-xs text-slate-500">
                Nenhum registro corresponde aos filtros de busca atuais.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-950/40">
                    <th className="py-3 px-3">Pedido Nº</th>
                    <th className="py-3 px-3">Cliente</th>
                    <th className="py-3 px-3">OPs Vinculadas</th>
                    <th className="py-3 px-3">Volume de Big Bags</th>
                    <th className="py-3 px-3">Data Pedido</th>
                    <th className="py-3 px-3">Previsão Entrega</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {pedidosFiltrados.map((ped) => {
                    const pct =
                      ped.totalItens > 0
                        ? Math.round((ped.totalProduzido / ped.totalItens) * 100)
                        : 0;

                    return (
                      <tr
                        key={ped.id}
                        className="hover:bg-slate-850/60 transition-colors"
                      >
                        <td className="py-3 px-3 font-mono font-bold text-amber-400">
                          {ped.pedidoNumber}
                        </td>
                        <td
                          className="py-3 px-3 font-medium text-slate-100 max-w-[280px] truncate"
                          title={ped.cliente}
                        >
                          {ped.cliente}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1">
                            {ped.ops && ped.ops.length > 0 ? (
                              ped.ops.map((op) => (
                                <span
                                  key={op}
                                  className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded font-mono text-[10px] border border-slate-700"
                                >
                                  {op}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-slate-500">Sem OP</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="space-y-1">
                            <span className="font-mono font-semibold text-slate-200">
                              {ped.totalProduzido} / {ped.totalItens} ({pct}%)
                            </span>
                            <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  ped.status === 'CONCLUIDO'
                                    ? 'bg-emerald-500'
                                    : pct > 50
                                    ? 'bg-amber-500'
                                    : 'bg-blue-500'
                                }`}
                                style={{ width: `${Math.min(100, pct)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                          {ped.dataPedido}
                        </td>
                        <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                          {ped.dataPrevisaoEntrega}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              ped.status === 'CONCLUIDO'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : ped.status === 'EM_PRODUCAO'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : ped.status === 'CANCELADO'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            }`}
                          >
                            {ped.status === 'CONCLUIDO'
                              ? 'CONCLUÍDO'
                              : ped.status === 'EM_PRODUCAO'
                              ? 'EM PRODUÇÃO'
                              : ped.status === 'CANCELADO'
                              ? 'CANCELADO'
                              : 'PENDENTE'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {podeEditar && (
                              <>
                                {/* Opção 1: Duplicar Pedido */}
                                <button
                                  onClick={() => handleAbrirDuplicacao(ped)}
                                  className="inline-flex items-center space-x-1 px-2 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 text-sky-400 hover:text-sky-300 transition-all text-[11px] font-semibold cursor-pointer"
                                  title="Duplicar este pedido"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Duplicar</span>
                                </button>

                                {/* Opção 2: Remover Pedido */}
                                <button
                                  onClick={() => setPedidoParaExcluir(ped)}
                                  className="inline-flex items-center space-x-1 px-2 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 transition-all text-[11px] font-semibold cursor-pointer"
                                  title="Remover este pedido"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Remover</span>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Rodapé da Janela */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-950/60 shrink-0">
          <span className="text-[11px] text-slate-500">
            Total exibido: {pedidosFiltrados.length} pedidos
          </span>
          <button
            onClick={aoFechar}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>

      {/* Modal: Inserir Pedido Manualmente */}
      {modalInserirAberto && (
        <ModalInserirPedidoManual
          pedidoParaEditar={null}
          aoFechar={() => setModalInserirAberto(false)}
          aoSalvarSucesso={() => recarregar()}
        />
      )}

      {/* Diálogo de Duplicação de Pedido */}
      {pedidoParaDuplicar && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xs"
          onClick={() => setPedidoParaDuplicar(null)}
        >
          <div
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 shrink-0">
                  <Copy className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-100">
                    Duplicar Pedido
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Origem: Pedido <strong className="text-amber-400 font-mono">#{pedidoParaDuplicar.pedidoNumber}</strong> ({pedidoParaDuplicar.cliente})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPedidoParaDuplicar(null)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Esta ação criará uma cópia completa dos dados técnicos e especificações do Big Bag deste pedido com novos números de identificação:
            </p>

            <div className="space-y-3.5 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Novo Número do Pedido:
                </label>
                <input
                  type="text"
                  value={duplicarNovoPedido}
                  onChange={(e) => setDuplicarNovoPedido(e.target.value)}
                  placeholder="Ex: 1024-C"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Novo Número da O.P (Ordem de Produção):
                </label>
                <input
                  type="text"
                  value={duplicarNovaOp}
                  onChange={(e) => setDuplicarNovaOp(e.target.value)}
                  placeholder="Ex: OP-1024-C"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-blue-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Quantidade a Produzir (unidades Big Bags):
                </label>
                <input
                  type="number"
                  min="1"
                  value={duplicarNovaQtd}
                  onChange={(e) => setDuplicarNovaQtd(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setPedidoParaDuplicar(null)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarDuplicacao}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>Confirmar Duplicação</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Diálogo de Confirmação de Remoção */}
      {pedidoParaExcluir && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xs"
          onClick={() => setPedidoParaExcluir(null)}
        >
          <div
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start space-x-3">
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-100">
                  Confirmar Remoção de Pedido
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Tem certeza que deseja remover o pedido{' '}
                  <strong className="text-amber-400 font-mono">
                    {pedidoParaExcluir.pedidoNumber}
                  </strong>{' '}
                  do cliente <strong className="text-slate-200">{pedidoParaExcluir.cliente}</strong>?
                </p>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
              <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={excluirOpsVinculadas}
                  onChange={(e) => setExcluirOpsVinculadas(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500 bg-slate-900 border-slate-700"
                />
                <span>
                  Remover também as OPs vinculadas ({pedidoParaExcluir.ops?.join(', ') || 'nenhuma'}) da programação fabril
                </span>
              </label>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setPedidoParaExcluir(null)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarExclusao}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Sim, Remover Pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
