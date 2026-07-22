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

const STORAGE_KEYS = {
  OPS: 'virtude_ops_v1',
  PEDIDOS: 'virtude_pedidos_v1',
  CLIENTES: 'virtude_clientes_v1',
  PRODUTOS: 'virtude_produtos_v1',
  LOGS_IMPORTACAO: 'virtude_logs_imp_v1',
  LOGS_SISTEMA: 'virtude_logs_sys_v1',
  USUARIO: 'virtude_usuario_v1',
  USUARIOS_SISTEMA: 'virtude_usuarios_sistema_v1',
  TEMA: 'virtude_tema_v1',
};

class StorageService {
  // --- Initialization & Storage Getters ---
  public getOps(): OrdemProducao[] {
    const raw = localStorage.getItem(STORAGE_KEYS.OPS);
    if (!raw) {
      this.saveOps(INITIAL_OPS);
      return INITIAL_OPS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_OPS;
    }
  }

  public saveOps(ops: OrdemProducao[]): void {
    localStorage.setItem(STORAGE_KEYS.OPS, JSON.stringify(ops));
  }

  public getPedidos(): Pedido[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PEDIDOS);
    if (!raw) {
      this.savePedidos(INITIAL_PEDIDOS);
      return INITIAL_PEDIDOS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_PEDIDOS;
    }
  }

  public savePedidos(pedidos: Pedido[]): void {
    localStorage.setItem(STORAGE_KEYS.PEDIDOS, JSON.stringify(pedidos));
  }

  public getClientes(): Cliente[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CLIENTES);
    if (!raw) {
      this.saveClientes(INITIAL_CLIENTES);
      return INITIAL_CLIENTES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_CLIENTES;
    }
  }

  public saveClientes(clientes: Cliente[]): void {
    localStorage.setItem(STORAGE_KEYS.CLIENTES, JSON.stringify(clientes));
  }

  public getProdutos(): Produto[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUTOS);
    if (!raw) {
      this.saveProdutos(INITIAL_PRODUTOS);
      return INITIAL_PRODUTOS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_PRODUTOS;
    }
  }

  public saveProdutos(produtos: Produto[]): void {
    localStorage.setItem(STORAGE_KEYS.PRODUTOS, JSON.stringify(produtos));
  }

  public getLogsImportacao(): LogImportacao[] {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS_IMPORTACAO);
    if (!raw) {
      this.saveLogsImportacao(INITIAL_LOGS_IMPORTACAO);
      return INITIAL_LOGS_IMPORTACAO;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_LOGS_IMPORTACAO;
    }
  }

  public saveLogsImportacao(logs: LogImportacao[]): void {
    localStorage.setItem(STORAGE_KEYS.LOGS_IMPORTACAO, JSON.stringify(logs));
  }

  public getLogsSistema(): LogSistema[] {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS_SISTEMA);
    if (!raw) {
      this.saveLogsSistema(INITIAL_LOGS_SISTEMA);
      return INITIAL_LOGS_SISTEMA;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_LOGS_SISTEMA;
    }
  }

  public saveLogsSistema(logs: LogSistema[]): void {
    localStorage.setItem(STORAGE_KEYS.LOGS_SISTEMA, JSON.stringify(logs));
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
      this.saveUsuariosSistema(INITIAL_USUARIOS_SISTEMA);
      return INITIAL_USUARIOS_SISTEMA;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_USUARIOS_SISTEMA;
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

    const eficienciaGlobal =
      ops.length > 0 ? Number((somaEficiencia / ops.length).toFixed(1)) : 95.0;

    // MES OEE Calculation
    // OEE = Disponibilidade (96%) * Desempenho (89%) * Qualidade (98.5%)
    const oeeDisponibilidade = 96.2;
    const oeeDesempenho = Number(((eficienciaGlobal / 100) * 94).toFixed(1));
    const oeeQualidade = 98.8;
    const oeeGeral = Number(
      ((oeeDisponibilidade * oeeDesempenho * oeeQualidade) / 10000).toFixed(1)
    );

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
