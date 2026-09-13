import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { IndicadoresKpi, OrdemProducao } from '../types';
import { formatarDataBR } from './excelService';

export class PdfService {
  /**
   * Generates a printable, high-quality PDF Report for Virtude Big Bags
   */
  public gerarRelatorioProducaoPDF(
    titulo: string,
    subtitulo: string,
    ops: OrdemProducao[],
    kpis: IndicadoresKpi
  ): any {
    const PDFClass = typeof jsPDF === 'function' ? jsPDF : ((jsPDF as any).jsPDF || (jsPDF as any).default);
    const doc = new PDFClass('portrait', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();

    // --- Header Section ---
    doc.setFillColor(15, 23, 42); // Slate-900 Navy Industrial Header
    doc.rect(0, 0, pageWidth, 28, 'F');

    // Company Logo / Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text("VIRTUDE BIG BAG'S", 14, 13);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('SISTEMA DE GERENCIAMENTO VISUAL DA PRODUÇÃO & PCP', 14, 20);

    // Date/Time Stamp
    const dataHoraStr = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    doc.setFontSize(9);
    doc.text(`Gerado em: ${dataHoraStr}`, pageWidth - 14, 18, { align: 'right' });

    // --- Report Subheader ---
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(titulo, 14, 38);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(subtitulo, 14, 44);

    // --- KPI Cards Summary Box ---
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 48, pageWidth - 28, 22, 2, 2, 'FD');

    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);

    doc.setFont('helvetica', 'bold');
    doc.text('OPs Programadas:', 18, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(`${kpis.pedidosProgramados}`, 52, 55);

    doc.setFont('helvetica', 'bold');
    doc.text('Em Produção:', 75, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(`${kpis.pedidosProduzindo}`, 103, 55);

    doc.setFont('helvetica', 'bold');
    doc.text('Finalizados:', 125, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(`${kpis.pedidosFinalizados}`, 148, 55);

    doc.setFont('helvetica', 'bold');
    doc.text('Eficiência Média:', 18, 64);
    doc.setFont('helvetica', 'normal');
    doc.text(`${kpis.eficienciaGlobal}%`, 52, 64);

    doc.setFont('helvetica', 'bold');
    doc.text('OEE Geral:', 75, 64);
    doc.setFont('helvetica', 'normal');
    doc.text(`${kpis.oeeGeral}%`, 103, 64);

    doc.setFont('helvetica', 'bold');
    doc.text('Atrasados:', 125, 64);
    doc.setFont('helvetica', 'normal');
    doc.text(`${kpis.pedidosAtrasados}`, 148, 64);

    // --- Table Data ---
    const tableData = ops.map((op) => [
      op.opNumber,
      op.pedidoNumber,
      op.cliente.length > 22 ? op.cliente.substring(0, 20) + '...' : op.cliente,
      op.produto.length > 25 ? op.produto.substring(0, 23) + '...' : op.produto,
      `${op.quantidadeProduzida} / ${op.quantidade}`,
      op.status,
      `${op.eficiencia}%`,
      op.dataProgramada,
      op.dataEntrega,
    ]);

    autoTable(doc, {
      startY: 76,
      head: [
        [
          'OP',
          'Pedido',
          'Cliente',
          'Produto',
          'Progresso',
          'Status',
          'Efic.',
          'Data Prog.',
          'Data Ent.',
        ],
      ],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [30, 41, 59],
      },
      columnStyles: {
        0: { fontStyle: 'bold', halign: 'center', cellWidth: 22 },
        1: { halign: 'center', cellWidth: 18 },
        2: { cellWidth: 38 },
        3: { cellWidth: 40 },
        4: { halign: 'center', cellWidth: 20 },
        5: { halign: 'center', fontStyle: 'bold', cellWidth: 22 },
        6: { halign: 'center', cellWidth: 14 },
        7: { halign: 'center', cellWidth: 18 },
        8: { halign: 'center', cellWidth: 18 },
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 5) {
          const status = String(data.cell.raw);
          if (status === 'FINALIZADO') {
            data.cell.styles.textColor = [16, 185, 129];
          } else if (status === 'ATRASADO') {
            data.cell.styles.textColor = [239, 68, 68];
          } else if (status === 'CORTE') {
            data.cell.styles.textColor = [245, 158, 11];
          } else if (status === 'PREPARAÇÃO') {
            data.cell.styles.textColor = [6, 182, 212];
          } else if (status === 'CONFECÇÃO') {
            data.cell.styles.textColor = [99, 102, 241];
          }
        }
      },
    });

    // --- Footer Page Numbers ---
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Virtude Big Bag's PCP MES System - Página ${i} de ${totalPages}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 8,
        { align: 'center' }
      );
    }

    if (typeof window !== 'undefined') {
      doc.save(`Relatorio_Producao_Virtude_BigBags_${Date.now()}.pdf`);
    }
    return doc;
  }

  /**
   * Generates a comprehensive Dossier PDF for a finalized Production Order (OP)
   */
  public gerarDossieOpPDF(op: OrdemProducao): any {
    const PDFClass = typeof jsPDF === 'function' ? jsPDF : ((jsPDF as any).jsPDF || (jsPDF as any).default);
    const doc = new PDFClass('portrait', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();

    // --- Header Section ---
    doc.setFillColor(15, 23, 42); // Slate-900 Navy Industrial Header
    doc.rect(0, 0, pageWidth, 28, 'F');

    // Company Logo / Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text("VIRTUDE BIG BAG'S", 14, 13);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('REGISTRO DA PRODUÇÃO, CONTROLE DE QUALIDADE & RASTREABILIDADE', 14, 20);

    // Date/Time Stamp
    const dataHoraStr = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    doc.setFontSize(8);
    doc.text(`Gerado em: ${dataHoraStr}`, pageWidth - 14, 18, { align: 'right' });

    // --- Subheader / OP Badge ---
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text(`ORDEM DE PRODUÇÃO: ${op.opNumber}`, 14, 38);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129); // Emerald-600
    doc.text('STATUS: FINALIZADO (CONCLUÍDO)', pageWidth - 14, 38, { align: 'right' });

    // --- Resumo da OP (Card Cinza Claro) ---
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setFillColor(248, 250, 252); // slate-50
    doc.roundedRect(14, 43, pageWidth - 28, 26, 2, 2, 'FD');

    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);

    // Linha 1
    doc.setFont('helvetica', 'bold');
    doc.text('Cliente:', 18, 49);
    doc.setFont('helvetica', 'normal');
    doc.text(op.cliente || 'N/A', 35, 49);

    doc.setFont('helvetica', 'bold');
    doc.text('Nº Pedido:', 125, 49);
    doc.setFont('helvetica', 'normal');
    doc.text(op.pedidoNumber || 'N/A', 145, 49);

    // Linha 2
    doc.setFont('helvetica', 'bold');
    doc.text('Produto:', 18, 56);
    doc.setFont('helvetica', 'normal');
    const produtoTexto = `${op.produto || 'Big Bag'} ${op.dimensoes ? `(${op.dimensoes})` : ''}`;
    doc.text(produtoTexto.length > 55 ? produtoTexto.substring(0, 52) + '...' : produtoTexto, 35, 56);

    doc.setFont('helvetica', 'bold');
    doc.text('Lote:', 125, 56);
    doc.setFont('helvetica', 'normal');
    doc.text(op.lote || 'N/A', 145, 56);

    // Linha 3
    doc.setFont('helvetica', 'bold');
    doc.text('Data Prog.:', 18, 63);
    doc.setFont('helvetica', 'normal');
    doc.text(formatarDataBR(op.dataProgramada), 38, 63);

    doc.setFont('helvetica', 'bold');
    doc.text('Data Conclusão:', 75, 63);
    doc.setFont('helvetica', 'normal');
    doc.text(formatarDataBR(op.dataFimReal || op.alteradoEm || op.dataProgramada), 103, 63);

    doc.setFont('helvetica', 'bold');
    doc.text('Eficiência:', 140, 63);
    doc.setFont('helvetica', 'normal');
    doc.text(`${op.eficiencia}%`, 158, 63);

    // --- Cards Métricas Produção x Refugo x Qualidade ---
    const totalRefugadas =
      op.quantidadeRefugada ??
      (op.apontamentos || []).reduce((acc, apt) => acc + (apt.quantidadeRefugada || 0), 0);

    const cardWidth = (pageWidth - 28 - 8) / 3;
    const cardY = 73;

    // Card 1: Produção Aprovada
    doc.setDrawColor(167, 243, 208); // emerald-200
    doc.setFillColor(236, 253, 245); // emerald-50
    doc.roundedRect(14, cardY, cardWidth, 18, 2, 2, 'FD');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(5, 150, 105);
    doc.text('PEÇAS PRODUZIDAS', 18, cardY + 5);
    doc.setFontSize(12);
    doc.text(`${op.quantidadeProduzida} / ${op.quantidade} un`, 18, cardY + 12);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('100% da meta da OP', 18, cardY + 16);

    // Card 2: Peças Refugadas
    const temRefugo = totalRefugadas > 0;
    doc.setDrawColor(temRefugo ? 254 : 226, temRefugo ? 202 : 232, temRefugo ? 202 : 240);
    doc.setFillColor(temRefugo ? 254 : 248, temRefugo ? 242 : 250, temRefugo ? 242 : 252);
    doc.roundedRect(14 + cardWidth + 4, cardY, cardWidth, 18, 2, 2, 'FD');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(temRefugo ? 220 : 71, temRefugo ? 38 : 85, temRefugo ? 38 : 105);
    doc.text('PEÇAS REFUGADAS', 18 + cardWidth + 4, cardY + 5);
    doc.setFontSize(12);
    doc.text(`${totalRefugadas} unidades`, 18 + cardWidth + 4, cardY + 12);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(
      temRefugo ? 'Refugo registrado no processo' : 'Zero refugos apontados',
      18 + cardWidth + 4,
      cardY + 16
    );

    // Card 3: Inspeção de Qualidade
    doc.setDrawColor(191, 219, 254); // blue-200
    doc.setFillColor(239, 246, 255); // blue-50
    doc.roundedRect(14 + (cardWidth + 4) * 2, cardY, cardWidth, 18, 2, 2, 'FD');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(29, 78, 216);
    doc.text('CONTROLE DE QUALIDADE', 18 + (cardWidth + 4) * 2, cardY + 5);
    doc.setFontSize(10);
    doc.text(
      op.revisadoQualidade !== false ? 'Aprovado & Revisado' : 'Não Revisado',
      18 + (cardWidth + 4) * 2,
      cardY + 12
    );
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('Inspeção chão de fábrica', 18 + (cardWidth + 4) * 2, cardY + 16);

    // --- Tabela de Etapas do Processo ---
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('RASTREAMENTO POR ETAPAS DO PROCESSO & APONTAMENTOS', 14, 98);

    const apontamentos = op.apontamentos || [];
    let tableData: any[][] = [];

    if (apontamentos.length > 0) {
      tableData = apontamentos.map((apt, idx) => {
        const teveRef = apt.pecasRefugadas || (apt.quantidadeRefugada && apt.quantidadeRefugada > 0);
        const refugoTexto = teveRef ? `SIM (${apt.quantidadeRefugada || 0} un)` : 'NÃO';
        const qualidadeTexto = apt.revisadoQualidade !== false ? 'SIM (Revisado)' : 'NÃO';
        const justificativaOuObs =
          [
            apt.justificativaRefugo ? `Justificativa: ${apt.justificativaRefugo}` : '',
            apt.observacoes ? `Obs: ${apt.observacoes}` : '',
          ]
            .filter(Boolean)
            .join(' | ') || '-';

        return [
          `#${idx + 1} - ${apt.novoStatus}`,
          apt.dataHora || '-',
          apt.operador || 'PCP',
          `+${apt.quantidadeApontada} un`,
          `${apt.quantidadeTotalApos} / ${op.quantidade}`,
          qualidadeTexto,
          refugoTexto,
          justificativaOuObs,
        ];
      });
    } else {
      tableData = [
        [
          'PROCESSO COMPLETO',
          formatarDataBR(op.dataFimReal || op.dataProgramada),
          'Operador Geral',
          `${op.quantidadeProduzida} un`,
          `${op.quantidadeProduzida} / ${op.quantidade}`,
          op.revisadoQualidade !== false ? 'SIM (Revisado)' : 'NÃO',
          totalRefugadas > 0 ? `SIM (${totalRefugadas} un)` : 'NÃO',
          op.observacoes || 'Conclusão consolidada da ordem de produção.',
        ],
      ];
    }

    autoTable(doc, {
      startY: 102,
      head: [
        [
          'Etapa Processo',
          'Data / Hora',
          'Operador',
          'Produzido',
          'Acumulado',
          'Qualidade',
          'Refugo',
          'Justificativas / Observações',
        ],
      ],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [30, 41, 59],
      },
      columnStyles: {
        0: { fontStyle: 'bold', halign: 'left', cellWidth: 26 },
        1: { halign: 'center', cellWidth: 23 },
        2: { halign: 'center', cellWidth: 18 },
        3: { halign: 'center', fontStyle: 'bold', cellWidth: 16 },
        4: { halign: 'center', cellWidth: 18 },
        5: { halign: 'center', cellWidth: 19 },
        6: { halign: 'center', fontStyle: 'bold', cellWidth: 18 },
        7: { halign: 'left', cellWidth: 44 },
      },
      didParseCell: (data) => {
        if (data.section === 'body') {
          // Destacar coluna de Refugo se SIM
          if (data.column.index === 6 && String(data.cell.raw).startsWith('SIM')) {
            data.cell.styles.textColor = [220, 38, 38];
            data.cell.styles.fontStyle = 'bold';
          }
          // Destacar peças produzidas
          if (data.column.index === 3) {
            data.cell.styles.textColor = [5, 150, 105];
          }
        }
      },
    });

    // --- Observações Gerais se houver ---
    const finalY = (doc as any).lastAutoTable?.finalY || 180;
    if (op.observacoes && finalY < 250) {
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('OBSERVAÇÕES ADICIONAIS DA OP:', 14, finalY + 8);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(op.observacoes, 14, finalY + 13, { maxWidth: pageWidth - 28 });
    }

    // --- Footer Page Numbers & Assinatura ---
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setDrawColor(226, 232, 240);
      doc.line(14, doc.internal.pageSize.getHeight() - 14, pageWidth - 14, doc.internal.pageSize.getHeight() - 14);

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Virtude Big Bag's — Registro da Produção — OP #${op.opNumber}`,
        14,
        doc.internal.pageSize.getHeight() - 8
      );
      doc.text(
        `Página ${i} de ${totalPages}`,
        pageWidth - 14,
        doc.internal.pageSize.getHeight() - 8,
        { align: 'right' }
      );
    }

    const nomeArquivo = `Registro_Producao_OP_${op.opNumber}_${(op.cliente || 'Cliente').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    if (typeof window !== 'undefined') {
      doc.save(nomeArquivo);
    }
    return doc;
  }
}

export const pdfService = new PdfService();
