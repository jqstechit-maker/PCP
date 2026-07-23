import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  Cliente,
  LogImportacao,
  LogSistema,
  OrdemProducao,
  Pedido,
  Produto,
} from '../types';

type Listener = () => void;

class FirebaseSyncService {
  private listeners: Set<Listener> = new Set();
  private isSyncingFromRemote = false;

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((fn) => fn());
  }

  // --- Initialize Realtime Listeners ---
  public initRealtimeListeners(
    onOpsChange: (ops: OrdemProducao[]) => void,
    onClientesChange: (clientes: Cliente[]) => void,
    onProdutosChange: (produtos: Produto[]) => void,
    onPedidosChange: (pedidos: Pedido[]) => void,
    onLogsImportacaoChange?: (logs: LogImportacao[]) => void,
    onLogsSistemaChange?: (logs: LogSistema[]) => void
  ) {
    try {
      // 1. Listen to 'ops'
      onSnapshot(collection(db, 'ops'), (snapshot) => {
        if (snapshot.metadata.hasPendingWrites) return; // ignore local echo write
        const ops: OrdemProducao[] = [];
        snapshot.forEach((docSnap) => {
          ops.push(docSnap.data() as OrdemProducao);
        });
        if (ops.length > 0 || snapshot.empty) {
          this.isSyncingFromRemote = true;
          onOpsChange(ops);
          this.isSyncingFromRemote = false;
          this.notifyListeners();
        }
      });

      // 2. Listen to 'clientes'
      onSnapshot(collection(db, 'clientes'), (snapshot) => {
        if (snapshot.metadata.hasPendingWrites) return;
        const clientes: Cliente[] = [];
        snapshot.forEach((docSnap) => {
          clientes.push(docSnap.data() as Cliente);
        });
        if (clientes.length > 0 || snapshot.empty) {
          this.isSyncingFromRemote = true;
          onClientesChange(clientes);
          this.isSyncingFromRemote = false;
          this.notifyListeners();
        }
      });

      // 3. Listen to 'produtos'
      onSnapshot(collection(db, 'produtos'), (snapshot) => {
        if (snapshot.metadata.hasPendingWrites) return;
        const produtos: Produto[] = [];
        snapshot.forEach((docSnap) => {
          produtos.push(docSnap.data() as Produto);
        });
        if (produtos.length > 0 || snapshot.empty) {
          this.isSyncingFromRemote = true;
          onProdutosChange(produtos);
          this.isSyncingFromRemote = false;
          this.notifyListeners();
        }
      });

      // 4. Listen to 'pedidos'
      onSnapshot(collection(db, 'pedidos'), (snapshot) => {
        if (snapshot.metadata.hasPendingWrites) return;
        const pedidos: Pedido[] = [];
        snapshot.forEach((docSnap) => {
          pedidos.push(docSnap.data() as Pedido);
        });
        if (pedidos.length > 0 || snapshot.empty) {
          this.isSyncingFromRemote = true;
          onPedidosChange(pedidos);
          this.isSyncingFromRemote = false;
          this.notifyListeners();
        }
      });

      // 5. Listen to 'logs_importacao'
      if (onLogsImportacaoChange) {
        onSnapshot(collection(db, 'logs_importacao'), (snapshot) => {
          if (snapshot.metadata.hasPendingWrites) return;
          const logs: LogImportacao[] = [];
          snapshot.forEach((docSnap) => {
            logs.push(docSnap.data() as LogImportacao);
          });
          onLogsImportacaoChange(logs);
          this.notifyListeners();
        });
      }

      // 6. Listen to 'logs_sistema'
      if (onLogsSistemaChange) {
        onSnapshot(collection(db, 'logs_sistema'), (snapshot) => {
          if (snapshot.metadata.hasPendingWrites) return;
          const logs: LogSistema[] = [];
          snapshot.forEach((docSnap) => {
            logs.push(docSnap.data() as LogSistema);
          });
          onLogsSistemaChange(logs);
          this.notifyListeners();
        });
      }
    } catch (err) {
      console.warn('Firestore realtime subscription error:', err);
    }
  }

  // --- Push updates to Firestore Cloud ---
  public async syncOpsToCloud(ops: OrdemProducao[]) {
    if (this.isSyncingFromRemote) return;
    try {
      const batch = writeBatch(db);
      // Delete old if needed or overwrite all
      const existing = await getDocs(collection(db, 'ops'));
      existing.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });

      ops.forEach((op) => {
        const ref = doc(db, 'ops', op.id);
        batch.set(ref, op);
      });
      await batch.commit();
    } catch (err) {
      console.error('Error syncing OPs to cloud:', err);
    }
  }

  public async syncClientesToCloud(clientes: Cliente[]) {
    if (this.isSyncingFromRemote) return;
    try {
      const batch = writeBatch(db);
      const existing = await getDocs(collection(db, 'clientes'));
      existing.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });

      clientes.forEach((cli) => {
        const ref = doc(db, 'clientes', cli.id);
        batch.set(ref, cli);
      });
      await batch.commit();
    } catch (err) {
      console.error('Error syncing Clientes to cloud:', err);
    }
  }

  public async syncProdutosToCloud(produtos: Produto[]) {
    if (this.isSyncingFromRemote) return;
    try {
      const batch = writeBatch(db);
      const existing = await getDocs(collection(db, 'produtos'));
      existing.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });

      produtos.forEach((prod) => {
        const ref = doc(db, 'produtos', prod.id);
        batch.set(ref, prod);
      });
      await batch.commit();
    } catch (err) {
      console.error('Error syncing Produtos to cloud:', err);
    }
  }

  public async syncPedidosToCloud(pedidos: Pedido[]) {
    if (this.isSyncingFromRemote) return;
    try {
      const batch = writeBatch(db);
      const existing = await getDocs(collection(db, 'pedidos'));
      existing.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });

      pedidos.forEach((ped) => {
        const ref = doc(db, 'pedidos', ped.id);
        batch.set(ref, ped);
      });
      await batch.commit();
    } catch (err) {
      console.error('Error syncing Pedidos to cloud:', err);
    }
  }

  public async syncLogsImportacaoToCloud(logs: LogImportacao[]) {
    if (this.isSyncingFromRemote) return;
    try {
      const batch = writeBatch(db);
      const existing = await getDocs(collection(db, 'logs_importacao'));
      existing.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });

      logs.forEach((log) => {
        const ref = doc(db, 'logs_importacao', log.id);
        batch.set(ref, log);
      });
      await batch.commit();
    } catch (err) {
      console.error('Error syncing logs importação to cloud:', err);
    }
  }

  public async syncLogsSistemaToCloud(logs: LogSistema[]) {
    if (this.isSyncingFromRemote) return;
    try {
      const batch = writeBatch(db);
      const existing = await getDocs(collection(db, 'logs_sistema'));
      existing.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });

      logs.forEach((log) => {
        const ref = doc(db, 'logs_sistema', log.id);
        batch.set(ref, log);
      });
      await batch.commit();
    } catch (err) {
      console.error('Error syncing logs sistema to cloud:', err);
    }
  }
}

export const firebaseSyncService = new FirebaseSyncService();
