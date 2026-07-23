import {
  Cliente,
  ConfiguracoesSistema,
  LogImportacao,
  LogSistema,
  OrdemProducao,
  Pedido,
  Produto,
  UsuarioSistema,
} from '../types';

export class MysqlSyncService {
  private isSyncing = false;

  public async checkStatus() {
    try {
      const res = await fetch('/api/mysql/status');
      if (!res.ok) return { success: false, error: `HTTP ${res.status}` };
      return await res.json();
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }

  public async initTables() {
    try {
      const res = await fetch('/api/mysql/init-tables', { method: 'POST' });
      return await res.json();
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }

  // --- SYNC TO MYSQL ---

  public async syncOpsToMysql(ops: OrdemProducao[]) {
    if (this.isSyncing || !ops || ops.length === 0) return;
    try {
      await fetch('/api/mysql/ops/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ops }),
      });
    } catch (err) {
      console.warn('Erro ao sincronizar OPs no MySQL Hostinger:', err);
    }
  }

  public async syncPedidosToMysql(pedidos: Pedido[]) {
    if (this.isSyncing || !pedidos || pedidos.length === 0) return;
    try {
      await fetch('/api/mysql/pedidos/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pedidos }),
      });
    } catch (err) {
      console.warn('Erro ao sincronizar Pedidos no MySQL Hostinger:', err);
    }
  }

  public async syncClientesToMysql(clientes: Cliente[]) {
    if (this.isSyncing || !clientes || clientes.length === 0) return;
    try {
      await fetch('/api/mysql/clientes/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientes }),
      });
    } catch (err) {
      console.warn('Erro ao sincronizar Clientes no MySQL Hostinger:', err);
    }
  }

  public async syncProdutosToMysql(produtos: Produto[]) {
    if (this.isSyncing || !produtos || produtos.length === 0) return;
    try {
      await fetch('/api/mysql/produtos/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produtos }),
      });
    } catch (err) {
      console.warn('Erro ao sincronizar Produtos no MySQL Hostinger:', err);
    }
  }

  public async syncConfiguracoesToMysql(config: ConfiguracoesSistema) {
    if (this.isSyncing || !config) return;
    try {
      await fetch('/api/mysql/configuracoes/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configuracoes: config }),
      });
    } catch (err) {
      console.warn('Erro ao sincronizar Configurações no MySQL Hostinger:', err);
    }
  }

  public async syncUsuariosSistemaToMysql(usuarios: UsuarioSistema[]) {
    if (this.isSyncing || !usuarios || usuarios.length === 0) return;
    try {
      await fetch('/api/mysql/usuarios-sistema/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarios }),
      });
    } catch (err) {
      console.warn('Erro ao sincronizar Usuários no MySQL Hostinger:', err);
    }
  }

  public async syncLogsImportacaoToMysql(logs: LogImportacao[]) {
    if (this.isSyncing || !logs || logs.length === 0) return;
    try {
      await fetch('/api/mysql/logs-importacao/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs }),
      });
    } catch (err) {
      console.warn('Erro ao sincronizar Logs de Importação no MySQL Hostinger:', err);
    }
  }

  public async syncLogsSistemaToMysql(logs: LogSistema[]) {
    if (this.isSyncing || !logs || logs.length === 0) return;
    try {
      await fetch('/api/mysql/logs-sistema/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs }),
      });
    } catch (err) {
      console.warn('Erro ao sincronizar Logs de Sistema no MySQL Hostinger:', err);
    }
  }

  // --- FETCH FROM MYSQL ---

  public async fetchOps(): Promise<OrdemProducao[]> {
    try {
      const res = await fetch('/api/mysql/ops');
      if (!res.ok) return [];
      const json = await res.json();
      return json.success ? json.data : [];
    } catch {
      return [];
    }
  }

  public async fetchPedidos(): Promise<Pedido[]> {
    try {
      const res = await fetch('/api/mysql/pedidos');
      if (!res.ok) return [];
      const json = await res.json();
      return json.success ? json.data : [];
    } catch {
      return [];
    }
  }

  public async fetchClientes(): Promise<Cliente[]> {
    try {
      const res = await fetch('/api/mysql/clientes');
      if (!res.ok) return [];
      const json = await res.json();
      return json.success ? json.data : [];
    } catch {
      return [];
    }
  }

  public async fetchProdutos(): Promise<Produto[]> {
    try {
      const res = await fetch('/api/mysql/produtos');
      if (!res.ok) return [];
      const json = await res.json();
      return json.success ? json.data : [];
    } catch {
      return [];
    }
  }

  public async fetchConfiguracoes(): Promise<ConfiguracoesSistema | null> {
    try {
      const res = await fetch('/api/mysql/configuracoes');
      if (!res.ok) return null;
      const json = await res.json();
      return json.success ? json.data : null;
    } catch {
      return null;
    }
  }

  public async fetchUsuariosSistema(): Promise<UsuarioSistema[]> {
    try {
      const res = await fetch('/api/mysql/usuarios-sistema');
      if (!res.ok) return [];
      const json = await res.json();
      return json.success ? json.data : [];
    } catch {
      return [];
    }
  }
}

export const mysqlSyncService = new MysqlSyncService();
