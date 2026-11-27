'use client';
import {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import type {ReactNode} from 'react';
import {ShoppingCart, X} from 'lucide-react';
import type {Operations, OpsAction} from '../lib/operations';
import type {Conversation} from '../lib/service-types';
import {hasUnreadOrder} from '../lib/order-alerts';
import {completedOrderLeads, purchasedCustomers} from '../lib/completed-orders';
import type {PurchasedCustomer} from '../lib/completed-orders';
import './order-notifications.css';

type Read = {conversationId: string; messageId: string};
type Alert = Read & {name: string; text: string; at: number};
const keyOf = (value: Read) => `${value.conversationId}:${value.messageId}`;
const Context = createContext({
  alerts: [] as Alert[],
  customers: [] as PurchasedCustomer[],
  requestedChat: null as {id: string; token: number} | null,
  openChat: (_id: string) => {},
  viewChat: (_id: string | null) => {},
  dismiss: (_alert: Read) => {},
  isUnread: hasUnreadOrder,
});
export const useOrderNotifications = () => useContext(Context);

export function OrderNotificationProvider({state, act, busy, navigate, children}: {
  state?: Operations; busy: boolean; children: ReactNode; navigate: () => void;
  act: (action: Omit<OpsAction, 'requestId'>) => Promise<boolean>;
}) {
  const customers = useMemo(() => purchasedCustomers(state), [state]);
  const completedLeads = useMemo(() => completedOrderLeads(state, customers), [state, customers]);
  const completedKeys = useMemo(() => new Set(completedLeads.map(keyOf)), [completedLeads]);
  const [pending, setPending] = useState<Record<string, Read>>({});
  const [viewedId, setViewedId] = useState<string | null>(null);
  const [requestedChat, setRequestedChat] = useState<{id: string; token: number} | null>(null);
  const [popup, setPopup] = useState<Alert | null>(null);
  const announced = useRef(new Set<string>());
  const inflight = useRef(false);
  const lastAttempt = useRef(0);
  const latest = useRef({pending, busy, act});
  latest.current = {pending, busy, act};
  const dismiss = useCallback((alert: Read) => {
    setPending(old => old[keyOf(alert)] ? old : {...old, [keyOf(alert)]: alert});
  }, []);
  const viewChat = useCallback((id: string | null) => setViewedId(id), []);
  const isUnread = (chat: Conversation) => hasUnreadOrder(chat) &&
    !completedKeys.has(keyOf({conversationId: chat.id, messageId: chat.orderAlert!.messageId})) &&
    !pending[keyOf({conversationId: chat.id, messageId: chat.orderAlert!.messageId})];
  const alerts: Alert[] = (state?.service?.conversations || []).filter(isUnread).map(c => ({
    conversationId: c.id, messageId: c.orderAlert!.messageId, text: c.orderAlert!.text, at: c.orderAlert!.at,
    name: String(state?.records.contacts.find(v => v.id === c.contactId)?.name || 'Pelanggan'),
  })).sort((a, b) => b.at - a.at);
  const openChat = (id: string) => {
    const alert = alerts.find(a => a.conversationId === id);
    if (alert) dismiss(alert);
    setRequestedChat({id, token: Date.now()});
    navigate();
  };
  // Reading is persisted on the server. A stale acknowledgement only clears its
  // own message ID, so an order arriving during the request remains unread.
  useEffect(() => {
    if (!completedLeads.length) return;
    setPending(old => {
      const additions = completedLeads.filter(alert => !old[keyOf(alert)]);
      return additions.length ? {...old, ...Object.fromEntries(additions.map(alert => [keyOf(alert), alert]))} : old;
    });
  }, [completedLeads]);
  useEffect(() => {
    const flush = async () => {
      const current = latest.current;
      if (inflight.current || current.busy || Date.now() - lastAttempt.current < 2500) return;
      const item = Object.values(current.pending)[0];
      if (!item) return;
      inflight.current = true; lastAttempt.current = Date.now();
      try {
        if (await current.act({type: 'service', data: {kind: 'order_alert_read', ...item}})) {
          setPending(old => {const next = {...old}; delete next[keyOf(item)]; return next;});
        }
      } finally {inflight.current = false;}
    };
    void flush();
    const timer = setInterval(() => void flush(), 3000);
    return () => clearInterval(timer);
  }, [pending, busy]);
  useEffect(() => {
    const chat = state?.service?.conversations.find(c => c.id === viewedId);
    if (chat && hasUnreadOrder(chat) && document.visibilityState === 'visible') dismiss({conversationId: chat.id, messageId: chat.orderAlert!.messageId});
  }, [state, viewedId, dismiss]);
  const alertKeys = alerts.map(keyOf).join('|');
  useEffect(() => {
    const fresh = alerts.find(a => a.conversationId !== viewedId && !announced.current.has(keyOf(a)));
    for (const alert of alerts) announced.current.add(keyOf(alert));
    if (fresh) setPopup(fresh);
    else setPopup(current => current && alerts.some(a => keyOf(a) === keyOf(current)) ? current : null);
  }, [alertKeys, viewedId]);
  useEffect(() => {
    if (!popup) return;
    const timer = setTimeout(() => setPopup(null), 8000);
    return () => clearTimeout(timer);
  }, [popup]);
  return <Context.Provider value={{alerts, customers, requestedChat, openChat, viewChat, dismiss, isUnread}}>
    {children}
    {popup && alerts.some(a => keyOf(a) === keyOf(popup)) && <aside className="order-popup" role="status" aria-live="polite">
      <ShoppingCart size={23}/>
      <div><strong>Pembeli ingin order</strong><p><b>{popup.name}</b>: {popup.text}</p><button type="button" onClick={() => openChat(popup.conversationId)}>Buka chat <span aria-hidden="true">→</span></button></div>
      <button type="button" className="order-popup-close" aria-label="Tutup pop-up" onClick={() => setPopup(null)}><X size={17}/></button>
    </aside>}
  </Context.Provider>;
}

export function OrderNotificationBell() {
  const {alerts, openChat, dismiss} = useOrderNotifications();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => {if (!root.current?.contains(e.target as Node)) setOpen(false);};
    const escape = (e: KeyboardEvent) => {if (e.key === 'Escape') {setOpen(false); trigger.current?.focus();}};
    document.addEventListener('pointerdown', outside); document.addEventListener('keydown', escape);
    return () => {document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape);};
  }, [open]);
  return <div ref={root} className="order-notifications">
    <button ref={trigger} type="button" className={`button order-notification-trigger ${alerts.length ? 'has-orders' : ''}`}
      aria-label={`${alerts.length} calon order baru`} aria-expanded={open} aria-controls="order-notification-list" onClick={() => setOpen(v => !v)}>
      <ShoppingCart size={18}/><span className="order-trigger-label">Calon order</span><b>{alerts.length}</b>
    </button>
    {open && <section id="order-notification-list" className="order-notification-list" aria-label="Calon order baru">
      <header><strong>Calon order baru</strong><span>{alerts.length}</span></header>
      <p className="order-notification-hint">Notifikasi hilang setelah chat dibuka atau pembelian terdeteksi.</p>
      {!alerts.length && <p className="order-notification-empty">Tidak ada calon order baru.</p>}
      {alerts.map(a => <div className="order-notification-item" key={keyOf(a)}>
        <button type="button" onClick={() => {setOpen(false); openChat(a.conversationId);}}><strong>{a.name}</strong><span>{a.text}</span><small>Buka chat →</small></button>
        <button type="button" className="order-dismiss" aria-label={`Bukan order: ${a.name}`} title="Bukan order" onClick={() => dismiss(a)}><X size={16}/></button>
      </div>)}
    </section>}
  </div>;
}
