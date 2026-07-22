import { Cliente, LogImportacao, LogSistema, OrdemProducao, Pedido, Produto, Usuario, UsuarioSistema } from '../types';

export const INITIAL_USUARIOS_SISTEMA: UsuarioSistema[] = [];

export const INITIAL_USUARIO: Usuario = {
  id: 'usr-001',
  nome: 'Jacques Silva',
  email: 'pcp@virtudebigbags.com.br',
  cargo: 'Gerente de Processos',
  perfil: 'PCP_ADMIN',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
};

export const INITIAL_CLIENTES: Cliente[] = [];

export const INITIAL_PRODUTOS: Produto[] = [];

export const INITIAL_OPS: OrdemProducao[] = [];

export const INITIAL_PEDIDOS: Pedido[] = [];

export const INITIAL_LOGS_IMPORTACAO: LogImportacao[] = [];

export const INITIAL_LOGS_SISTEMA: LogSistema[] = [];
