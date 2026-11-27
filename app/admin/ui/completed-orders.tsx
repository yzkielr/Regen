'use client';
import {useEffect, useMemo, useRef, useState} from 'react';
import {ShoppingBag, Search, ArrowUpRight, CheckCheck} from 'lucide-react';
import type {Operations} from '../lib/operations';
import {purchasedCustomers, purchaseLabels} from '../lib/completed-orders';
import {useOrderNotifications} from './order-notifications';
import './completed-orders.css';

const date = (at: number) => new Intl.DateTimeFormat('id-ID', {dateStyle: 'medium', timeZone: 'Asia/Jakarta'}).format(at);
export function CompletedOrdersButton({state, openOrders}: {state?: Operations; openOrders: () => void}) {
  const customers = useMemo(() => purchasedCustomers(state), [state]);
  const {openChat} = useOrderNotifications();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const search = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!open) return;
    search.current?.focus();
    const outside = (e: PointerEvent) => {if (!root.current?.contains(e.target as Node)) setOpen(false);};
    const escape = (e: KeyboardEvent) => {if (e.key === 'Escape') {setOpen(false); trigger.current?.focus();}};
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape);};
  }, [open]);
  const rows = customers.filter(c => (filter === 'all' || (filter === 'paid' ? c.status === 'paid' : c.status.endsWith('_reported'))) && `${c.name} ${c.phone} ${c.evidence}`.toLowerCase().includes(query.toLowerCase().trim()));
  return <div ref={root} className="completed-orders">
    <button ref={trigger} type="button" className={`button completed-orders-trigger ${customers.length ? 'has-customers' : ''}`} disabled={!state}
      aria-label={`Sudah order: ${customers.length} pelanggan`} aria-expanded={open} aria-controls="completed-orders-list" onClick={() => setOpen(v => !v)}>
      <ShoppingBag size={18}/><span className="completed-orders-label">Sudah order</span><b>{customers.length}</b>
    </button>
    {open && <section id="completed-orders-list" className="completed-orders-list" aria-label="Pelanggan yang sudah order">
      <header><strong>Sudah order</strong><span>{customers.length} pelanggan</span></header>
      <p className="completed-orders-hint">Dari pesanan dan chat pelanggan. Laporan sudah bayar perlu verifikasi pembayaran.</p>
      <div className="completed-orders-filters">
        <label><Search size={15}/><input ref={search} aria-label="Cari pelanggan yang sudah order" placeholder="Cari nama, nomor, atau invoice" value={query} onChange={e => setQuery(e.target.value)}/></label>
        <select aria-label="Filter pelanggan yang sudah order" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">Semua</option><option value="paid">Pembayaran terverifikasi</option><option value="reported">Terdeteksi dari chat</option>
        </select>
      </div>
      <div className="completed-orders-results">
        {!rows.length && <p className="completed-orders-empty">{customers.length ? 'Tidak ada pelanggan yang cocok.' : 'Belum ada pesanan atau laporan pembelian dari pelanggan.'}</p>}
        {rows.map(c => <button key={c.contactId} type="button" className="completed-orders-item" onClick={() => {setOpen(false); if (c.conversationId) openChat(c.conversationId); else openOrders();}}>
          <span className="completed-orders-person"><strong>{c.name}</strong><time dateTime={new Date(c.at).toISOString()}>{date(c.at)}</time></span>
          {c.phone && <span className="completed-orders-phone">{c.phone}</span>}
          <span className={`completed-orders-badge ${c.status}`}>{c.status === 'paid' && <CheckCheck size={13}/>} {purchaseLabels[c.status]}</span>
          <span className="completed-orders-evidence">{c.evidence}</span>
          <span className="completed-orders-footer"><small>{c.orderCount ? `${c.orderCount} pesanan tercatat` : 'Dari chat pelanggan'}</small><small>{c.conversationId ? 'Buka chat' : 'Lihat pesanan'} <ArrowUpRight size={13}/></small></span>
        </button>)}
      </div>
    </section>}
  </div>;
}
