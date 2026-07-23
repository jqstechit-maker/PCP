import mysql from 'mysql2/promise';

export function getDbConfig() {
  return {
    host: process.env.MYSQL_HOST || 'sql.hostinger.com',
    user: process.env.MYSQL_USER || 'u609303672_pcp_virtude',
    password: process.env.MYSQL_PASSWORD || 'Virtude@2026',
    database: process.env.MYSQL_DATABASE || 'u609303672_pcp_virtude',
    port: Number(process.env.MYSQL_PORT || 3306),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 8000,
  };
}

let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(getDbConfig());
  }
  return pool;
}

export async function testConnection() {
  try {
    const p = getPool();
    const [rows] = await p.query('SELECT 1 + 1 AS connection_test');
    return {
      success: true,
      message: 'Conexão com MySQL Hostinger estabelecida com sucesso!',
      database: process.env.MYSQL_DATABASE || 'u609303672_pcp_virtude',
      user: process.env.MYSQL_USER || 'u609303672_pcp_virtude',
      host: process.env.MYSQL_HOST || 'sql.hostinger.com',
      result: rows,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: message,
      database: process.env.MYSQL_DATABASE || 'u609303672_pcp_virtude',
      user: process.env.MYSQL_USER || 'u609303672_pcp_virtude',
      host: process.env.MYSQL_HOST || 'sql.hostinger.com',
    };
  }
}

export async function initMySQLTables() {
  try {
    const p = getPool();

    // 1. OPs Table
    await p.query(`
      CREATE TABLE IF NOT EXISTS ops (
        id VARCHAR(128) PRIMARY KEY,
        opNumber VARCHAR(64),
        pedidoNumber VARCHAR(64),
        cliente VARCHAR(255),
        produto VARCHAR(255),
        modelo VARCHAR(255),
        quantidade DOUBLE DEFAULT 0,
        quantidadeProduzida DOUBLE DEFAULT 0,
        status VARCHAR(64),
        prioridade VARCHAR(64),
        eficiencia DOUBLE DEFAULT 0,
        dataProgramada VARCHAR(64),
        dataEntrega VARCHAR(64),
        dataInicioReal VARCHAR(64),
        dataFimReal VARCHAR(64),
        observacoes TEXT,
        capacidadeCargaKg DOUBLE,
        tecidoGrm DOUBLE,
        tempoEstimadoHoras DOUBLE,
        alteradoEm VARCHAR(64),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Pedidos Table
    await p.query(`
      CREATE TABLE IF NOT EXISTS pedidos (
        id VARCHAR(128) PRIMARY KEY,
        pedidoNumber VARCHAR(64),
        cliente VARCHAR(255),
        dataPedido VARCHAR(64),
        dataPrevisaoEntrega VARCHAR(64),
        status VARCHAR(64),
        totalItens INT DEFAULT 0,
        totalProduzido INT DEFAULT 0,
        ops JSON,
        valorTotal DOUBLE DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. Clientes Table
    await p.query(`
      CREATE TABLE IF NOT EXISTS clientes (
        id VARCHAR(128) PRIMARY KEY,
        nome VARCHAR(255),
        cnpj VARCHAR(64),
        cidadeUF VARCHAR(255),
        contato VARCHAR(255),
        telefone VARCHAR(64),
        email VARCHAR(255),
        pedidosAtivos INT DEFAULT 0,
        totalBigBagsComprados INT DEFAULT 0,
        status VARCHAR(64) DEFAULT 'ATIVO',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Produtos Table
    await p.query(`
      CREATE TABLE IF NOT EXISTS produtos (
        id VARCHAR(128) PRIMARY KEY,
        codigo VARCHAR(64),
        nome VARCHAR(255),
        modelo VARCHAR(255),
        dimensoes VARCHAR(128),
        capacidadeKg DOUBLE DEFAULT 0,
        gramaturaTecido DOUBLE DEFAULT 0,
        tipoAlca VARCHAR(128),
        tempoPadraoMinutos DOUBLE DEFAULT 0,
        metaProducaoHora DOUBLE DEFAULT 0,
        estoqueMinimoTecidoMeters DOUBLE DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 5. Logs Importação Table
    await p.query(`
      CREATE TABLE IF NOT EXISTS logs_importacao (
        id VARCHAR(128) PRIMARY KEY,
        dataHora VARCHAR(64),
        nomeArquivo VARCHAR(255),
        usuario VARCHAR(255),
        registrosLidos INT DEFAULT 0,
        registrosNovos INT DEFAULT 0,
        registrosAtualizados INT DEFAULT 0,
        registrosSemAlteracao INT DEFAULT 0,
        errosEncontrados INT DEFAULT 0,
        detalhesErros JSON,
        status VARCHAR(64),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 6. Logs Sistema Table
    await p.query(`
      CREATE TABLE IF NOT EXISTS logs_sistema (
        id VARCHAR(128) PRIMARY KEY,
        dataHora VARCHAR(64),
        usuario VARCHAR(255),
        modulo VARCHAR(128),
        acao VARCHAR(128),
        descricao TEXT,
        ip VARCHAR(64),
        nivel VARCHAR(32),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    return {
      success: true,
      message: 'Tabelas MySQL inicializadas/verificadas com sucesso no banco u609303672_pcp_virtude!',
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: message,
    };
  }
}
