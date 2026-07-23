import { useEffect, useState } from 'react';
import { storageService } from '../services/storageService';
import { Cliente, LogImportacao, LogSistema, OrdemProducao, Pedido, Produto } from '../types';

export function useStorageData() {
  const [ops, setOps] = useState<OrdemProducao[]>(() => storageService.getOps());
  const [clientes, setClientes] = useState<Cliente[]>(() => storageService.getClientes());
  const [produtos, setProdutos] = useState<Produto[]>(() => storageService.getProdutos());
  const [pedidos, setPedidos] = useState<Pedido[]>(() => storageService.getPedidos());
  const [logsImportacao, setLogsImportacao] = useState<LogImportacao[]>(() =>
    storageService.getLogsImportacao()
  );
  const [logsSistema, setLogsSistema] = useState<LogSistema[]>(() =>
    storageService.getLogsSistema()
  );

  const refreshData = () => {
    setOps(storageService.getOps());
    setClientes(storageService.getClientes());
    setProdutos(storageService.getProdutos());
    setPedidos(storageService.getPedidos());
    setLogsImportacao(storageService.getLogsImportacao());
    setLogsSistema(storageService.getLogsSistema());
  };

  useEffect(() => {
    const handleStorageChange = () => {
      refreshData();
    };

    window.addEventListener('virtude_data_synced', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('virtude_data_synced', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return {
    ops,
    clientes,
    produtos,
    pedidos,
    logsImportacao,
    logsSistema,
    refreshData,
  };
}
