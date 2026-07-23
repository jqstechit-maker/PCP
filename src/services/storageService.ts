import {
  INITIAL_CLIENTES,
  INITIAL_LOGS_IMPORTACAO,
  INITIAL_LOGS_SISTEMA,
  INITIAL_OPS,
  INITIAL_PEDIDOS,
  INITIAL_PRODUTOS,
  INITIAL_USUARIO,
  INITIAL_USUARIOS_SISTEMA,
} from '../data/mockData';
import {
  Cliente,
  IndicadoresKpi,
  LogImportacao,
  LogSistema,
  OrdemProducao,
  Pedido,
  Produto,
  StatusProducao,
  Usuario,
  UsuarioSistema,
} from '../types';
import { firebaseSyncService } from './firebaseSyncService';
import { mysqlSyncService } from './mysqlSyncService';

const STORAGE_KEYS = {
  OPS: 'virtude_ops_v2',
  PEDIDOS: 'virtude_pedidos_v2',
  CLIENTES: 'virtude_clientes_v2',
  PRODUTOS: 'virtude_produtos_v2',
  LOGS_IMPORTACAO: 'virtude_logs_imp_v2',
  LOGS_SISTEMA: 'virtude_logs_sys_v2',
  USUARIO: 'virtude_usuario_v1',
  USUARIOS_SISTEMA: 'virtude_usuarios_sistema_v2',
  TEMA: 'virtude_tema_v1',
};

class StorageService {
  constructor() {
    this.initFirebaseRealtimeSync();
  }

  private dispatchSyncEvent(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('virtude_data_synced'));
    }
  }

  private initFirebaseRealtimeSync(): void {
    if (typeof window === 'undefined') return;

    firebaseSyncService.initRealtimeListeners(
      (remoteOps) => {
        if (remoteOps && remoteOps.length > 0) {
          localStorage.setItem(STORAGE_KEYS.OPS, JSON.stringify(remoteOps));
          this.dispatchSyncEvent();
        }
      },
      (remoteClientes) => {
        if (remoteClientes && remoteClientes.length > 0) {
          localStorage.setItem(STORAGE_KEYS.CLIENTES, JSON.stringify(remoteClientes));
          this.dispatchSyncEvent();
        }
      },
      (remoteProdutos) => {
        if (remoteProdutos && remoteProdutos.length > 0) {
          localStorage.setItem(STORAGE_KEYS.PRODUTOS, JSON.stringify(remoteProdutos));
          this.dispatchSyncEvent();
        }
      },
      (remotePedidos) => {
        if (remotePedidos && remotePedidos.length > 0) {
          localStorage.setItem(STORAGE_KEYS.PEDIDOS, JSON.stringify(remotePedidos));
          this.dispatchSyncEvent();
        }
      },
      (remoteLogsImport) => {
        if (remoteLogsImport && remoteLogsImport.length > 0) {
          localStorage.setItem(STORAGE_KEYS.LOGS_IMPORTACAO, JSON.stringify(remoteLogsImport));
          this.dispatchSyncEvent();
        }
      },
      (remoteLogsSys) => {
        if (remoteLogsSys && remoteLogsSys.length > 0) {
          localStorage.setItem(STORAGE_KEYS.LOGS_SISTEMA, JSON.stringify(remoteLogsSys));
          this.dispatchSyncEvent();
        }
      }
    );
  }

  // --- Initialization & Storage Getters ---
  public getOps(): OrdemProducao[] {
    const raw = localStorage.getItem(STORAGE_KEYS.OPS);
    if (!raw) {
      return [];
    }
    try {
      const parsed: OrdemProducao[] = JSON.parse(raw);
      const cleaned = parsed.filter(
        (op) => !['op-101', 'op-102', 'op-103', 'op-104', 'op-105', 'op-106', 'op-107'].includes(op.id)
      );
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEYS.OPS, JSON.stringify(cleaned));
      }
      return cleaned;
    } catch {
      return [];
    }
  }

  public saveOps(ops: OrdemProducao[]): void {
    localStorage.setItem(STORAGE_KEYS.OPS, JSON.stringify(ops));
    firebaseSyncService.syncOpsToCloud(ops);
    mysqlSyncService.syncOpsToMysql(ops);
    this.dispatchSyncEvent();
  }

  public syncDerivadosComOps(): void {
    const ops = this.getOps();
    if (ops.length === 0) return;

    // 1. Clientes
    const currentClientes = this.getClientesDirect();
    const clientesMap = new Map<string, Cliente>();
    currentClientes.forEach((c) => clientesMap.set(c.nome.toLowerCase().trim(), c));

    // 2. Produtos
    const currentProdutos = this.getProdutosDirect();
    const produtosMap = new Map<string, Produto>();
    currentProdutos.forEach((p) => {
      produtosMap.set(p.nome.toLowerCase().trim(), p);
      if (p.codigo) produtosMap.set(p.codigo.toLowerCase().trim(), p);
    });

    // 3. Pedidos
    const currentPedidos = this.getPedidosDirect();
    const pedidosMap = new Map<string, Pedido>();
    currentPedidos.forEach((p) => pedidosMap.set(p.pedidoNumber.toUpperCase().trim(), p));

    ops.forEach((op) => {
      // Sync Cliente
      if (op.cliente && op.cliente.trim() && op.cliente !== 'Cliente Indefinido') {
        const cliKey = op.cliente.toLowerCase().trim();
        if (!clientesMap.has(cliKey)) {
          const novoCli: Cliente = {
            id: `cli-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            nome: op.cliente.trim(),
            cnpj: '12.345.678/0001-90',
            cidadeUF: 'São Paulo / SP',
            contato: 'Setor Compras / PCP',
            telefone: '(11) 3000-0000',
            email: 'contato@cliente.com.br',
            pedidosAtivos: 1,
            totalBigBagsComprados: op.quantidade || 0,
            status: 'ATIVO',
          };
          clientesMap.set(cliKey, novoCli);
        } else {
          const cli = clientesMap.get(cliKey)!;
          cli.totalBigBagsComprados = (cli.totalBigBagsComprados || 0) + (op.quantidade || 0);
        }
      }

      // Sync Produto
      if (op.produto && op.produto.trim()) {
        const prodKey = op.produto.toLowerCase().trim();
        if (!produtosMap.has(prodKey)) {
          const novoProd: Produto = {
            id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            codigo: `BB-${op.produto.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase() || 'STD'}-${op.capacidadeCargaKg || 1000}`,
            nome: op.produto.trim(),
            modelo: op.modelo || 'Saia Superior / Fundo Fechado',
            dimensoes: '90 x 90 x 120 cm',
            capacidadeKg: op.capacidadeCargaKg || 1000,
            gramaturaTecido: op.tecidoGrm || 160,
            tipoAlca: '4 Alças de Canto 30cm',
            tempoPadraoMinutos: 15,
            metaProducaoHora: 20,
          };
          produtosMap.set(prodKey, novoProd);
        }
      }

      // Sync Pedido
      if (op.pedidoNumber && op.pedidoNumber.trim() && op.pedidoNumber !== 'PED-VAR') {
        const pedKey = op.pedidoNumber.toUpperCase().trim();
        if (!pedidosMap.has(pedKey)) {
          const novoPed: Pedido = {
            id: `ped-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            pedidoNumber: op.pedidoNumber.toUpperCase().trim(),
            cliente: op.cliente || 'Cliente Indefinido',
            dataPedido: op.dataProgramada || new Date().toISOString().substring(0, 10),
            dataPrevisaoEntrega: op.dataEntrega || new Date().toISOString().substring(0, 10),
            status: op.status === 'FINALIZADO' ? 'CONCLUIDO' : op.status === 'ATRASADO' ? 'PENDENTE' : 'EM_PRODUCAO',
            totalItens: op.quantidade || 0,
            totalProduzido: op.quantidadeProduzida || 0,
            ops: [op.opNumber],
            valorTotal: (op.quantidade || 0) * 48.50,
          };
          pedidosMap.set(pedKey, novoPed);
        } else {
          const ped = pedidosMap.get(pedKey)!;
          if (!ped.ops.includes(op.opNumber)) {
            ped.ops.push(op.opNumber);
          }
          ped.totalItens = (ped.totalItens || 0) + (op.quantidade || 0);
          ped.totalProduzido = (ped.totalProduzido || 0) + (op.quantidadeProduzida || 0);
        }
      }
    });

    this.saveClientes(Array.from(clientesMap.values()));
    this.saveProdutos(Array.from(produtosMap.values()));
    this.savePedidos(Array.from(pedidosMap.values()));
  }

  private getPedidosDirect(): Pedido[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PEDIDOS);
    if (!raw) return [];
    try {
      const parsed: Pedido[] = JSON.parse(raw);
      return parsed.filter(
        (p) => !['ped-1042', 'ped-1043', 'ped-1044', 'ped-1045', 'ped-1046'].includes(p.id)
      );
    } catch {
      return [];
    }
  }

  public getPedidos(): Pedido[] {
    let list = this.getPedidosDirect();
    if (list.length === 0 && this.getOps().length > 0) {
      this.syncDerivadosComOps();
      list = this.getPedidosDirect();
    }
    return list;
  }

  public savePedidos(pedidos: Pedido[]): void {
    localStorage.setItem(STORAGE_KEYS.PEDIDOS, JSON.stringify(pedidos));
    firebaseSyncService.syncPedidosToCloud(pedidos);
    mysqlSyncService.syncPedidosToMysql(pedidos);
    this.dispatchSyncEvent();
  }

  private getClientesDirect(): Cliente[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CLIENTES);
    if (!raw) return [];
    try {
      const parsed: Cliente[] = JSON.parse(raw);
      return parsed.filter(
        (c) => !['cli-1', 'cli-2', 'cli-3', 'cli-4', 'cli-5'].includes(c.id)
      );
    } catch {
      return [];
    }
  }

  public getClientes(): Cliente[] {
    let list = this.getClientesDirect();
    if (list.length === 0 && this.getOps().length > 0) {
      this.syncDerivadosComOps();
      list = this.getClientesDirect();
    }
    return list;
  }

  public saveClientes(clientes: Cliente[]): void {
    localStorage.setItem(STORAGE_KEYS.CLIENTES, JSON.stringify(clientes));
    firebaseSyncService.syncClientesToCloud(clientes);
    mysqlSyncService.syncClientesToMysql(clientes);
    this.dispatchSyncEvent();
  }

  private getProdutosDirect(): Produto[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUTOS);
    if (!raw) return [];
    try {
      const parsed: Produto[] = JSON.parse(raw);
      return parsed.filter(
        (p) => !['prod-1', 'prod-2', 'prod-3', 'prod-4', 'prod-5'].includes(p.id)
      );
    } catch {
      return [];
    }
  }

  public getProdutos(): Produto[] {
    let list = this.getProdutosDirect();
    if (list.length === 0 && this.getOps().length > 0) {
      this.syncDerivadosComOps();
      list = this.getProdutosDirect();
    }
    return list;
  }

  public saveProdutos(produtos: Produto[]): void {
    localStorage.setItem(STORAGE_KEYS.PRODUTOS, JSON.stringify(produtos));
    firebaseSyncService.syncProdutosToCloud(produtos);
    mysqlSyncService.syncProdutosToMysql(produtos);
    this.dispatchSyncEvent();
  }

  public getLogsImportacao(): LogImportacao[] {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS_IMPORTACAO);
    if (!raw) {
      return [];
    }
    try {
      const parsed: LogImportacao[] = JSON.parse(raw);
      const cleaned = parsed.filter((log) => !['imp-001', 'imp-002'].includes(log.id));
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEYS.LOGS_IMPORTACAO, JSON.stringify(cleaned));
      }
      return cleaned;
    } catch {
      return [];
    }
  }

  public saveLogsImportacao(logs: LogImportacao[]): void {
    localStorage.setItem(STORAGE_KEYS.LOGS_IMPORTACAO, JSON.stringify(logs));
    firebaseSyncService.syncLogsImportacaoToCloud(logs);
    this.dispatchSyncEvent();
  }

  public getLogsSistema(): LogSistema[] {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS_SISTEMA);
    if (!raw) {
      return [];
    }
    try {
      const parsed: LogSistema[] = JSON.parse(raw);
      const cleaned = parsed.filter(
        (log) => !['log-101', 'log-102', 'log-103', 'log-104'].includes(log.id)
      );
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEYS.LOGS_SISTEMA, JSON.stringify(cleaned));
      }
      return cleaned;
    } catch {
      return [];
    }
  }

  public saveLogsSistema(logs: LogSistema[]): void {
    localStorage.setItem(STORAGE_KEYS.LOGS_SISTEMA, JSON.stringify(logs));
    firebaseSyncService.syncLogsSistemaToCloud(logs);
    this.dispatchSyncEvent();
  }

  public addLogSistema(
    modulo: string,
    acao: string,
    descricao: string,
    nivel: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS' = 'INFO'
  ): void {
    const usuario = this.getUsuario();
    const logs = this.getLogsSistema();
    const newLog: LogSistema = {
      id: `log-${Date.now()}`,
      dataHora: new Date().toISOString().replace('T', ' ').substring(0, 19),
      usuario: usuario.nome,
      modulo,
      acao,
      descricao,
      ip: '192.168.1.45',
      nivel,
    };
    logs.unshift(newLog);
    this.saveLogsSistema(logs);
  }

  public getUsuario(): Usuario {
    const raw = localStorage.getItem(STORAGE_KEYS.USUARIO);
    if (!raw) {
      this.saveUsuario(INITIAL_USUARIO);
      return INITIAL_USUARIO;
    }
    try {
      const parsed = JSON.parse(raw);
      if (parsed.nome === 'Carlos Eduardo Ramos' || !parsed.nome || parsed.cargo?.includes('Supervisor')) {
        parsed.nome = INITIAL_USUARIO.nome;
        parsed.cargo = INITIAL_USUARIO.cargo;
        this.saveUsuario(parsed);
      }
      return parsed;
    } catch {
      return INITIAL_USUARIO;
    }
  }

  public saveUsuario(usuario: Usuario): void {
    localStorage.setItem(STORAGE_KEYS.USUARIO, JSON.stringify(usuario));
  }

  public getUsuariosSistema(): UsuarioSistema[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USUARIOS_SISTEMA);
    if (!raw) {
      this.saveUsuariosSistema([]);
      return [];
    }
    try {
      const parsed: UsuarioSistema[] = JSON.parse(raw);
      const cleaned = parsed.filter(
        (u) => !['usys-001', 'usys-002', 'usys-003', 'usys-004'].includes(u.id)
      );
      if (cleaned.length !== parsed.length) {
        this.saveUsuariosSistema(cleaned);
      }
      return cleaned;
    } catch {
      this.saveUsuariosSistema([]);
      return [];
    }
  }

  public saveUsuariosSistema(usuarios: UsuarioSistema[]): void {
    localStorage.setItem(STORAGE_KEYS.USUARIOS_SISTEMA, JSON.stringify(usuarios));
  }

  public getTema(): 'dark' | 'light' {
    const raw = localStorage.getItem(STORAGE_KEYS.TEMA);
    return raw === 'light' ? 'light' : 'dark';
  }

  public saveTema(tema: 'dark' | 'light'): void {
    localStorage.setItem(STORAGE_KEYS.TEMA, tema);
  }

  // --- KPI & OEE Aggregator ---
  public calcularKpis(): IndicadoresKpi {
    const ops = this.getOps();
    const clientes = this.getClientes();
    
    let pedidosProgramados = 0;
    let pedidosProduzindo = 0;
    let pedidosFinalizados = 0;
    let pedidosPendentes = 0;
    let pedidosAtrasados = 0;
    let producaoDiaAtual = 0;
    let quantidadeProduzidaTotal = 0;
    let somaEficiencia = 0;

    const produtosUnicosSet = new Set<string>();

    ops.forEach((op) => {
      pedidosProgramados++;
      quantidadeProduzidaTotal += op.quantidadeProduzida;
      somaEficiencia += op.eficiencia;
      produtosUnicosSet.add(op.produto);

      if (op.status === 'FINALIZADO') {
        pedidosFinalizados++;
      } else if (op.status === 'AGUARDANDO') {
        pedidosPendentes++;
      } else if (op.status === 'ATRASADO') {
        pedidosAtrasados++;
      } else {
        // CORTE, PREPARAÇÃO, CONFECÇÃO
        pedidosProduzindo++;
      }

      // Check today's production approximation (last 24h/active)
      if (op.status !== 'AGUARDANDO') {
        producaoDiaAtual += Math.round(op.quantidadeProduzida * 0.18);
      }
    });

    const totalOps = ops.length;
    const eficienciaGlobal =
      totalOps > 0 ? Number((somaEficiencia / totalOps).toFixed(1)) : 0;

    // MES OEE Calculation
    const oeeDisponibilidade = totalOps > 0 ? 96.2 : 0;
    const oeeDesempenho = totalOps > 0 ? Number(((eficienciaGlobal / 100) * 94).toFixed(1)) : 0;
    const oeeQualidade = totalOps > 0 ? 98.8 : 0;
    const oeeGeral = totalOps > 0
      ? Number(((oeeDisponibilidade * oeeDesempenho * oeeQualidade) / 10000).toFixed(1))
      : 0;

    return {
      pedidosProgramados,
      pedidosProduzindo,
      pedidosFinalizados,
      pedidosPendentes,
      pedidosAtrasados,
      producaoDiaAtual,
      metaDiaAtual: 1000,
      eficienciaGlobal,
      quantidadeProduzidaTotal,
      clientesAtendidos: clientes.filter((c) => c.status === 'ATIVO').length,
      produtosProduzidosDiferentes: produtosUnicosSet.size,
      oeeDisponibilidade,
      oeeDesempenho,
      oeeQualidade,
      oeeGeral,
    };
  }

  // --- OP Status Advancement & Editing ---
  public atualizarStatusOp(
    opId: string,
    novoStatus: StatusProducao,
    qtdProduzidaAdicional?: number,
    observacoes?: string
  ): OrdemProducao {
    const ops = this.getOps();
    const index = ops.findIndex((o) => o.id === opId);
    if (index === -1) throw new Error('Ordem de Produção não encontrada.');

    const op = ops[index];
    const statusAntigo = op.status;
    op.status = novoStatus;
    op.alteradoEm = new Date().toISOString().replace('T', ' ').substring(0, 19);

    if (observacoes !== undefined) {
      op.observacoes = observacoes;
    }

    if (qtdProduzidaAdicional && qtdProduzidaAdicional > 0) {
      op.quantidadeProduzida = Math.min(
        op.quantidade,
        op.quantidadeProduzida + qtdProduzidaAdicional
      );
    }

    if (novoStatus === 'FINALIZADO') {
      op.quantidadeProduzida = op.quantidade;
      op.dataFimReal = new Date().toISOString().replace('T', ' ').substring(0, 16);
    } else if (
      (statusAntigo === 'AGUARDANDO' || !op.dataInicioReal) &&
      novoStatus !== 'AGUARDANDO'
    ) {
      op.dataInicioReal = new Date().toISOString().replace('T', ' ').substring(0, 16);
    }

    ops[index] = op;
    this.saveOps(ops);

    this.addLogSistema(
      'PROGRAMAÇÃO',
      'ALTERAÇÃO_STATUS',
      `OP ${op.opNumber} (${op.cliente}) alterada de ${statusAntigo} para ${novoStatus}. Qtd produções: ${op.quantidadeProduzida}/${op.quantidade}`,
      novoStatus === 'ATRASADO' ? 'WARNING' : 'INFO'
    );

    return op;
  }

  // --- Reset to Initial State ---
  public resetarBanco(): void {
    localStorage.removeItem(STORAGE_KEYS.OPS);
    localStorage.removeItem(STORAGE_KEYS.PEDIDOS);
    localStorage.removeItem(STORAGE_KEYS.CLIENTES);
    localStorage.removeItem(STORAGE_KEYS.PRODUTOS);
    localStorage.removeItem(STORAGE_KEYS.LOGS_IMPORTACAO);
    localStorage.removeItem(STORAGE_KEYS.LOGS_SISTEMA);
    localStorage.removeItem(STORAGE_KEYS.USUARIO);

    this.getOps();
    this.getPedidos();
    this.getClientes();
    this.getProdutos();
    this.getLogsImportacao();
    this.getLogsSistema();
    this.getUsuario();

    this.addLogSistema(
      'CONFIGURAÇÕES',
      'RESET_BANCO',
      'Banco de dados restaurado para os dados padrão da Virtude Big Bags',
      'WARNING'
    );
  }
}

export const storageService = new StorageService();
