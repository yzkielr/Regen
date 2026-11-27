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
const payment = '(?:bayar|membayar|dibayar|transfer(?:in)?|ditransfer|tf|trf|melunasi|lunasi|dilunasi|lunas|melakukan pembayaran)';
const order = '(?:order|pesan|memesan|beli|membeli|check ?out|cek ?out|co|melakukan (?:pemesanan|pembelian|check ?out))';
const completion = '(?:sudah|udah|uda|sdh|udh|dah|telah|barusan|baru(?: saja| aja)?|selesai|berhasil|sukses|done)';
const already = '(?:sudah|udah|uda|sdh|udh|dah|telah|selesai|berhasil|sukses|done)';
const person = '(?:(?:saya|aku|sy|aq|kami|kak|baru|selesai)\\s+){0,3}';
const past = '(?:tadi(?: pagi| siang| sore| malam)?|kemarin|barusan)';
const paymentNoun = '(?:pembayaran|payment|transfer|tf|trf|invoice|tagihan)';
const orderNoun = '(?:pesanan|pemesanan|orderan|order|pembelian|purchase|check ?out|cek ?out|co)';
const nounOwner = '(?:nya)?(?:\\s+(?:nya|saya|aku|sy|kami|my))?';
const negative = '(?:belum|blm|blum|belom|tidak|nggak|gak|ga|enggak|jangan|bukan|mau|ingin|akan|nanti|besok|not|never|haven t|hasn t|didn t|will|want to|please|minta|tolong)';
// Patterns contain only the fixed rules above. Reuse them across chat history.
const patterns = new Map<string, RegExp>();
const matches = (pattern: string, text: string) => {
  let regex = patterns.get(pattern);
  if (!regex) {regex = new RegExp(`\\b(?:${pattern})\\b`); patterns.set(pattern, regex);}
  return regex.test(text);
};
function reportedAction(text: string, action: string, noun: string, english: string, result: string) {
  const target = `(?:${action}|${noun}|${english})`;
  if (matches(`${negative}\\s+(?:(?:saya|aku|sy|kami|kak|bisa|pernah|jadi|selesai|berhasil|sudah|udah|sdh|udh|akan|have|yet|to|already|just)\\s+){0,4}${target}`, text)) return false;
  if (matches(`${target}${nounOwner}\\s+(?:(?:masih|is|has|been)\\s+){0,3}(?:belum|blm|belom|tidak|gagal|failed|not|pending)`, text)) return false;
  return matches(`${completion}\\s+${person}${action}|${past}\\s+${person}${action}|${action}(?:nya)?\\s+${person}${already}|(?:saya|aku|sy|aq|kami)\\s+${action}.{0,40}\\b${past}`, text) ||
    matches(`${noun}${nounOwner}\\s+(?:(?:${already}|is|has been)\\s+)?(?:${result})`, text) ||
    matches(`(?:i|we)(?:\\s+(?:have|ve|already|just|successfully))*\\s+${english}`, text);
}

// Chat text is only a customer report, never proof that money was received.
// Action-specific negatives allow "sudah checkout, belum bayar" to remain an
// order report without becoming a payment report.
export function reportedPurchase(message: ServiceMessage, previous?: ServiceMessage): 'payment_reported' | 'order_reported' | null {
  if (message.role !== 'customer' || message.status !== 'received' || !message.text || message.text.length > 4000) return null;
  let result: 'payment_reported' | 'order_reported' | null = null;
  for (const clause of message.text.match(/[^\n.!?;,]+[\n.!?;,]?/g) || []) {
    if (clause.trimEnd().endsWith('?') || /^\s*>/.test(clause)) continue;
    const text = normalize(clause);
    if (/\b(?:kalau|kalo|jika|misal|misalnya|seandainya|if|suppose|contoh|example|katanya|kata dia|he said|she said)\b/.test(text)) continue;
    if (/\b(?:apakah|apa sudah|apa udah|apa sdh|apa udh|sudahkah|udahkah|sudah belum|udah belum|sudah masuk belum|have you|did you|has it|is it|can i|how to)\b/.test(text)) continue;
    if (/\b(?:gagal|failed|pending|dibatalkan|cancelled|canceled)\b/.test(text)) continue;
    if (reportedAction(text, payment, paymentNoun, '(?:paid|transferred|made (?:the |a |my )?payment|completed (?:the |my )?payment|sent (?:the |my )?payment)', 'sent|completed|done|paid|berhasil|selesai|sukses|lunas|dibayar') ||
        /^(?:(?:ini|berikut|terlampir|here is|here s|my)\s+(?:bukti|receipt|proof of)\s+(?:pembayaran|transfer|tf|trf|payment)|(?:bukti (?:pembayaran|transfer|tf|trf)|payment receipt|proof of payment)\s+(?:terlampir|attached))(?:\s+(?:saya|aku|sy|kak|ya|ka|min))*$/.test(text) ||
        /^(?:done payment|paid)(?:\s+(?:kak|ya|ka|min|thanks|thank you))*$/.test(text)) return 'payment_reported';
    if (reportedAction(text, order, orderNoun, '(?:ordered|purchased|bought|checked out|completed (?:the |my )?checkout|placed (?:an |my |the )?order|made (?:a |my |the )?purchase)', 'placed|confirmed|completed|done|berhasil|selesai|sukses|masuk|dibuat|dikonfirmasi') ||
        /\b(?:pesanan|order|barang)\s+saya\s+(?:sudah|udah)\s+(?:sampai|diterima)\b/.test(text)) result = 'order_reported';
  }
  if (result) return result;
  // A short "sudah/done" only answers a recent, explicit completion question
  // or checkout/payment instruction. It cannot inherit arbitrary old context.
  const text = normalize(message.text);
  if (!/^(?:(?:sudah|udah|sdh|udh|uda|dah|done|selesai)(?:\s+selesai)?)(?:\s+(?:kak|ya|ka|min|thanks|thank you))*$/.test(text) || /\?/.test(message.text)) return null;
  if (!previous || !['bot', 'admin', 'owner'].includes(previous.role) || !['sent', 'delivered', 'read'].includes(previous.status) || message.at < previous.at || message.at - previous.at > 2 * 60 * 60 * 1000) return null;
  const context = normalize(previous.text);
  if (/\b(?:kalau|kalo|jika|if|contoh|example|belum|not|mau|ingin|want to)\b/.test(context)) return null;
  const completionQuestion = (action: string) => matches(`(?:sudah|udah|have you|did you)\\s+(?:(?:kakak|kak|anda|selesai|already|completed)\\s+){0,3}(?:${action})|(?:silakan|silahkan|please)\\s+(?:(?:lakukan|complete|make|the|your)\\s+){0,3}(?:${action})`, context);
  if (completionQuestion(`${payment}|paid|transferred|payment`)) return 'payment_reported';
  if (completionQuestion(`${order}|checked out|placed an order|checkout`)) return 'order_reported';
  return null;
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
    let previousMessage: ServiceMessage | undefined;
    for (const message of chat.messages) {
      const status = reportedPurchase(message, previousMessage);
      if (message.role !== 'note' && !['draft', 'cancelled'].includes(message.status)) previousMessage = message;
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

// Only retire the lead that predates the completion. A later purchase intent
// from a returning customer remains a new lead. IDs also protect read receipts
// from clearing a different alert that arrives while the request is in flight.
export function completedOrderLeads(state: Operations | undefined, customers: PurchasedCustomer[]) {
  const completedAt = new Map(customers.map(c => [c.contactId, c.at]));
  return (state?.service?.conversations || []).filter(c => !c.test && c.orderAlert && !c.orderAlert.readAt &&
    completedAt.has(c.contactId) && completedAt.get(c.contactId)! >= c.orderAlert.at)
    .map(c => ({conversationId: c.id, messageId: c.orderAlert!.messageId}));
}
