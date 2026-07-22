import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  app.use(express.json());

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
    app.use(express.static("dist"));
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
