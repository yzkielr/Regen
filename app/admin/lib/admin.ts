import type { QuickReply, Workspace } from './types';

export type AdminView = 'live' | 'overview' | 'all' | 'needs_admin' | 'human' | 'resolved' | 'contacts' | 'activity' | 'channels' | 'bot_config' | 'replies' | 'analytics' | 'settings';
export const DEFAULT_REPLIES: QuickReply[] = [
  { id: 'greeting', title: 'Sapaan awal', text: 'Halo Kak, terima kasih sudah menghubungi Regen. Saya admin yang akan membantu. Ada yang bisa dibantu?' },
  { id: 'checking', title: 'Sedang diperiksa', text: 'Baik Kak, saya bantu periksa informasinya terlebih dahulu ya. Mohon ditunggu sebentar.' },
  { id: 'closing', title: 'Penutup percakapan', text: 'Terima kasih sudah menghubungi Regen. Jika ada pertanyaan lain, silakan hubungi kami kembali.' },
];
export const dayKey = (at: number) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).format(at);
export function metrics(state: Workspace, now = Date.now()) {
  const chats = state.conversations;
  const messages = chats.flatMap(c => c.messages);
  const today = dayKey(now);
  const bot = messages.filter(m => m.sender === 'bot').length;
  const human = messages.filter(m => m.sender === 'admin').length;
  const received = messages.filter(m => m.sender === 'customer').length;
  const days = Array.from({ length: 7 }, (_, i) => {
    const at = now - (6 - i) * 86_400_000;
    const key = dayKey(at);
    return { key, label: new Date(at).toLocaleDateString('id-ID', { weekday: 'short', timeZone: 'Asia/Jakarta' }), count: messages.filter(m => m.sender !== 'note' && dayKey(m.at) === key).length };
  });
  return { bot, human, received, days, botRate: bot + human ? Math.round(bot / (bot + human) * 100) : 0,
    today: chats.filter(c => c.messages.some(m => m.sender !== 'note' && dayKey(m.at) === today)).length,
    unread: chats.reduce((n, c) => n + c.unread, 0),
    needsAdmin: chats.filter(c => c.mode === 'needs_admin' && c.status === 'open'),
    handling: chats.filter(c => c.mode === 'human' && c.status === 'open').length,
    botChats: chats.filter(c => c.mode === 'bot' && c.status === 'open').length,
    resolved: chats.filter(c => c.status === 'resolved').length,
  };
}
