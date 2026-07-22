// Entry point proxy for hosts expecting server.js at root
try {
  require('./dist/server.js');
} catch (err) {
  console.error('[PCP Server Launcher] Não foi possível carregar ./dist/server.js. Certifique-se de executar "npm run build".', err);
  process.exit(1);
}
