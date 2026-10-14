import { orderTotal } from './operations';
import type { Operations } from './operations';

export type ReportKind = 'week' | 'month' | 'year';
export const reportKindLabels = { week: 'Mingguan', month: 'Bulanan', year: 'Tahunan' };
const day = 86400000, wib = 7 * 3600000;
export const wibDate = (time = Date.now()) => new Date(time + wib).toISOString().slice(0, 10);
const calendar = (date: Date) => date.toISOString().slice(0, 10);
const dateLabel = (date: Date) => new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
export function reportPeriod(kind: ReportKind, value: string) {
  const pattern = kind === 'week' ? /^\d{4}-\d{2}-\d{2}$/ : kind === 'month' ? /^\d{4}-\d{2}$/ : /^\d{4}$/;
  if (!pattern.test(value)) throw Error('Pilih periode laporan yang valid.');
  const parts = value.split('-').map(Number), year = parts[0], month = parts[1] ?? 1, date = parts[2] ?? 1;
  if (year < 1900 || year > 9998 || month < 1 || month > 12 || date < 1 || date > 31) throw Error('Pilih periode laporan yang valid.');
  const start = new Date(Date.UTC(year, month - 1, date));
  if (start.getUTCMonth() !== month - 1 || start.getUTCDate() !== date) throw Error('Tanggal laporan tidak valid.');
  if (kind === 'week') start.setUTCDate(start.getUTCDate() - (start.getUTCDay() + 6) % 7);
  const end = new Date(start);
  if (kind === 'week') end.setUTCDate(end.getUTCDate() + 7);
  else if (kind === 'month') end.setUTCMonth(end.getUTCMonth() + 1);
  else end.setUTCFullYear(end.getUTCFullYear() + 1);
  const through = new Date(end.getTime() - day);
  return { kind, from: calendar(start), to: calendar(through), start: start.getTime() - wib, end: end.getTime() - wib,
    label: kind === 'year' ? String(year) : kind === 'month' ? new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(start) : `${dateLabel(start)} - ${dateLabel(through)}` };
}
export const reportStatuses: Record<string, string> = { draft: 'Draft', confirmed: 'Menunggu pembayaran', awaiting_payment: 'Menunggu pembayaran', paid: 'Dibayar', ready_for_packing: 'Siap dikemas', shipped: 'Dikirim', completed: 'Selesai', cancelled: 'Dibatalkan' };
const paidStatuses = new Set(['paid', 'ready_for_packing', 'shipped', 'completed']);
export const reportMoney = (n: number) => `Rp ${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(n)}`;
export const reportDateTime = (n: number) => new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' }).format(n) + ' WIB';

export function buildExecutiveReport(state: Operations, kind: ReportKind, value: string, generatedAt = Date.now()) {
  const period = reportPeriod(kind, value), contacts = new Map(state.records.contacts.map(c => [c.id, c]));
  const orders = state.records.orders.filter(o => o.test !== true && o.demoOnly !== true && contacts.get(String(o.contactId))?.demoOnly !== true && o.createdAt >= period.start && o.createdAt < period.end)
    .sort((a, b) => a.createdAt - b.createdAt || String(a.number ?? a.id).localeCompare(String(b.number ?? b.id)))
    .map(o => {
      let raw: unknown;
      try { raw = JSON.parse(String(o.items)); } catch { throw Error(`Rincian pesanan ${o.number || o.id} tidak valid. Periksa pesanan sebelum mengunduh.`); }
      if (!Array.isArray(raw) || !raw.length || raw.some(l => !l || typeof l.name !== 'string' || !Number.isFinite(l.quantity) || l.quantity <= 0 || !Number.isFinite(l.price) || l.price < 0)) throw Error(`Rincian pesanan ${o.number || o.id} tidak lengkap.`);
      const items = raw.map(l => ({ name: String(l.name), quantity: Number(l.quantity), price: Number(l.price), subtotal: Number(l.quantity) * Number(l.price) }));
      const contact = contacts.get(String(o.contactId)), subtotal = items.reduce((n, l) => n + l.subtotal, 0), discount = Number(o.discount || 0), shipping = Number(o.shipping || 0), taxPercent = Number(o.taxPercent || 0), total = orderTotal(o);
      if (![subtotal, discount, shipping, taxPercent, total].every(Number.isFinite) || discount < 0 || discount > subtotal || shipping < 0 || taxPercent < 0 || taxPercent > 100) throw Error(`Nilai pesanan ${o.number || o.id} tidak valid.`);
      const paid = paidStatuses.has(String(o.status)), cancelled = o.status === 'cancelled';
      return { id: o.id, number: String(o.number || o.id), createdAt: o.createdAt, name: String(contact?.name || 'Nama belum tersedia'), phone: String(contact?.phone || 'Nomor belum tersedia'), address: String(o.address || contact?.address || ''), status: reportStatuses[String(o.status)] || String(o.status || 'Belum diketahui'), statusCode: String(o.status), paid, cancelled, items, subtotal, discount, taxPercent, tax: (subtotal - discount) * taxPercent / 100, shipping, total };
    });
  const sum = (match: (o: typeof orders[number]) => boolean) => orders.filter(match).reduce((n, o) => n + o.total, 0);
  return { businessName: state.settings.businessName || 'Regen', generatedAt, period, orders,
    summary: { orders: orders.length, paidOrders: orders.filter(o => o.paid).length, paidValue: sum(o => o.paid), pendingOrders: orders.filter(o => !o.paid && !o.cancelled).length, pendingValue: sum(o => !o.paid && !o.cancelled), cancelledOrders: orders.filter(o => o.cancelled).length, cancelledValue: sum(o => o.cancelled), units: orders.filter(o => !o.cancelled).reduce((n, o) => n + o.items.reduce((v, i) => v + i.quantity, 0), 0) },
    filename: `regen-laporan-${reportKindLabels[kind].toLowerCase()}-${period.from}_${period.to}.pdf` };
}
export type ExecutiveReport = ReturnType<typeof buildExecutiveReport>;
