import {
  ArrowRight,
  CheckCircle,
  Clock,
  Factory,
  Layers,
  Scissors,
  Wrench,
} from 'lucide-react';
import React, { useState } from 'react';
import { storageService } from '../../services/storageService';
import { OrdemProducao, StatusProducao } from '../../types';

interface ProducaoKanbanViewProps {
  onAvancarStatusOp: (opId: string, novoStatus: StatusProducao) => void;
}

export const ProducaoKanbanView: React.FC<ProducaoKanbanViewProps> = ({
  onAvancarStatusOp,
}) => {
  const [ops, setOps] = useState<OrdemProducao[]>(() => storageService.getOps());

  const usuarioLogado = storageService.getUsuarioSessao() || storageService.getUsuario();
  const podeEditar = usuarioLogado.permissao === 'EDITAR' && usuarioLogado.perfil !== 'VISUALIZADOR';

  const recarregar = () => {
    setOps(storageService.getOps());
  };

  const handleAvancar = (id: string, proximo: StatusProducao) => {
    onAvancarStatusOp(id, proximo);
    recarregar();
  };

  const colunas: {
    id: StatusProducao;
    titulo: string;
    subtitulo: string;
    icon: React.ElementType;
    cor: string;
    borderCor: string;
    proximaEtapa?: StatusProducao;
  }[] = [
    {
      id: 'AGUARDANDO',
      titulo: '1. Aguardando Início',
      subtitulo: 'Aguardando Tecido / Bobina',
      icon: Clock,
      cor: 'bg-slate-800 text-slate-300',
      borderCor: 'border-slate-700',
      proximaEtapa: 'CORTE',
    },
    {
      id: 'CORTE',
      titulo: '2. Corte de Ráfia',
      subtitulo: 'Corte a Quente / Dimensionamento',
      icon: Scissors,
      cor: 'bg-amber-500/10 text-amber-400',
      borderCor: 'border-amber-500/30',
      proximaEtapa: 'PREPARAÇÃO',
    },
    {
      id: 'PREPARAÇÃO',
      titulo: '3. Preparação & Alças',
      subtitulo: 'Dobras, Válvulas e Costura Alças',
      icon: Wrench,
      cor: 'bg-cyan-500/10 text-cyan-400',
      borderCor: 'border-cyan-500/30',
      proximaEtapa: 'CONFECÇÃO',
    },
    {
      id: 'CONFECÇÃO',
      titulo: '4. Confecção Final',
      subtitulo: 'Fechamento do Corpo / Inspeção',
      icon: Factory,
      cor: 'bg-indigo-500/10 text-indigo-400',
      borderCor: 'border-indigo-500/30',
      proximaEtapa: 'FINALIZADO',
    },
    {
      id: 'FINALIZADO',
      titulo: '5. Expedição / Finalizado',
      subtitulo: 'Pronto para Envio ao Cliente',
      icon: CheckCircle,
      cor: 'bg-emerald-500/10 text-emerald-400',
      borderCor: 'border-emerald-500/30',
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
        <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
          <Factory className="w-5 h-5 text-amber-400" />
          <span>Gestão Visual de Chão de Fábrica (Pipeline MES)</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Acompanhe o fluxo físico de transformação do Big Bag desde o corte da matéria-prima até a expedição final.
        </p>
      </div>

      {/* Kanban Pipeline Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {colunas.map((col) => {
          const Icone = col.icon;
          const opsColuna = ops.filter(
            (o) => o.status === col.id || (col.id === 'AGUARDANDO' && o.status === 'ATRASADO')
          );

          return (
            <div
              key={col.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between shadow-lg"
            >
              {/* Column Header */}
              <div className="pb-3 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`p-1.5 rounded-lg ${col.cor}`}>
                      <Icone className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-200">{col.titulo}</h3>
                  </div>
                  <span className="text-xs font-bold font-mono px-2 py-0.5 bg-slate-800 rounded-full text-slate-300">
                    {opsColuna.length}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">{col.subtitulo}</p>
              </div>

              {/* OP Cards List */}
              <div className="my-3 space-y-3 flex-1 overflow-y-auto max-h-[550px] pr-1">
                {opsColuna.length > 0 ? (
                  opsColuna.map((op) => {
                    const pct = Math.round(
                      (op.quantidadeProduzida / op.quantidade) * 100
                    );

                    return (
                      <div
                        key={op.id}
                        className={`bg-slate-950 border ${
                          op.status === 'ATRASADO'
                            ? 'border-red-500/50'
                            : 'border-slate-800 hover:border-amber-500/40'
                        } p-3 rounded-xl space-y-2 transition-all shadow-sm`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono font-bold text-amber-400">
                            {op.opNumber}
                          </span>
                          <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                            {op.prioridade}
                          </span>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-slate-100 truncate">
                            {op.cliente}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {op.produto}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-900 space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                            <span>Qtd: {op.quantidadeProduzida}/{op.quantidade}</span>
                            <span className="text-slate-200 font-bold">{pct}%</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-amber-500 h-full rounded-full"
                              style={{ width: `${Math.min(100, pct)}%` }}
                            />
                          </div>
                        </div>

                        {col.proximaEtapa && podeEditar && (
                          <button
                            onClick={() => handleAvancar(op.id, col.proximaEtapa!)}
                            className="w-full mt-2 py-1.5 bg-amber-500/10 hover:bg-amber-500 hover:text-slate-950 text-amber-400 text-[10px] font-bold rounded-lg border border-amber-500/20 flex items-center justify-center space-x-1 transition-all"
                          >
                            <span>Avançar para {col.proximaEtapa}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-[11px] text-slate-600 border border-dashed border-slate-800/80 rounded-xl">
                    Sem OPs nesta etapa
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
