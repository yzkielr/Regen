import type { Operations } from './operations';
import type { Conversation, ServiceMessage } from './service-types';

const normalize = (text: string) => text.toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const purchase = /\b(?:pesan|pemesanan|order|beli|checkout|check out|ambil|book|booking|buy|purchase)\b/;
const cancelled = /\b(?:batal(?:kan)?|cancel|gajadi|ga jadi|gak jadi|nggak jadi|tidak jadi|belum jadi)\b/;
const deferred = /\b(?:belum|jangan|tidak|nggak|gak|ga|enggak|nanti|besok|minggu depan|bulan depan|mikir|pikir|pertimbang|maybe|later|not yet|don t)\b/;

// This classifier only creates an internal lead alert. It never places orders,
// edits bot instructions, or sends a customer message.
export function orderIntent(chat: Conversation, message: ServiceMessage): 'order' | 'cancel' | null {
  if (message.role !== 'customer' || message.status === 'cancelled') return null;
  const text = normalize(message.text);
  if (!text || message.text.length > 4000) return null;
  if (cancelled.test(text)) return 'cancel';
  if (deferred.test(text)) return null;
  if (/\b(?:cara|gimana|bagaimana|how|syarat|minimum|minimal|minimalnya)\b/.test(text)) return null;
  if (/\b(?:pesanan saya|order saya|pesanan sebelumnya|sudah pesan|sudah order|udah pesan|udah order|resi|sampai mana|track|tracking)\b/.test(text)) return null;
  // Questions about photos, dosage, examples, or hypothetical purchases are inquiries.
  if (/\b(?:kalau|kalo|jika|misal|misalnya|seandainya|if|contoh|foto|gambar|testimoni|dosis)\b/.test(text)) return null;
  if (/\b(?:saya|aku|sy|aq|kami|gue|gw|i|we)\s+(?:(?:mau|ingin|jadi|akan|want to|would like to)\s+)?(?:pesan|order|beli|checkout|check out|ambil|book|buy|purchase)\b/.test(text) ||
      /\b(?:mau|ingin|pengen|pgn|jadi|lanjut|lanjutkan|boleh|bisa)\s+(?:pesan|order|beli|checkout|check out)\b/.test(text) ||
      /\b(?:tolong|bantu|buatkan|bikinkan)\s+(?:(?:saya|aku|sy)\s+)?(?:pesanan|order|invoice|tagihan)\b/.test(text) ||
      /\b(?:kirim|minta|boleh minta)\s+(?:nomor\s+)?(?:rekening|invoice|tagihan|payment link|link pembayaran|link checkout)\b/.test(text)) return 'order';
  const index = chat.messages.findIndex(m => m.id === message.id);
  const history = chat.messages.slice(Math.max(0, index - 6), index).filter(m => m.role !== 'note' && !['draft', 'cancelled'].includes(m.status));
  const last = history.at(-1);
  const context = normalize(history.map(m => m.text).join(' '));
  const buyingContext = purchase.test(context) || /\b(?:produk|paket|package|vial|pen|cartridge|harga|rp|mg|iu)\b/.test(context);
  if (buyingContext && /^(?:(?:iya|ya|oke|ok|baik|jadi|boleh|kak)\s+)*(?:ambil|pesan|order|beli|checkout|bungkus|gas)\s+/.test(text)) return 'order';
  // A bare "iya" only confirms an explicit purchase question from the other side.
  if (last && last.role !== 'customer' && message.at - last.at < 2 * 60 * 60 * 1000 &&
      /^(?:iya|ya|yes|yup|oke|ok|boleh|betul|lanjut)(?:\s+(?:kak|ka|min|dong|ya|silakan|silahkan))*$/.test(text) &&
      /\b(?:mau|ingin|jadi|lanjut|buatkan|proses|konfirmasi|would you like)\b/.test(normalize(last.text)) && purchase.test(normalize(last.text)) &&
      !/\b(?:info|informasi|foto|cara|syarat)\b/.test(normalize(last.text))) return 'order';
  return null;
}

export function hasUnreadOrder(chat: Conversation) {
  return !!chat.orderAlert && !chat.orderAlert.readAt && !chat.test;
}

export function captureOrderAlerts(before: Operations, after: Operations, now: number) {
  for (const chat of after.service?.conversations || []) {
    if (chat.test) continue;
    const previous = before.service?.conversations.find(c => c.id === chat.id);
    const latest = chat.messages.findLast(m => m.role === 'customer');
    if (!latest || previous?.messages.some(m => m.id === latest.id) || now - latest.at > 24 * 60 * 60 * 1000) continue;
    const decision = orderIntent(chat, latest);
    if (decision === 'order') chat.orderAlert = {messageId: latest.id, at: latest.at, text: latest.text.slice(0, 240)};
    else if (decision === 'cancel' && chat.orderAlert && !chat.orderAlert.readAt) chat.orderAlert.readAt = now;
  }
}
