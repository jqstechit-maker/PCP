import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  Package,
  Sparkles,
  Tag,
  Wrench,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { storageService } from '../../services/storageService';
import { DadosPedidoManual, Pedido, PrioridadeOp, StatusProducao } from '../../types';

interface ModalInserirPedidoManualProps {
  aoFechar: () => void;
  aoSalvarSucesso?: () => void;
  pedidoParaEditar?: Pedido | null;
}

export const ModalInserirPedidoManual: React.FC<ModalInserirPedidoManualProps> = ({
  aoFechar,
  aoSalvarSucesso,
  pedidoParaEditar,
}) => {
  const modoEdicao = !!pedidoParaEditar;
  const clientesExistentes = storageService.getClientes();
  const produtosExistentes = storageService.getProdutos();
  const opsExistentes = storageService.getOps();

  // Se estiver editando, busca OP vinculada como referência de dados
  const opVinculada = modoEdicao && pedidoParaEditar?.ops?.[0]
    ? opsExistentes.find((o) => o.opNumber === pedidoParaEditar.ops[0])
    : undefined;

  const hojeStr = new Date().toISOString().substring(0, 10);

  // Sugestão de números sequenciais caso seja inserção nova
  const sugerirNumeroPedido = () => {
    const pedidos = storageService.getPedidos();
    const numeros = pedidos
      .map((p) => {
        const m = p.pedidoNumber.match(/\d+/);
        return m ? parseInt(m[0], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const max = numeros.length > 0 ? Math.max(...numeros) : 1000;
    return `PED-${max + 1}`;
  };

  const sugerirNumeroOp = () => {
    const anoAtual = new Date().getFullYear();
    const numeros = opsExistentes
      .map((o) => {
        const m = o.opNumber.match(/\d+$/);
        return m ? parseInt(m[0], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const max = numeros.length > 0 ? Math.max(...numeros) : 0;
    const prox = String(max + 1).padStart(3, '0');
    return `OP-${anoAtual}-${prox}`;
  };

  // Estados do Formulário (Baseados nos campos da planilha de importação)
  const [pedidoNumber, setPedidoNumber] = useState<string>(
    pedidoParaEditar?.pedidoNumber || sugerirNumeroPedido()
  );
  const [opNumber, setOpNumber] = useState<string>(
    opVinculada?.opNumber || pedidoParaEditar?.ops?.[0] || sugerirNumeroOp()
  );
  const [empresaId, setEmpresaId] = useState<string>(opVinculada?.empresaId || 'V');
  const [cliente, setCliente] = useState<string>(pedidoParaEditar?.cliente || '');
  const [desenho, setDesenho] = useState<string>(opVinculada?.desenho || '');
  const [produto, setProduto] = useState<string>(
    opVinculada?.produto || 'Big Bag Travado 90x90x120cm'
  );
  const [modelo, setModelo] = useState<string>(
    opVinculada?.modelo || 'Saia Superior / Funil Inferior'
  );
  const [dimensoes, setDimensoes] = useState<string>(
    opVinculada?.dimensoes || '90 x 90 x 120 cm'
  );
  const [quantidade, setQuantidade] = useState<number>(
    pedidoParaEditar?.totalItens || opVinculada?.quantidade || 250
  );
  const [quantidadeProduzida, setQuantidadeProduzida] = useState<number>(
    pedidoParaEditar?.totalProduzido || opVinculada?.quantidadeProduzida || 0
  );
  const [dataPedido, setDataPedido] = useState<string>(
    pedidoParaEditar?.dataPedido || opVinculada?.dataPedido || hojeStr
  );
  const [dataProgramada, setDataProgramada] = useState<string>(
    opVinculada?.dataProgramada || hojeStr
  );
  const [dataEntrega, setDataEntrega] = useState<string>(
    pedidoParaEditar?.dataPrevisaoEntrega || opVinculada?.dataEntrega || hojeStr
  );
  const [prioridade, setPrioridade] = useState<PrioridadeOp>(
    opVinculada?.prioridade || 'MÉDIA'
  );
  const [statusOp, setStatusOp] = useState<StatusProducao>(
    opVinculada?.status || 'AGUARDANDO'
  );
  const [statusPedido, setStatusPedido] = useState<Pedido['status']>(
    pedidoParaEditar?.status || 'PENDENTE'
  );
  const [lote, setLote] = useState<string>(
    opVinculada?.lote || `LT-${new Date().getFullYear().toString().substring(2)}${String(new Date().getMonth() + 1).padStart(2, '0')}`
  );
  const [capacidadeCargaKg, setCapacidadeCargaKg] = useState<number>(
    opVinculada?.capacidadeCargaKg || 1000
  );
  const [tecidoGrm, setTecidoGrm] = useState<number>(opVinculada?.tecidoGrm || 160);
  const [eficiencia, setEficiencia] = useState<number>(opVinculada?.eficiencia || 95);
  const [observacoes, setObservacoes] = useState<string>(
    opVinculada?.observacoes || 'Cadastro manual de pedido e ordem de produção'
  );

  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [salvando, setSalvando] = useState<boolean>(false);

  // Modelos pré-definidos de Big Bag comuns na indústria
  const modelosPredefinidos = [
    'Saia Superior / Funil Inferior',
    'Saia Superior / Fundo Fechado',
    'Válvula de Enchimento / Funil Inferior',
    'Válvula de Enchimento / Fundo Fechado',
    'Boca Aberta / Fundo Fechado Plano',
    'Boca Aberta / Funil de Descarga',
  ];

  // Ao selecionar um produto existente, auto-preencher dimensões e modelo se aplicável
  const handleSelecionarProduto = (prodNome: string) => {
    setProduto(prodNome);
    const prod = produtosExistentes.find(
      (p) => p.nome.toLowerCase() === prodNome.toLowerCase()
    );
    if (prod) {
      if (prod.modelo) setModelo(prod.modelo);
      if (prod.dimensoes) setDimensoes(prod.dimensoes);
      if (prod.capacidadeKg) setCapacidadeCargaKg(prod.capacidadeKg);
      if (prod.gramaturaTecido) setTecidoGrm(prod.gramaturaTecido);
    }
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    // Validações básicas
    if (!pedidoNumber.trim()) {
      setErro('O Número do Pedido é obrigatório.');
      return;
    }
    if (!opNumber.trim()) {
      setErro('O Número da O.P é obrigatório.');
      return;
    }
    if (!cliente.trim()) {
      setErro('O Nome do Cliente / Razão Social é obrigatório.');
      return;
    }
    if (quantidade <= 0) {
      setErro('A Quantidade de Big Bags deve ser maior que zero.');
      return;
    }

    try {
      setSalvando(true);

      const dados: DadosPedidoManual = {
        pedidoNumber: pedidoNumber.trim().toUpperCase(),
        opNumber: opNumber.trim().toUpperCase(),
        empresaId: empresaId.toUpperCase(),
        cliente: cliente.trim(),
        desenho: desenho.trim(),
        produto: produto.trim(),
        modelo: modelo.trim(),
        dimensoes: dimensoes.trim(),
        quantidade: Number(quantidade),
        quantidadeProduzida: Number(quantidadeProduzida),
        dataPedido,
        dataProgramada,
        dataConfec: dataEntrega,
        dataEntrega,
        prioridade,
        status: statusOp,
        statusPedido,
        lote: lote.trim(),
        eficiencia: Number(eficiencia),
        capacidadeCargaKg: Number(capacidadeCargaKg),
        tecidoGrm: Number(tecidoGrm),
        observacoes: observacoes.trim(),
      };

      if (modoEdicao && pedidoParaEditar) {
        // Atualização de pedido existente
        const resAtualizacao = storageService.atualizarPedidoManual(
          pedidoParaEditar.id,
          {
            cliente: dados.cliente,
            dataPedido: dados.dataPedido,
            dataPrevisaoEntrega: dados.dataEntrega,
            status: dados.statusPedido,
            totalItens: dados.quantidade,
            observacoes: dados.observacoes,
          }
        );

        if (!resAtualizacao.sucesso) {
          setErro(resAtualizacao.mensagem);
          setSalvando(false);
          return;
        }

        // Se também salvou os dados da OP
        storageService.adicionarPedidoManual(dados);
      } else {
        // Inserção nova
        const res = storageService.adicionarPedidoManual(dados);
        if (!res.sucesso) {
          setErro(res.mensagem);
          setSalvando(false);
          return;
        }
      }

      setSucesso(
        modoEdicao
          ? `Pedido #${pedidoNumber} atualizado com sucesso!`
          : `Pedido #${pedidoNumber} inserido com sucesso no sistema!`
      );

      setTimeout(() => {
        if (aoSalvarSucesso) aoSalvarSucesso();
        aoFechar();
      }, 1000);
    } catch (err: any) {
      setErro(`Falha ao salvar: ${err.message || 'Erro inesperado'}`);
      setSalvando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto"
      onClick={aoFechar}
    >
      <div
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-100">
                  {modoEdicao ? 'Editar Pedido de Venda' : 'Inserir Pedido Manualmente'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  PADRÃO PCP
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Utiliza como base os campos e especificações da planilha de importação do PCP.
              </p>
            </div>
          </div>

          <button
            onClick={aoFechar}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Formulário */}
        <form onSubmit={handleSalvar} className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Mensagens de Erro ou Sucesso */}
          {erro && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start space-x-3 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{erro}</span>
            </div>
          )}

          {sucesso && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start space-x-3 text-xs text-emerald-400">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{sucesso}</span>
            </div>
          )}

          {/* SEÇÃO 1: Identificação Comercial & Fabril */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-1.5">
              <Package className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                1. Identificação Comercial & Fabril
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Nº do Pedido <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  value={pedidoNumber}
                  onChange={(e) => setPedidoNumber(e.target.value.toUpperCase())}
                  placeholder="Ex: PED-1050"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500 transition-colors uppercase"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Nº da O.P (Produção) <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  value={opNumber}
                  onChange={(e) => setOpNumber(e.target.value.toUpperCase())}
                  placeholder="Ex: OP-2026-095"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500 transition-colors uppercase"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Empresa (Sigla L / V)
                </label>
                <select
                  value={empresaId}
                  onChange={(e) => setEmpresaId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                >
                  <option value="V">V - VIRTUDE BIG BAGS</option>
                  <option value="L">L - LAELSON</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Cliente / Razão Social <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  list="lista-clientes-sugestao"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  placeholder="Nome do cliente ou comprador"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                />
                <datalist id="lista-clientes-sugestao">
                  {clientesExistentes.map((c) => (
                    <option key={c.id} value={c.nome} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Código do Desenho Técnico (Opcional)
                </label>
                <input
                  type="text"
                  value={desenho}
                  onChange={(e) => setDesenho(e.target.value.toUpperCase())}
                  placeholder="Ex: DES-402, DES-STD"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500 transition-colors uppercase"
                />
              </div>
            </div>
          </div>

          {/* SEÇÃO 2: Especificações Técnicas do Big Bag */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-1.5">
              <Tag className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                2. Especificações do Produto & Big Bag
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Produto / Descrição do Big Bag <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  list="lista-produtos-sugestao"
                  value={produto}
                  onChange={(e) => handleSelecionarProduto(e.target.value)}
                  placeholder="Ex: Big Bag Travado 90x90x120cm"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                />
                <datalist id="lista-produtos-sugestao">
                  {produtosExistentes.map((p) => (
                    <option key={p.id} value={p.nome} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Modelo / Válvulas / Fundo
                </label>
                <input
                  type="text"
                  list="lista-modelos-sugestao"
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  placeholder="Ex: Saia Superior / Funil Inferior"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                />
                <datalist id="lista-modelos-sugestao">
                  {modelosPredefinidos.map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Dimensões (cm)
                </label>
                <input
                  type="text"
                  value={dimensoes}
                  onChange={(e) => setDimensoes(e.target.value)}
                  placeholder="90 x 90 x 120 cm"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Capacidade (kg)
                </label>
                <input
                  type="number"
                  min="100"
                  step="50"
                  value={capacidadeCargaKg}
                  onChange={(e) => setCapacidadeCargaKg(Number(e.target.value))}
                  placeholder="1000"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Gramatura (g/m²)
                </label>
                <input
                  type="number"
                  min="50"
                  step="10"
                  value={tecidoGrm}
                  onChange={(e) => setTecidoGrm(Number(e.target.value))}
                  placeholder="160"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Lote de Produção
                </label>
                <input
                  type="text"
                  value={lote}
                  onChange={(e) => setLote(e.target.value.toUpperCase())}
                  placeholder="LT-2609"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500 transition-colors uppercase"
                />
              </div>
            </div>
          </div>

          {/* SEÇÃO 3: Quantidades & Cronograma (PCP) */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-1.5">
              <Calendar className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                3. Quantidades & Cronograma Fabril
              </h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Qtd. Total (Bags) <span className="text-amber-400">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantidade}
                  onChange={(e) => setQuantidade(Math.max(1, Number(e.target.value)))}
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 font-mono font-bold focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Qtd. Já Produzida
                </label>
                <input
                  type="number"
                  min="0"
                  max={quantidade}
                  value={quantidadeProduzida}
                  onChange={(e) => setQuantidadeProduzida(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Prioridade
                </label>
                <select
                  value={prioridade}
                  onChange={(e) => setPrioridade(e.target.value as PrioridadeOp)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                >
                  <option value="BAIXA">BAIXA</option>
                  <option value="MÉDIA">MÉDIA</option>
                  <option value="ALTA">ALTA</option>
                  <option value="URGENTE">URGENTE</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Eficiência Prevista (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={eficiencia}
                  onChange={(e) => setEficiencia(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Data do Pedido (Emissão)
                </label>
                <input
                  type="date"
                  value={dataPedido}
                  onChange={(e) => setDataPedido(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Data Programada (Fim PCP)
                </label>
                <input
                  type="date"
                  value={dataProgramada}
                  onChange={(e) => setDataProgramada(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Previsão de Entrega / Confecção
                </label>
                <input
                  type="date"
                  value={dataEntrega}
                  onChange={(e) => setDataEntrega(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Status Inicial da O.P (Chão de Fábrica)
                </label>
                <select
                  value={statusOp}
                  onChange={(e) => setStatusOp(e.target.value as StatusProducao)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                >
                  <option value="AGUARDANDO">AGUARDANDO INÍCIO</option>
                  <option value="CORTE">ETAPA DE CORTE</option>
                  <option value="PREPARAÇÃO">ETAPA DE PREPARAÇÃO</option>
                  <option value="CONFECÇÃO">ETAPA DE CONFECÇÃO</option>
                  <option value="FINALIZADO">FINALIZADO (100%)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Status Comercial do Pedido
                </label>
                <select
                  value={statusPedido}
                  onChange={(e) => setStatusPedido(e.target.value as Pedido['status'])}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                >
                  <option value="PENDENTE">PENDENTE (EM ABERTO)</option>
                  <option value="EM_PRODUCAO">EM PRODUÇÃO</option>
                  <option value="CONCLUIDO">CONCLUÍDO</option>
                  <option value="CANCELADO">CANCELADO</option>
                </select>
              </div>
            </div>
          </div>

          {/* SEÇÃO 4: Observações Operacionais */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-1.5">
              <Wrench className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                4. Observações & Requisitos Específicos
              </h4>
            </div>

            <div>
              <textarea
                rows={2}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Ex: Liner tubular PEAD 80 micras, alças reforçadas azuis, logo em silk 1 cor..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
              />
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-800 bg-slate-950/60 shrink-0">
          <span className="text-[11px] text-slate-500 flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Sincroniza automaticamente com Pedidos, PCP e Kanban</span>
          </span>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={aoFechar}
              disabled={salvando}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSalvar}
              disabled={salvando}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{salvando ? 'Salvando...' : modoEdicao ? 'Salvar Alterações' : 'Cadastrar Pedido'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
