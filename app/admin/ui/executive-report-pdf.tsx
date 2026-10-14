'use client';
import { adminFetch } from './admin-client';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import type { CellDef } from 'jspdf-autotable';
import { reportDateTime, reportKindLabels, reportMoney } from '../lib/executive-report';
import type { ExecutiveReport } from '../lib/executive-report';

export type ReportFonts = { regular: string; bold: string };
const green: [number, number, number] = [15, 81, 69], ink: [number, number, number] = [31, 48, 60], muted: [number, number, number] = [101, 117, 128];
let fonts: Promise<ReportFonts> | undefined;
export function loadReportFonts() {
  if (!fonts) fonts = Promise.all(['Regular', 'Bold'].map(async style => {
    const r = await adminFetch(`/admin-assets/pdf-assets/standard_fonts/LiberationSans-${style}.ttf`, { cache: 'force-cache', signal: AbortSignal.timeout(20000) });
    if (!r.ok) throw Error('Font laporan belum dapat dimuat. Silakan coba lagi.');
    const bytes = new Uint8Array(await r.arrayBuffer());
    if (bytes.length < 1000) throw Error('Font laporan tidak lengkap. Silakan coba lagi.');
    let text = ''; for (let i = 0; i < bytes.length; i += 8192) text += String.fromCharCode(...bytes.subarray(i, i + 8192));
    return btoa(text);
  })).then(([regular, bold]) => ({ regular, bold })).catch(e => { fonts = undefined; throw e; });
  return fonts;
}

export function createExecutivePdf(report: ExecutiveReport, font: ReportFonts) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true, putOnlyUsedFonts: true });
  for (const [style, bytes] of Object.entries(font)) { const name = `Regen-${style}.ttf`; doc.addFileToVFS(name, bytes); doc.addFont(name, 'Regen', style === 'regular' ? 'normal' : 'bold'); }
  doc.setFont('Regen'); doc.setProperties({ title: `Laporan Eksekutif ${reportKindLabels[report.period.kind]} - ${report.period.label}`, author: report.businessName, subject: 'Ringkasan dan rincian pesanan Regen' });
  const text = (value: string, x: number, y: number, size = 10, bold = false, color = ink) => { doc.setFont('Regen', bold ? 'bold' : 'normal'); doc.setFontSize(size); doc.setTextColor(...color); doc.text(value, x, y); };
  doc.setFillColor(...green); doc.rect(0, 0, 210, 4, 'F');
  text('Regen', 14, 20, 25, true, green); text('LAPORAN EKSEKUTIF', 14, 31, 16, true);
  text(`${reportKindLabels[report.period.kind]} | ${report.period.label}`, 14, 39, 11);
  text(`Dibuat ${reportDateTime(report.generatedAt)}`, 14, 46, 8, false, muted);
  const cards = [['PESANAN', String(report.summary.orders)], ['NILAI DIBAYAR', reportMoney(report.summary.paidValue)], ['BELUM DIBAYAR', reportMoney(report.summary.pendingValue)]];
  cards.forEach(([label, amount], i) => { const x = 14 + i * 62; doc.setFillColor(241, 246, 244); doc.roundedRect(x, 54, 58, 24, 2, 2, 'F'); text(label, x + 4, 62, 8, true, muted); const size = amount.length > 20 ? 10 : amount.length > 14 ? 12 : 16; text(amount, x + 4, 72, size, true, green); });
  const note = 'Berdasarkan tanggal pembuatan pesanan (WIB). Data simulasi dikecualikan. Status pembayaran mengikuti catatan saat laporan diunduh; bukan arus kas berdasarkan tanggal pembayaran.';
  doc.setFontSize(8); const noteLines = doc.splitTextToSize(note, 182); text(noteLines, 14, 86, 8, false, muted);
  autoTable(doc, { startY: 102, margin: { left: 14, right: 14, top: 24, bottom: 17 }, theme: 'plain', styles: { font: 'Regen', fontSize: 9, cellPadding: 3, textColor: ink },
    head: [['RINGKASAN STATUS', 'PESANAN', 'NILAI']], headStyles: { fillColor: green, textColor: 255 }, columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
    body: [['Sudah dibayar (termasuk dikirim / selesai)', String(report.summary.paidOrders), reportMoney(report.summary.paidValue)], ['Belum dibayar (termasuk draft)', String(report.summary.pendingOrders), reportMoney(report.summary.pendingValue)], ['Dibatalkan', String(report.summary.cancelledOrders), reportMoney(report.summary.cancelledValue)]] });
  let y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 13;
  text('RINCIAN PESANAN', 14, y, 11, true, green); y += 5;
  if (!report.orders.length) { text('Tidak ada pesanan pada periode ini.', 14, y + 8, 10); }
  report.orders.forEach((order, index) => {
    const adjustment = `Subtotal ${reportMoney(order.subtotal)}   |   Diskon ${reportMoney(order.discount)}\nPajak ${order.taxPercent}%: ${reportMoney(order.tax)}   |   Ongkir ${reportMoney(order.shipping)}`;
    const heading: CellDef = { content: `${index + 1}. ${order.number}  |  ${order.status}\n${reportDateTime(order.createdAt)}`, colSpan: 4, styles: { fillColor: green, textColor: 255, fontStyle: 'bold', fontSize: 9 } };
    const customer: CellDef = { content: `Pemesan: ${order.name}\nNo. HP / WhatsApp: ${order.phone}`, colSpan: 4, styles: { fillColor: [238, 245, 242], textColor: ink, fontStyle: 'normal' } };
    autoTable(doc, { startY: y, margin: { left: 14, right: 14, top: 24, bottom: 17 }, pageBreak: 'avoid', rowPageBreak: 'avoid', showHead: 'everyPage', showFoot: 'lastPage', theme: 'grid',
      styles: { font: 'Regen', fontStyle: 'normal', fontSize: 9, cellPadding: 3, textColor: ink, lineColor: [217, 226, 222], lineWidth: 0.15, overflow: 'linebreak' },
      headStyles: { fillColor: [246, 248, 247], textColor: ink, fontStyle: 'bold' }, footStyles: { fillColor: [246, 248, 247], textColor: ink, fontStyle: 'bold' },
      columnStyles: { 0: { cellWidth: 85 }, 1: { cellWidth: 17, halign: 'right' }, 2: { cellWidth: 40, halign: 'right' }, 3: { cellWidth: 40, halign: 'right' } },
      head: [[heading], [customer], ['Produk yang dipesan', 'Jumlah', 'Harga satuan', 'Subtotal item']],
      body: order.items.map(i => [i.name, String(i.quantity), reportMoney(i.price), reportMoney(i.subtotal)]),
      foot: [[{ content: adjustment, colSpan: 4, styles: { fontStyle: 'normal', fontSize: 8, halign: 'left' } }], [{ content: 'TOTAL PESANAN', colSpan: 3, styles: { halign: 'right' } }, { content: reportMoney(order.total), styles: { halign: 'right', textColor: green } }]] });
    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 7;
  });
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page);
    if (page > 1) { text('Regen | Laporan Eksekutif', 14, 13, 10, true, green); text(`${reportKindLabels[report.period.kind]}: ${report.period.from} - ${report.period.to}`, 14, 19, 8, false, muted); }
    doc.setDrawColor(217, 226, 222); doc.line(14, 282, 196, 282);
    text('Privat - Regen Admin', 14, 288, 8, false, muted);
    doc.setFontSize(8); doc.text(`Halaman ${page} / ${pages}`, 196, 288, { align: 'right' });
  }
  return doc;
}

export async function downloadExecutivePdf(report: ExecutiveReport) { const font = await loadReportFonts(); const doc = createExecutivePdf(report, font); doc.save(report.filename); }
