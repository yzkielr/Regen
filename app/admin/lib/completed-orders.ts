import type {Operations, Entry} from './operations';
import type {Conversation, ServiceMessage} from './service-types';

export type PurchaseStatus = 'paid' | 'ordered' | 'payment_reported' | 'order_reported';
export type PurchasedCustomer = {
  contactId: string; conversationId?: string; name: string; phone: string;
  status: PurchaseStatus; at: number; evidence: string; orderCount: number;
};
export const purchaseLabels: Record<PurchaseStatus, string> = {
  paid: 'Pembayaran terverifikasi', ordered: 'Pesanan tercatat',
  payment_reported: 'Laporan sudah bayar', order_reported: 'Laporan sudah order',
};
const normalize = (value: string) => value.toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const payment = '(?:bayar|membayar|transfer|tf|melunasi|lunas|melakukan pembayaran)';
const order = '(?:order|pesan|memesan|beli|membeli|checkout|check out)';
const completed = '(?:sudah|udah|sdh|udh|telah|barusan|baru saja)';
const person = '(?:(?:saya|aku|sy|kami|kak|baru|selesai)\\s+){0,3}';
const completedPayment = new RegExp(`\\b${completed}\\s+${person}${payment}\\b|\\b(?:saya|aku|sy|kami)\\s+${payment}\\b.{0,45}\\b(?:tadi|kemarin|barusan)\\b`);
const completedOrder = new RegExp(`\\b${completed}\\s+${person}${order}\\b|\\b(?:saya|aku|sy|kami)\\s+${order}\\b.{0,45}\\b(?:tadi|kemarin|barusan)\\b`);

// Chat text is only a customer report, never proof that money was received.
// Ignore bot/admin messages and hypothetical, negated, or quoted assertions.
export function reportedPurchase(message: ServiceMessage): 'payment_reported' | 'order_reported' | null {
  if (message.role !== 'customer' || message.status !== 'received' || !message.text || message.text.length > 4000) return null;
  let result: 'payment_reported' | 'order_reported' | null = null;
  for (const clause of message.text.match(/[^\n.!?;,]+[\n.!?;,]?/g) || []) {
    if (clause.trimEnd().endsWith('?')) continue;
    const text = normalize(clause);
    if (/\b(?:kalau|kalo|jika|misal|misalnya|seandainya|if|suppose|contoh|example|katanya|kata dia|he said|she said)\b/.test(text)) continue;
    if (/\b(?:belum|blm|belom|tidak|nggak|gak|ga|enggak|jangan|bukan|mau|ingin|akan|nanti|besok|not|haven t|hasn t|didn t|will|want to)\b.{0,30}\b(?:sudah|udah|bayar|membayar|transfer|tf|lunas|order|pesan|beli|paid|ordered|purchased|bought|payment)\b/.test(text)) continue;
    if (/\b(?:apakah|apa sudah|apa udah|apa sdh|apa udh|sudahkah|udahkah|sudah belum|udah belum|sudah masuk belum|have you|did you|has it|is it|can i|how to)\b/.test(text)) continue;
    if (/\b(?:gagal|failed|pending|dibatalkan|cancelled|canceled)\b/.test(text)) continue;
    if (completedPayment.test(text) || /\b(?:ini|berikut|terlampir|here is|here s|my)\s+(?:bukti|receipt|proof of)\s+(?:pembayaran|transfer|tf|payment)\b/.test(text) || /\b(?:i|we)\s+(?:(?:have|ve|already|just)\s+)*(?:paid|transferred)\b|\bpayment\s+(?:sent|completed|done)\b|\b(?:transfer|tf|pembayaran)\s+(?:sudah\s+|udah\s+)?(?:berhasil|selesai|sukses|lunas)\b/.test(text)) return 'payment_reported';
    if (completedOrder.test(text) || /\b(?:i|we)\s+(?:(?:have|ve|already|just)\s+)*(?:ordered|purchased|bought)\b|\b(?:pesanan|order|barang)\s+saya\s+(?:sudah|udah)\s+(?:sampai|diterima)\b/.test(text)) result = 'order_reported';
  }
  return result;
}

const paidStatuses = new Set(['paid', 'ready_for_packing', 'shipped', 'completed']);
const orderStatuses = new Set(['confirmed', 'awaiting_payment', ...paidStatuses]);
const timestamp = (value: unknown) => typeof value === 'number' && Number.isFinite(value) ? value : 0;
const isRealOrder = (o: Entry) => o.test !== true && o.demoOnly !== true && orderStatuses.has(String(o.status));

// Derived from the saved workspace, so existing history is included immediately
// and every normal workspace refresh picks up new orders/messages. No writes,
// AI calls, invoice transitions, or changes to conversation mode are performed.
export function purchasedCustomers(state?: Operations): PurchasedCustomer[] {
  if (!state) return [];
  const contacts = new Map(state.records.contacts.filter(c => c.demoOnly !== true).map(c => [c.id, c]));
  const chats = new Map<string, Conversation>();
  const evidence = new Map<string, {status: PurchaseStatus; at: number; text: string; chat?: string}>();
  const counts = new Map<string, number>();
  const priority = {paid: 4, payment_reported: 3, ordered: 2, order_reported: 1};
  const add = (id: string, value: {status: PurchaseStatus; at: number; text: string; chat?: string}) => {
    const previous = evidence.get(id);
    if (!previous || value.at > previous.at || value.at === previous.at && priority[value.status] > priority[previous.status]) evidence.set(id, value);
  };
  for (const chat of state.service?.conversations || []) {
    if (chat.test || !contacts.has(chat.contactId)) continue;
    const previous = chats.get(chat.contactId);
    if (!previous || chat.updatedAt > previous.updatedAt) chats.set(chat.contactId, chat);
    for (const message of chat.messages) {
      const status = reportedPurchase(message);
      if (status) add(chat.contactId, {status, at: message.at, text: message.text.slice(0, 320), chat: chat.id});
    }
  }
  const matchedPayments = new Map<string, number>();
  for (const payment of state.service?.payments || []) {
    if (payment.test || payment.status !== 'matched' || !(payment.verified || payment.reviewedBy)) continue;
    matchedPayments.set(payment.orderId, Math.max(matchedPayments.get(payment.orderId) || 0, payment.reviewedAt || payment.receivedAt || payment.occurredAt));
  }
  for (const o of state.records.orders) {
    if (!isRealOrder(o) || !contacts.has(String(o.contactId))) continue;
    const id = String(o.contactId);
    counts.set(id, (counts.get(id) || 0) + 1);
    const paidAt = matchedPayments.get(o.id) || timestamp(o.paidAt);
    const paid = paidStatuses.has(String(o.status)) || !!paidAt;
    const at = paid ? paidAt || o.updatedAt : timestamp(o.invoiceAt) || o.createdAt;
    const chat = chats.get(id);
    add(id, {status: paid ? 'paid' : 'ordered', at,
      text: `Invoice ${String(o.number || o.id)}${paid ? ' · pembayaran tercatat lunas' : ' · menunggu pembayaran'}`,
      chat: chat?.id});
  }
  return [...evidence].map(([contactId, value]) => {
    const contact = contacts.get(contactId)!;
    return {contactId, conversationId: value.chat || chats.get(contactId)?.id,
      name: String(contact.name || 'Pelanggan'), phone: String(contact.phone || ''),
      status: value.status, at: value.at, evidence: value.text, orderCount: counts.get(contactId) || 0};
  }).sort((a, b) => b.at - a.at || a.name.localeCompare(b.name));
}
