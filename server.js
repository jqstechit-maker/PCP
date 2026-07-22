// Entry point proxy for hosts expecting server.js at root
import('./dist/server.js').catch((error) => {
  console.error('[PCP Server Launcher] Erro ao iniciar o servidor:', error);
  process.exit(1);
});

