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
      'O.P',
      'ID.',
      'PEDIDO',
      'CLIENTE',
      'DESENHO',
      'PRODUTO',
      'MODELO',
      'DATA PROGAMADA',
      'STATUS DO PROCESSO',
      'DATA CONFEC.',
      'QUANTIDADE PRODUZIDA',
      'LOTE',
      'EFICIENCIA',
      'STATUS PED.',
    ];

    const exData = [
      header,
      [
        'OP-2026-095',
        'V',
        'PED-1049',
        'Agroquímica do Brasil S.A.',
        'DES-402',
        'Big Bag Standard 4 Alças',
        'Saia Superior / Fundo Fechado',
        '2026-07-25',
        'AGUARDANDO',
        '2026-07-28',
        1500,
        'LOTE-8821',
        100.0,
        'EM PRODUCAO',
      ],
      [
        'OP-2026-096',
        'L',
        'PED-1050',
        'Fertilizantes Safra Forte Ltda',
        'DES-509',
        'Big Bag Travado Q-Bag',
        'Válvula Carga / Válvula Descarga',
        '2026-07-22',
        'CORTE',
        '2026-07-26',
        600,
        'LOTE-8822',
        93.5,
        'EM PRODUCAO',
      ],
      [
        'OP-2026-097',
        'V',
        'PED-1051',
        'Mineração Vale Dourado S/A',
        'DES-610',
        'Big Bag Carga Pesada Mineração',
        'Abertura Total / Fundo Fechado',
        '2026-07-23',
        'PREPARAÇÃO',
        '2026-07-27',
        2000,
        'LOTE-8823',
        90.0,
        'PENDENTE',
      ],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(exData);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 15 }, // O.P
      { wch: 8 },  // ID. (EMPRESA L/V)
      { wch: 14 }, // PEDIDO
      { wch: 30 }, // CLIENTE
      { wch: 14 }, // DESENHO
      { wch: 32 }, // PRODUTO
      { wch: 32 }, // MODELO
      { wch: 16 }, // DATA PROGAMADA
      { wch: 22 }, // STATUS DO PROCESSO
      { wch: 16 }, // DATA CONFEC.
      { wch: 22 }, // QUANTIDADE PRODUZIDA
      { wch: 14 }, // LOTE
      { wch: 14 }, // EFICIENCIA
      { wch: 16 }, // STATUS PED.
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

            // Normalize and sanitize key lookup
            const sanitizeKey = (str: string): string => {
              if (!str) return '';
              return str
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, '');
            };

            const rowKeys = Object.keys(row);

            const getCol = (possibleKeys: string[]): string => {
              // 1. Exact sanitized match
              for (const pk of possibleKeys) {
                const pkSan = sanitizeKey(pk);
                const foundKey = rowKeys.find((k) => sanitizeKey(k) === pkSan);
                if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null && String(row[foundKey]).trim() !== '') {
                  return String(row[foundKey]).trim();
                }
              }

              // 2. Contains sanitized match
              for (const pk of possibleKeys) {
                const pkSan = sanitizeKey(pk);
                if (!pkSan) continue;
                const foundKey = rowKeys.find((k) => {
                  const kSan = sanitizeKey(k);
                  return kSan.length > 2 && (kSan.includes(pkSan) || pkSan.includes(kSan));
                });
                if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null && String(row[foundKey]).trim() !== '') {
                  return String(row[foundKey]).trim();
                }
              }

              return '';
            };

            const opNumber = getCol([
              'O.P', 'O.P.', 'OP', 'ORDEM', 'ORDEM_PRODUCAO', 'ORDEM DE PRODUCAO', 'ORDEM PRODUCAO',
              'NUMERO_OP', 'NUMERO OP', 'N_OP', 'Nº OP', 'OP N°'
            ]);

            const empresaIdRaw = getCol([
              'ID.', 'ID', 'EMPRESA', 'EMPRESA_ID', 'SIGLA', 'EMPRESA L/V'
            ]);

            const pedidoNumber = getCol([
              'PEDIDO', 'NUMERO_PEDIDO', 'NUMERO PEDIDO', 'PED', 'N_PEDIDO',
              'Nº PEDIDO', 'PEDIDO DE VENDA', 'PEDIDO_VENDA', 'PEDIDO VENDA'
            ]);

            const cliente = getCol([
              'CLIENTE', 'NOME_CLIENTE', 'NOME CLIENTE', 'RAZAO_SOCIAL', 'RAZÃO SOCIAL',
              'RAZAO SOCIAL', 'CLIENTE / RAZAO SOCIAL', 'NOME DO CLIENTE', 'COMPRADOR'
            ]);

            const desenho = getCol([
              'DESENHO', 'N_DESENHO', 'Nº DESENHO', 'COD_DESENHO', 'CODIGO DESENHO', 'DESENHO TECNICO'
            ]);

            const produto = getCol([
              'PRODUTO', 'ITEM', 'DESCRICAO', 'DESCRIÇÃO', 'MODELO BIG BAG',
              'DESCRICAO DO PRODUTO', 'DESCRICAO_PRODUTO', 'PRODUTO / ITEM', 'BIG BAG', 'TIPO BIG BAG'
            ]);

            const modelo = getCol([
              'MODELO', 'TIPO_MODELO', 'ESPECIFICACAO', 'ESPECIFICAÇÃO', 'TIPO MODELO',
              'MODELO DO BIG BAG', 'ESPECIFICACAO TECNICA', 'FECHAMENTO'
            ]);

            const dataProgRaw = getCol([
              'DATA PROGAMADA', 'DATA PROGRAMADA', 'DATA_PROGRAMADA', 'DATA PROG', 'DATA_PROG', 'PROGRAMADA', 'DATA FABRICACAO', 'DATA INICIO'
            ]);

            const statusProcessoRaw = getCol([
              'STATUS DO PROCESSO', 'STATUS PROCESSO', 'STATUS', 'SITUACAO', 'SITUAÇÃO', 'ETAPA', 'STATUS OP', 'FASE'
            ]);

            const dataConfecRaw = getCol([
              'DATA CONFEC.', 'DATA CONFEC', 'DATA CONFECCAO', 'DATA CONFECÇÃO', 'DATA_CONFEC', 'DATA_CONFECCAO', 'DATA ENTREGA', 'DATA_ENTREGA'
            ]);

            const qtdProduzidaRaw = getCol([
              'QUANTIDADE PRODUZIDA', 'QTD PRODUZIDA', 'QTD_PRODUZIDA', 'PRODUZIDO', 'PRODUZIDA', 'QTD_PRD',
              'QUANTIDADE PRD', 'QTD FEITA', 'CONCLUIDO'
            ]);

            const quantidadeRaw = getCol([
              'QUANTIDADE', 'QTD', 'QTDE', 'QUANT', 'QTD_TOTAL', 'QUANTIDADE TOTAL', 'QTD TOTAL', 'QTD PEDIDA', 'VOLUME'
            ]);

            const lote = getCol([
              'LOTE', 'N_LOTE', 'Nº LOTE', 'NUMERO LOTE', 'LOTE_PRODUCAO', 'LOTE PRODUCAO'
            ]);

            const eficiencaRaw = getCol([
              'EFICIENCIA', 'EFICIÊNCIA', 'EFICIENCIA_%', 'EFIC'
            ]);

            const statusPedidoRaw = getCol([
              'STATUS PED.', 'STATUS PEDIDO', 'STATUS PED', 'SITUACAO PEDIDO', 'STATUS_PEDIDO', 'STATUS_PED'
            ]);

            const prioridadeRaw = getCol(['PRIORIDADE', 'PRIOR', 'URGENCIA']);
            const capacidadeRaw = getCol(['CAPACIDADE_KG', 'CAPACIDADE KG', 'CARGA_KG', 'CARGA KG', 'CARGA', 'CAPACIDADE', 'KG', 'PESO']);
            const gramaturaRaw = getCol(['GRAMATURA_GRM', 'GRAMATURA GRM', 'GRAMATURA', 'GRAM', 'TECIDO']);
            const observacoes = getCol(['OBSERVACOES', 'OBSERVAÇÕES', 'OBS', 'NOTAS', 'OBSERVACAO']);

            if (!opNumber) {
              errosEncontrados++;
              detalhesErros.push(`Linha ${linhaNum}: Número da O.P não informado.`);
              return;
            }

            const opKey = opNumber.toUpperCase();
            const quantidadeProduzida = parseInt(qtdProduzidaRaw) || 0;
            const quantidade = parseInt(quantidadeRaw) || (quantidadeProduzida > 0 ? quantidadeProduzida : 100);
            const status = this.normalizarStatus(statusProcessoRaw || statusPedidoRaw);
            const prioridade = this.normalizarPrioridade(prioridadeRaw);
            let eficiencia = parseFloat(eficiencaRaw) || 95.0;
            if (status === 'FINALIZADO') {
              eficiencia = 100.0;
            }
            const dataProgramada =
              this.normalizarData(dataProgRaw) || new Date().toISOString().substring(0, 10);
            const dataConfec = this.normalizarData(dataConfecRaw);
            const dataEntrega = dataConfec || dataProgramada;

            // Empresa ID normalization: L (LAELSON) or V (VIRTUDE)
            let empresaId = empresaIdRaw.toUpperCase();
            if (empresaId.includes('LAELSON')) empresaId = 'L';
            else if (empresaId.includes('VIRTUDE')) empresaId = 'V';
            else if (!empresaId) empresaId = 'V';

            const opData: OrdemProducao = {
              id: opMap.get(opKey)?.id || `op-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              opNumber: opNumber.toUpperCase(),
              empresaId,
              pedidoNumber: pedidoNumber ? pedidoNumber.toUpperCase() : 'PED-VAR',
              cliente: cliente || 'Cliente Indefinido',
              desenho: desenho || '',
              produto: produto || 'Big Bag Standard',
              modelo: modelo || 'Saia Superior / Fundo Fechado',
              dataProgramada,
              statusProcesso: statusProcessoRaw || status,
              status,
              dataConfec,
              quantidade,
              quantidadeProduzida,
              lote: lote || '',
              eficiencia,
              prioridade,
              statusPedido: statusPedidoRaw || 'EM PRODUCAO',
              dataEntrega,
              capacidadeCargaKg: parseInt(capacidadeRaw) || 1000,
              tecidoGrm: parseInt(gramaturaRaw) || 160,
              observacoes: observacoes || 'Importado via Planilha PCP Excel',
              tempoEstimadoHoras: Math.ceil((quantidade || 100) / 25),
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

          // Save updated list of OPs and sync Clientes, Produtos and Pedidos
          storageService.saveOps(opsAtualizadas);
          storageService.syncDerivadosComOps();

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
      'O.P': op.opNumber,
      'ID.': op.empresaId || 'V',
      'PEDIDO': op.pedidoNumber,
      'CLIENTE': op.cliente,
      'DESENHO': op.desenho || '-',
      'PRODUTO': op.produto,
      'MODELO': op.modelo,
      'DATA PROGAMADA': op.dataProgramada,
      'STATUS DO PROCESSO': op.statusProcesso || op.status,
      'DATA CONFEC.': op.dataConfec || op.dataEntrega || '-',
      'QUANTIDADE PRODUZIDA': op.quantidadeProduzida || op.quantidade,
      'LOTE': op.lote || '-',
      'EFICIENCIA': `${op.eficiencia}%`,
      'STATUS PED.': op.statusPedido || 'EM PRODUCAO',
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
