import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { IndicadoresKpi, OrdemProducao, Pedido } from '../types';
import { formatarDataBR } from './excelService';

export class PdfService {
  /**
   * Generates a printable, high-quality PDF Report for Virtude Big Bags with mathematically
   * aligned margins, zero right-edge overflow, and dynamic Landscape/Portrait orientation.
   */
  public gerarRelatorioProducaoPDF(
    titulo: string,
    subtitulo: string,
    ops: OrdemProducao[],
    kpis: IndicadoresKpi,
    orientacao: 'landscape' | 'portrait' = 'landscape'
  ): any {
    const PDFClass = typeof jsPDF === 'function' ? jsPDF : ((jsPDF as any).jsPDF || (jsPDF as any).default);
    const doc = new PDFClass(orientacao, 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const isLandscape = orientacao === 'landscape';

    // Largura útil respeitando margens simétricas de 14mm
    const marginX = 14;
    const contentWidth = pageWidth - marginX * 2; // 269mm em Paisagem, 182mm em Retrato

    // --- Header Section ---
    doc.setFillColor(15, 23, 42); // Slate-900 Navy Industrial Header
    doc.rect(0, 0, pageWidth, 28, 'F');

    // Company Logo / Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text("VIRTUDE BIG BAG'S", marginX, 13);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225);
    doc.text('SISTEMA DE GERENCIAMENTO VISUAL DA PRODUÇÃO & PCP', marginX, 20);

    // Date/Time Stamp & Sistema
    const dataHoraStr = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    doc.setFontSize(8.5);
    doc.setTextColor(226, 232, 240);
    doc.text(`Gerado em: ${dataHoraStr}`, pageWidth - marginX, 14, { align: 'right' });
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Módulo PCP & Chão de Fábrica', pageWidth - marginX, 20, { align: 'right' });

    // --- Report Subheader ---
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(titulo, marginX, 38);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(subtitulo, marginX, 44, { maxWidth: contentWidth });

    // --- KPI Cards Summary Box ---
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(marginX, 48, contentWidth, 22, 2, 2, 'FD');

    // Distribuição dinâmica das 3 colunas perfeitamente alinhadas à largura útil
    const colWidth = contentWidth / 3;
    const col1X = marginX + (isLandscape ? 8 : 4);
    const col2X = marginX + colWidth + (isLandscape ? 8 : 4);
    const col3X = marginX + colWidth * 2 + (isLandscape ? 8 : 4);

    const valOffset = isLandscape ? 40 : 34;

    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);

    // Linha 1 do box de KPI (y = 55)
    doc.setFont('helvetica', 'bold');
    doc.text('OPs Programadas:', col1X, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(`${kpis.pedidosProgramados}`, col1X + valOffset, 55);

    doc.setFont('helvetica', 'bold');
    doc.text('Em Produção:', col2X, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(`${kpis.pedidosProduzindo}`, col2X + (isLandscape ? 34 : 28), 55);

    doc.setFont('helvetica', 'bold');
    doc.text('Finalizados:', col3X, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(`${kpis.pedidosFinalizados}`, col3X + (isLandscape ? 30 : 25), 55);

    // Linha 2 do box de KPI (y = 64)
    doc.setFont('helvetica', 'bold');
    doc.text('Eficiência Média:', col1X, 64);
    doc.setFont('helvetica', 'normal');
    doc.text(`${kpis.eficienciaGlobal}%`, col1X + valOffset, 64);

    doc.setFont('helvetica', 'bold');
    doc.text('OEE Geral:', col2X, 64);
    doc.setFont('helvetica', 'normal');
    doc.text(`${kpis.oeeGeral}%`, col2X + (isLandscape ? 34 : 28), 64);

    doc.setFont('helvetica', 'bold');
    doc.text('Atrasados:', col3X, 64);
    doc.setFont('helvetica', 'normal');
    doc.text(`${kpis.pedidosAtrasados}`, col3X + (isLandscape ? 30 : 25), 64);

    // --- Table Data ---
    const tableData = ops.map((op) => [
      op.opNumber || '-',
      op.pedidoNumber || '-',
      isLandscape
        ? (op.cliente || 'Cliente Indefinido')
        : (op.cliente?.length > 20 ? op.cliente.substring(0, 18) + '...' : op.cliente || '-'),
      isLandscape
        ? (op.produto || 'Big Bag Padrão')
        : (op.produto?.length > 22 ? op.produto.substring(0, 20) + '...' : op.produto || '-'),
      `${Number(op.quantidadeProduzida) || 0} / ${Number(op.quantidade) || 0}`,
      op.status || 'AGUARDANDO',
      `${op.eficiencia || 0}%`,
      formatarDataBR(op.dataProgramada),
      formatarDataBR(op.dataEntrega),
    ]);

    // Definição exata das larguras de colunas para somar 100% de contentWidth
    // Paisagem (contentWidth = 269mm): 26 + 22 + 54 + 56 + 24 + 28 + 16 + 22 + 21 = 269mm
    // Retrato (contentWidth = 182mm): 22 + 18 + 32 + 34 + 18 + 24 + 12 + 11 + 11 = 182mm
    const landscapeColStyles: Record<number, any> = {
      0: { fontStyle: 'bold', halign: 'center', cellWidth: 26 },
      1: { halign: 'center', cellWidth: 22 },
      2: { halign: 'left', cellWidth: 54 },
      3: { halign: 'left', cellWidth: 56 },
      4: { halign: 'center', cellWidth: 24 },
      5: { halign: 'center', fontStyle: 'bold', cellWidth: 28 }, // Largura ampla para "AGUARDANDO" sem quebra
      6: { halign: 'center', cellWidth: 16 },
      7: { halign: 'center', cellWidth: 22 },
      8: { halign: 'center', cellWidth: 21 },
    };

    const portraitColStyles: Record<number, any> = {
      0: { fontStyle: 'bold', halign: 'center', cellWidth: 22 },
      1: { halign: 'center', cellWidth: 18 },
      2: { halign: 'left', cellWidth: 32 },
      3: { halign: 'left', cellWidth: 34 },
      4: { halign: 'center', cellWidth: 18 },
      5: { halign: 'center', fontStyle: 'bold', cellWidth: 24 },
      6: { halign: 'center', cellWidth: 12 },
      7: { halign: 'center', cellWidth: 11 },
      8: { halign: 'center', cellWidth: 11 },
    };

    autoTable(doc, {
      startY: 75,
      margin: { left: marginX, right: marginX },
      tableWidth: contentWidth,
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
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontSize: isLandscape ? 8 : 7,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        cellPadding: 2.2,
      },
      bodyStyles: {
        fontSize: isLandscape ? 8 : 6.8,
        textColor: [30, 41, 59],
        valign: 'middle',
        cellPadding: 2,
        overflow: 'linebreak',
      },
      columnStyles: isLandscape ? landscapeColStyles : portraitColStyles,
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 5) {
          const status = String(data.cell.raw).toUpperCase().trim();
          if (status === 'FINALIZADO') {
            data.cell.styles.textColor = [16, 185, 129];
          } else if (status === 'ATRASADO') {
            data.cell.styles.textColor = [239, 68, 68];
          } else if (status === 'CORTE') {
            data.cell.styles.textColor = [168, 85, 247];
          } else if (status === 'PREPARAÇÃO' || status === 'PREPARACAO') {
            data.cell.styles.textColor = [217, 119, 6];
          } else if (status === 'CONFECÇÃO' || status === 'CONFECCAO') {
            data.cell.styles.textColor = [37, 99, 235];
          } else if (status === 'AGUARDANDO') {
            data.cell.styles.textColor = [100, 116, 139];
          }
        }
      },
    });

    // --- Footer Page Numbers ---
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setDrawColor(226, 232, 240);
      doc.line(marginX, pageHeight - 11, pageWidth - marginX, pageHeight - 11);

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(
        "Virtude Big Bag's — Sistema PCP & Controle Fabril Industrial",
        marginX,
        pageHeight - 6
      );
      doc.text(
        `Página ${i} de ${totalPages}`,
        pageWidth - marginX,
        pageHeight - 6,
        { align: 'right' }
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
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 14;
    const contentWidth = pageWidth - marginX * 2; // 182mm

    // --- Header Section ---
    doc.setFillColor(15, 23, 42); // Slate-900 Navy Industrial Header
    doc.rect(0, 0, pageWidth, 28, 'F');

    // Company Logo / Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text("VIRTUDE BIG BAG'S", marginX, 13);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225);
    doc.text('REGISTRO DA PRODUÇÃO, CONTROLE DE QUALIDADE & RASTREABILIDADE', marginX, 20);

    // Date/Time Stamp
    const dataHoraStr = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    doc.setFontSize(8);
    doc.setTextColor(226, 232, 240);
    doc.text(`Gerado em: ${dataHoraStr}`, pageWidth - marginX, 18, { align: 'right' });

    // --- Subheader / OP Badge ---
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`ORDEM DE PRODUÇÃO: ${op.opNumber}`, marginX, 38);

    // Badge Dinâmica de Status da OP
    const statusStr = op.status || 'AGUARDANDO';
    let statusCor: [number, number, number] = [100, 116, 139];
    if (statusStr === 'FINALIZADO') statusCor = [16, 185, 129];
    else if (statusStr === 'CORTE') statusCor = [168, 85, 247];
    else if (statusStr === 'PREPARAÇÃO') statusCor = [217, 119, 6];
    else if (statusStr === 'CONFECÇÃO') statusCor = [37, 99, 235];
    else if (statusStr === 'ATRASADO') statusCor = [239, 68, 68];

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...statusCor);
    doc.text(`STATUS: ${statusStr}`, pageWidth - marginX, 38, { align: 'right' });

    // --- Resumo da OP (Card Cinza Claro) ---
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setFillColor(248, 250, 252); // slate-50
    doc.roundedRect(marginX, 43, contentWidth, 26, 2, 2, 'FD');

    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);

    // Linha 1 (y = 49)
    doc.setFont('helvetica', 'bold');
    doc.text('Cliente:', marginX + 4, 49);
    doc.setFont('helvetica', 'normal');
    const clienteTexto = op.cliente || 'N/A';
    doc.text(clienteTexto.length > 40 ? clienteTexto.substring(0, 38) + '...' : clienteTexto, marginX + 22, 49);

    doc.setFont('helvetica', 'bold');
    doc.text('Nº Pedido:', marginX + 110, 49);
    doc.setFont('helvetica', 'normal');
    doc.text(op.pedidoNumber || 'N/A', marginX + 130, 49);

    // Linha 2 (y = 56)
    doc.setFont('helvetica', 'bold');
    doc.text('Produto:', marginX + 4, 56);
    doc.setFont('helvetica', 'normal');
    const produtoTexto = `${op.produto || 'Big Bag'} ${op.dimensoes ? `(${op.dimensoes})` : ''}`;
    doc.text(produtoTexto.length > 45 ? produtoTexto.substring(0, 42) + '...' : produtoTexto, marginX + 22, 56);

    doc.setFont('helvetica', 'bold');
    doc.text('Lote:', marginX + 110, 56);
    doc.setFont('helvetica', 'normal');
    doc.text(op.lote || 'N/A', marginX + 130, 56);

    // Linha 3 (y = 63)
    doc.setFont('helvetica', 'bold');
    doc.text('Data Prog.:', marginX + 4, 63);
    doc.setFont('helvetica', 'normal');
    doc.text(formatarDataBR(op.dataProgramada), marginX + 25, 63);

    doc.setFont('helvetica', 'bold');
    doc.text('Data Conclusão:', marginX + 60, 63);
    doc.setFont('helvetica', 'normal');
    doc.text(formatarDataBR(op.dataFimReal || op.alteradoEm || op.dataProgramada), marginX + 88, 63);

    doc.setFont('helvetica', 'bold');
    doc.text('Eficiência:', marginX + 125, 63);
    doc.setFont('helvetica', 'normal');
    doc.text(`${op.eficiencia || 0}%`, marginX + 144, 63);

    // --- Cards Métricas Produção x Refugo x Qualidade ---
    const totalRefugadas =
      op.quantidadeRefugada ??
      (op.apontamentos || []).reduce((acc, apt) => acc + (apt.quantidadeRefugada || 0), 0);

    const cardGap = 4;
    const cardWidth = (contentWidth - cardGap * 2) / 3; // (182 - 8) / 3 = 58mm
    const cardY = 73;

    // Card 1: Produção Aprovada
    doc.setDrawColor(167, 243, 208); // emerald-200
    doc.setFillColor(236, 253, 245); // emerald-50
    doc.roundedRect(marginX, cardY, cardWidth, 18, 2, 2, 'FD');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(5, 150, 105);
    doc.text('PEÇAS PRODUZIDAS', marginX + 4, cardY + 5);
    doc.setFontSize(11);
    doc.text(`${op.quantidadeProduzida || 0} / ${op.quantidade} un`, marginX + 4, cardY + 12);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    const pctMeta = op.quantidade > 0 ? Math.round(((op.quantidadeProduzida || 0) / op.quantidade) * 100) : 0;
    doc.text(`${pctMeta}% da meta da OP`, marginX + 4, cardY + 16);

    // Card 2: Peças Refugadas
    const temRefugo = totalRefugadas > 0;
    doc.setDrawColor(temRefugo ? 254 : 226, temRefugo ? 202 : 232, temRefugo ? 202 : 240);
    doc.setFillColor(temRefugo ? 254 : 248, temRefugo ? 242 : 250, temRefugo ? 242 : 252);
    doc.roundedRect(marginX + cardWidth + cardGap, cardY, cardWidth, 18, 2, 2, 'FD');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(temRefugo ? 220 : 71, temRefugo ? 38 : 85, temRefugo ? 38 : 105);
    doc.text('PEÇAS REFUGADAS', marginX + cardWidth + cardGap + 4, cardY + 5);
    doc.setFontSize(11);
    doc.text(`${totalRefugadas} unidades`, marginX + cardWidth + cardGap + 4, cardY + 12);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(
      temRefugo ? 'Refugo registrado no processo' : 'Zero refugos apontados',
      marginX + cardWidth + cardGap + 4,
      cardY + 16
    );

    // Card 3: Inspeção de Qualidade
    doc.setDrawColor(191, 219, 254); // blue-200
    doc.setFillColor(239, 246, 255); // blue-50
    doc.roundedRect(marginX + (cardWidth + cardGap) * 2, cardY, cardWidth, 18, 2, 2, 'FD');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(29, 78, 216);
    doc.text('CONTROLE DE QUALIDADE', marginX + (cardWidth + cardGap) * 2 + 4, cardY + 5);
    doc.setFontSize(10);
    doc.text(
      op.revisadoQualidade !== false ? 'Aprovado & Revisado' : 'Pendente de Revisão',
      marginX + (cardWidth + cardGap) * 2 + 4,
      cardY + 12
    );
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('Inspeção chão de fábrica', marginX + (cardWidth + cardGap) * 2 + 4, cardY + 16);

    // --- Tabela de Etapas do Processo ---
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.text('RASTREAMENTO POR ETAPAS DO PROCESSO & APONTAMENTOS', marginX, 98);

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

    // 26 + 22 + 18 + 17 + 18 + 18 + 18 + 45 = 182mm (exatamente contentWidth)
    autoTable(doc, {
      startY: 102,
      margin: { left: marginX, right: marginX },
      tableWidth: contentWidth,
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
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontSize: 7.2,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        cellPadding: 2,
      },
      bodyStyles: {
        fontSize: 7.2,
        textColor: [30, 41, 59],
        valign: 'middle',
        cellPadding: 1.8,
        overflow: 'linebreak',
      },
      columnStyles: {
        0: { fontStyle: 'bold', halign: 'left', cellWidth: 26 },
        1: { halign: 'center', cellWidth: 22 },
        2: { halign: 'center', cellWidth: 18 },
        3: { halign: 'center', fontStyle: 'bold', cellWidth: 17 },
        4: { halign: 'center', cellWidth: 18 },
        5: { halign: 'center', cellWidth: 18 },
        6: { halign: 'center', fontStyle: 'bold', cellWidth: 18 },
        7: { halign: 'left', cellWidth: 45 },
      },
      didParseCell: (data) => {
        if (data.section === 'body') {
          if (data.column.index === 6 && String(data.cell.raw).startsWith('SIM')) {
            data.cell.styles.textColor = [220, 38, 38];
            data.cell.styles.fontStyle = 'bold';
          }
          if (data.column.index === 3) {
            data.cell.styles.textColor = [5, 150, 105];
          }
        }
      },
    });

    // --- Observações Gerais se houver ---
    const finalY = (doc as any).lastAutoTable?.finalY || 180;
    if (op.observacoes && finalY < 250) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('OBSERVAÇÕES ADICIONAIS DA OP:', marginX, finalY + 8);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(op.observacoes, marginX, finalY + 13, { maxWidth: contentWidth });
    }

    // --- Footer Page Numbers & Linha divisória ---
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setDrawColor(226, 232, 240);
      doc.line(marginX, pageHeight - 12, pageWidth - marginX, pageHeight - 12);

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Virtude Big Bag's — Registro da Produção — OP #${op.opNumber}`,
        marginX,
        pageHeight - 7
      );
      doc.text(
        `Página ${i} de ${totalPages}`,
        pageWidth - marginX,
        pageHeight - 7,
        { align: 'right' }
      );
    }

    const nomeArquivo = `Registro_Producao_OP_${op.opNumber}_${(op.cliente || 'Cliente').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    if (typeof window !== 'undefined') {
      doc.save(nomeArquivo);
    }
    return doc;
  }

  /**
   * Generates a printable, high-quality PDF Report for Pedidos
   */
  public gerarRelatorioPedidosPDF(
    pedidos: Pedido[],
    ops: OrdemProducao[],
    orientacao: 'landscape' | 'portrait' = 'landscape'
  ): any {
    const PDFClass = typeof jsPDF === 'function' ? jsPDF : ((jsPDF as any).jsPDF || (jsPDF as any).default);
    const doc = new PDFClass(orientacao, 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const isLandscape = orientacao === 'landscape';

    const marginX = 14;
    const contentWidth = pageWidth - marginX * 2; // 269mm em Paisagem, 182mm em Retrato

    // --- Header Section ---
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text("VIRTUDE BIG BAG'S", marginX, 13);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225);
    doc.text('SISTEMA DE GESTÃO DE PEDIDOS & CARTEIRA COMERCIAL', marginX, 20);

    const dataHoraStr = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    doc.setFontSize(8.5);
    doc.setTextColor(226, 232, 240);
    doc.text(`Gerado em: ${dataHoraStr}`, pageWidth - marginX, 14, { align: 'right' });
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Relatório Comercial & Fabril', pageWidth - marginX, 20, { align: 'right' });

    // --- Subheader ---
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(`Relatório Geral de Pedidos (${pedidos.length} Registros)`, marginX, 38);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Posição consolidada de pedidos, volumes fabricados e saldos pendentes.', marginX, 44);

    // --- KPI Box ---
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(marginX, 48, contentWidth, 22, 2, 2, 'FD');

    const totalItensGlobal = pedidos.reduce((acc, p) => acc + (p.totalItens || 0), 0);
    const totalProdGlobal = pedidos.reduce((acc, p) => acc + (p.totalProduzido || 0), 0);
    const pedidosAbertos = pedidos.filter((p) => p.status === 'PENDENTE').length;
    const pedidosProduzindo = pedidos.filter((p) => p.status === 'EM_PRODUCAO').length;
    const pedidosConcluidos = pedidos.filter((p) => p.status === 'CONCLUIDO').length;

    const colWidth = contentWidth / 3;
    const col1X = marginX + (isLandscape ? 8 : 4);
    const col2X = marginX + colWidth + (isLandscape ? 8 : 4);
    const col3X = marginX + colWidth * 2 + (isLandscape ? 8 : 4);

    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);

    doc.setFont('helvetica', 'bold');
    doc.text('Total de Pedidos:', col1X, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(`${pedidos.length}`, col1X + 36, 55);

    doc.setFont('helvetica', 'bold');
    doc.text('Em Aberto:', col2X, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(`${pedidosAbertos}`, col2X + 26, 55);

    doc.setFont('helvetica', 'bold');
    doc.text('Em Produção:', col3X, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(`${pedidosProduzindo}`, col3X + 30, 55);

    doc.setFont('helvetica', 'bold');
    doc.text('Volume Total:', col1X, 64);
    doc.setFont('helvetica', 'normal');
    doc.text(`${totalItensGlobal.toLocaleString('pt-BR')} un`, col1X + 36, 64);

    doc.setFont('helvetica', 'bold');
    doc.text('Total Produzido:', col2X, 64);
    doc.setFont('helvetica', 'normal');
    doc.text(`${totalProdGlobal.toLocaleString('pt-BR')} un`, col2X + 32, 64);

    doc.setFont('helvetica', 'bold');
    doc.text('Finalizados:', col3X, 64);
    doc.setFont('helvetica', 'normal');
    doc.text(`${pedidosConcluidos}`, col3X + 30, 64);

    // Mapeamento de OPs
    const opMap = new Map<string, OrdemProducao>();
    ops.forEach((op) => opMap.set(op.opNumber.toUpperCase().trim(), op));

    // --- Table Data ---
    const tableData = pedidos.map((ped) => {
      const saldo = Math.max(0, (ped.totalItens || 0) - (ped.totalProduzido || 0));
      const opsFormatadas = (ped.ops || [])
        .map((opNum) => {
          const opObj = opMap.get(opNum.toUpperCase().trim());
          const etapa = opObj?.status || 'AGUARDANDO';
          return `${opNum} (${etapa})`;
        })
        .join(', ');

      return [
        ped.pedidoNumber,
        ped.cliente,
        formatarDataBR(ped.dataPedido),
        formatarDataBR(ped.dataPrevisaoEntrega),
        `${(ped.totalItens || 0).toLocaleString('pt-BR')} un`,
        `${(ped.totalProduzido || 0).toLocaleString('pt-BR')} un`,
        `${saldo.toLocaleString('pt-BR')} un`,
        ped.status === 'CONCLUIDO' ? 'FINALIZADO' : ped.status === 'EM_PRODUCAO' ? 'EM PRODUÇÃO' : ped.status,
        opsFormatadas || '-',
      ];
    });

    // Colunas Paisagem: 24 + 56 + 22 + 22 + 22 + 22 + 22 + 27 + 52 = 269mm
    const landscapeColStyles: Record<number, any> = {
      0: { fontStyle: 'bold', halign: 'center', cellWidth: 24 },
      1: { halign: 'left', cellWidth: 56 },
      2: { halign: 'center', cellWidth: 22 },
      3: { halign: 'center', cellWidth: 22 },
      4: { halign: 'center', cellWidth: 22 },
      5: { halign: 'center', cellWidth: 22 },
      6: { halign: 'center', cellWidth: 22 },
      7: { halign: 'center', fontStyle: 'bold', cellWidth: 27 },
      8: { halign: 'left', cellWidth: 52 },
    };

    // Colunas Retrato: 20 + 36 + 18 + 18 + 16 + 16 + 16 + 20 + 22 = 182mm
    const portraitColStyles: Record<number, any> = {
      0: { fontStyle: 'bold', halign: 'center', cellWidth: 20 },
      1: { halign: 'left', cellWidth: 36 },
      2: { halign: 'center', cellWidth: 18 },
      3: { halign: 'center', cellWidth: 18 },
      4: { halign: 'center', cellWidth: 16 },
      5: { halign: 'center', cellWidth: 16 },
      6: { halign: 'center', cellWidth: 16 },
      7: { halign: 'center', fontStyle: 'bold', cellWidth: 20 },
      8: { halign: 'left', cellWidth: 22 },
    };

    autoTable(doc, {
      startY: 75,
      margin: { left: marginX, right: marginX },
      tableWidth: contentWidth,
      head: [
        [
          'Nº Pedido',
          'Cliente',
          'Data Pedido',
          'Previsão',
          'Total Itens',
          'Produzido',
          'Saldo',
          'Status',
          'OPs & Etapas',
        ],
      ],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontSize: isLandscape ? 8 : 7,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        cellPadding: 2.2,
      },
      bodyStyles: {
        fontSize: isLandscape ? 7.8 : 6.8,
        textColor: [30, 41, 59],
        valign: 'middle',
        cellPadding: 2,
        overflow: 'linebreak',
      },
      columnStyles: isLandscape ? landscapeColStyles : portraitColStyles,
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 7) {
          const status = String(data.cell.raw).toUpperCase().trim();
          if (status === 'FINALIZADO' || status === 'CONCLUIDO') {
            data.cell.styles.textColor = [16, 185, 129];
          } else if (status === 'EM PRODUÇÃO' || status === 'EM_PRODUCAO') {
            data.cell.styles.textColor = [37, 99, 235];
          } else if (status === 'PENDENTE') {
            data.cell.styles.textColor = [217, 119, 6];
          } else if (status === 'CANCELADO') {
            data.cell.styles.textColor = [239, 68, 68];
          }
        }
      },
    });

    // --- Footer Page Numbers ---
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setDrawColor(226, 232, 240);
      doc.line(marginX, pageHeight - 11, pageWidth - marginX, pageHeight - 11);

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(
        "Virtude Big Bag's — Gestão de Pedidos e Controle Fabril",
        marginX,
        pageHeight - 6
      );
      doc.text(
        `Página ${i} de ${totalPages}`,
        pageWidth - marginX,
        pageHeight - 6,
        { align: 'right' }
      );
    }

    if (typeof window !== 'undefined') {
      doc.save(`Relatorio_Pedidos_Virtude_BigBags_${Date.now()}.pdf`);
    }
    return doc;
  }
}

export const pdfService = new PdfService();

