'use client';
import { adminFetch, logoutAdmin } from './admin-client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowUpRight, BellRing, BookOpen, Bot, Check, CheckCheck, ChevronDown, ChevronRight, CircleCheck, CircleHelp, Download, FlaskConical, Inbox, Info, LoaderCircle, LockKeyhole, MessageCircle, LayoutDashboard, Headset, ChartNoAxesCombined, MessagesSquare, PanelLeftClose, Play, Plus, Radio, RefreshCw, Search, Send, ShieldCheck, Sparkles, Star, StickyNote, UserRound, UsersRound, X, History, Settings2, LogOut } from 'lucide-react';
import type { Action, Conversation, Envelope, QuickReply } from '../lib/types';
import { DEFAULT_REPLIES } from '../lib/admin';
import type { AdminView } from '../lib/admin';
import { Overview, Analytics, BotConfig, ReplyLibrary } from './admin-panels';


type View = AdminView;
const modeText = { bot: 'Bot aktif', human: 'Ditangani admin', needs_admin: 'Perlu admin' };
const time = (at: number) => new Date(at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' });
const date = (at: number) => new Date(at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', timeZone: 'Asia/Jakarta' });
function Avatar({ chat, large = false }: { chat: Conversation; large?: boolean }) {
  return <span className={`avatar ${chat.color} ${large ? 'large' : ''}`}>{chat.initials}</span>;
}
function Badge({ chat, paused = false }: { chat: Conversation; paused?: boolean }) {
  return <span className={`badge ${chat.status === 'resolved' ? 'resolved' : chat.mode}`}>{chat.status === 'resolved' ? <CircleCheck size={12} /> : chat.mode === 'bot' ? <Bot size={12} /> : chat.mode === 'human' ? <UserRound size={12} /> : <BellRing size={12} />}{chat.status === 'resolved' ? 'Selesai' : paused && chat.mode === 'bot' ? 'Bot dijeda' : modeText[chat.mode]}</span>;
}

export default function Dashboard({ displayName, embedded = false, initialView = 'all', sharedReplies = [], assignees = [], manageReplies }: { displayName: string; embedded?: boolean; initialView?: AdminView; sharedReplies?: QuickReply[]; assignees?: string[]; manageReplies?: () => void }) {
  const [data, setData] = useState<Envelope | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState('nadia');
  const [view, setView] = useState<View>(initialView);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'priority'>('all');
  const [draft, setDraft] = useState('');
  const [note, setNote] = useState(false);
  const [modal, setModal] = useState<'simulate' | 'help' | 'reset' | 'replies' | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [simulation, setSimulation] = useState('Saya ingin bicara dengan admin.');
  const [target, setTarget] = useState('raka');
  const [mobileChat, setMobileChat] = useState(false);
  const [details, setDetails] = useState(false);
  const [toast, setToast] = useState('');
  const end = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDialogElement>(null);
  const lock = useRef(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const res = await adminFetch('/admin/api/workspace', { cache: 'no-store' });
      if (res.status === 401) { window.location.assign('/admin/login'); return; }
      const result = await res.json() as Envelope & { error?: string };
      if (!res.ok) throw new Error(result.error || 'Percakapan belum berhasil dimuat.');
      setData(result);
    } catch (e) { setError(e instanceof Error ? e.message : 'Koneksi terputus. Coba muat ulang.'); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { if (toast) { const timer = setTimeout(() => setToast(''), 3500); return () => clearTimeout(timer); } }, [toast]);
  useEffect(() => { if (modal) modalRef.current?.showModal(); else modalRef.current?.close(); }, [modal]);
  const chat = data?.state.conversations.find(c => c.id === selected);
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [selected, chat?.messages.length, note]);

  async function act(action: Omit<Action, 'requestId'>, success = '') {
    if (!data || lock.current) return false;
    lock.current = true; setBusy(true); setError('');
    try {
      const response = await adminFetch('/admin/api/workspace', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version: data.version, action: { conversationId: selected, ...action, requestId: crypto.randomUUID() } }) });
      const result = await response.json() as Envelope & { error?: string };
      if (result.state) setData({ state: result.state, version: result.version });
      if (!response.ok) throw new Error(result.error || 'Perubahan belum tersimpan.');
      if (success) setToast(success);
      return true;
    } catch (e) { setError(e instanceof Error ? e.message : 'Koneksi terputus. Periksa koneksi lalu muat ulang sebelum mencoba kembali.'); return false; }
    finally { lock.current = false; setBusy(false); }
  }
  async function selectChat(c: Conversation) {
    setSelected(c.id); setDraft(''); setNote(false); setMobileChat(true);
    if (c.unread) await act({ type: 'read', conversationId: c.id });
  }
  function openSim() { setTarget(view === 'overview' || view === 'bot_config' ? 'raka' : selected); setModal('simulate'); }
  function navigate(next: View) { setView(next); setMobileChat(false); setSearch(''); setFilter('all'); }
  function openChat(c: Conversation) { navigate(c.status === 'resolved' ? 'resolved' : 'all'); void selectChat(c); }
  const conversations = data?.state.conversations ?? [];
  const counts = { all: conversations.filter(c => c.status === 'open').length, needs_admin: conversations.filter(c => c.status === 'open' && c.mode === 'needs_admin').length, human: conversations.filter(c => c.status === 'open' && c.mode === 'human').length, resolved: conversations.filter(c => c.status === 'resolved').length };
  const list = conversations.filter(c => {
    if (view === 'resolved' ? c.status !== 'resolved' : c.status !== 'open') return false;
    if (['human', 'needs_admin'].includes(view) && c.mode !== view) return false;
    if (filter === 'unread' && !c.unread || filter === 'priority' && !c.priority) return false;
    return `${c.name} ${c.tags.join(' ')} ${c.messages.at(-1)?.text}`.toLowerCase().includes(search.toLowerCase());
  }).sort((a, b) => b.updatedAt - a.updatedAt);
  const isInbox = ['all', 'human', 'needs_admin', 'resolved'].includes(view);
  const title = ({ live: 'WhatsApp Regen', overview: 'Dashboard Overview', all: 'Manajemen Chat', needs_admin: 'Perlu Admin', human: 'Human CS Agent', resolved: 'Percakapan Selesai', contacts: 'Customer CRM', activity: 'System & Bot Logs', channels: 'WhatsApp Gateway', bot_config: 'AI / Bot Config', replies: 'Jawaban Cepat', analytics: 'Analytics', settings: 'Settings Global' })[view];
  const botEnabled = data?.state.botEnabled !== false;
  const availableReplies = [...sharedReplies, ...(data?.state.quickReplies ?? DEFAULT_REPLIES)];
  const navigation = [
    { id: 'live', text: 'Pusat CS', icon: MessageCircle },
    { id: 'overview', text: 'Dashboard', icon: LayoutDashboard },
    { id: 'channels', text: 'WhatsApp Gateway', icon: Radio },
    { id: 'all', text: 'Manajemen Chat', icon: MessagesSquare },
    { id: 'contacts', text: 'Customer CRM', icon: UsersRound },
    { id: 'bot_config', text: 'AI / Bot Config', icon: Bot },
    { id: 'replies', text: 'Jawaban Cepat', icon: BookOpen },
    { id: 'human', text: 'Human CS Agent', icon: Headset },
    { id: 'activity', text: 'System & Bot Logs', icon: History },
    { id: 'analytics', text: 'Analytics', icon: ChartNoAxesCombined },
    { id: 'settings', text: 'Settings Global', icon: Settings2 },
  ] as const;

  return <div className={`app-shell admin-console ${embedded ? 'embedded-chat' : ''} ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
    <aside className="sidebar">
      <a className="brand" href="/" aria-label="Regen Admin"><img src="/admin-assets/regen-logo-green.png" alt="Regen Longevity Lab" /><span>ADMIN v2</span></a>
      <p className="sidebar-subtitle">WhatsApp Supervision</p>
      <div className="workspace gateway-mini"><div><small>WHATSAPP REGEN</small><strong><span /> Supervisi</strong></div><button onClick={() => navigate('live')} title="Lihat koneksi WhatsApp"><ChevronRight size={15} /></button><p>Pengiriman masih dijeda</p></div>
      <p className="nav-label">WORKSPACE</p>
      <nav aria-label="Navigasi utama">
        {navigation.map((item, index) => <button key={item.id} title={item.text} aria-label={item.text} className={`nav-item ${view === item.id ? 'active' : ''}`} onClick={() => navigate(item.id)}><item.icon size={16} /><span><small>{index + 1}.</small> {item.text}</span>{item.id === 'all' && <em>{counts.all}</em>}</button>)}
        <div className="nav-divider" />
        <p className="nav-label">ANTRIAN LAYANAN</p>
        <button title="Perlu admin" className={`nav-item ${view === 'needs_admin' ? 'active' : ''}`} onClick={() => navigate('needs_admin')}><BellRing size={16} /><span>Perlu admin</span><em className="orange">{counts.needs_admin}</em></button>
        <button title="Selesai" className={`nav-item ${view === 'resolved' ? 'active' : ''}`} onClick={() => navigate('resolved')}><CircleCheck size={16} /><span>Selesai</span><em>{counts.resolved}</em></button>
      </nav>
      <div className="sidebar-bottom"><div className="demo-card"><FlaskConical size={19} /><strong>Kenali alurnya, tanpa risiko.</strong><p>Coba bot dan balasan admin dengan percakapan contoh.</p><button onClick={() => setModal('help')}>Panduan demo <ArrowUpRight size={15} /></button></div>
        <button className="support" onClick={() => setModal('help')}><CircleHelp size={17} />Pusat panduan</button>
        <div className="profile"><span className="profile-avatar">{displayName.slice(0, 1).toUpperCase()}</span><div><strong>{displayName.split('@')[0]}</strong><small>Administrator</small></div><button type="button" onClick={()=>void logoutAdmin()} aria-label="Keluar"><LogOut size={16} /></button></div>
      </div>
    </aside>

    <main className="main">
      <header className="topbar"><div className="console-breadcrumb"><button className="icon-button sidebar-toggle" title="Ubah lebar sidebar" aria-label="Ubah lebar sidebar" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}><PanelLeftClose size={18} /></button><strong>Regen</strong><ChevronRight size={12} /><h1>{title}</h1><span className="private-tag"><LockKeyhole size={11} />Privat</span></div><div className="top-actions"><a className="button website-link" href="https://www.regenlongevitylab.com" target="_blank" rel="noreferrer">Website Regen <ArrowUpRight size={13} /></a><span className="demo-pill"><span />{view === 'live' ? 'Supervisi WhatsApp' : 'Mode demo'}</span><button className="button" onClick={() => navigate(view === 'live' ? 'overview' : 'live')}><MessageCircle size={14} /><span>{view === 'live' ? 'Buka demo' : 'Pusat CS'}</span></button></div></header>
      {view !== 'live' && <div className="demo-banner"><FlaskConical size={15} /><p>Anda sedang di ruang demo. Semua kontak dan pesan adalah contoh; tidak ada pesan yang dikirim ke WhatsApp.</p><button onClick={() => setModal('help')}>Cara mencoba <ArrowUpRight size={13} /></button></div>}
      {error && <div className="error-banner" role="alert"><Info size={17} /><span>{error}</span><button onClick={() => void load()} disabled={busy}>Muat ulang</button></div>}
      {view === 'live' ? <div className="empty-state"><MessageCircle size={30}/><h2>Pusat CS Regen</h2><p>Buka kotak masuk dashboard untuk supervisi dan pengambilalihan admin.</p><a className="button primary" href="/admin#service">Buka Pusat CS</a></div> : !data ? <div className="loading-state">{error ? <Info size={30} /> : <LoaderCircle size={30} className="spin" />}<h2>{error ? 'Data belum dapat dimuat' : 'Menyiapkan ruang supervisi…'}</h2><p>Percakapan demo Anda akan muncul di sini.</p></div> : isInbox ? <div className={`inbox-layout ${mobileChat ? 'show-chat' : ''} ${details ? 'show-details' : ''}`}>
        <section className="conversation-panel" aria-label="Daftar percakapan">
          <div className="list-heading"><h2>Percakapan <span>{list.length}</span></h2><button className="icon-button simulate-list-button" onClick={openSim} disabled={busy} title="Simulasikan pesan" aria-label="Simulasikan pesan"><Plus size={17} /></button><button className="icon-button" onClick={() => void load()} disabled={busy} title="Muat ulang" aria-label="Muat ulang percakapan"><RefreshCw size={15} /></button></div>
          <label className="search"><Search size={16} /><input placeholder="Cari nama atau pesan…" value={search} onChange={e => setSearch(e.target.value)} aria-label="Cari percakapan" /><kbd>⌕</kbd></label>
          <div className="filters" aria-label="Filter percakapan">{(['all', 'unread', 'priority'] as const).map(f => <button key={f} className={filter === f ? 'selected' : ''} onClick={() => setFilter(f)}>{f === 'all' ? 'Semua' : f === 'unread' ? 'Belum dibaca' : 'Prioritas'}</button>)}</div>
          <div className="conversation-list">{list.map(c => <button key={c.id} className={`conversation ${selected === c.id ? 'selected' : ''}`} onClick={() => void selectChat(c)} disabled={busy}><div className="avatar-wrap"><Avatar chat={c} /><span className="wa-dot"><MessageCircle size={9} /></span></div><div className="conversation-content"><div className="conversation-top"><strong>{c.name}</strong><small>{time(c.updatedAt)}</small></div><p>{c.messages.at(-1)?.sender === 'admin' ? 'Anda: ' : c.messages.at(-1)?.sender === 'note' ? 'Catatan: ' : ''}{c.messages.at(-1)?.text}</p><div className="conversation-bottom"><Badge chat={c} paused={!botEnabled} /><span className="row">{c.priority && <Star size={12} className="starred" />}{c.unread > 0 && <span className="unread">{c.unread}</span>}</span></div></div></button>)}{!list.length && <div className="empty-state"><Inbox size={30} /><h3>Tidak ada percakapan</h3><p>Coba kata kunci atau filter lain.</p><button className="text-button" onClick={() => { setFilter('all'); setSearch(''); }}>Hapus filter</button></div>}</div>
          <footer className="list-footer"><ShieldCheck size={13} />Data demo tersimpan secara privat</footer>
        </section>

        {chat && <section className="chat-panel" aria-label={`Percakapan dengan ${chat.name}`}>
          <div className="chat-header"><button className="icon-button back-button" onClick={() => setMobileChat(false)} aria-label="Kembali ke daftar"><ArrowLeft size={20} /></button><Avatar chat={chat} /><div className="chat-identity"><h2>{chat.name} {chat.priority && <Star size={13} className="starred" />}</h2><span><MessageCircle size={12} /> WhatsApp demo <span className="dot-separator">·</span> {chat.city}</span></div><button className={`icon-button ${chat.priority ? 'active-star' : ''}`} aria-label={chat.priority ? 'Hapus prioritas' : 'Tandai prioritas'} title="Prioritas" onClick={() => void act({ type: 'priority' })} disabled={busy}><Star size={18} /></button><button className="icon-button detail-toggle" title="Detail kontak" aria-label="Detail kontak" onClick={() => setDetails(!details)}><Info size={19} /></button></div>
          <div className={`control-strip ${chat.mode === 'needs_admin' && chat.status === 'open' ? 'attention' : ''}`}><div><span className={`status-dot ${chat.mode}`} /><strong>{chat.status === 'resolved' ? 'Percakapan selesai' : chat.mode === 'bot' && !botEnabled ? 'Bot dijeda secara global' : chat.mode === 'needs_admin' ? 'Menunggu bantuan Anda' : chat.mode === 'human' ? 'Anda memegang percakapan ini' : 'Bot sedang menangani percakapan'}</strong><span className="control-caption">{chat.status === 'resolved' ? 'Tidak ada balasan otomatis' : chat.mode === 'bot' && !botEnabled ? 'Aktifkan dari AI / Bot Config' : chat.mode === 'bot' ? 'Siap menjawab pesan berikutnya' : 'Balasan otomatis dijeda'}</span></div>{chat.status === 'resolved' ? <button className="button small" disabled={busy} onClick={() => void act({ type: 'reopen' }, 'Percakapan dibuka kembali. Bot dijeda.')}><RefreshCw size={13} />Buka kembali</button> : chat.mode === 'human' ? <button className="button small" disabled={busy} onClick={() => void act({ type: 'resume' }, 'Bot aktif untuk pesan pelanggan berikutnya.')}><Play size={13} />Aktifkan bot</button> : <button className="button small dark" disabled={busy} onClick={() => void act({ type: 'handoff' }, 'Anda mengambil alih. Bot dijeda.')}><UserRound size={13} />Ambil alih</button>}</div>
          <div className="messages" aria-live="polite"><div className="day-divider"><span>{date(chat.messages[0].at)}</span></div><div className="conversation-origin"><LockKeyhole size={11} />Percakapan contoh · hanya untuk latihan</div>{chat.messages.map((m, i) => <div key={m.id} className={`message-row ${m.sender}`}>
            {m.sender === 'customer' && (i === 0 || chat.messages[i - 1].sender !== 'customer') ? <Avatar chat={chat} /> : m.sender === 'customer' ? <span className="avatar-spacer" /> : null}
            <div className="message-bubble">{m.sender === 'bot' && <div className="message-sender"><Bot size={12} />Bot demo</div>}{m.sender === 'admin' && <div className="message-sender"><UserRound size={12} />Anda · balasan demo</div>}{m.sender === 'note' && <div className="message-sender"><StickyNote size={12} />Catatan internal · hanya admin</div>}<p>{m.text}</p><div className="message-time">{time(m.at)}{['bot', 'admin'].includes(m.sender) && <CheckCheck size={13} />}</div></div>
          </div>)}<div ref={end} /></div>
          <div className="chat-bottom"><div className="chat-tools"><span><ShieldCheck size={12} />Tersimpan di ruang demo</span>{chat.status !== 'resolved' && <button disabled={busy} onClick={() => void act({ type: 'resolve' }, 'Percakapan ditandai selesai.')}><CircleCheck size={14} />Tandai selesai</button>}</div>
            <form className={`composer ${note ? 'note-composer' : ''}`} onSubmit={async e => { e.preventDefault(); if (await act({ type: note ? 'note' : 'send', text: draft }, note ? 'Catatan internal tersimpan.' : 'Balasan tersimpan di demo.')) setDraft(''); }}><div className="composer-tabs"><button type="button" className={!note ? 'active' : ''} onClick={() => setNote(false)}><MessageCircle size={14} />Balasan</button><button type="button" className={note ? 'active' : ''} onClick={() => setNote(true)}><StickyNote size={14} />Catatan internal</button><button type="button" disabled={busy || chat.mode !== 'human' || chat.status === 'resolved'} onClick={() => setModal('replies')}><BookOpen size={14} />Jawaban cepat</button><span><LockKeyhole size={11} />DEMO</span></div><textarea aria-label={note ? 'Catatan internal' : 'Balasan untuk pelanggan demo'} placeholder={note ? 'Tambahkan konteks untuk tim. Catatan ini tidak tampil sebagai balasan pelanggan…' : chat.status === 'resolved' ? 'Buka kembali percakapan untuk membalas.' : chat.mode !== 'human' ? 'Klik Ambil alih untuk menulis balasan manual.' : `Tulis balasan untuk ${chat.name.split(' ')[0]}…`} value={draft} onChange={e => setDraft(e.target.value)} maxLength={4000} disabled={busy || !note && (chat.mode !== 'human' || chat.status === 'resolved')} onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); e.currentTarget.form?.requestSubmit(); } }} /><div className="composer-footer"><span>{note ? 'Hanya terlihat oleh admin' : 'Tidak dikirim ke WhatsApp'}{draft.length > 3500 ? ` · ${draft.length}/4.000` : ''}</span><button type="submit" className="button primary small" disabled={busy || !draft.trim() || !note && (chat.mode !== 'human' || chat.status === 'resolved')}>{busy ? <LoaderCircle size={14} className="spin" /> : note ? <Plus size={14} /> : <Send size={14} />}{note ? 'Simpan catatan' : 'Kirim demo'}</button></div></form>
          </div>
        </section>}

        {chat && <aside className="contact-panel"><div className="detail-header"><h2>Detail kontak</h2><button className="icon-button detail-close" aria-label="Tutup detail" onClick={() => setDetails(false)}><X size={18} /></button><UsersRound size={16} className="muted" /></div><div className="contact-card"><Avatar chat={chat} large /><h3>{chat.name}</h3><span>Kontak demo · {chat.city}</span><Badge chat={chat} paused={!botEnabled} /></div><section className="detail-section"><h4>PENANGGUNG JAWAB</h4><select className="assignee" aria-label="Penanggung jawab percakapan" value={chat.assignee || ''} disabled={busy} onChange={e => { if (e.target.value) void act({ type: 'assign', text: e.target.value }, 'Petugas ditetapkan. Bot dijeda.'); }}><option value="">Belum ditugaskan</option>{[...new Set(['Anda', ...assignees, ...(chat.assignee ? [chat.assignee] : [])])].map(name => <option key={name} value={name}>{name}</option>)}</select></section><section className="detail-section"><h4>LABEL KONTAK</h4><div className="tags">{chat.tags.map(t => <span key={t}>{t}</span>)}<span className="demo-label">Demo</span></div></section><section className="detail-section"><h4><Sparkles size={12} /> RINGKASAN AWAL DEMO</h4><p className="summary">{chat.summary}</p></section><section className="detail-section"><h4>AKTIVITAS TERAKHIR</h4><ol className="timeline">{chat.events.slice(-3).reverse().map(e => <li key={e.id}><span /> <div><p>{e.text}</p><small>{time(e.at)} WIB</small></div></li>)}</ol></section><div className="handoff-hint"><ShieldCheck size={17} /><div><strong>Kendali tetap di tangan Anda</strong><p>Setelah diambil alih, bot menunggu Anda mengaktifkannya kembali.</p></div></div></aside>}
      </div> : <div className="workspace-page">
        {view === 'overview' && <Overview state={data.state} busy={busy} navigate={navigate} openChat={openChat} simulate={openSim} act={act} />}
        {view === 'analytics' && <Analytics state={data.state} navigate={navigate} />}
        {view === 'bot_config' && <BotConfig state={data.state} busy={busy} act={act} simulate={openSim} />}
        {view === 'replies' && <ReplyLibrary state={data.state} busy={busy} act={act} />}
        {view === 'settings' && <div className="page-heading"><div><h2>Settings Global</h2><p>Kelola data latihan dan akses ruang kerja privat Anda.</p></div></div>}
        {view === 'contacts' && <><div className="page-heading"><div><h2>Kenali setiap percakapan.</h2><p>Kontak contoh untuk mencoba alur supervisi Anda.</p></div><span className="count-label">{conversations.length} kontak</span></div><div className="table-wrap"><table><thead><tr><th>Nama kontak</th><th>Kota</th><th>Status</th><th>Penanggung jawab</th><th /></tr></thead><tbody>{conversations.map(c => <tr key={c.id}><td><div className="row"><Avatar chat={c} /><strong>{c.name}</strong></div></td><td>{c.city}</td><td><Badge chat={c} paused={!botEnabled} /></td><td>{c.assignee || 'Belum ditugaskan'}</td><td><button className="text-button" onClick={() => { setView(c.status === 'resolved' ? 'resolved' : 'all'); void selectChat(c); }}>Buka chat <ArrowUpRight size={14} /></button></td></tr>)}</tbody></table></div></>}
        {view === 'activity' && <><div className="page-heading"><div><h2>Semua tindakan, satu riwayat.</h2><p>Lihat kapan bot dijeda, admin membalas, dan percakapan diselesaikan.</p></div></div><div className="activity-list">{conversations.flatMap(c => c.events.map(e => ({ ...e, chat: c }))).sort((a, b) => b.at - a.at).map(e => <button key={e.id} onClick={() => { setView(e.chat.status === 'resolved' ? 'resolved' : 'all'); void selectChat(e.chat); }}><div className="activity-icon"><History size={17} /></div><div><strong>{e.text}</strong><p>{e.chat.name}</p></div><time>{date(e.at)} · {time(e.at)}</time><ChevronRight size={15} /></button>)}</div></>}
        {view === 'channels' && <><div className="page-heading"><div><h2>WhatsApp Gateway</h2><p>Status saluran dan koneksi layanan Regen.</p></div></div><div className="settings-grid"><article className="settings-card"><div className="settings-icon"><FlaskConical size={25} /></div><span className="badge bot">Aktif</span><h3>WhatsApp demo</h3><p>Pesan masuk, balasan bot, balasan admin, dan catatan disimpan dalam ruang kerja privat Anda.</p><button className="button primary" onClick={openSim}>Simulasikan pesan <Plus size={15} /></button></article><article className="settings-card"><div className="settings-icon neutral"><MessageCircle size={25} /></div><span className="badge human">Supervisi</span><h3>Pusat CS Regen</h3><p>Percakapan dan kontrol bot tersedia di Pusat CS Regen. Nomor baru masih menunggu koneksi WhatsApp.</p><a className="button primary" href="/admin#service">Buka Pusat CS <ArrowUpRight size={15}/></a><div className="settings-note"><LockKeyhole size={14} />Pengiriman dan bot masih dijeda</div></article></div></>}{view === 'settings' && <><div className="settings-row"><div><h3>Unduh data demo</h3><p>Simpan percakapan dan riwayat tindakan sebagai file JSON.</p></div><button className="button" onClick={() => { const url = URL.createObjectURL(new Blob([JSON.stringify(data.state, null, 2)], { type: 'application/json' })); const a = document.createElement('a'); a.href = url; a.download = 'regen-inbox-demo.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }}><Download size={15} />Unduh data</button></div><div className="settings-row"><div><h3>Mulai ulang demo</h3><p>Hapus perubahan latihan dan kembalikan tujuh percakapan contoh.</p></div><button className="button danger" onClick={() => setModal('reset')}>Reset demo</button></div></>}
      </div>}
    </main>
    {toast && <div className="toast" role="status"><Check size={17} />{toast}</div>}
    <dialog ref={modalRef} className="modal" onCancel={() => setModal(null)} onClick={e => { if (e.target === e.currentTarget) setModal(null); }}><button className="modal-close icon-button" aria-label="Tutup" onClick={() => setModal(null)}><X size={20} /></button>
      {modal === 'replies' && <><span className="modal-icon"><BookOpen size={25} /></span><h2>Pilih jawaban cepat</h2><p>Jawaban akan dimasukkan ke editor. Periksa terlebih dahulu sebelum mengirim demo.</p><div className="quick-picker">{availableReplies.map(r => <button key={r.id} onClick={() => { setDraft(r.text); setNote(false); setModal(null); }}><strong>{r.title}</strong><p>{r.text}</p><ChevronRight size={16} /></button>)}</div>{availableReplies.length === 0 && <p>Belum ada jawaban cepat.</p>}<button className="text-button" onClick={() => { setModal(null); if (manageReplies) manageReplies(); else navigate('replies'); }}>Kelola jawaban cepat <ArrowUpRight size={14} /></button></>}
      {modal === 'simulate' && <form onSubmit={async e => { e.preventDefault(); if (await act({ type: 'simulate', conversationId: target, text: simulation }, 'Pesan pelanggan disimulasikan.')) { setSelected(target); setView('all'); setMobileChat(true); setDraft(''); setModal(null); } }}><span className="modal-icon"><FlaskConical size={25} /></span><h2>Jadi pelanggan sebentar.</h2><p>Kirim pesan contoh dan lihat bagaimana bot atau admin menanganinya.</p><label className="form-label">Percakapan<select value={target} onChange={e => setTarget(e.target.value)}>{conversations.map(c => <option key={c.id} value={c.id}>{c.name} · {c.status === 'resolved' ? 'Selesai' : modeText[c.mode]}</option>)}</select></label><label className="form-label">Pesan pelanggan<textarea value={simulation} onChange={e => setSimulation(e.target.value)} maxLength={4000} required rows={4} /></label><div className="preset-buttons">{['Halo Regen 👋', 'Jam operasionalnya kapan?', 'Saya ingin bicara dengan admin.'].map(p => <button type="button" key={p} onClick={() => setSimulation(p)}>{p.includes('Jam') ? 'Tanya jam layanan' : p.includes('admin') ? 'Minta admin' : 'Sapa bot'}</button>)}</div><div className="modal-note"><Info size={15} /><span>COA, pengetahuan, dan guardrail yang disimpan dapat diuji di sini. Saat admin mengambil alih, bot tidak membalas pesan baru.</span></div><button type="submit" className="button primary wide" disabled={busy || !simulation.trim()}>{busy ? <LoaderCircle className="spin" size={16} /> : <Send size={16} />}Masukkan pesan demo</button></form>}
      {modal === 'help' && <><span className="modal-icon"><BookOpen size={25} /></span><h2>Satu percakapan. Kendali penuh.</h2><p>Coba alur layanan dari bot ke admin dalam beberapa langkah.</p><ol className="help-steps"><li><span>1</span><div><strong>Simulasikan pesan pelanggan</strong><p>Pilih Raka atau kontak dengan label Bot aktif. Coba pertanyaan jam layanan.</p></div></li><li><span>2</span><div><strong>Ambil alih percakapan</strong><p>Klik Ambil alih, lalu tulis balasan manual. Bot langsung dijeda.</p></div></li><li><span>3</span><div><strong>Coba pesan berikutnya</strong><p>Simulasikan pesan lagi. Bot tetap diam selama Anda menangani percakapan.</p></div></li><li><span>4</span><div><strong>Kembalikan ke bot saat siap</strong><p>Klik Aktifkan bot. Bot akan menjawab pesan pelanggan berikutnya.</p></div></li></ol><div className="modal-note"><ShieldCheck size={16} /><span>Ini demo supervisi, belum koneksi WhatsApp atau fitur coexistence. Data contoh tersimpan privat untuk akun Anda.</span></div><button className="button primary wide" onClick={() => { setTarget('raka'); setSimulation('Jam operasionalnya kapan?'); setModal('simulate'); }}>Mulai mencoba <ArrowUpRight size={16} /></button></>}
      {modal === 'reset' && <><span className="modal-icon"><RefreshCw size={25} /></span><h2>Mulai demo dari awal?</h2><p>Balasan dan catatan latihan Anda akan dihapus. Tujuh percakapan contoh akan dikembalikan.</p><div className="modal-actions"><button className="button" onClick={() => setModal(null)}>Batal</button><button className="button primary" disabled={busy} onClick={async () => { if (await act({ type: 'reset' }, 'Demo dikembalikan ke kondisi awal.')) { setSelected('nadia'); setDraft(''); setView('all'); setModal(null); } }}>Ya, reset demo</button></div></>}
    </dialog>
  </div>;
}
