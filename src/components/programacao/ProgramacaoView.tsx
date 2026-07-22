import {
  ArrowUpDown,
  CheckCircle,
  Download,
  Edit2,
  FileSpreadsheet,
  FileText,
  Filter,
  Plus,
  RefreshCw,
  Search,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { excelService } from '../../services/excelService';
import { pdfService } from '../../services/pdfService';
import { storageService } from '../../services/storageService';
import { OrdemProducao, StatusProducao } from '../../types';

interface ProgramacaoViewProps {
  buscaGlobal: string;
  onAbrirImportador: () => void;
}

export const ProgramacaoView: React.FC<ProgramacaoViewProps> = ({
  buscaGlobal,
  onAbrirImportador,
}) => {
  const [ops, setOps] = useState<OrdemProducao[]>(() => storageService.getOps());

  // Filter States
  const [statusFiltro, setStatusFiltro] = useState<string>('TODOS');
  const [clienteFiltro, setClienteFiltro] = useState<string>('TODOS');
  const [prioridadeFiltro, setPrioridadeFiltro] = useState<string>('TODOS');
  const [buscaLocal, setBuscaLocal] = useState<string>('');

  // Pagination
  const [paginaAtual, setPaginaAtual] = useState<number>(1);
  const itensPorPagina = 8;

  // Sorting
  const [campoOrdenacao, setCampoOrdenacao] =
    useState<keyof OrdemProducao>('dataProgramada');
  const [direcaoOrdenacao, setDirecaoOrdenacao] = useState<'asc' | 'desc'>('asc');

  // Modal State for OP Editing / Status Advance
  const [opModal, setOpModal] = useState<OrdemProducao | null>(null);
  const [modalNovoStatus, setModalNovoStatus] = useState<StatusProducao>('AGUARDANDO');
  const [modalQtdAdicional, setModalQtdAdicional] = useState<number>(0);
  const [modalObservacoes, setModalObservacoes] = useState<string>('');

  // Recalculate list whenever storage updates
  const recarregarDados = () => {
    setOps(storageService.getOps());
  };

  // Get unique clients for dropdown
  const listaClientes = useMemo(() => {
    const setC = new Set<string>();
    ops.forEach((o) => setC.add(o.cliente));
    return Array.from(setC);
  }, [ops]);

  // Combined Search & Filter Logic
  const opsFiltradas = useMemo(() => {
    const termo = (buscaLocal || buscaGlobal).toLowerCase().trim();

    return ops.filter((op) => {
      // Search matches OP, Pedido, Cliente, Produto, Modelo
      const bateBusca =
        !termo ||
        op.opNumber.toLowerCase().includes(termo) ||
        op.pedidoNumber.toLowerCase().includes(termo) ||
        op.cliente.toLowerCase().includes(termo) ||
        op.produto.toLowerCase().includes(termo) ||
        op.modelo.toLowerCase().includes(termo);

      const bateStatus = statusFiltro === 'TODOS' || op.status === statusFiltro;
      const bateCliente = clienteFiltro === 'TODOS' || op.cliente === clienteFiltro;
      const batePrioridade =
        prioridadeFiltro === 'TODOS' || op.prioridade === prioridadeFiltro;

      return bateBusca && bateStatus && bateCliente && batePrioridade;
    });
  }, [ops, buscaLocal, buscaGlobal, statusFiltro, clienteFiltro, prioridadeFiltro]);

  // Sorted Array
  const opsOrdenadas = useMemo(() => {
    return [...opsFiltradas].sort((a, b) => {
      const valA = a[campoOrdenacao];
      const valB = b[campoOrdenacao];

      if (valA === undefined) return 1;
      if (valB === undefined) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return direcaoOrdenacao === 'asc' ? valA - valB : valB - valA;
      }

      return direcaoOrdenacao === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [opsFiltradas, campoOrdenacao, direcaoOrdenacao]);

  // Paginated Output
  const totalPaginas = Math.ceil(opsOrdenadas.length / itensPorPagina) || 1;
  const opsPaginadas = useMemo(() => {
    const inicio = (paginaAtual - 1) * itensPorPagina;
    return opsOrdenadas.slice(inicio, inicio + itensPorPagina);
  }, [opsOrdenadas, paginaAtual, itensPorPagina]);

  // Handle Sort Click
  const alternarOrdenacao = (campo: keyof OrdemProducao) => {
    if (campoOrdenacao === campo) {
      setDirecaoOrdenacao(direcaoOrdenacao === 'asc' ? 'desc' : 'asc');
    } else {
      setCampoOrdenacao(campo);
      setDirecaoOrdenacao('asc');
    }
  };

  // Open Edit Modal
  const abrirModalEditar = (op: OrdemProducao) => {
    setOpModal(op);
    setModalNovoStatus(op.status);
    setModalQtdAdicional(0);
    setModalObservacoes(op.observacoes || '');
  };

  // Save Status / OP Change
  const salvarEdicaoOp = () => {
    if (!opModal) return;

    storageService.atualizarStatusOp(
      opModal.id,
      modalNovoStatus,
      modalQtdAdicional,
      modalObservacoes
    );

    recarregarDados();
    setOpModal(null);
  };

  // Status Badge Styling Helper - Clean Minimalism Theme
  const renderStatusBadge = (status: StatusProducao) => {
    switch (status) {
      case 'AGUARDANDO':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
            AGUARDANDO
          </span>
        );
      case 'CORTE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
            CORTE
          </span>
        );
      case 'PREPARAÇÃO':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800">
            PREPARAÇÃO
          </span>
        );
      case 'CONFECÇÃO':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800">
            CONFECÇÃO
          </span>
        );
      case 'FINALIZADO':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
            FINALIZADO
          </span>
        );
      case 'ATRASADO':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800 animate-pulse">
            ATRASADO
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Top Header & Export Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <span>Programação de Produção (PCP)</span>
            <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 px-2 py-0.5 rounded-full font-mono">
              {opsOrdenadas.length} OP(s)
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Controle visual de ordens de fabricação de Big Bags importadas da planilha Excel.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() =>
              excelService.exportarOpsParaExcel(
                opsOrdenadas,
                'Programacao_Producao_Virtude.xlsx'
              )
            }
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Exportar Excel</span>
          </button>

          <button
            onClick={() =>
              pdfService.gerarRelatorioProducaoPDF(
                'Relatório de Programação de Produção PCP',
                'Virtude Big Bag\'s - Ordens de Produção Ativas',
                opsOrdenadas,
                storageService.calcularKpis()
              )
            }
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium transition-colors"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Exportar PDF</span>
          </button>

          <button
            onClick={onAbrirImportador}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-xs transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Importar Planilha</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Instant Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={buscaLocal}
              onChange={(e) => {
                setBuscaLocal(e.target.value);
                setPaginaAtual(1);
              }}
              placeholder="Pesquisa rápida (OP, cliente...)"
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Filter Status */}
          <div className="relative">
            <select
              value={statusFiltro}
              onChange={(e) => {
                setStatusFiltro(e.target.value);
                setPaginaAtual(1);
              }}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="AGUARDANDO">AGUARDANDO</option>
              <option value="CORTE">CORTE</option>
              <option value="PREPARAÇÃO">PREPARAÇÃO</option>
              <option value="CONFECÇÃO">CONFECÇÃO</option>
              <option value="FINALIZADO">FINALIZADO</option>
              <option value="ATRASADO">ATRASADO</option>
            </select>
          </div>

          {/* Filter Cliente */}
          <div className="relative">
            <select
              value={clienteFiltro}
              onChange={(e) => {
                setClienteFiltro(e.target.value);
                setPaginaAtual(1);
              }}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="TODOS">Todos os Clientes</option>
              {listaClientes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Prioridade */}
          <div className="relative">
            <select
              value={prioridadeFiltro}
              onChange={(e) => {
                setPrioridadeFiltro(e.target.value);
                setPaginaAtual(1);
              }}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="TODOS">Todas as Prioridades</option>
              <option value="URGENTE">URGENTE</option>
              <option value="ALTA">ALTA</option>
              <option value="MÉDIA">MÉDIA</option>
              <option value="BAIXA">BAIXA</option>
            </select>
          </div>
        </div>
      </div>

      {/* Production Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wide">
                <th
                  onClick={() => alternarOrdenacao('opNumber')}
                  className="p-3 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>OP</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-3">Pedido</th>
                <th
                  onClick={() => alternarOrdenacao('cliente')}
                  className="p-3 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>Cliente</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-3">Produto / Modelo</th>
                <th className="p-3">Quantidade</th>
                <th className="p-3 text-center">Status</th>
                <th
                  onClick={() => alternarOrdenacao('eficiencia')}
                  className="p-3 text-center cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Eficiência</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => alternarOrdenacao('dataProgramada')}
                  className="p-3 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>Data Prog.</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {opsPaginadas.length > 0 ? (
                opsPaginadas.map((op) => {
                  const perc = Math.round(
                    (op.quantidadeProduzida / op.quantidade) * 100
                  );

                  return (
                    <tr
                      key={op.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors text-slate-700 dark:text-slate-300"
                    >
                      <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {op.opNumber}
                      </td>
                      <td className="p-3 font-mono text-slate-500 dark:text-slate-400">{op.pedidoNumber}</td>
                      <td className="p-3 font-semibold text-slate-900 dark:text-slate-100 max-w-[180px] truncate">
                        {op.cliente}
                      </td>
                      <td className="p-3 max-w-[220px]">
                        <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
                          {op.produto}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">{op.modelo}</p>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {op.quantidadeProduzida} / {op.quantidade}
                        </div>
                        <div className="w-24 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full rounded-full ${
                              perc >= 100 ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${Math.min(100, perc)}%` }}
                          />
                        </div>
                      </td>
                      <td className="p-3 text-center">{renderStatusBadge(op.status)}</td>
                      <td className="p-3 text-center font-bold text-slate-800 dark:text-slate-200">
                        {op.eficiencia}%
                      </td>
                      <td className="p-3 font-mono text-slate-500 dark:text-slate-400">
                        {op.dataProgramada}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => abrirModalEditar(op)}
                          className="p-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white dark:bg-slate-800 dark:hover:bg-blue-600 text-slate-600 dark:text-slate-300 rounded-lg transition-colors"
                          title="Atualizar Status / OP"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    Nenhuma Ordem de Produção encontrada com os filtros atuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            Mostrando {opsPaginadas.length} de {opsOrdenadas.length} OPs
          </span>

          <div className="flex items-center space-x-2">
            <button
              disabled={paginaAtual === 1}
              onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
              className="px-3 py-1 bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 rounded-lg transition-colors"
            >
              Anterior
            </button>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              Página {paginaAtual} de {totalPaginas}
            </span>
            <button
              disabled={paginaAtual === totalPaginas}
              onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg transition-colors"
            >
              Próxima
            </button>
          </div>
        </div>
      </div>

      {/* Status Advance & Edit Modal */}
      {opModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-amber-400">
                  Atualizar Ordem de Produção {opModal.opNumber}
                </h3>
                <p className="text-xs text-slate-400">{opModal.cliente}</p>
              </div>
              <button
                onClick={() => setOpModal(null)}
                className="text-slate-400 hover:text-slate-100 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  Status Atual / Novo Status:
                </label>
                <select
                  value={modalNovoStatus}
                  onChange={(e) => setModalNovoStatus(e.target.value as StatusProducao)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="AGUARDANDO">AGUARDANDO</option>
                  <option value="CORTE">CORTE (Corte do Tecido/Ráfia)</option>
                  <option value="PREPARAÇÃO">PREPARAÇÃO (Montagem Alças/Dobras)</option>
                  <option value="CONFECÇÃO">CONFECÇÃO (Costura Final)</option>
                  <option value="FINALIZADO">FINALIZADO (Pronto/Expedição)</option>
                  <option value="ATRASADO">ATRASADO (Alerta de Prazo)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  Adicionar Quantidade Produzida Neste Apontamento:
                </label>
                <input
                  type="number"
                  value={modalQtdAdicional}
                  onChange={(e) => setModalQtdAdicional(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500"
                  placeholder="Ex: 50"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Atualmente produzido: {opModal.quantidadeProduzida} de {opModal.quantidade} unidades.
                </p>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  Observações PCP / Turno:
                </label>
                <textarea
                  rows={3}
                  value={modalObservacoes}
                  onChange={(e) => setModalObservacoes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500"
                  placeholder="Insira notas do operador ou observações do PCP..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setOpModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={salvarEdicaoOp}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-md"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
