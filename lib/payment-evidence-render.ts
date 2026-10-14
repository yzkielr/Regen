import path from 'node:path';
import { parsePaperReceipt, rupiah } from './paper-mail-parse';

export const PAYMENT_EVIDENCE_SIZE = 1200;
const clean = (value: string) => value.replace(/[\x00-\x1f\x7f\u200b-\u200f\u202a-\u202e\u2066-\u2069]/g, ' ').replace(/\s+/g, ' ').trim();
const xml = (value: string) => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]!));
const labels = /^(?:no\.?\s*(?:invoice|referensi|telp\.?\s*partner)|tgl\.?\s*pembayaran|tanggal\s+pembayaran|nama\s+(?:partner|pembayar)|metode\s+pembayaran|detail\s+(?:transaksi|pengirim)|total\s+dana\s+diterima|nominal\s+uji|referensi\s+uji|customer|pelanggan|telepon\s+uji)\s*(?:[:：].*)?$/i;

// Display-only extraction; reconciliation still uses the original strict parser.
function field(body: string, label: RegExp) {
  const lines = body.split(/\r?\n/).map(clean).filter(Boolean);
  const values = new Set<string>();
  for (let i = 0; i < lines.length; i++) {
    const match = label.exec(lines[i]);
    if (!match) continue;
    const inline = clean(lines[i].slice(match[0].length).replace(/^[:：]\s*/, ''));
    const value = inline || lines[i + 1] || '';
    if (value && !labels.test(value) && !/^[-_=]{3,}$/.test(value)) { values.add(value); if (!inline) i++; }
  }
  return values.size === 1 ? [...values][0] : '';
}

export function paymentEvidenceDetails(from: string, subject: string, receivedAt: number, body: string, test = false) {
  const receipt = parsePaperReceipt(subject, body);
  const testAmounts = [...new Set([...body.matchAll(/^Nominal\s+uji\s*[:：]\s*((?:Rp\.?|IDR)\s*[\d.,]+)/gim)].map(match => rupiah(match[1])).filter(Boolean))];
  const amount = test ? (testAmounts.length === 1 ? testAmounts[0] : 0) : receipt.amount;
  const date = new Date(receivedAt);
  return {
    test,
    review: !test && !receipt.success,
    amount: amount > 0 ? `Rp ${amount.toLocaleString('id-ID')}` : 'Periksa email asli',
    reference: receipt.reference || 'Periksa email asli',
    customer: field(body, /^(?:Nama\s+(?:Partner|Pembayar)|Customer|Pelanggan)\b\s*/i) || 'Tidak tercantum',
    paidAt: field(body, /^(?:Tgl\.?|Tanggal)\s+Pembayaran\b\s*/i) || 'Tidak tercantum',
    phone: field(body, /^(?:No\.?\s*Telp\.?\s*Partner|Telepon\s+uji)\b\s*/i) || 'Tidak tercantum',
    method: field(body, /^Metode\s+Pembayaran\b\s*/i) || 'Tidak tercantum',
    transaction: receipt.transactionId || (test ? 'Pengujian sistem Regen' : 'Periksa email asli'),
    from: clean(from),
    receivedAt: Number.isFinite(date.getTime()) ? date.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', dateStyle: 'medium', timeStyle: 'short' }) + ' WIB' : 'Tidak tercantum',
  };
}

export async function renderPaymentEmail(from: string, subject: string, receivedAt: number, body: string, test = false) {
  const { default: sharp } = await import('sharp');
  const details = paymentEvidenceDetails(from, subject, receivedAt, body, test);
  const accent = test || details.review ? '#80591c' : '#075345';
  const ink = '#17392f', muted = '#5a6e66';
  const layers: { input: Buffer; left: number; top: number }[] = [];
  let shortened = false;
  async function text(value: string, left: number, top: number, width: number, height: number, size: number, options: { bold?: boolean; color?: string; min?: number } = {}) {
    const original = clean(value);
    const fontfile = path.join(process.cwd(), 'public/admin-assets/pdf-assets/standard_fonts', options.bold ? 'LiberationSans-Bold.ttf' : 'LiberationSans-Regular.ttf');
    const draw = (content: string, fontSize: number) => sharp({ text: {
      text: `<span foreground="${options.color || ink}" weight="${options.bold ? 'bold' : 'normal'}">${xml(content)}</span>`,
      font: `Liberation Sans ${fontSize}`, fontfile, width, rgba: true, dpi: 72, spacing: 5, wrap: 'word-char',
    } }).png().toBuffer({ resolveWithObject: true });
    const min = options.min || size;
    let fontSize = size, result = await draw(original, fontSize);
    while (result.info.height > height && fontSize > min) { fontSize = Math.max(min, fontSize - 2); result = await draw(original, fontSize); }
    if (result.info.height > height) {
      shortened = true;
      const chars = Array.from(original); let low = 0, high = chars.length;
      while (low < high) {
        const mid = Math.ceil((low + high) / 2), candidate = await draw(chars.slice(0, mid).join('') + '…', fontSize);
        if (candidate.info.height <= height) low = mid; else high = mid - 1;
      }
      result = await draw(chars.slice(0, low).join('') + '…', fontSize);
    }
    if (result.info.height > height || result.info.width > width) throw Error('Payment evidence text exceeds its layout bounds');
    layers.push({ input: result.data, left, top });
  }
  const background = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
    <rect width="1200" height="1200" fill="#edf3ef"/>
    <rect x="48" y="48" width="1104" height="1104" rx="28" fill="#ffffff" stroke="#d7e3db" stroke-width="2"/>
    <rect x="92" y="134" width="58" height="5" rx="2" fill="${accent}"/>
    <rect x="92" y="268" width="1016" height="170" rx="20" fill="${accent}"/>
    <path d="M92 589H1108 M92 733H1108 M92 875H1108 M92 1016H1108" stroke="#e2e9e4" stroke-width="2"/>
  </svg>`);
  await text('Regen', 92, 84, 350, 45, 38, { bold: true });
  await text(test ? 'PENGUJIAN SISTEM' : 'ARSIP EMAIL PEMBAYARAN', 724, 98, 384, 27, 19, { color: muted });
  await text(test ? 'SIMULASI — BUKAN PEMBAYARAN' : 'Ringkasan email pembayaran', 92, 170, 1016, 58, 42, { bold: true, min: 32 });
  await text(test ? 'Jangan dikemas / jangan dikirim. Tidak ada dana diterima.' : details.review ? 'Perlu diperiksa — informasi pembayaran belum dapat dipastikan.' : 'Notifikasi pembayaran masuk · Paper.id', 92, 231, 1016, 27, 22, { color: muted });
  await text(test ? 'NOMINAL SIMULASI' : 'NOMINAL PADA EMAIL', 124, 300, 952, 27, 19, { color: '#dbece2' });
  await text(details.amount, 124, 342, 952, 72, 64, { color: '#ffffff', bold: true, min: 40 });
  await text(test ? 'REFERENSI UJI' : 'NOMOR INVOICE', 92, 473, 1016, 25, 19, { color: muted });
  await text(details.reference, 92, 511, 1016, 64, 35, { bold: true, min: 26 });
  const cells = [
    ['NAMA PARTNER', details.customer, 92, 610], ['TANGGAL PEMBAYARAN', details.paidAt, 630, 610],
    ['NO. TELEPON PARTNER', details.phone, 92, 754], ['METODE PEMBAYARAN', details.method, 630, 754],
  ] as const;
  for (const [label, value, x, y] of cells) {
    await text(label, x, y, 478, 25, 18, { color: muted });
    await text(value, x, y + 37, 478, 76, 28, { min: 22 });
  }
  await text('REFERENSI TRANSAKSI', 92, 896, 1016, 25, 19, { color: muted });
  await text(details.transaction, 92, 933, 1016, 63, 30, { min: 24 });
  await text(`Dari: ${details.from}`, 92, 1040, 1016, 28, 21, { color: muted, min: 19 });
  await text(`Email diterima: ${details.receivedAt}`, 92, 1076, 1016, 28, 21, { color: muted });
  await text(test ? 'Email uji dibuat sistem Regen; bukan notifikasi pembayaran asli.' : shortened ? 'Salinan terstruktur; kolom bertanda … diringkas. Detail lengkap ada di email asli.' : 'Salinan terstruktur dari teks email; bukan tangkapan layar Paper.id.', 92, 1120, 1016, 23, 18, { color: muted, min: 17 });
  return sharp(background).composite(layers).png().toBuffer();
}
