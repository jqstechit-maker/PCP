import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { getPool, initMySQLTables, testConnection } from './src/lib/mysql.js';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  app.use(express.json({ limit: '10mb' }));

  // --- REST API ENDPOINTS ---

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      system: 'PCP Virtude Big Bags - Backend Node.js Engine',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
    });
  });

  // --- MYSQL HOSTINGER API ENDPOINTS ---

  // MySQL Test Connection Endpoint
  app.get('/api/mysql/status', async (_req: Request, res: Response) => {
    const status = await testConnection();
    res.json(status);
  });

  // MySQL Init Tables Endpoint
  app.post('/api/mysql/init-tables', async (_req: Request, res: Response) => {
    const result = await initMySQLTables();
    res.json(result);
  });

  // MySQL OPs GET & SYNC
  app.get('/api/mysql/ops', async (_req: Request, res: Response) => {
    try {
      const pool = getPool();
      const [rows] = await pool.query('SELECT * FROM ops ORDER BY created_at DESC');
      res.json({ success: true, data: rows });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ success: false, error: msg });
    }
  });

  app.post('/api/mysql/ops/sync', async (req: Request, res: Response) => {
    try {
      const { ops } = req.body;
      if (!Array.isArray(ops)) {
        res.status(400).json({ success: false, error: 'Array "ops" é obrigatório.' });
        return;
      }
      await initMySQLTables();
      const pool = getPool();

      for (const op of ops) {
        await pool.query(
          `INSERT INTO ops (
            id, opNumber, pedidoNumber, cliente, produto, modelo, quantidade, 
            quantidadeProduzida, status, prioridade, eficiencia, dataProgramada, 
            dataEntrega, dataInicioReal, dataFimReal, observacoes, capacidadeCargaKg, 
            tecidoGrm, tempoEstimadoHoras, alteradoEm
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE 
            opNumber = VALUES(opNumber),
            pedidoNumber = VALUES(pedidoNumber),
            cliente = VALUES(cliente),
            produto = VALUES(produto),
            modelo = VALUES(modelo),
            quantidade = VALUES(quantidade),
            quantidadeProduzida = VALUES(quantidadeProduzida),
            status = VALUES(status),
            prioridade = VALUES(prioridade),
            eficiencia = VALUES(eficiencia),
            dataProgramada = VALUES(dataProgramada),
            dataEntrega = VALUES(dataEntrega),
            dataInicioReal = VALUES(dataInicioReal),
            dataFimReal = VALUES(dataFimReal),
            observacoes = VALUES(observacoes),
            capacidadeCargaKg = VALUES(capacidadeCargaKg),
            tecidoGrm = VALUES(tecidoGrm),
            tempoEstimadoHoras = VALUES(tempoEstimadoHoras),
            alteradoEm = VALUES(alteradoEm)`,
          [
            op.id,
            op.opNumber || '',
            op.pedidoNumber || '',
            op.cliente || '',
            op.produto || '',
            op.modelo || '',
            Number(op.quantidade || 0),
            Number(op.quantidadeProduzida || 0),
            op.status || 'AGUARDANDO',
            op.prioridade || 'MÉDIA',
            Number(op.eficiencia || 0),
            op.dataProgramada || '',
            op.dataEntrega || '',
            op.dataInicioReal || null,
            op.dataFimReal || null,
            op.observacoes || '',
            Number(op.capacidadeCargaKg || 0),
            Number(op.tecidoGrm || 0),
            Number(op.tempoEstimadoHoras || 0),
            op.alteradoEm || new Date().toISOString(),
          ]
        );
      }

      res.json({ success: true, count: ops.length, message: 'OPs sincronizadas no MySQL Hostinger!' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ success: false, error: msg });
    }
  });

  // MySQL Pedidos GET & SYNC
  app.get('/api/mysql/pedidos', async (_req: Request, res: Response) => {
    try {
      const pool = getPool();
      const [rows] = await pool.query('SELECT * FROM pedidos ORDER BY created_at DESC');
      res.json({ success: true, data: rows });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ success: false, error: msg });
    }
  });

  app.post('/api/mysql/pedidos/sync', async (req: Request, res: Response) => {
    try {
      const { pedidos } = req.body;
      if (!Array.isArray(pedidos)) {
        res.status(400).json({ success: false, error: 'Array "pedidos" é obrigatório.' });
        return;
      }
      await initMySQLTables();
      const pool = getPool();

      for (const ped of pedidos) {
        await pool.query(
          `INSERT INTO pedidos (
            id, pedidoNumber, cliente, dataPedido, dataPrevisaoEntrega, status, totalItens, totalProduzido, ops, valorTotal
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE 
            pedidoNumber = VALUES(pedidoNumber),
            cliente = VALUES(cliente),
            dataPedido = VALUES(dataPedido),
            dataPrevisaoEntrega = VALUES(dataPrevisaoEntrega),
            status = VALUES(status),
            totalItens = VALUES(totalItens),
            totalProduzido = VALUES(totalProduzido),
            ops = VALUES(ops),
            valorTotal = VALUES(valorTotal)`,
          [
            ped.id,
            ped.pedidoNumber || '',
            ped.cliente || '',
            ped.dataPedido || '',
            ped.dataPrevisaoEntrega || '',
            ped.status || 'PENDENTE',
            Number(ped.totalItens || 0),
            Number(ped.totalProduzido || 0),
            JSON.stringify(ped.ops || []),
            Number(ped.valorTotal || 0),
          ]
        );
      }

      res.json({ success: true, count: pedidos.length, message: 'Pedidos sincronizados no MySQL Hostinger!' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ success: false, error: msg });
    }
  });

  // MySQL Clientes GET & SYNC
  app.get('/api/mysql/clientes', async (_req: Request, res: Response) => {
    try {
      const pool = getPool();
      const [rows] = await pool.query('SELECT * FROM clientes ORDER BY created_at DESC');
      res.json({ success: true, data: rows });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ success: false, error: msg });
    }
  });

  app.post('/api/mysql/clientes/sync', async (req: Request, res: Response) => {
    try {
      const { clientes } = req.body;
      if (!Array.isArray(clientes)) {
        res.status(400).json({ success: false, error: 'Array "clientes" é obrigatório.' });
        return;
      }
      await initMySQLTables();
      const pool = getPool();

      for (const cli of clientes) {
        await pool.query(
          `INSERT INTO clientes (
            id, nome, cnpj, cidadeUF, contato, telefone, email, pedidosAtivos, totalBigBagsComprados, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE 
            nome = VALUES(nome),
            cnpj = VALUES(cnpj),
            cidadeUF = VALUES(cidadeUF),
            contato = VALUES(contato),
            telefone = VALUES(telefone),
            email = VALUES(email),
            pedidosAtivos = VALUES(pedidosAtivos),
            totalBigBagsComprados = VALUES(totalBigBagsComprados),
            status = VALUES(status)`,
          [
            cli.id,
            cli.nome || '',
            cli.cnpj || '',
            cli.cidadeUF || '',
            cli.contato || '',
            cli.telefone || '',
            cli.email || '',
            Number(cli.pedidosAtivos || 0),
            Number(cli.totalBigBagsComprados || 0),
            cli.status || 'ATIVO',
          ]
        );
      }

      res.json({ success: true, count: clientes.length, message: 'Clientes sincronizados no MySQL Hostinger!' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ success: false, error: msg });
    }
  });

  // MySQL Produtos GET & SYNC
  app.get('/api/mysql/produtos', async (_req: Request, res: Response) => {
    try {
      const pool = getPool();
      const [rows] = await pool.query('SELECT * FROM produtos ORDER BY created_at DESC');
      res.json({ success: true, data: rows });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ success: false, error: msg });
    }
  });

  app.post('/api/mysql/produtos/sync', async (req: Request, res: Response) => {
    try {
      const { produtos } = req.body;
      if (!Array.isArray(produtos)) {
        res.status(400).json({ success: false, error: 'Array "produtos" é obrigatório.' });
        return;
      }
      await initMySQLTables();
      const pool = getPool();

      for (const prod of produtos) {
        await pool.query(
          `INSERT INTO produtos (
            id, codigo, nome, modelo, dimensoes, capacidadeKg, gramaturaTecido, tipoAlca, tempoPadraoMinutos, metaProducaoHora, estoqueMinimoTecidoMeters
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE 
            codigo = VALUES(codigo),
            nome = VALUES(nome),
            modelo = VALUES(modelo),
            dimensoes = VALUES(dimensoes),
            capacidadeKg = VALUES(capacidadeKg),
            gramaturaTecido = VALUES(gramaturaTecido),
            tipoAlca = VALUES(tipoAlca),
            tempoPadraoMinutos = VALUES(tempoPadraoMinutos),
            metaProducaoHora = VALUES(metaProducaoHora),
            estoqueMinimoTecidoMeters = VALUES(estoqueMinimoTecidoMeters)`,
          [
            prod.id,
            prod.codigo || '',
            prod.nome || '',
            prod.modelo || '',
            prod.dimensoes || '',
            Number(prod.capacidadeKg || 0),
            Number(prod.gramaturaTecido || 0),
            prod.tipoAlca || '',
            Number(prod.tempoPadraoMinutos || 0),
            Number(prod.metaProducaoHora || 0),
            Number(prod.estoqueMinimoTecidoMeters || 0),
          ]
        );
      }

      res.json({ success: true, count: produtos.length, message: 'Produtos sincronizados no MySQL Hostinger!' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ success: false, error: msg });
    }
  });


  // Server metadata endpoint
  app.get('/api/info', (_req: Request, res: Response) => {
    res.json({
      name: "Sistema PCP Virtude Big Bag's - Backend Node.js",
      version: '1.0.0',
      runtime: `Node.js ${process.version}`,
      framework: 'Express + Vite',
      host: '0.0.0.0',
      port: PORT,
      status: 'Ativo e Operacional',
      empresa: "VIRTUDE BIG BAG'S INDÚSTRIA E COMÉRCIO DE EMBALAGENS LTDA",
    });
  });

  // API Route: KPI Status
  app.get('/api/kpis', (_req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        metaDiaAtual: 1000,
        oeeDisponibilidade: 96.2,
        oeeDesempenho: 89.3,
        oeeQualidade: 98.8,
        oeeGeral: 84.8,
        eficienciaGlobal: 95.0,
      },
    });
  });

  // API Route: AI Production Assistant Endpoint (Server-Side Gemini API Proxy)
  app.post('/api/ai/analise-producao', async (req: Request, res: Response) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(400).json({
          success: false,
          error: 'Chave GEMINI_API_KEY não configurada no servidor Node.js.',
        });
        return;
      }

      const { prompt, contexto } = req.body;
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Você é o Assistente Especialista em PCP e OEE da Virtude Big Bags.\nContexto: ${JSON.stringify(contexto || {})}\n\nPergunta do usuário: ${prompt || 'Gere uma análise rápida da produção atual.'}`,
              },
            ],
          },
        ],
      });

      res.json({
        success: true,
        resposta: response.text,
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      res.status(500).json({
        success: false,
        error: errorMsg,
      });
    }
  });

  // --- VITE MIDDLEWARE / STATIC SERVING ---

  if (process.env.NODE_ENV !== 'production') {
    // Development mode: integration with Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: serve static built files from dist
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[PCP Node.js Server] Servidor iniciado com sucesso em http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[PCP Node.js Server] Erro ao iniciar servidor:', err);
  process.exit(1);
});
