import { Building2, Mail, MapPin, Phone, Users } from 'lucide-react';
import React, { useState } from 'react';
import { storageService } from '../../services/storageService';
import { Cliente } from '../../types';

export const ClientesView: React.FC = () => {
  const [clientes] = useState<Cliente[]>(() => storageService.getClientes());

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Users className="w-5 h-5 text-amber-400" />
            <span>Carteira de Clientes Industriais</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Empresas atendidas com embalagens industriais e Big Bags da Virtude.
          </p>
        </div>
      </div>

      {/* Grid of Clients */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clientes.map((cli) => (
          <div
            key={cli.id}
            className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-lg hover:border-slate-700 transition-all"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">{cli.nome}</h3>
                  <p className="text-[10px] text-slate-500 font-mono">{cli.cnpj}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center space-x-2 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{cli.cidadeUF}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-400">
                <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>
                  {cli.contato} • {cli.telefone}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-slate-400 truncate">
                <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{cli.email}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-slate-950 p-2 rounded-xl">
                <span className="text-[10px] text-slate-500 block">Pedidos Ativos</span>
                <span className="font-bold text-amber-400 text-sm">
                  {cli.pedidosAtivos}
                </span>
              </div>
              <div className="bg-slate-950 p-2 rounded-xl">
                <span className="text-[10px] text-slate-500 block">Total de Bags</span>
                <span className="font-bold text-slate-100 text-sm">
                  {cli.totalBigBagsComprados.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
