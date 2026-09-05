import {
  CheckCircle2,
  Clock,
  Factory,
  Filter,
  Layers,
  Package,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { storageService } from '../../services/storageService';
import { Pedido } from '../../types';

type FiltroRapido = 'TODOS' | 'EM_ABERTO' | 'EM_PRODUCAO' | 'FINALIZADO';

export const PedidosView: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>(() => storageService.getPedidos());
  const [isAdmin, setIsAdmin] = useState<boolean>(() => storageService.isAdmin());
  const [filtroRapido, setFiltroRapido] = useState<FiltroRapido>('TODOS');
  const [buscaTexto, setBuscaTexto] = useState<string>('');

  // Atualização em tempo real quando houver mudanças no storage ou apontamentos
  useEffect(() => {
    const handleSync = () => {
      setPedidos(storageService.getPedidos());
      setIsAdmin(storageService.isAdmin());
    };

    window.addEventListener('virtude_data_synced', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('virtude_data_synced', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Helpers de classificação de status de pedidos
  const isPedidoEmAberto = (ped: Pedido) => {
    return (
      ped.status === 'PENDENTE' ||
      (ped.status !== 'CONCLUIDO' && ped.status !== 'CANCELADO' && ped.totalProduzido === 0)
    );
  };

  const isPedidoEmProducao = (ped: Pedido) => {
    return (
      ped.status === 'EM_PRODUCAO' ||
      (ped.status !== 'CONCLUIDO' && ped.status !== 'CANCELADO' && ped.totalProduzido > 0 && ped.totalProduzido < ped.totalItens)
    );
  };

  const isPedidoFinalizado = (ped: Pedido) => {
    return ped.status === 'CONCLUIDO' || (ped.totalItens > 0 && ped.totalProduzido >= ped.totalItens);
  };

  // Contagens para os botões de filtros rápidos
  const contagens = useMemo(() => {
    return {
      todos: pedidos.length,
      emAberto: pedidos.filter(isPedidoEmAberto).length,
      emProducao: pedidos.filter(isPedidoEmProducao).length,
      finalizados: pedidos.filter(isPedidoFinalizado).length,
    };
  }, [pedidos]);

  // Totalizadores operacionais e financeiros
  const totaisGerais = useMemo(() => {
    const totalBags = pedidos.reduce((acc, p) => acc + (p.totalItens || 0), 0);
    const totalProduzido = pedidos.reduce((acc, p) => acc + (p.totalProduzido || 0), 0);
    const valorTotalEstimado = pedidos.reduce((acc, p) => acc + (p.valorTotal || 0), 0);

    return {
      totalBags,
      totalProduzido,
      valorTotalEstimado,
    };
  }, [pedidos]);

  // Lista de pedidos filtrada
  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((ped) => {
      // 1. Filtro rápido de status
      if (filtroRapido === 'EM_ABERTO' && !isPedidoEmAberto(ped)) return false;
      if (filtroRapido === 'EM_PRODUCAO' && !isPedidoEmProducao(ped)) return false;
      if (filtroRapido === 'FINALIZADO' && !isPedidoFinalizado(ped)) return false;

      // 2. Filtro de busca textual
      if (buscaTexto.trim()) {
        const termo = buscaTexto.toLowerCase().trim();
        const matchNumero = ped.pedidoNumber.toLowerCase().includes(termo);
        const matchCliente = ped.cliente.toLowerCase().includes(termo);
        const matchOps = ped.ops.some((op) => op.toLowerCase().includes(termo));

        if (!matchNumero && !matchCliente && !matchOps) return false;
      }

      return true;
    });
  }, [pedidos, filtroRapido, buscaTexto]);

  return (
    <div className="space-y-6 pb-8">
      {/* Header com Descrição e Identificação de Acesso */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Package className="w-5 h-5 text-amber-400" />
            <span>Pedidos de Vendas e Produção</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Acompanhe o status comercial e de fabricação de cada pedido de cliente.
          </p>
        </div>

        {/* Indicador de Privilégio Admin / Operacional */}
        <div className="flex items-center space-x-2">
          {isAdmin ? (
            <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center space-x-2 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="leading-tight">
                <span className="font-bold">Acesso Administrador</span>
                <p className="text-[10px] text-emerald-400/80">Valores comerciais visíveis</p>
              </div>
            </div>
          ) : (
            <div className="px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl flex items-center space-x-2 text-xs text-slate-400">
              <Package className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="leading-tight">
                <span className="font-semibold text-slate-300">Modo Operacional</span>
                <p className="text-[10px] text-slate-400">Valores financeiros restritos ao Admin</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Total de Pedidos</span>
            <Layers className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-xl font-bold text-slate-100 mt-2 font-mono">
            {contagens.todos}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {totaisGerais.totalBags.toLocaleString()} Big Bags programados
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-blue-400">Em Aberto</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-xl font-bold text-blue-400 mt-2 font-mono">
            {contagens.emAberto}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Aguardando início de produção
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-400">Em Produção</span>
            <Factory className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-bold text-amber-400 mt-2 font-mono">
            {contagens.emProducao}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Ativos no chão de fábrica
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-400">Finalizados</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-emerald-400 mt-2 font-mono">
            {contagens.finalizados}
          </p>
          {isAdmin ? (
            <p className="text-[10px] text-emerald-400/90 mt-0.5 font-mono">
              Total: R$ {totaisGerais.valorTotalEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          ) : (
            <p className="text-[10px] text-slate-500 mt-0.5">
              100% concluídos
            </p>
          )}
        </div>
      </div>

      {/* Painel de Filtros Rápidos e Busca */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Botões de Filtros Rápidos */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center space-x-1 mr-1">
              <Filter className="w-3.5 h-3.5 text-amber-400" />
              <span>Filtros Rápidos:</span>
            </span>

            {/* BOTÃO TODOS */}
            <button
              onClick={() => setFiltroRapido('TODOS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                filtroRapido === 'TODOS'
                  ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              <span>TODOS</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                  filtroRapido === 'TODOS'
                    ? 'bg-slate-950/30 text-slate-950 font-extrabold'
                    : 'bg-slate-900 text-slate-400'
                }`}
              >
                {contagens.todos}
              </span>
            </button>

            {/* BOTÃO PEDIDOS EM ABERTO */}
            <button
              onClick={() => setFiltroRapido('EM_ABERTO')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                filtroRapido === 'EM_ABERTO'
                  ? 'bg-blue-500 text-slate-950 shadow-md ring-2 ring-blue-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>PEDIDOS EM ABERTO</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                  filtroRapido === 'EM_ABERTO'
                    ? 'bg-slate-950/30 text-slate-950 font-extrabold'
                    : 'bg-slate-900 text-blue-400'
                }`}
              >
                {contagens.emAberto}
              </span>
            </button>

            {/* BOTÃO EM PRODUÇÃO */}
            <button
              onClick={() => setFiltroRapido('EM_PRODUCAO')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                filtroRapido === 'EM_PRODUCAO'
                  ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              <Factory className="w-3 h-3" />
              <span>EM PRODUÇÃO</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                  filtroRapido === 'EM_PRODUCAO'
                    ? 'bg-slate-950/30 text-slate-950 font-extrabold'
                    : 'bg-slate-900 text-amber-400'
                }`}
              >
                {contagens.emProducao}
              </span>
            </button>

            {/* BOTÃO FINALIZADOS */}
            <button
              onClick={() => setFiltroRapido('FINALIZADO')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                filtroRapido === 'FINALIZADO'
                  ? 'bg-emerald-500 text-slate-950 shadow-md ring-2 ring-emerald-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>FINALIZADOS</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                  filtroRapido === 'FINALIZADO'
                    ? 'bg-slate-950/30 text-slate-950 font-extrabold'
                    : 'bg-slate-900 text-emerald-400'
                }`}
              >
                {contagens.finalizados}
              </span>
            </button>
          </div>

          {/* Campo de Pesquisa */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={buscaTexto}
              onChange={(e) => setBuscaTexto(e.target.value)}
              placeholder="Buscar por cliente, pedido ou OP..."
              className="w-full pl-9 pr-8 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
            {buscaTexto && (
              <button
                onClick={() => setBuscaTexto('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Resumo do filtro ativo */}
        {(filtroRapido !== 'TODOS' || buscaTexto) && (
          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <span>
              Exibindo <strong>{pedidosFiltrados.length}</strong> de <strong>{pedidos.length}</strong> pedidos
              {filtroRapido !== 'TODOS' && (
                <> no filtro <span className="text-amber-400 font-semibold">{filtroRapido.replace('_', ' ')}</span></>
              )}
              {buscaTexto && <> correspondentes a &quot;{buscaTexto}&quot;</>}
            </span>

            <button
              onClick={() => {
                setFiltroRapido('TODOS');
                setBuscaTexto('');
              }}
              className="text-xs text-amber-400 hover:underline flex items-center space-x-1"
            >
              <span>Limpar filtros</span>
            </button>
          </div>
        )}
      </div>

      {/* Orders List */}
      {pedidos.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <Package className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">Nenhum Pedido Registrado</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Não há pedidos de vendas ou produção cadastrados no sistema. Importe novas planilhas ou cadastre novas ordens para acompanhar o fluxo comercial.
          </p>
        </div>
      ) : pedidosFiltrados.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <Filter className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">Nenhum pedido atende aos filtros</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Não foram encontrados pedidos para o filtro selecionado ({filtroRapido.replace('_', ' ')}).
          </p>
          <button
            onClick={() => {
              setFiltroRapido('TODOS');
              setBuscaTexto('');
            }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
          >
            Ver Todos os Pedidos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pedidosFiltrados.map((ped) => {
            const pct = ped.totalItens > 0 ? Math.round((ped.totalProduzido / ped.totalItens) * 100) : 0;
            const finalizado = isPedidoFinalizado(ped);
            const emProducao = isPedidoEmProducao(ped);

            return (
              <div
                key={ped.id}
                className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-lg hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Cabeçalho do Card */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="font-mono font-bold text-amber-400 text-sm">
                        {ped.pedidoNumber}
                      </span>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Pedido em: {ped.dataPedido}
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center space-x-1 ${
                        finalizado
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : emProducao
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {finalizado ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>FINALIZADO</span>
                        </>
                      ) : emProducao ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          <span>EM PRODUÇÃO</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" />
                          <span>EM ABERTO</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Informações do Cliente e Previsão */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 truncate" title={ped.cliente}>
                      {ped.cliente}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Previsão de Entrega:{' '}
                      <span className="font-semibold text-slate-200">
                        {ped.dataPrevisaoEntrega}
                      </span>
                    </p>
                  </div>

                  {/* OPs Associadas */}
                  {ped.ops && ped.ops.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-slate-500 font-semibold">OPs:</span>
                      {ped.ops.map((opNum) => (
                        <span
                          key={opNum}
                          className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md font-mono text-[10px] border border-slate-700"
                        >
                          {opNum}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Progresso Fabril de Big Bags */}
                  <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-850">
                    <div className="flex justify-between text-xs text-slate-300 font-medium">
                      <span>Volume de Big Bags:</span>
                      <span className="font-bold text-slate-100">
                        {ped.totalProduzido} / {ped.totalItens} un ({pct}%)
                      </span>
                    </div>

                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          finalizado
                            ? 'bg-emerald-500'
                            : pct > 50
                            ? 'bg-amber-500'
                            : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* VALOR ESTIMADO: Exibição restrita a usuários ADMIN */}
                {isAdmin && ped.valorTotal !== undefined && (
                  <div className="pt-3 border-t border-slate-800/80 flex justify-between items-center text-xs">
                    <span className="text-slate-400 flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>Valor Estimado (Admin):</span>
                    </span>
                    <span className="font-bold font-mono text-emerald-400 text-sm">
                      R${' '}
                      {ped.valorTotal.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

