import { Box, Database, Shield, Zap } from 'lucide-react';
import React, { useState } from 'react';
import { storageService } from '../../services/storageService';
import { Produto } from '../../types';

export const ProdutosView: React.FC = () => {
  const [produtos] = useState<Produto[]>(() => storageService.getProdutos());

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Database className="w-5 h-5 text-amber-400" />
            <span>Catálogo Técnico de Modelos Big Bag</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Especificações de engenharia, gramatura de ráfia e cadência padrão por hora de produção.
          </p>
        </div>
      </div>

      {/* Grid of Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {produtos.map((prod) => (
          <div
            key={prod.id}
            className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-lg hover:border-slate-700 transition-all"
          >
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="font-mono text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {prod.codigo}
                </span>
                <h3 className="text-sm font-bold text-slate-100 mt-1">{prod.nome}</h3>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between border-b border-slate-800/50 pb-1">
                <span className="text-slate-400">Modelo:</span>
                <span className="font-semibold text-slate-200">{prod.modelo}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/50 pb-1">
                <span className="text-slate-400">Dimensões:</span>
                <span className="font-mono text-slate-200">{prod.dimensoes}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/50 pb-1">
                <span className="text-slate-400">Carga Máxima (SWL):</span>
                <span className="font-bold text-amber-400">{prod.capacidadeKg} kg</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/50 pb-1">
                <span className="text-slate-400">Tecido de Ráfia:</span>
                <span className="font-mono text-slate-200">{prod.gramaturaTecido} g/m²</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-slate-400">Estrutura de Alças:</span>
                <span className="font-medium text-slate-200 text-right">{prod.tipoAlca}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-850">
                <span className="text-[10px] text-slate-500 block">Tempo Confecção</span>
                <span className="font-bold text-slate-200">{prod.tempoPadraoMinutos} min / unid</span>
              </div>
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-850">
                <span className="text-[10px] text-slate-500 block">Cadência Padrão</span>
                <span className="font-bold text-emerald-400">{prod.metaProducaoHora} unid / hora</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
