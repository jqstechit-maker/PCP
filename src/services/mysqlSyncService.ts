import { Cliente, OrdemProducao, Pedido, Produto } from '../types';

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
}

export const mysqlSyncService = new MysqlSyncService();
