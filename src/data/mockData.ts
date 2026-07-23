import { Cliente, ConfiguracoesSistema, LogImportacao, LogSistema, OrdemProducao, Pedido, Produto, Usuario, UsuarioSistema } from '../types';

export const INITIAL_CONFIGURACOES: ConfiguracoesSistema = {
  empresa: {
    nome: "VIRTUDE BIG BAG'S INDÚSTRIA E COMÉRCIO DE EMBALAGENS LTDA",
    cnpj: '18.920.345/0001-88',
    cidadeUF: 'Americana / SP',
    telefone: '(19) 3465-9000',
    email: 'contato@virtudebigbags.com.br',
  },
  parametros: {
    metaDiariaBags: 1000,
    eficienciaAlvo: 95.0,
    oeeAlvo: 85.0,
    horasTurno: 9,
  },
  ultimaAtualizacao: new Date().toISOString(),
};

export const INITIAL_USUARIOS_SISTEMA: UsuarioSistema[] = [];

export const INITIAL_USUARIO: Usuario = {
  id: 'usr-001',
  nome: 'Jacques Silva',
  email: 'pcp@virtudebigbags.com.br',
  cargo: 'Gerente de Processos',
  perfil: 'PCP_ADMIN',
  senha: 'Virtude@2026',
  departamento: 'ADM',
  permissao: 'EDITAR',
  modulosPermitidos: [
    'dashboard',
    'programacao',
    'producao',
    'pedidos',
    'clientes',
    'produtos',
    'importador',
    'relatorios',
    'configuracoes',
    'logs',
  ],
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
};


export const INITIAL_CLIENTES: Cliente[] = [];

export const INITIAL_PRODUTOS: Produto[] = [];

export const INITIAL_OPS: OrdemProducao[] = [];

export const INITIAL_PEDIDOS: Pedido[] = [];

export const INITIAL_LOGS_IMPORTACAO: LogImportacao[] = [];

export const INITIAL_LOGS_SISTEMA: LogSistema[] = [];
