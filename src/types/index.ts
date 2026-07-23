export type StatusProducao =
  | 'AGUARDANDO'
  | 'CORTE'
  | 'PREPARAÇÃO'
  | 'CONFECÇÃO'
  | 'FINALIZADO'
  | 'ATRASADO';

export type PrioridadeOp = 'BAIXA' | 'MÉDIA' | 'ALTA' | 'URGENTE';

export interface OrdemProducao {
  id: string;
  opNumber: string; // Ex: OP-2026-089
  pedidoNumber: string; // Ex: PED-1045
  cliente: string;
  produto: string; // Ex: Big Bag Travado 90x90x120cm
  modelo: string; // Ex: Saia Superior / Funil Inferior
  quantidade: number;
  quantidadeProduzida: number;
  status: StatusProducao;
  prioridade: PrioridadeOp;
  eficiencia: number; // Ex: 94%
  dataProgramada: string; // YYYY-MM-DD
  dataEntrega: string; // YYYY-MM-DD
  dataInicioReal?: string;
  dataFimReal?: string;
  observacoes?: string;
  capacidadeCargaKg?: number; // Ex: 1000kg, 1500kg
  tecidoGrm?: number; // Gramatura g/m²
  tempoEstimadoHoras?: number;
  alteradoEm: string;
}

export interface Pedido {
  id: string;
  pedidoNumber: string;
  cliente: string;
  dataPedido: string;
  dataPrevisaoEntrega: string;
  status: 'PENDENTE' | 'EM_PRODUCAO' | 'CONCLUIDO' | 'CANCELADO';
  totalItens: number;
  totalProduzido: number;
  ops: string[]; // List of OP IDs
  valorTotal?: number;
}

export interface Cliente {
  id: string;
  nome: string;
  cnpj: string;
  cidadeUF: string;
  contato: string;
  telefone: string;
  email: string;
  pedidosAtivos: number;
  totalBigBagsComprados: number;
  status: 'ATIVO' | 'INATIVO';
}

export interface Produto {
  id: string;
  codigo: string;
  nome: string;
  modelo: string;
  dimensoes: string; // Ex: 90x90x120cm
  capacidadeKg: number;
  gramaturaTecido: number;
  tipoAlca: string; // Ex: 4 Alças de Canto Reforçadas
  tempoPadraoMinutos: number; // Tempo de confecção por unidade
  metaProducaoHora: number;
  estoqueMinimoTecidoMeters?: number;
}

export interface LogImportacao {
  id: string;
  dataHora: string;
  nomeArquivo: string;
  usuario: string;
  registrosLidos: number;
  registrosNovos: number;
  registrosAtualizados: number;
  registrosSemAlteracao: number;
  errosEncontrados: number;
  detalhesErros?: string[];
  status: 'SUCESSO' | 'AVISO' | 'ERRO';
}

export interface LogSistema {
  id: string;
  dataHora: string;
  usuario: string;
  modulo: string;
  acao: string;
  descricao: string;
  ip: string;
  nivel: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
}

export interface IndicadoresKpi {
  pedidosProgramados: number;
  pedidosProduzindo: number;
  pedidosFinalizados: number;
  pedidosPendentes: number;
  pedidosAtrasados: number;
  producaoDiaAtual: number;
  metaDiaAtual: number;
  eficienciaGlobal: number; // %
  quantidadeProduzidaTotal: number;
  clientesAtendidos: number;
  produtosProduzidosDiferentes: number;
  // OEE Components
  oeeDisponibilidade: number;
  oeeDesempenho: number;
  oeeQualidade: number;
  oeeGeral: number;
}

export interface FiltrosProgramacao {
  busca: string;
  status: string;
  cliente: string;
  modelo: string;
  prioridade: string;
  dataInicio: string;
  dataFim: string;
}

export type GrupoUsuario = 'VENDAS' | 'PRODUCAO' | 'ADM' | 'QUALIDADE';
export type RegraAcesso = 'VISUALIZACAO' | 'EDITAR';

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

export interface UsuarioSistema {
  id: string;
  nome: string;
  cargo?: string;
  senha?: string;
  departamento: GrupoUsuario;
  permissao: RegraAcesso;
  politicaAceita: boolean;
  dataCriacao: string;
  status: 'ATIVO' | 'INATIVO';
  modulosPermitidos?: ModuloAtivo[];
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  perfil: 'PCP_ADMIN' | 'OPERADOR' | 'VISUALIZADOR';
  avatar?: string;
  senha?: string;
  departamento?: GrupoUsuario;
  permissao?: RegraAcesso;
  modulosPermitidos?: ModuloAtivo[];
}

export interface ConfiguracoesEmpresa {
  nome: string;
  cnpj: string;
  cidadeUF: string;
  telefone: string;
  email: string;
}

export interface ParametrosIndustriais {
  metaDiariaBags: number;
  eficienciaAlvo: number;
  oeeAlvo: number;
  horasTurno: number;
}

export interface ConfiguracoesSistema {
  empresa: ConfiguracoesEmpresa;
  parametros: ParametrosIndustriais;
  ultimaAtualizacao?: string;
}

