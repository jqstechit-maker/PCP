import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
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
    onLogsSistemaChange?: (logs: LogSistema[]) => void,
    onConfiguracoesChange?: (config: ConfiguracoesSistema) => void,
    onUsuariosSistemaChange?: (usuarios: UsuarioSistema[]) => void
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

      // 7. Listen to 'configuracoes'
      if (onConfiguracoesChange) {
        onSnapshot(doc(db, 'configuracoes', 'geral'), (docSnap) => {
          if (docSnap.exists() && !docSnap.metadata.hasPendingWrites) {
            const data = docSnap.data() as ConfiguracoesSistema;
            this.isSyncingFromRemote = true;
            onConfiguracoesChange(data);
            this.isSyncingFromRemote = false;
            this.notifyListeners();
          }
        });
      }

      // 8. Listen to 'usuarios_sistema'
      if (onUsuariosSistemaChange) {
        onSnapshot(collection(db, 'usuarios_sistema'), (snapshot) => {
          if (snapshot.metadata.hasPendingWrites) return;
          const usuarios: UsuarioSistema[] = [];
          snapshot.forEach((docSnap) => {
            usuarios.push(docSnap.data() as UsuarioSistema);
          });
          if (usuarios.length > 0 || snapshot.empty) {
            this.isSyncingFromRemote = true;
            onUsuariosSistemaChange(usuarios);
            this.isSyncingFromRemote = false;
            this.notifyListeners();
          }
        });
      }
    } catch (err) {
      console.warn('Firestore realtime subscription error:', err);
    }
  }

  // --- Push updates to Firestore Cloud ---
  private async executeChunkedSync<T extends { id: string }>(
    collectionName: string,
    items: T[]
  ) {
    if (this.isSyncingFromRemote) return;
    try {
      const colRef = collection(db, collectionName);
      const existing = await getDocs(colRef);
      const existingIds = new Set(existing.docs.map((d) => d.id));
      const currentIds = new Set(items.map((i) => i.id));

      const ops: Array<(batch: any) => void> = [];

      // Delete items no longer present
      existing.docs.forEach((docSnap) => {
        if (!currentIds.has(docSnap.id)) {
          ops.push((b) => b.delete(docSnap.ref));
        }
      });

      // Upsert current items
      items.forEach((item) => {
        const ref = doc(db, collectionName, item.id);
        ops.push((b) => b.set(ref, item));
      });

      // Execute in chunks of 350 operations
      const CHUNK_SIZE = 350;
      for (let i = 0; i < ops.length; i += CHUNK_SIZE) {
        const chunk = ops.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);
        chunk.forEach((opFn) => opFn(batch));
        await batch.commit();
      }
    } catch (err) {
      console.error(`Error syncing ${collectionName} to cloud:`, err);
    }
  }

  public async syncOpsToCloud(ops: OrdemProducao[]) {
    await this.executeChunkedSync('ops', ops);
  }

  public async syncClientesToCloud(clientes: Cliente[]) {
    await this.executeChunkedSync('clientes', clientes);
  }

  public async syncProdutosToCloud(produtos: Produto[]) {
    await this.executeChunkedSync('produtos', produtos);
  }

  public async syncPedidosToCloud(pedidos: Pedido[]) {
    await this.executeChunkedSync('pedidos', pedidos);
  }

  public async syncConfiguracoesToCloud(config: ConfiguracoesSistema) {
    if (this.isSyncingFromRemote) return;
    try {
      await setDoc(doc(db, 'configuracoes', 'geral'), config);
    } catch (err) {
      console.error('Error syncing Configuracoes to cloud:', err);
    }
  }

  public async syncUsuariosSistemaToCloud(usuarios: UsuarioSistema[]) {
    await this.executeChunkedSync('usuarios_sistema', usuarios);
  }

  public async syncLogsImportacaoToCloud(logs: LogImportacao[]) {
    await this.executeChunkedSync('logs_importacao', logs);
  }

  public async syncLogsSistemaToCloud(logs: LogSistema[]) {
    await this.executeChunkedSync('logs_sistema', logs);
  }
}

export const firebaseSyncService = new FirebaseSyncService();

