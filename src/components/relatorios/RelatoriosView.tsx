import {
  AlertTriangle,
  BarChart2,
  Box,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Printer,
  RotateCcw,
  Search,
  TrendingUp,
  User,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { excelService } from '../../services/excelService';
import { pdfService } from '../../services/pdfService';
import { storageService } from '../../services/storageService';
import { OrdemProducao } from '../../types';

export const RelatoriosView: React.FC = () => {
  const [tipoRelatorio, setTipoRelatorio] = useState<
    'DIARIO' | 'MENSAL' | 'CLIENTES' | 'PRODUTOS' | 'EFICIENCIA'
  >('DIARIO');

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [clienteFiltro, setClienteFiltro] = useState('TODOS');
  const [produtoFiltro, setProdutoFiltro] = useState('TODOS');
  const [statusFiltro, setStatusFiltro] = useState('TODOS');
  const [eficienciaFiltro, setEficienciaFiltro] = useState('TODOS');
  const [clienteExpandido, setClienteExpandido] = useState<string | null>(null);

  const kpis = storageService.calcularKpis();
  const ops = storageService.getOps();

  // Lista única de clientes e produtos para os selects de filtro
  const listaClientesUnicos = useMemo(() => {
    const set = new Set<string>();
    ops.forEach((op) => {
      if (op.cliente) set.add(op.cliente.trim());
    });
    return Array.from(set).sort();
  }, [ops]);

  const listaProdutosUnicos = useMemo(() => {
    const set = new Set<string>();
    ops.forEach((op) => {
      if (op.produto) set.add(op.produto.trim());
    });
    return Array.from(set).sort();
  }, [ops]);

  // Aplicação de Todos os Filtros
  const opsFiltradas = useMemo(() => {
    return ops.filter((op) => {
      // 1. Busca por texto livre (OP, Pedido, Cliente, Produto)
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const opNum = (op.opNumber || '').toLowerCase();
        const pedNum = (op.pedidoNumber || '').toLowerCase();
        const cli = (op.cliente || '').toLowerCase();
        const prod = (op.produto || '').toLowerCase();
        if (
          !opNum.includes(term) &&
          !pedNum.includes(term) &&
          !cli.includes(term) &&
          !prod.includes(term)
        ) {
          return false;
        }
      }

      // 2. Filtro de Cliente
      if (clienteFiltro !== 'TODOS' && op.cliente !== clienteFiltro) {
        return false;
      }

      // 3. Filtro de Produto
      if (produtoFiltro !== 'TODOS' && op.produto !== produtoFiltro) {
        return false;
      }

      // 4. Filtro de Status
      if (statusFiltro !== 'TODOS' && op.status !== statusFiltro) {
        return false;
      }

      // 5. Filtro de Faixa de Eficiência
      if (eficienciaFiltro === 'ALTA' && op.eficiencia < 90) return false;
      if (
        eficienciaFiltro === 'MEDIA' &&
        (op.eficiencia < 75 || op.eficiencia >= 90)
      ) {
        return false;
      }
      if (eficienciaFiltro === 'BAIXA' && op.eficiencia >= 75) return false;

      // 6. Data Início (compara com dataProgramada ou dataEntrega)
      if (dataInicio) {
        const dataRef = op.dataProgramada || op.dataEntrega;
        if (dataRef && dataRef < dataInicio) return false;
      }

      // 7. Data Fim
      if (dataFim) {
        const dataRef = op.dataProgramada || op.dataEntrega;
        if (dataRef && dataRef > dataFim) return false;
      }

      return true;
    });
  }, [
    ops,
    searchTerm,
    clienteFiltro,
    produtoFiltro,
    statusFiltro,
    eficienciaFiltro,
    dataInicio,
    dataFim,
  ]);

  // Agrupamentos calculados dinamicamente com base nas OPs filtradas
  const agrupamentoCliente = useMemo(() => {
    const map = new Map<
      string,
      {
        cliente: string;
        qtdOps: number;
        totalProduzido: number;
        totalMeta: number;
        somaEficiencia: number;
        ops: OrdemProducao[];
      }
    >();

    opsFiltradas.forEach((op) => {
      const cli = op.cliente || 'Cliente Indefinido';
      if (!map.has(cli)) {
        map.set(cli, {
          cliente: cli,
          qtdOps: 0,
          totalProduzido: 0,
          totalMeta: 0,
          somaEficiencia: 0,
          ops: [],
        });
      }
      const item = map.get(cli)!;
      item.qtdOps += 1;
      item.totalProduzido += op.quantidadeProduzida || 0;
      item.totalMeta += op.quantidade || 0;
      item.somaEficiencia += op.eficiencia || 0;
      item.ops.push(op);
    });

    return Array.from(map.values()).map((c) => ({
      ...c,
      mediaEficiencia: c.qtdOps > 0 ? Math.round(c.somaEficiencia / c.qtdOps) : 0,
      percentualMeta:
        c.totalMeta > 0 ? Math.round((c.totalProduzido / c.totalMeta) * 100) : 0,
    }));
  }, [opsFiltradas]);

  const agrupamentoProduto = useMemo(() => {
    const map = new Map<
      string,
      {
        produto: string;
        qtdOps: number;
        totalProduzido: number;
        totalMeta: number;
        somaEficiencia: number;
        ops: OrdemProducao[];
      }
    >();

    opsFiltradas.forEach((op) => {
      const prod = op.produto || 'Produto Padrão';
      if (!map.has(prod)) {
        map.set(prod, {
          produto: prod,
          qtdOps: 0,
          totalProduzido: 0,
          totalMeta: 0,
          somaEficiencia: 0,
          ops: [],
        });
      }
      const item = map.get(prod)!;
      item.qtdOps += 1;
      item.totalProduzido += op.quantidadeProduzida || 0;
      item.totalMeta += op.quantidade || 0;
      item.somaEficiencia += op.eficiencia || 0;
      item.ops.push(op);
    });

    return Array.from(map.values()).map((p) => ({
      ...p,
      mediaEficiencia: p.qtdOps > 0 ? Math.round(p.somaEficiencia / p.qtdOps) : 0,
    }));
  }, [opsFiltradas]);

  const agrupamentoMensal = useMemo(() => {
    const map = new Map<
      string,
      {
        mesAno: string;
        qtdOps: number;
        totalProduzido: number;
        totalMeta: number;
        somaEficiencia: number;
      }
    >();

    opsFiltradas.forEach((op) => {
      const dataRef = op.dataProgramada || op.dataEntrega || '2026-07-01';
      const mesAno = dataRef.substring(0, 7); // YYYY-MM
      if (!map.has(mesAno)) {
        map.set(mesAno, {
          mesAno,
          qtdOps: 0,
          totalProduzido: 0,
          totalMeta: 0,
          somaEficiencia: 0,
        });
      }
      const item = map.get(mesAno)!;
      item.qtdOps += 1;
      item.totalProduzido += op.quantidadeProduzida || 0;
      item.totalMeta += op.quantidade || 0;
      item.somaEficiencia += op.eficiencia || 0;
    });

    return Array.from(map.values())
      .map((m) => ({
        ...m,
        mediaEficiencia:
          m.qtdOps > 0 ? Math.round(m.somaEficiencia / m.qtdOps) : 0,
      }))
      .sort((a, b) => b.mesAno.localeCompare(a.mesAno));
  }, [opsFiltradas]);

  const agrupamentoDiario = useMemo(() => {
    const map = new Map<
      string,
      {
        data: string;
        qtdOps: number;
        totalProduzido: number;
        totalMeta: number;
        somaEficiencia: number;
      }
    >();

    opsFiltradas.forEach((op) => {
      const dataRef = op.dataProgramada || op.dataEntrega || 'Sem Data';
      if (!map.has(dataRef)) {
        map.set(dataRef, {
          data: dataRef,
          qtdOps: 0,
          totalProduzido: 0,
          totalMeta: 0,
          somaEficiencia: 0,
        });
      }
      const item = map.get(dataRef)!;
      item.qtdOps += 1;
      item.totalProduzido += op.quantidadeProduzida || 0;
      item.totalMeta += op.quantidade || 0;
      item.somaEficiencia += op.eficiencia || 0;
    });

    return Array.from(map.values())
      .map((d) => ({
        ...d,
        mediaEficiencia:
          d.qtdOps > 0 ? Math.round(d.somaEficiencia / d.qtdOps) : 0,
      }))
      .sort((a, b) => b.data.localeCompare(a.data));
  }, [opsFiltradas]);

  // Resumo de KPIs das OPs filtradas
  const totalBagsProduzidosFiltrados = useMemo(
    () => opsFiltradas.reduce((acc, op) => acc + (op.quantidadeProduzida || 0), 0),
    [opsFiltradas]
  );

  const totalBagsMetaFiltrados = useMemo(
    () => opsFiltradas.reduce((acc, op) => acc + (op.quantidade || 0), 0),
    [opsFiltradas]
  );

  const mediaEficienciaFiltrada = useMemo(() => {
    if (opsFiltradas.length === 0) return 0;
    const soma = opsFiltradas.reduce((acc, op) => acc + (op.eficiencia || 0), 0);
    return Math.round(soma / opsFiltradas.length);
  }, [opsFiltradas]);

  const limparFiltros = () => {
    setSearchTerm('');
    setDataInicio('');
    setDataFim('');
    setClienteFiltro('TODOS');
    setProdutoFiltro('TODOS');
    setStatusFiltro('TODOS');
    setEficienciaFiltro('TODOS');
  };

  const handleExportPDF = () => {
    pdfService.gerarRelatorioProducaoPDF(
      `Relatório Gerencial (${tipoRelatorio}) - ${opsFiltradas.length} Registros`,
      `Filtros aplicados: Cliente (${clienteFiltro}), Produto (${produtoFiltro}), Status (${statusFiltro})`,
      opsFiltradas,
      {
        ...kpis,
        pedidosProgramados: opsFiltradas.length,
        eficienciaGlobal: mediaEficienciaFiltrada,
      }
    );
  };

  const handleExportExcel = () => {
    excelService.exportarOpsParaExcel(
      opsFiltradas,
      `Relatorio_Virtude_${tipoRelatorio}_${Date.now()}.xlsx`
    );
  };

  const temFiltroAtivo =
    Boolean(searchTerm) ||
    Boolean(dataInicio) ||
    Boolean(dataFim) ||
    clienteFiltro !== 'TODOS' ||
    produtoFiltro !== 'TODOS' ||
    statusFiltro !== 'TODOS' ||
    eficienciaFiltro !== 'TODOS';

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
            Gere demonstrativos detalhados com filtros avançados por dia, mês, cliente, produto e eficiência OEE.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold transition-colors"
            title="Exportar dados filtrados para Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar Excel ({opsFiltradas.length})</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-md"
            title="Gerar relatório impresso em PDF"
          >
            <Download className="w-4 h-4" />
            <span>Baixar PDF</span>
          </button>

          <button
            onClick={() => window.print()}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-colors"
            title="Imprimir visualização"
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
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              tipoRelatorio === tab.id
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
            }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Interactive Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-md space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wide">
            <Filter className="w-4 h-4" />
            <span>Filtros do Relatório ({opsFiltradas.length} de {ops.length} OPs)</span>
          </div>

          {temFiltroAtivo && (
            <button
              onClick={limparFiltros}
              className="flex items-center space-x-1 text-xs text-amber-400 hover:text-amber-300 font-semibold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Limpar Filtros</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Busca Texto */}
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">
              Busca por Texto:
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nº OP, Pedido, Cliente, Produto..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>
          </div>

          {/* Filtro por Cliente */}
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">
              Cliente:
            </label>
            <select
              value={clienteFiltro}
              onChange={(e) => setClienteFiltro(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
            >
              <option value="TODOS">Todos os Clientes ({listaClientesUnicos.length})</option>
              {listaClientesUnicos.map((cli) => (
                <option key={cli} value={cli}>
                  {cli}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Produto */}
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">
              Produto:
            </label>
            <select
              value={produtoFiltro}
              onChange={(e) => setProdutoFiltro(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
            >
              <option value="TODOS">Todos os Produtos ({listaProdutosUnicos.length})</option>
              {listaProdutosUnicos.map((prod) => (
                <option key={prod} value={prod}>
                  {prod}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Status */}
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">
              Status da OP:
            </label>
            <select
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="EM_ANDAMENTO">Em Andamento</option>
              <option value="FINALIZADO">Finalizado</option>
              <option value="PENDENTE">Pendente</option>
              <option value="ATRASADO">Atrasado</option>
            </select>
          </div>

          {/* Data Início */}
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">
              Data Início:
            </label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
            />
          </div>

          {/* Data Fim */}
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">
              Data Fim:
            </label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
            />
          </div>

          {/* Filtro por Eficiência */}
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">
              Eficiência (OEE):
            </label>
            <select
              value={eficienciaFiltro}
              onChange={(e) => setEficienciaFiltro(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
            >
              <option value="TODOS">Todas as Faixas</option>
              <option value="ALTA">Alta (≥ 90%)</option>
              <option value="MEDIA">Média (75% a 89%)</option>
              <option value="BAIXA">Baixa (&lt; 75%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards Summary for Filtered View */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-md">
          <span className="text-[11px] font-semibold text-slate-400 block uppercase">
            OPs no Filtro
          </span>
          <span className="text-2xl font-bold font-mono text-slate-100 mt-1 block">
            {opsFiltradas.length}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            de {ops.length} cadastradas
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-md">
          <span className="text-[11px] font-semibold text-slate-400 block uppercase">
            Big Bags Produzidos
          </span>
          <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">
            {totalBagsProduzidosFiltrados.toLocaleString('pt-BR')}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Meta: {totalBagsMetaFiltrados.toLocaleString('pt-BR')} un
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-md">
          <span className="text-[11px] font-semibold text-slate-400 block uppercase">
            Eficiência Média
          </span>
          <span className="text-2xl font-bold font-mono text-amber-400 mt-1 block">
            {mediaEficienciaFiltrada}%
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            OEE Calculado do período
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-md">
          <span className="text-[11px] font-semibold text-slate-400 block uppercase">
            Agrupamentos
          </span>
          <span className="text-2xl font-bold font-mono text-blue-400 mt-1 block">
            {tipoRelatorio === 'CLIENTES'
              ? agrupamentoCliente.length
              : tipoRelatorio === 'PRODUTOS'
              ? agrupamentoProduto.length
              : tipoRelatorio === 'MENSAL'
              ? agrupamentoMensal.length
              : agrupamentoDiario.length}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block uppercase">
            {tipoRelatorio}
          </span>
        </div>
      </div>

      {/* View-Specific Content Panels */}

      {/* 1. VISÃO POR CLIENTE */}
      {tipoRelatorio === 'CLIENTES' && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-3">
            <User className="w-4 h-4 text-amber-400" />
            <span>Relatório Consolidado de Produção por Cliente</span>
          </h3>

          {agrupamentoCliente.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-4 text-center">
              Nenhuma OP encontrada com os filtros selecionados.
            </p>
          ) : (
            <div className="space-y-3">
              {agrupamentoCliente.map((item) => (
                <div
                  key={item.cliente}
                  className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden transition-all"
                >
                  <div
                    onClick={() =>
                      setClienteExpandido(
                        clienteExpandido === item.cliente ? null : item.cliente
                      )
                    }
                    className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer hover:bg-slate-800/50"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                        <span>{item.cliente}</span>
                        <span className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full font-mono font-semibold">
                          {item.qtdOps} {item.qtdOps === 1 ? 'OP' : 'OPs'}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Volume Total: {item.totalProduzido.toLocaleString('pt-BR')} / {item.totalMeta.toLocaleString('pt-BR')} Big Bags
                      </p>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-semibold">
                          Conclusão Meta
                        </span>
                        <span className="text-xs font-bold font-mono text-emerald-400">
                          {item.percentualMeta}%
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-semibold">
                          Eficiência Média
                        </span>
                        <span className="text-xs font-bold font-mono text-amber-400">
                          {item.mediaEficiencia}%
                        </span>
                      </div>

                      {clienteExpandido === item.cliente ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expandable OPs list for client */}
                  {clienteExpandido === item.cliente && (
                    <div className="border-t border-slate-800 p-3 bg-slate-900/60 overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="text-[10px] font-bold text-slate-400 uppercase border-b border-slate-800 pb-1">
                            <th className="p-2">OP</th>
                            <th className="p-2">Pedido</th>
                            <th className="p-2">Produto</th>
                            <th className="p-2">Qtd Produzida / Meta</th>
                            <th className="p-2">Status</th>
                            <th className="p-2">Eficiência</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40 text-slate-300">
                          {item.ops.map((op) => (
                            <tr key={op.id}>
                              <td className="p-2 font-mono font-bold text-amber-400">{op.opNumber}</td>
                              <td className="p-2 font-mono">{op.pedidoNumber}</td>
                              <td className="p-2">{op.produto}</td>
                              <td className="p-2 font-mono">{op.quantidadeProduzida} / {op.quantidade}</td>
                              <td className="p-2 font-semibold text-slate-200">{op.status}</td>
                              <td className="p-2 font-mono text-amber-400 font-bold">{op.eficiencia}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. VISÃO POR PRODUTO */}
      {tipoRelatorio === 'PRODUTOS' && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Box className="w-4 h-4 text-amber-400" />
            <span>Relatório Consolidado de Produção por Modelo de Produto</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="p-3">Produto / Modelo</th>
                  <th className="p-3 text-center">Qtd OPs</th>
                  <th className="p-3">Big Bags Produzidos</th>
                  <th className="p-3">Meta Programada</th>
                  <th className="p-3 text-center">Eficiência Média</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {agrupamentoProduto.map((item) => (
                  <tr key={item.produto} className="hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-slate-100">{item.produto}</td>
                    <td className="p-3 text-center font-mono font-bold text-amber-400">{item.qtdOps}</td>
                    <td className="p-3 font-mono text-emerald-400 font-bold">{item.totalProduzido.toLocaleString('pt-BR')} un</td>
                    <td className="p-3 font-mono text-slate-400">{item.totalMeta.toLocaleString('pt-BR')} un</td>
                    <td className="p-3 text-center font-mono font-bold text-amber-400">{item.mediaEficiencia}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. VISÃO MENSAL */}
      {tipoRelatorio === 'MENSAL' && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>Demonstrativo de Desempenho Mensal</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="p-3">Mês / Ano</th>
                  <th className="p-3 text-center">OPs Processadas</th>
                  <th className="p-3">Big Bags Produzidos</th>
                  <th className="p-3">Meta Programada</th>
                  <th className="p-3 text-center">Eficiência Média</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {agrupamentoMensal.map((item) => (
                  <tr key={item.mesAno} className="hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-amber-400">{item.mesAno}</td>
                    <td className="p-3 text-center font-mono">{item.qtdOps}</td>
                    <td className="p-3 font-mono text-emerald-400 font-bold">{item.totalProduzido.toLocaleString('pt-BR')} un</td>
                    <td className="p-3 font-mono text-slate-400">{item.totalMeta.toLocaleString('pt-BR')} un</td>
                    <td className="p-3 text-center font-mono font-bold text-amber-400">{item.mediaEficiencia}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. VISÃO DIÁRIA */}
      {tipoRelatorio === 'DIARIO' && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-3">
            <BarChart2 className="w-4 h-4 text-amber-400" />
            <span>Relatório de Produção Diária</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="p-3">Data</th>
                  <th className="p-3 text-center">Qtd OPs</th>
                  <th className="p-3">Total Produzido</th>
                  <th className="p-3">Meta Diária</th>
                  <th className="p-3 text-center">Eficiência do Dia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {agrupamentoDiario.map((item) => (
                  <tr key={item.data} className="hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-slate-100">{item.data}</td>
                    <td className="p-3 text-center font-mono">{item.qtdOps}</td>
                    <td className="p-3 font-mono text-emerald-400 font-bold">{item.totalProduzido.toLocaleString('pt-BR')} un</td>
                    <td className="p-3 font-mono text-slate-400">{item.totalMeta.toLocaleString('pt-BR')} un</td>
                    <td className="p-3 text-center font-mono font-bold text-amber-400">{item.mediaEficiencia}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. VISÃO EFICIÊNCIA / OEE */}
      {tipoRelatorio === 'EFICIENCIA' && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-3">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span>Análise de Eficiência OEE por Ordem de Produção</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="p-3">OP</th>
                  <th className="p-3">Cliente</th>
                  <th className="p-3">Produto</th>
                  <th className="p-3 text-center">Eficiência OEE</th>
                  <th className="p-3">Classificação</th>
                  <th className="p-3">Progresso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {opsFiltradas
                  .slice()
                  .sort((a, b) => b.eficiencia - a.eficiencia)
                  .map((op) => {
                    const isAlta = op.eficiencia >= 90;
                    const isMedia = op.eficiencia >= 75 && op.eficiencia < 90;
                    return (
                      <tr key={op.id} className="hover:bg-slate-800/40">
                        <td className="p-3 font-mono font-bold text-amber-400">{op.opNumber}</td>
                        <td className="p-3 font-semibold text-slate-100">{op.cliente}</td>
                        <td className="p-3 text-slate-300">{op.produto}</td>
                        <td className="p-3 text-center font-mono font-bold text-sm">
                          <span
                            className={
                              isAlta
                                ? 'text-emerald-400'
                                : isMedia
                                ? 'text-amber-400'
                                : 'text-red-400'
                            }
                          >
                            {op.eficiencia}%
                          </span>
                        </td>
                        <td className="p-3">
                          {isAlta ? (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Alta Performance</span>
                            </span>
                          ) : isMedia ? (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              <span>Regular</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Gargalo / Baixa</span>
                            </span>
                          )}
                        </td>
                        <td className="p-3 w-36">
                          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                            <div
                              className={`h-full transition-all ${
                                isAlta
                                  ? 'bg-emerald-500'
                                  : isMedia
                                  ? 'bg-amber-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(op.eficiencia, 100)}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detailed List Preview Table for Filtered Records */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Listagem Detalhada de Ordens Filtradas ({opsFiltradas.length})</span>
          </h3>
          <span className="text-xs text-amber-400 font-mono font-semibold">
            {opsFiltradas.length} Registros Exibidos
          </span>
        </div>

        {opsFiltradas.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-6 text-center">
            Nenhuma Ordem de Produção coincide com os filtros selecionados.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="p-3">OP</th>
                  <th className="p-3">Pedido</th>
                  <th className="p-3">Cliente</th>
                  <th className="p-3">Produto</th>
                  <th className="p-3">Qtd Produzida / Meta</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Eficiência</th>
                  <th className="p-3">Data Programada / Entrega</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {opsFiltradas.map((op) => (
                  <tr key={op.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-amber-400">{op.opNumber}</td>
                    <td className="p-3 font-mono text-slate-400">{op.pedidoNumber || 'PED-VAR'}</td>
                    <td className="p-3 font-semibold text-slate-100">{op.cliente}</td>
                    <td className="p-3 text-slate-300">{op.produto}</td>
                    <td className="p-3 font-mono">
                      {op.quantidadeProduzida} / {op.quantidade}
                    </td>
                    <td className="p-3 text-center font-bold text-slate-200">{op.status}</td>
                    <td className="p-3 text-center font-bold text-amber-400">{op.eficiencia}%</td>
                    <td className="p-3 font-mono text-slate-400">
                      {op.dataProgramada || op.dataEntrega || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

