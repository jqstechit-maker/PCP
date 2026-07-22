import { CheckCircle2, Clock, Package, Plus } from 'lucide-react';
import React, { useState } from 'react';
import { storageService } from '../../services/storageService';
import { Pedido } from '../../types';

export const PedidosView: React.FC = () => {
  const [pedidos] = useState<Pedido[]>(() => storageService.getPedidos());

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pedidos.map((ped) => {
            const pct = Math.round((ped.totalProduzido / ped.totalItens) * 100);

            return (
              <div
                key={ped.id}
                className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-lg hover:border-slate-700 transition-all"
              >
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
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                      ped.status === 'CONCLUIDO'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : ped.status === 'EM_PRODUCAO'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {ped.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-100 truncate">
                    {ped.cliente}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Previsão de Entrega:{' '}
                    <span className="font-semibold text-slate-200">
                      {ped.dataPrevisaoEntrega}
                    </span>
                  </p>
                </div>

                <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-850">
                  <div className="flex justify-between text-xs text-slate-300 font-medium">
                    <span>Volume de Big Bags:</span>
                    <span className="font-bold text-slate-100">
                      {ped.totalProduzido} / {ped.totalItens} unidades
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>

                {ped.valorTotal && (
                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                    <span className="text-slate-400">Valor Estimado:</span>
                    <span className="font-bold font-mono text-emerald-400">
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
