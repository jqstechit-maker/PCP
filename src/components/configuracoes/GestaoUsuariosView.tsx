import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Lock,
  Plus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import React, { useState } from 'react';
import { storageService } from '../../services/storageService';
import { GrupoUsuario, RegraAcesso, UsuarioSistema } from '../../types';

export const GestaoUsuariosView: React.FC = () => {
  const [usuarios, setUsuarios] = useState<UsuarioSistema[]>(() =>
    storageService.getUsuariosSistema()
  );

  // Form state
  const [nome, setNome] = useState('');
  const [cargo, setCargo] = useState('');
  const [senha, setSenha] = useState('');
  const [departamento, setDepartamento] = useState<GrupoUsuario>('PRODUCAO');
  const [permissao, setPermissao] = useState<RegraAcesso>('EDITAR');
  const [politicaAceita, setPoliticaAceita] = useState(false);

  // UI state
  const [mostrarModalPolitica, setMostrarModalPolitica] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');
  const [filtroDepto, setFiltroDepto] = useState<string>('TODOS');

  const handleCriarUsuario = (e: React.FormEvent) => {
    e.preventDefault();
    setMensagemErro('');
    setMensagemSucesso('');

    if (!nome.trim()) {
      setMensagemErro('Por favor, informe o Nome Completo do usuário.');
      return;
    }

    if (!senha.trim() || senha.length < 4) {
      setMensagemErro('A senha deve conter no mínimo 4 caracteres.');
      return;
    }

    if (!politicaAceita) {
      setMensagemErro('É obrigatório dar o aceite na Política de Uso do Sistema para criar o login.');
      return;
    }

    const novoUsuario: UsuarioSistema = {
      id: `usys-${Date.now()}`,
      nome: nome.trim(),
      cargo: cargo.trim() || 'Operador PCP',
      departamento,
      permissao,
      politicaAceita: true,
      dataCriacao: new Date().toISOString().split('T')[0],
      status: 'ATIVO',
    };

    const listaAtualizada = [novoUsuario, ...usuarios];
    setUsuarios(listaAtualizada);
    storageService.saveUsuariosSistema(listaAtualizada);

    // Registra log do sistema
    storageService.addLogSistema(
      'CONFIGURAÇÕES',
      'CRIACAO_USUARIO',
      `Novo usuário ${novoUsuario.nome} cadastrado para o dpto ${novoUsuario.departamento} com permissão ${novoUsuario.permissao}.`,
      'SUCCESS'
    );

    // Limpa o formulário
    setNome('');
    setCargo('');
    setSenha('');
    setPoliticaAceita(false);
    setMensagemSucesso(`Usuário "${novoUsuario.nome}" criado com sucesso! Login liberado.`);

    setTimeout(() => setMensagemSucesso(''), 4000);
  };

  const handleAlternarPermissao = (id: string) => {
    const listaAtualizada = usuarios.map((u) => {
      if (u.id === id) {
        const novaPermissao: RegraAcesso =
          u.permissao === 'EDITAR' ? 'VISUALIZACAO' : 'EDITAR';
        return { ...u, permissao: novaPermissao };
      }
      return u;
    });

    setUsuarios(listaAtualizada);
    storageService.saveUsuariosSistema(listaAtualizada);
  };

  const handleExcluirUsuario = (id: string, nomeUsuario: string) => {
    if (confirm(`Tem certeza que deseja remover o login de "${nomeUsuario}"?`)) {
      const listaAtualizada = usuarios.filter((u) => u.id !== id);
      setUsuarios(listaAtualizada);
      storageService.saveUsuariosSistema(listaAtualizada);

      storageService.addLogSistema(
        'CONFIGURAÇÕES',
        'EXCLUSAO_USUARIO',
        `Usuário ${nomeUsuario} teve seu acesso revogado e removido do sistema.`,
        'WARNING'
      );
    }
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    if (filtroDepto !== 'TODOS' && u.departamento !== filtroDepto) return false;
    return true;
  });

  const renderBadgeDepto = (depto: GrupoUsuario) => {
    switch (depto) {
      case 'VENDAS':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
            VENDAS
          </span>
        );
      case 'PRODUCAO':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800">
            PRODUÇÃO
          </span>
        );
      case 'ADM':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800">
            ADM
          </span>
        );
      case 'QUALIDADE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
            QUALIDADE
          </span>
        );
    }
  };

  const renderBadgePermissao = (permissao: RegraAcesso) => {
    if (permissao === 'EDITAR') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 flex items-center space-x-1 inline-flex">
          <ShieldCheck className="w-3 h-3" />
          <span>Editar</span>
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 flex items-center space-x-1 inline-flex">
        <Shield className="w-3 h-3" />
        <span>Só Visualização</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs flex items-center space-x-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-blue-600 dark:text-blue-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Total de Usuários</p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{usuarios.length} Cadastrados</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs flex items-center space-x-3">
          <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-lg text-amber-600 dark:text-amber-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Permissão Editar</p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {usuarios.filter((u) => u.permissao === 'EDITAR').length} Operadores
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs flex items-center space-x-3">
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Só Visualização</p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {usuarios.filter((u) => u.permissao === 'VISUALIZACAO').length} Usuários
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs flex items-center space-x-3">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Política Aceita</p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">100% Conforme</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form: Cadastrar Novo Usuário */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <UserPlus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-wide">
              Criar Login de Usuário
            </h3>
          </div>

          {mensagemErro && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/80 dark:border-red-800 dark:text-red-300 rounded-lg text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{mensagemErro}</span>
            </div>
          )}

          {mensagemSucesso && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 dark:bg-emerald-950/80 dark:border-emerald-800 dark:text-emerald-300 rounded-lg text-xs font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{mensagemSucesso}</span>
            </div>
          )}

          <form onSubmit={handleCriarUsuario} className="space-y-4 text-xs">
            {/* Campo Nome */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                Nome do Usuário:
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: João da Silva"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            {/* Campo Cargo */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                Cargo / Função:
              </label>
              <input
                type="text"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                placeholder="Ex: Operador de PCP, Gerente, Analista"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            {/* Campo Senha */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Senha de Acesso:</span>
              </label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            {/* Campo Departamento / Grupo */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                Departamento (Grupo):
              </label>
              <select
                value={departamento}
                onChange={(e) => setDepartamento(e.target.value as GrupoUsuario)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-semibold"
              >
                <option value="PRODUCAO">Produção</option>
                <option value="VENDAS">Vendas</option>
                <option value="ADM">ADM (Administração)</option>
                <option value="QUALIDADE">Qualidade</option>
              </select>
            </div>

            {/* Campo Regras de Acesso */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                Regra de Acesso:
              </label>
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <label
                  className={`flex items-center justify-center space-x-1.5 p-2 rounded-lg border cursor-pointer text-xs font-bold transition-all ${
                    permissao === 'VISUALIZACAO'
                      ? 'bg-slate-100 border-slate-400 text-slate-800 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="permissao"
                    value="VISUALIZACAO"
                    checked={permissao === 'VISUALIZACAO'}
                    onChange={() => setPermissao('VISUALIZACAO')}
                    className="sr-only"
                  />
                  <Shield className="w-3.5 h-3.5" />
                  <span>Só Visualização</span>
                </label>

                <label
                  className={`flex items-center justify-center space-x-1.5 p-2 rounded-lg border cursor-pointer text-xs font-bold transition-all ${
                    permissao === 'EDITAR'
                      ? 'bg-blue-50 border-blue-400 text-blue-700 dark:bg-blue-950 dark:border-blue-700 dark:text-blue-300 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="permissao"
                    value="EDITAR"
                    checked={permissao === 'EDITAR'}
                    onChange={() => setPermissao('EDITAR')}
                    className="sr-only"
                  />
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </label>
              </div>
            </div>

            {/* Checkbox Política de Uso */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2">
              <label className="flex items-start space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={politicaAceita}
                  onChange={(e) => setPoliticaAceita(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-[11px] text-slate-600 dark:text-slate-300 leading-tight">
                  Concordo com a <strong>Política de Uso e Segurança</strong> de Dados PCP Virtude.
                </span>
              </label>

              <button
                type="button"
                onClick={() => setMostrarModalPolitica(true)}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1 font-medium"
              >
                <FileText className="w-3 h-3" />
                <span>Ler Política de Uso na íntegra</span>
              </button>
            </div>

            {/* Botão de Envio */}
            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Login</span>
            </button>
          </form>
        </div>

        {/* User List Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-wide">
                Usuários Cadastrados por Departamento
              </h3>
            </div>

            {/* Department Filter */}
            <select
              value={filtroDepto}
              onChange={(e) => setFiltroDepto(e.target.value)}
              className="px-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="TODOS">Todos os Grupos</option>
              <option value="PRODUCAO">Produção</option>
              <option value="VENDAS">Vendas</option>
              <option value="ADM">ADM</option>
              <option value="QUALIDADE">Qualidade</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wide">
                  <th className="p-3">Nome</th>
                  <th className="p-3">Grupo / Depto</th>
                  <th className="p-3">Regra de Acesso</th>
                  <th className="p-3 text-center">Política</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {usuariosFiltrados.length > 0 ? (
                  usuariosFiltrados.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors text-slate-700 dark:text-slate-300"
                    >
                      <td className="p-3">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {u.nome}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                          {u.cargo || 'Operador PCP'}
                        </div>
                      </td>

                      <td className="p-3">{renderBadgeDepto(u.departamento)}</td>

                      <td className="p-3">{renderBadgePermissao(u.permissao)}</td>

                      <td className="p-3 text-center">
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Aceito</span>
                        </span>
                      </td>

                      <td className="p-3 text-right space-x-1">
                        <button
                          onClick={() => handleAlternarPermissao(u.id)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-[11px] font-medium transition-colors"
                          title="Alternar entre Editar e Só Visualização"
                        >
                          Trocar Regra
                        </button>

                        <button
                          onClick={() => handleExcluirUsuario(u.id, u.nome)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors"
                          title="Remover Login"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 text-xs">
                      Nenhum usuário encontrado para este grupo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Guidelines Box */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 text-xs">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Resumo das Regras de Acesso por Grupo</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400">
              <div className="p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg">
                <strong className="text-blue-600 dark:text-blue-400">Vendas:</strong> Acesso aos pedidos de clientes e acompanhamento de entrega.
              </div>
              <div className="p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg">
                <strong className="text-amber-600 dark:text-amber-400">Produção:</strong> Atualização de progresso das OPs (corte, confecção, finalização).
              </div>
              <div className="p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg">
                <strong className="text-purple-600 dark:text-purple-400">ADM:</strong> Acesso total às configurações, importação Excel, exportação Hostinger.
              </div>
              <div className="p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg">
                <strong className="text-emerald-600 dark:text-emerald-400">Qualidade:</strong> Inspeção de lotes, apontamento de defeitos e liberação de Big Bags.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Política de Uso */}
      {mostrarModalPolitica && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-xl w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                <FileText className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Política de Uso e Confidencialidade - Virtude Big Bag's
                </h3>
              </div>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <p className="font-semibold text-slate-800 dark:text-slate-100">
                TERMOS DE USO E SEGURANÇA DA INFORMAÇÃO INDUSTRIAL PCP / MES
              </p>

              <ol className="list-decimal pl-4 space-y-2">
                <li>
                  <strong>Confidencialidade das Ordens de Produção:</strong> Toda e qualquer informação contida nas OPs, especificações técnicas de Big Bags, desenhos de modelos e lista de clientes pertence exclusivamente à Virtude Big Bag's Indústria e Comércio.
                </li>
                <li>
                  <strong>Uso Pessoal e Intransferível das Credenciais:</strong> Cada login cadastrado é de responsabilidade individual. É proibido o compartilhamento de senhas entre colaboradores.
                </li>
                <li>
                  <strong>Audit e Logs de Alterações:</strong> Todas as criações, modificações de status de produção, importações de planilhas e edições de OPs são registradas na tabela de auditoria com identificação do usuário e data/hora.
                </li>
                <li>
                  <strong>Níveis de Permissão (Visualização / Editar):</strong>
                  <ul className="list-disc pl-4 mt-1 space-y-1">
                    <li>
                      <em>Só Visualização:</em> Permite apenas a consulta de dashboards, OPs e relatórios.
                    </li>
                    <li>
                      <em>Editar:</em> Permite alteração de status, alteração de dados de produção e adição de apontamentos.
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>Responsabilidade Operacional:</strong> Os apontamentos efetuados pelos operadores da Produção e Qualidade refletem diretamente no OEE e nos indicadores de fábrica.
                </li>
              </ol>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end">
              <button
                onClick={() => setMostrarModalPolitica(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors"
              >
                Compreendido e Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
