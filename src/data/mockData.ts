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

export const INITIAL_CLIENTES: Cliente[] = [
  {
    id: 'cli-1',
    nome: 'Agroquímica do Brasil S.A.',
    cnpj: '12.345.678/0001-90',
    cidadeUF: 'Ribeirão Preto / SP',
    contato: 'Roberto Silveira',
    telefone: '(16) 3988-1200',
    email: 'compras@agroquimicabr.com.br',
    pedidosAtivos: 3,
    totalBigBagsComprados: 14500,
    status: 'ATIVO',
  },
  {
    id: 'cli-2',
    nome: 'Fertilizantes Safra Forte Ltda',
    cnpj: '98.765.432/0001-10',
    cidadeUF: 'Uberaba / MG',
    contato: 'Mariana Duarte',
    telefone: '(34) 3321-9080',
    email: 'marianad@safraforte.com.br',
    pedidosAtivos: 2,
    totalBigBagsComprados: 8900,
    status: 'ATIVO',
  },
  {
    id: 'cli-3',
    nome: 'Mineração Vale Dourado S/A',
    cnpj: '45.123.890/0001-55',
    cidadeUF: 'Belo Horizonte / MG',
    contato: 'Fernando Alencar',
    telefone: '(31) 2555-8900',
    email: 'suprimentos@valedourado.com.br',
    pedidosAtivos: 4,
    totalBigBagsComprados: 22400,
    status: 'ATIVO',
  },
  {
    id: 'cli-4',
    nome: 'Sementes Santa Clara Ind. e Com.',
    cnpj: '33.444.555/0001-22',
    cidadeUF: 'Cascavel / PR',
    contato: 'Luciana Martins',
    telefone: '(45) 3220-4411',
    email: 'pcp@sementessantaclara.com.br',
    pedidosAtivos: 1,
    totalBigBagsComprados: 6200,
    status: 'ATIVO',
  },
  {
    id: 'cli-5',
    nome: 'Cerealista Planalto Alimentos',
    cnpj: '77.888.999/0001-33',
    cidadeUF: 'Passo Fundo / RS',
    contato: 'Julio Cesar',
    telefone: '(54) 3311-7788',
    email: 'julio@planaltoalimentos.com.br',
    pedidosAtivos: 2,
    totalBigBagsComprados: 11300,
    status: 'ATIVO',
  },
];

export const INITIAL_PRODUTOS: Produto[] = [
  {
    id: 'prod-1',
    codigo: 'BB-STD-9090120',
    nome: 'Big Bag Standard 4 Alças',
    modelo: 'Saia Superior / Fundo Fechado',
    dimensoes: '90 x 90 x 120 cm',
    capacidadeKg: 1000,
    gramaturaTecido: 160,
    tipoAlca: '4 Alças de Canto 30cm',
    tempoPadraoMinutos: 12,
    metaProducaoHora: 30,
  },
  {
    id: 'prod-2',
    codigo: 'BB-TRV-9595140',
    nome: 'Big Bag Travado Q-Bag (Especial Anti-Abulamento)',
    modelo: 'Válvula Carga / Válvula Descarga',
    dimensoes: '95 x 95 x 140 cm',
    capacidadeKg: 1250,
    gramaturaTecido: 190,
    tipoAlca: '4 Alças Cross-Corner Reforçadas',
    tempoPadraoMinutos: 18,
    metaProducaoHora: 20,
  },
  {
    id: 'prod-3',
    codigo: 'BB-SAN-9090150',
    nome: 'Big Bag Sanfonado Higiênico',
    modelo: 'Saia Total / Funil Cônico',
    dimensoes: '90 x 90 x 150 cm',
    capacidadeKg: 1500,
    gramaturaTecido: 220,
    tipoAlca: '4 Alças Estivadas 40cm',
    tempoPadraoMinutos: 22,
    metaProducaoHora: 16,
  },
  {
    id: 'prod-4',
    codigo: 'BB-MIN-1010100',
    nome: 'Big Bag Carga Pesada Mineração',
    modelo: 'Abertura Total / Fundo Fechado Duplo',
    dimensoes: '100 x 100 x 100 cm',
    capacidadeKg: 2000,
    gramaturaTecido: 240,
    tipoAlca: '4 Alças Orelha de Elevação 50cm',
    tempoPadraoMinutos: 25,
    metaProducaoHora: 14,
  },
  {
    id: 'prod-5',
    codigo: 'BB-ALC-8585110',
    nome: 'Big Bag Alça Trava Reforçada',
    modelo: 'Valvulado com Lamination Impermeável',
    dimensoes: '85 x 85 x 110 cm',
    capacidadeKg: 1000,
    gramaturaTecido: 180,
    tipoAlca: '2 Alças Túnel com Trava de Segurança',
    tempoPadraoMinutos: 15,
    metaProducaoHora: 24,
  },
];

export const INITIAL_OPS: OrdemProducao[] = [];

export const INITIAL_PEDIDOS: Pedido[] = [];

export const INITIAL_LOGS_IMPORTACAO: LogImportacao[] = [];

export const INITIAL_LOGS_SISTEMA: LogSistema[] = [];
