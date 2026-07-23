import React, { useEffect, useState } from 'react';
import { LoginScreen } from './components/auth/LoginScreen';
import { LoginModal } from './components/auth/LoginModal';
import { ClientesView } from './components/clientes/ClientesView';
import { ConfiguracoesView } from './components/configuracoes/ConfiguracoesView';
import { DashboardView } from './components/dashboard/DashboardView';
import { ImportadorExcelView } from './components/importador/ImportadorExcelView';
import { Header } from './components/layout/Header';
import { ModuloAtivo, Sidebar } from './components/layout/Sidebar';
import { LogsView } from './components/logs/LogsView';
import { PedidosView } from './components/pedidos/PedidosView';
import { ProducaoKanbanView } from './components/producao/ProducaoKanbanView';
import { ProdutosView } from './components/produtos/ProdutosView';
import { ProgramacaoView } from './components/programacao/ProgramacaoView';
import { RelatoriosView } from './components/relatorios/RelatoriosView';
import { storageService } from './services/storageService';
import { StatusProducao, Usuario } from './types';

export default function App() {
  const [usuarioSessao, setUsuarioSessao] = useState<Usuario | null>(() =>
    storageService.getUsuarioSessao()
  );
  const [moduloAtivo, setModuloAtivo] = useState<ModuloAtivo>('dashboard');
  const [sidebarRecolhida, setSidebarRecolhida] = useState(false);
  const [tema, setTema] = useState<'dark' | 'light'>(() => storageService.getTema());
  const [usuario, setUsuario] = useState<Usuario>(
    () => usuarioSessao || storageService.getUsuario()
  );
  const [buscaGlobal, setBuscaGlobal] = useState('');
  const [modalPerfilAberto, setModalPerfilAberto] = useState(false);

  // Sync state on remote real-time updates
  useEffect(() => {
    const handleSync = () => {
      const sessaoAtual = storageService.getUsuarioSessao();
      if (sessaoAtual) {
        setUsuarioSessao(sessaoAtual);
        setUsuario(sessaoAtual);
      }
    };
    window.addEventListener('virtude_data_synced', handleSync);
    return () => window.removeEventListener('virtude_data_synced', handleSync);
  }, []);

  // Sync theme with DOM root class
  useEffect(() => {
    storageService.saveTema(tema);
  }, [tema]);

  const handleAlternarTema = () => {
    setTema((t) => (t === 'dark' ? 'light' : 'dark'));
  };

  const handleAvancarStatusOp = (opId: string, novoStatus: StatusProducao) => {
    storageService.atualizarStatusOp(opId, novoStatus);
  };

  const handleLogout = () => {
    storageService.fazerLogout();
    setUsuarioSessao(null);
  };

  // Login Screen Gate
  if (!usuarioSessao) {
    return (
      <LoginScreen
        tema={tema}
        onLoginSucesso={(usr) => {
          setUsuarioSessao(usr);
          setUsuario(usr);
        }}
      />
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        tema === 'dark'
          ? 'bg-slate-950 text-slate-100'
          : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* Top Header */}
      <Header
        usuario={usuario}
        tema={tema}
        onAlternarTema={handleAlternarTema}
        onAbrirImportador={() => setModuloAtivo('importador')}
        onAbrirPerfil={() => setModalPerfilAberto(true)}
        onLogout={handleLogout}
        buscaGlobal={buscaGlobal}
        onBuscaChange={(val) => {
          setBuscaGlobal(val);
          if (val && moduloAtivo !== 'programacao') {
            setModuloAtivo('programacao');
          }
        }}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          moduloAtivo={moduloAtivo}
          onSelecionarModulo={(m) => setModuloAtivo(m)}
          recolhido={sidebarRecolhida}
          onAlternarRecolhido={() => setSidebarRecolhida(!sidebarRecolhida)}
        />

        {/* Main Content Area */}
        <main
          className={`flex-1 overflow-y-auto p-4 md:p-6 transition-colors ${
            tema === 'light' ? 'bg-[#f8fafc] text-slate-800' : 'bg-slate-950 text-slate-100'
          }`}
        >
          <div className="max-w-7xl mx-auto space-y-6">
            {moduloAtivo === 'dashboard' && (
              <DashboardView
                onNavegarProgramacao={() => setModuloAtivo('programacao')}
                onAvancarStatusOp={handleAvancarStatusOp}
              />
            )}

            {moduloAtivo === 'programacao' && (
              <ProgramacaoView
                buscaGlobal={buscaGlobal}
                onAbrirImportador={() => setModuloAtivo('importador')}
              />
            )}

            {moduloAtivo === 'producao' && (
              <ProducaoKanbanView onAvancarStatusOp={handleAvancarStatusOp} />
            )}

            {moduloAtivo === 'pedidos' && <PedidosView />}

            {moduloAtivo === 'clientes' && <ClientesView />}

            {moduloAtivo === 'produtos' && <ProdutosView />}

            {moduloAtivo === 'importador' && (
              <ImportadorExcelView
                onSucessoImportacao={() => {
                  setModuloAtivo('programacao');
                }}
              />
            )}

            {moduloAtivo === 'relatorios' && <RelatoriosView />}

            {moduloAtivo === 'logs' && <LogsView />}

            {moduloAtivo === 'configuracoes' && (
              <ConfiguracoesView />
            )}
          </div>
        </main>
      </div>

      {/* User Profile / Password Modal */}
      {modalPerfilAberto && (
        <LoginModal
          usuarioAtual={usuario}
          onFechar={() => setModalPerfilAberto(false)}
          onAtualizarUsuario={(u) => {
            setUsuario(u);
            setUsuarioSessao(u);
            storageService.saveUsuarioSessao(u);
          }}
        />
      )}
    </div>
  );
}

