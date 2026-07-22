import * as XLSX from 'xlsx';
import { LogImportacao, OrdemProducao, PrioridadeOp, StatusProducao } from '../types';
import { storageService } from './storageService';

export interface ResultadoImportacaoExcel {
  sucesso: boolean;
  mensagem: string;
  log: LogImportacao;
  opsProcessadas: OrdemProducao[];
}

class ExcelService {
  /**
   * Generates a pre-formatted PCP Excel spreadsheet template for Virtude Big Bags
   */
  public gerarPlanilhaModeloPCP(): void {
    const header = [
      'OP',
      'PEDIDO',
      'CLIENTE',
      'PRODUTO',
      'MODELO',
      'QUANTIDADE',
      'QTD_PRODUZIDA',
      'STATUS',
      'PRIORIDADE',
      'EFICIENCIA_%',
      'DATA_PROGRAMADA',
      'DATA_ENTREGA',
      'CAPACIDADE_KG',
      'GRAMATURA_GRM',
      'OBSERVACOES',
    ];

    const exData = [
      header,
      [
        'OP-2026-095',
        'PED-1049',
        'Agroquímica do Brasil S.A.',
        'Big Bag Standard 4 Alças',
        'Saia Superior / Fundo Fechado',
        1500,
        0,
        'AGUARDANDO',
        'ALTA',
        100.0,
        '2026-07-25',
        '2026-08-01',
        1000,
        160,
        'Pedido de alta prioridade. Bobinas de Ráfia liberadas.',
      ],
      [
        'OP-2026-096',
        'PED-1050',
        'Fertilizantes Safra Forte Ltda',
        'Big Bag Travado Q-Bag (Especial Anti-Abulamento)',
        'Válvula Carga / Válvula Descarga',
        600,
        150,
        'CORTE',
        'URGENTE',
        93.5,
        '2026-07-22',
        '2026-07-27',
        1250,
        190,
        'Utilizar linha de costura em poliéster de alta tenacidade.',
      ],
      [
        'OP-2026-097',
        'PED-1051',
        'Mineração Vale Dourado S/A',
        'Big Bag Carga Pesada Mineração',
        'Abertura Total / Fundo Fechado Duplo',
        2000,
        500,
        'PREPARAÇÃO',
        'MÉDIA',
        90.0,
        '2026-07-23',
        '2026-08-05',
        2000,
        240,
        'Inspecionar alças estivadas com dinamômetro.',
      ],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(exData);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 15 }, // OP
      { wch: 12 }, // Pedido
      { wch: 30 }, // Cliente
      { wch: 35 }, // Produto
      { wch: 32 }, // Modelo
      { wch: 14 }, // Qtd
      { wch: 16 }, // Qtd Prod
      { wch: 14 }, // Status
      { wch: 12 }, // Prioridade
      { wch: 14 }, // Eficiencia
      { wch: 16 }, // Data Prog
      { wch: 16 }, // Data Ent
      { wch: 16 }, // Carga
      { wch: 16 }, // Gram
      { wch: 45 }, // Obs
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Programação PCP');

    XLSX.writeFile(workbook, 'Modelo_Programacao_Virtude_BigBags.xlsx');
  }

  /**
   * Imports an Excel file (.xlsx, .xls, .csv), parses PCP rows, performs diff update vs existing database
   */
  public async importarPlanilhaExcel(
    file: File
  ): Promise<ResultadoImportacaoExcel> {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });

          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(
            worksheet,
            {
              defval: '',
            }
          );

          if (!rows || rows.length === 0) {
            resolve({
              sucesso: false,
              mensagem: 'A planilha fornecida está vazia ou inacessível.',
              log: this.criarLogErro(file.name, 'Planilha vazia'),
              opsProcessadas: [],
            });
            return;
          }

          const existingOps = storageService.getOps();
          const opMap = new Map<string, OrdemProducao>();
          existingOps.forEach((op) => opMap.set(op.opNumber.trim().toUpperCase(), op));

          let registrosNovos = 0;
          let registrosAtualizados = 0;
          let registrosSemAlteracao = 0;
          let errosEncontrados = 0;
          const detalhesErros: string[] = [];

          const opsAtualizadas: OrdemProducao[] = [...existingOps];

          rows.forEach((row, index) => {
            const linhaNum = index + 2; // Accounting for header row

            // Normalize row key lookup
            const getCol = (possibleKeys: string[]): string => {
              for (const pk of possibleKeys) {
                const foundKey = Object.keys(row).find(
                  (k) => k.trim().toUpperCase() === pk.toUpperCase()
                );
                if (foundKey && row[foundKey] !== undefined) {
                  return String(row[foundKey]).trim();
                }
              }
              return '';
            };

            const opNumber = getCol(['OP', 'ORDEM_PRODUCAO', 'NUMERO_OP', 'ORDEM']);
            const pedidoNumber = getCol(['PEDIDO', 'NUMERO_PEDIDO', 'PED']);
            const cliente = getCol(['CLIENTE', 'NOME_CLIENTE', 'RAZAO_SOCIAL']);
            const produto = getCol(['PRODUTO', 'ITEM', 'DESCRICAO']);
            const modelo = getCol(['MODELO', 'TIPO_MODELO', 'ESPECIFICACAO']);
            const quantidadeRaw = getCol(['QUANTIDADE', 'QTD', 'QTD_TOTAL']);
            const qtdProduzidaRaw = getCol(['QTD_PRODUZIDA', 'PRODUZIDO', 'QTD_PRD']);
            const statusRaw = getCol(['STATUS', 'SITUACAO', 'ETAPA']);
            const prioridadeRaw = getCol(['PRIORIDADE', 'PRIOR']);
            const eficiencaRaw = getCol(['EFICIENCIA_%', 'EFICIENCIA', 'EFIC']);
            const dataProgRaw = getCol(['DATA_PROGRAMADA', 'DATA_PROG', 'PROGRAMADA']);
            const dataEntregaRaw = getCol(['DATA_ENTREGA', 'ENTREGA', 'PREVISAO']);
            const capacidadeRaw = getCol(['CAPACIDADE_KG', 'CARGA_KG', 'CARGA']);
            const gramaturaRaw = getCol(['GRAMATURA_GRM', 'GRAMATURA', 'GRAM']);
            const observacoes = getCol(['OBSERVACOES', 'OBS', 'NOTAS']);

            if (!opNumber) {
              errosEncontrados++;
              detalhesErros.push(`Linha ${linhaNum}: Número da OP não informado.`);
              return;
            }

            const opKey = opNumber.toUpperCase();
            const quantidade = parseInt(quantidadeRaw) || 100;
            const quantidadeProduzida = parseInt(qtdProduzidaRaw) || 0;
            const status = this.normalizarStatus(statusRaw);
            const prioridade = this.normalizarPrioridade(prioridadeRaw);
            const eficiencia = parseFloat(eficiencaRaw) || 95.0;
            const dataProgramada =
              this.normalizarData(dataProgRaw) || new Date().toISOString().substring(0, 10);
            const dataEntrega =
              this.normalizarData(dataEntregaRaw) || new Date().toISOString().substring(0, 10);

            const opData: OrdemProducao = {
              id: opMap.get(opKey)?.id || `op-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              opNumber: opNumber.toUpperCase(),
              pedidoNumber: pedidoNumber.toUpperCase() || 'PED-VAR',
              cliente: cliente || 'Cliente Indefinido',
              produto: produto || 'Big Bag Standard',
              modelo: modelo || 'Saia Superior / Fundo Fechado',
              quantidade,
              quantidadeProduzida,
              status,
              prioridade,
              eficiencia,
              dataProgramada,
              dataEntrega,
              capacidadeCargaKg: parseInt(capacidadeRaw) || 1000,
              tecidoGrm: parseInt(gramaturaRaw) || 160,
              observacoes: observacoes || 'Importado via Planilha PCP Excel',
              tempoEstimadoHoras: Math.ceil(quantidade / 25),
              alteradoEm: new Date().toISOString().replace('T', ' ').substring(0, 19),
            };

            const existing = opMap.get(opKey);
            if (!existing) {
              // New OP
              registrosNovos++;
              opMap.set(opKey, opData);
              opsAtualizadas.unshift(opData);
            } else {
              // Check if modified
              const foiAlterado =
                existing.status !== opData.status ||
                existing.quantidade !== opData.quantidade ||
                existing.quantidadeProduzida !== opData.quantidadeProduzida ||
                existing.prioridade !== opData.prioridade ||
                existing.observacoes !== opData.observacoes;

              if (foiAlterado) {
                registrosAtualizados++;
                const idx = opsAtualizadas.findIndex((o) => o.opNumber.toUpperCase() === opKey);
                if (idx !== -1) {
                  opsAtualizadas[idx] = { ...existing, ...opData };
                }
              } else {
                registrosSemAlteracao++;
              }
            }
          });

          // Save updated list
          storageService.saveOps(opsAtualizadas);

          const usuario = storageService.getUsuario();
          const logObj: LogImportacao = {
            id: `imp-${Date.now()}`,
            dataHora: new Date().toISOString().replace('T', ' ').substring(0, 19),
            nomeArquivo: file.name,
            usuario: usuario.nome,
            registrosLidos: rows.length,
            registrosNovos,
            registrosAtualizados,
            registrosSemAlteracao,
            errosEncontrados,
            detalhesErros,
            status: errosEncontrados > 0 ? 'AVISO' : 'SUCESSO',
          };

          const logsImport = storageService.getLogsImportacao();
          logsImport.unshift(logObj);
          storageService.saveLogsImportacao(logsImport);

          storageService.addLogSistema(
            'IMPORTADOR_EXCEL',
            'IMPORTACAO_CONCLUIDA',
            `Importado ${file.name}: ${registrosNovos} novos, ${registrosAtualizados} atualizados, ${registrosSemAlteracao} sem alteração.`,
            'SUCCESS'
          );

          resolve({
            sucesso: true,
            mensagem: `Planilha importada com sucesso! ${registrosNovos} novos registros, ${registrosAtualizados} atualizados.`,
            log: logObj,
            opsProcessadas: opsAtualizadas,
          });
        } catch (err: any) {
          resolve({
            sucesso: false,
            mensagem: `Erro ao processar arquivo Excel: ${err.message || 'Formato inválido.'}`,
            log: this.criarLogErro(file.name, err.message),
            opsProcessadas: [],
          });
        }
      };

      reader.onerror = () => {
        resolve({
          sucesso: false,
          mensagem: 'Falha na leitura do arquivo local.',
          log: this.criarLogErro(file.name, 'Falha no leitor de arquivos'),
          opsProcessadas: [],
        });
      };

      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Helper to normalize Status string from Excel
   */
  private normalizarStatus(statusRaw: string): StatusProducao {
    const s = (statusRaw || '').toUpperCase().trim();
    if (s.includes('FINAL') || s.includes('CONCLU') || s.includes('PRONTO'))
      return 'FINALIZADO';
    if (s.includes('CONFEC') || s.includes('COSTURA')) return 'CONFECÇÃO';
    if (s.includes('PREPAR') || s.includes('MONTAGEM')) return 'PREPARAÇÃO';
    if (s.includes('CORT')) return 'CORTE';
    if (s.includes('ATRAS') || s.includes('PARAD')) return 'ATRASADO';
    return 'AGUARDANDO';
  }

  /**
   * Helper to normalize Prioridade string
   */
  private normalizarPrioridade(prioridadeRaw: string): PrioridadeOp {
    const p = (prioridadeRaw || '').toUpperCase().trim();
    if (p.includes('URGENT') || p.includes('CRITIC')) return 'URGENTE';
    if (p.includes('ALT')) return 'ALTA';
    if (p.includes('BAIX')) return 'BAIXA';
    return 'MÉDIA';
  }

  /**
   * Normalizes Excel date or string into YYYY-MM-DD
   */
  private normalizarData(dataRaw: any): string {
    if (!dataRaw) return '';
    if (typeof dataRaw === 'number') {
      // Excel serial date integer
      const dateObj = XLSX.SSF.parse_date_code(dataRaw);
      if (dateObj) {
        const y = dateObj.y;
        const m = String(dateObj.m).padStart(2, '0');
        const d = String(dateObj.d).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
    }
    const str = String(dataRaw).trim();
    if (str.match(/^\d{4}-\d{2}-\d{2}$/)) return str;
    if (str.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const parts = str.split('/');
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return '';
  }

  /**
   * Exports an array of OPs to Excel file download
   */
  public exportarOpsParaExcel(ops: OrdemProducao[], filename: string = 'Relatorio_Programacao_Virtude_BigBags.xlsx'): void {
    const rows = ops.map((op) => ({
      'OP': op.opNumber,
      'Pedido': op.pedidoNumber,
      'Cliente': op.cliente,
      'Produto': op.produto,
      'Modelo': op.modelo,
      'Qtd Total': op.quantidade,
      'Qtd Produzida': op.quantidadeProduzida,
      'Status': op.status,
      'Prioridade': op.prioridade,
      'Eficiência (%)': `${op.eficiencia}%`,
      'Data Programada': op.dataProgramada,
      'Data Entrega': op.dataEntrega,
      'Observações': op.observacoes || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Produção');
    XLSX.writeFile(workbook, filename);
  }

  private criarLogErro(nomeArquivo: string, erroMsg: string): LogImportacao {
    return {
      id: `imp-err-${Date.now()}`,
      dataHora: new Date().toISOString().replace('T', ' ').substring(0, 19),
      nomeArquivo,
      usuario: storageService.getUsuario().nome,
      registrosLidos: 0,
      registrosNovos: 0,
      registrosAtualizados: 0,
      registrosSemAlteracao: 0,
      errosEncontrados: 1,
      detalhesErros: [erroMsg],
      status: 'ERRO',
    };
  }
}

export const excelService = new ExcelService();
