import {
  Activity,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Database,
  Factory,
  FileSpreadsheet,
  FileText,
  History,
  LayoutDashboard,
  Package,
  Settings,
  User,
  Users,
} from 'lucide-react';
import React from 'react';
import { storageService } from '../../services/storageService';

export type ModuloAtivo =
  | 'dashboard'
  | 'programacao'
  | 'producao'
  | 'pedidos'
  | 'clientes'
  | 'produtos'
  | 'importador'
  | 'relatorios'
  | 'configuracoes'
  | 'logs';

interface SidebarProps {
  moduloAtivo: ModuloAtivo;
  onSelecionarModulo: (modulo: ModuloAtivo) => void;
  recolhido: boolean;
  onAlternarRecolhido: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  moduloAtivo,
  onSelecionarModulo,
  recolhido,
  onAlternarRecolhido,
}) => {
  const kpis = storageService.calcularKpis();
  const usuario = storageService.getUsuario();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'programacao',
      label: 'Programação',
      icon: Calendar,
      badge: kpis.pedidosProgramados,
      badgeColor: 'bg-slate-800 text-slate-300',
    },
    {
      id: 'producao',
      label: 'Produção (MES)',
      icon: Factory,
      badge: kpis.pedidosProduzindo,
      badgeColor: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
    },
    {
      id: 'pedidos',
      label: 'Pedidos',
      icon: Package,
      badge: null,
    },
    {
      id: 'clientes',
      label: 'Clientes',
      icon: Users,
      badge: null,
    },
    {
      id: 'produtos',
      label: 'Produtos',
      icon: Database,
      badge: null,
    },
    {
      id: 'importador',
      label: 'Importador Excel',
      icon: FileSpreadsheet,
      badge: 'PCP',
      badgeColor: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
    },
    {
      id: 'relatorios',
      label: 'Relatórios',
      icon: FileText,
      badge: null,
    },
    {
      id: 'logs',
      label: 'Logs do Sistema',
      icon: History,
      badge: null,
    },
    {
      id: 'configuracoes',
      label: 'Configurações',
      icon: Settings,
      badge: null,
    },
  ];

  // Filter menu items by user permissions
  const menuItemsPermitidos = menuItems.filter((item) => {
    if (usuario.perfil === 'PCP_ADMIN' || usuario.departamento === 'ADM') return true;
    if (usuario.modulosPermitidos && usuario.modulosPermitidos.length > 0) {
      return usuario.modulosPermitidos.includes(item.id as ModuloAtivo);
    }
    // Default fallback rules if no specific list set
    if (usuario.departamento === 'VENDAS') {
      return ['dashboard', 'pedidos', 'clientes', 'programacao'].includes(item.id);
    }
    if (usuario.departamento === 'PRODUCAO') {
      return ['dashboard', 'producao', 'programacao', 'produtos'].includes(item.id);
    }
    if (usuario.departamento === 'QUALIDADE') {
      return ['dashboard', 'producao', 'relatorios', 'produtos'].includes(item.id);
    }
    return ['dashboard', 'programacao', 'producao'].includes(item.id);
  });

  return (
    <aside
      className={`bg-[#0f172a] border-r border-slate-800/80 text-slate-300 flex flex-col transition-all duration-300 z-20 shrink-0 ${
        recolhido ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        {!recolhido ? (
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-white text-base shadow-sm shrink-0">
              V
            </div>
            <div className="truncate">
              <h1 className="font-bold text-white text-base tracking-tight leading-none">
                VIRTUDE <span className="font-light opacity-80 text-xs italic text-slate-300">BIG BAG'S</span>
              </h1>
              <p className="text-[10px] text-blue-400 font-semibold tracking-wider mt-0.5">
                MES / PCP INDUSTRIAL
              </p>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 mx-auto bg-blue-600 rounded-lg flex items-center justify-center font-black text-white text-base shadow-sm">
            V
          </div>
        )}

        <button
          onClick={onAlternarRecolhido}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={recolhido ? 'Expandir Menu' : 'Recolher Menu'}
        >
          {recolhido ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Menu Links */}
      <nav className="flex-1 py-3 px-2.5 space-y-1 overflow-y-auto">
        {menuItemsPermitidos.map((item) => {
          const ItemIcon = item.icon;
          const isAtivo = moduloAtivo === item.id;


          return (
            <button
              key={item.id}
              onClick={() => onSelecionarModulo(item.id as ModuloAtivo)}
              className={`w-full flex items-center px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                isAtivo
                  ? 'bg-blue-600/10 text-blue-400 font-semibold border-l-2 border-blue-500'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
              title={recolhido ? item.label : undefined}
            >
              <ItemIcon
                className={`w-4 h-4 shrink-0 transition-transform ${
                  isAtivo ? 'text-blue-400' : 'text-slate-400 group-hover:text-blue-400'
                }`}
              />

              {!recolhido && (
                <span className="ml-3 truncate flex-1 text-left">{item.label}</span>
              )}

              {!recolhido && item.badge !== null && item.badge !== undefined && (
                <span
                  className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    isAtivo ? 'bg-blue-600/20 text-blue-300' : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Plant Operational Status Widget */}
      {!recolhido && (
        <div className="p-3 m-2.5 bg-slate-900/80 border border-slate-800/80 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
            <span className="flex items-center space-x-1.5">
              <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>Linha de Produção</span>
            </span>
            <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded text-[9px]">ONLINE</span>
          </div>
          <div className="text-xs font-medium text-slate-200 flex items-center justify-between">
            <span>Eficiência OEE:</span>
            <span className="text-blue-400 font-bold">{kpis.eficienciaGlobal}%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, kpis.eficienciaGlobal)}%` }}
            />
          </div>
        </div>
      )}

      {/* User Footer Profile Card */}
      {!recolhido && (
        <div className="p-3.5 border-t border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center space-x-3">
            {usuario.avatar ? (
              <img
                src={usuario.avatar}
                alt={usuario.nome}
                className="w-8 h-8 rounded-full object-cover border border-slate-700"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-xs">
                <User className="w-4 h-4" />
              </div>
            )}
            <div className="text-xs truncate">
              <p className="text-white font-medium truncate">{usuario.nome}</p>
              <p className="text-slate-400 opacity-80 text-[10px] truncate">{usuario.cargo}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

