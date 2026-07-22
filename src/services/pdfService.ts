import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { IndicadoresKpi, OrdemProducao } from '../types';

export class PdfService {
  /**
   * Generates a printable, high-quality PDF Report for Virtude Big Bags
   */
  public gerarRelatorioProducaoPDF(
    titulo: string,
    subtitulo: string,
    ops: OrdemProducao[],
    kpis: IndicadoresKpi
  ): void {
    const doc = new jsPDF('portrait', 'mm', 'a4');
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

    doc.save(`Relatorio_Producao_Virtude_BigBags_${Date.now()}.pdf`);
  }
}

export const pdfService = new PdfService();
