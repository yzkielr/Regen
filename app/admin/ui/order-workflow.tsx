'use client';
import { adminFetch } from './admin-client';
import { ResizableTextarea } from './resizable-textarea';
import { useState } from 'react';
import { FileText, X } from 'lucide-react';
import { Card, Invoice, Modal, Note, download } from './operations-components';
import type { ModuleProps } from './operations-components';
import { money, orderLines, orderTotal } from '../lib/operations';
import type { Entry } from '../lib/operations';
import type { Conversation, ServiceAction } from '../lib/service-types';
import { invoiceDelivery, invoiceMessage, paperProposal } from '../lib/order-invoice';

type Props=ModuleProps&{run:(action:ServiceAction)=>Promise<boolean>;refresh:()=>Promise<void>;navigate:(page:string)=>void};
const labels:Record<string,string>={draft:'Draft',awaiting_payment:'Menunggu pembayaran',paid:'PAID',ready_for_packing:'Siap dikemas',shipped:'Dikirim',completed:'Selesai',cancelled:'Dibatalkan',simulated:'Simulasi',queued:'Antrean · belum dikirim',blocked:'Belum dikirim',sending:'Mengirim',sent:'Diterima Meta',delivered:'Tersampaikan',read:'Dibaca',failed:'Gagal',unknown:'Status belum pasti'};
const Badge=({status}:{status:string})=><span className={`svc-badge ${status}`}>{labels[status]||status}</span>;

export function OrderDraftModal(p:Props&{chat?:Conversation;order?:Entry;close:()=>void;saved?:()=>void}) {
 const customer=p.state.records.contacts.find(c=>c.id===(p.order?.contactId||p.chat?.contactId));
 const [items,setItems]=useState<{productId:string;quantity:number;price:number}[]>(()=>p.order?orderLines(p.order):p.chat?.orderSuggestion?.items.map(i=>({...i,price:Number(p.state.records.products.find(product=>product.id===i.productId)?.price||0)}))||[]);
 const [productId,setProduct]=useState(''),[qty,setQty]=useState(1);
 const [address,setAddress]=useState(String(p.order?.address||customer?.address||'')),[notes,setNotes]=useState(String(p.order?.notes||''));
 const [shipping,setShipping]=useState(Number(p.order?.shipping||0)),[discount,setDiscount]=useState(Number(p.order?.discount||0));
 const tax=Number(p.order?.taxPercent??p.state.settings.taxPercent);
 const total=orderTotal({id:'preview',createdAt:0,updatedAt:0,items:JSON.stringify(items),shipping,discount,taxPercent:tax});
 const products=p.state.records.products.filter(product=>(p.order?.test===true||p.chat?.test||product.demoOnly!==true)&&!items.some(i=>i.productId===product.id));
 return <Modal title={`${p.order?'Edit':'Draft'} pesanan · ${customer?.name||''}`} onClose={p.close}><form className="ops-form" onSubmit={async e=>{e.preventDefault();const ok=p.order?await p.run({kind:'order_update',orderId:p.order.id,items,address,notes,shipping,discount}):await p.run({kind:'order_from_chat',conversationId:p.chat?.id,items,address,notes,shipping,discount});if(ok){p.close();p.saved?.();}}}>
 <Note>{p.order?.test===true||p.chat?.test?'SIMULASI — tidak membuat tagihan nyata.':'Draft untuk diperiksa admin. Stok belum direservasi dan invoice belum dikirim.'} Harga awal mengikuti katalog internal.</Note>
 <div className="svc-add-line"><select aria-label="Produk" value={productId} onChange={e=>setProduct(e.target.value)}><option value="">Pilih produk</option>{products.map(product=><option key={product.id} value={product.id}>{product.name} · {money(Number(product.price))}</option>)}</select><input aria-label="Jumlah produk baru" type="number" min={1} step={1} value={qty} onChange={e=>setQty(Number(e.target.value))}/><button type="button" className="button" disabled={!productId||!Number.isInteger(qty)||qty<1} onClick={()=>{const product=products.find(product=>product.id===productId)!;setItems([...items,{productId,quantity:qty,price:Number(product.price)}]);setProduct('');setQty(1);}}>Tambah</button></div>
 {items.map((item,index)=><div className="svc-draft-item" key={item.productId}><strong>{p.state.records.products.find(product=>product.id===item.productId)?.name}</strong><label>Jumlah<input type="number" min={1} step={1} required value={item.quantity} onChange={e=>setItems(items.map((value,i)=>i===index?{...value,quantity:Number(e.target.value)}:value))}/></label><label>Harga satuan (Rp)<input type="number" min={0} step={1} required value={item.price} onChange={e=>setItems(items.map((value,i)=>i===index?{...value,price:Number(e.target.value)}:value))}/></label><span>{money(item.price*item.quantity)}</span><button type="button" className="icon-button" onClick={()=>setItems(items.filter((_,i)=>i!==index))} aria-label="Hapus item"><X size={16}/></button></div>)}
 <label className="ops-field"><span>Alamat kirim</span><ResizableTextarea value={address} onChange={e=>setAddress(e.target.value)} maxLength={2000} placeholder="Boleh dilengkapi sebelum invoice diterbitkan."/></label>
 <div className="ops-form-grid"><label className="ops-field"><span>Ongkir (Rp)</span><input type="number" min={0} step={1} required value={shipping} onChange={e=>setShipping(Number(e.target.value))}/></label><label className="ops-field"><span>Diskon (Rp)</span><input type="number" min={0} max={items.reduce((n,i)=>n+i.price*i.quantity,0)} step={1} required value={discount} onChange={e=>setDiscount(Number(e.target.value))}/></label></div>
 <label className="ops-field"><span>Catatan</span><ResizableTextarea value={notes} onChange={e=>setNotes(e.target.value)} maxLength={2000}/></label>
 <footer><strong>Total: {money(total)} <small>termasuk pajak {tax}% dan ongkir</small></strong><button className="button primary" disabled={p.busy||!items.length}>Simpan draft</button></footer>
 </form></Modal>;
}

export function OrderWorkflow(p:Props&{status:Record<string,boolean|string>;openInbox:()=>void}) {
 const [filter,setFilter]=useState('all'),[search,setSearch]=useState(''),[error,setError]=useState(''),[flipBusy,setFlipBusy]=useState('');
 const [selected,setSelected]=useState(''),[editing,setEditing]=useState(''),[issuing,setIssuing]=useState(''),[link,setLink]=useState('');
 const rows=p.state.records.orders.filter(o=>(filter==='all'||filter==='needs_link'&&o.invoiceState==='needs_link'||filter===o.status)&&`${o.number} ${p.state.records.contacts.find(c=>c.id===o.contactId)?.name||''}`.toLowerCase().includes(search.toLowerCase()));
 const lookup=(id:string)=>p.state.records.orders.find(o=>o.id===id);
 async function flip(orderId:string){setFlipBusy(orderId);setError('');try{const response=await adminFetch('/admin/api/service/flip',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({orderId})});const data=await response.json() as {error?:string};if(!response.ok)throw Error(data.error||'Flip belum tersedia.');p.notice('Tautan invoice Flip tersimpan.');}catch(e){setError(e instanceof Error?e.message:'Flip belum tersedia.');}finally{await p.refresh();setFlipBusy('');}}
 return <><div className="svc-section-heading"><div><h3>Order & Invoice</h3><p>Periksa draft → terbitkan invoice → pembayaran PAID → packing list ke gudang.</p></div><button className="button primary" onClick={p.openInbox}><FileText size={16}/>Buat dari chat</button></div>
 <div className="svc-order-filters"><input aria-label="Cari invoice atau pelanggan" placeholder="Cari nomor invoice atau pelanggan" value={search} onChange={e=>setSearch(e.target.value)}/><select aria-label="Filter status pesanan" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">Semua status</option><option value="needs_link">Perlu link Paper.id</option>{['draft','awaiting_payment','paid','ready_for_packing','shipped','completed','cancelled'].map(status=><option key={status} value={status}>{labels[status]}</option>)}</select></div>
 {error&&<div className="ops-error" role="alert">{error}</div>}
 <div className="svc-order-cards">{rows.map(o=>{const delivery=invoiceDelivery(p.state,o),flipJob=p.state.service?.jobs.find(j=>j.kind==='flip_invoice'&&j.orderId===o.id);return <Card key={o.id} title={String(o.number)} extra={<Badge status={String(o.status)}/>}><div className="svc-fulfillment"><strong>{p.state.records.contacts.find(c=>c.id===o.contactId)?.name}</strong>{o.test===true&&<Badge status="simulated"/>}{orderLines(o).map(l=><span key={l.productId}>{l.name} × {l.quantity} · {money(l.price*l.quantity)}</span>)}<strong>Total {money(orderTotal(o))}</strong><p>{o.address||'Alamat perlu dilengkapi sebelum invoice.'}</p><div className="svc-invoice-delivery"><strong>{o.provider==='paper'?'Paper.id':o.provider==='flip'?'Flip':'Penyedia belum dipilih'}</strong>{o.paymentLink&&<Badge status={delivery.status}/>}<small>{delivery.detail}</small>{o.provider==='flip'&&flipJob&&flipJob.status!=='sent'&&<small>{flipJob.reason}</small>}{o.paymentLink&&<a href={String(o.paymentLink)} target="_blank" rel="noopener noreferrer">Buka payment link</a>}</div>
 <div className="ops-actions"><button className="button small" onClick={()=>setSelected(o.id)}>Lihat invoice</button>{o.status==='draft'&&<><button className="button small" onClick={()=>setEditing(o.id)}>Edit draft</button><button className="button primary small" onClick={()=>setIssuing(o.id)}>Siapkan invoice</button></>}{o.provider==='paper'&&o.status==='awaiting_payment'&&!o.paymentLink&&<button className="button primary small" onClick={()=>setLink(o.id)}>Masukkan link Paper.id</button>}{['paper','flip'].includes(String(o.provider))&&delivery.canQueue&&<button className="button primary small" disabled={p.busy} onClick={()=>void p.run({kind:'invoice_send',orderId:o.id})}>{delivery.status==='failed'?'Coba kirim lagi':'Kirim invoice ke buyer'}</button>}{o.provider==='flip'&&o.invoiceState==='needs_flip'&&<button className="button small" disabled={p.busy||!!flipBusy||!['blocked','queued'].includes(flipJob?.status||'')||!(o.test===true?p.status.flipSandbox:p.status.flip)} onClick={()=>void flip(o.id)}>{flipBusy===o.id?'Memproses…':'Buat tautan Flip'}</button>}{['draft','awaiting_payment'].includes(String(o.status))&&<button className="button small" disabled={p.busy} onClick={()=>{if(confirm(`Batalkan ${o.number}? Jika tagihan sudah dibuat di Paper.id atau Flip, batalkan juga di sana.`))void p.run({kind:'cancel_order',orderId:o.id});}}>Batalkan</button>}</div>
 </div></Card>;})}</div>
 {!rows.length&&<div className="svc-empty"><FileText/><strong>{p.state.records.orders.length?'Tidak ada hasil':'Belum ada draft order'}</strong><p>Buka percakapan buyer, lalu pilih Draft pesanan atau Tinjau draft dari usulan AI.</p><button className="button" onClick={p.openInbox}>Buka percakapan</button></div>}
 <Note>Stok direservasi saat invoice disiapkan. Payment link terkirim berarti buyer menerima tagihan; status PAID mengikuti verifikasi pembayaran.</Note>
 {lookup(selected)&&<Invoice row={lookup(selected)!} state={p.state} onClose={()=>setSelected('')}/>}
 {lookup(editing)&&<OrderDraftModal {...p} order={lookup(editing)!} close={()=>setEditing('')}/>}
 {lookup(issuing)&&<IssueInvoice {...p} order={lookup(issuing)!} close={()=>setIssuing('')} prepared={(id,provider)=>{setIssuing('');if(provider==='paper')setLink(id);}}/>}
 {lookup(link)&&<PaperLink {...p} order={lookup(link)!} close={()=>setLink('')}/>}
 </>;
}

function IssueInvoice(p:Props&{order:Entry;close:()=>void;prepared:(id:string,provider:string)=>void}) {
 const [provider,setProvider]=useState(p.state.service?.config.paymentProvider||'paper');
 const [address,setAddress]=useState(String(p.order.address||p.state.records.contacts.find(c=>c.id===p.order.contactId)?.address||''));
 return <Modal title={`Periksa invoice ${p.order.number}`} onClose={p.close}><form className="ops-form" onSubmit={async e=>{e.preventDefault();if(await p.run({kind:'invoice',orderId:p.order.id,provider,address}))p.prepared(p.order.id,provider);}}><pre className="svc-evidence">{paperProposal(p.state,{...p.order,address})}</pre><label className="ops-field"><span>Penyedia pembayaran</span><select value={provider} onChange={e=>setProvider(e.target.value as 'paper'|'flip')}><option value="paper">Paper.id · link dibuat admin</option><option value="flip">Flip · memerlukan koneksi API</option></select></label><label className="ops-field"><span>Alamat kirim lengkap</span><ResizableTextarea required maxLength={2000} value={address} onChange={e=>setAddress(e.target.value)}/></label><Note>{provider==='paper'?'Setelah disimpan, gunakan nomor invoice dan total yang sama saat membuat tagihan di Paper.id.':'Permintaan pembuatan invoice Flip dicatat untuk diproses melalui koneksi API.'}</Note><footer><button className="button primary" disabled={p.busy}>Konfirmasi & reservasi stok</button></footer></form></Modal>;
}

function PaperLink(p:Props&{order:Entry;close:()=>void}) {
 const [url,setUrl]=useState(''),[instructions,setInstructions]=useState('Silakan lakukan pembayaran melalui tautan invoice.'),[copyState,setCopyState]=useState('');
 const text=invoiceMessage(p.order,url.trim(),instructions.trim()),proposal=paperProposal(p.state,p.order);
 return <Modal title={`Paper.id · ${p.order.number}`} onClose={p.close}><form className="ops-form" onSubmit={async e=>{e.preventDefault();if(await p.run({kind:'paper_link',orderId:p.order.id,url,instructions}))p.close();}}>
 <p>Buat tagihan di Paper.id dengan nomor <strong>{p.order.number}</strong> dan total <strong>{money(orderTotal(p.order))}</strong>.</p>
 <details><summary>Rincian untuk Paper.id</summary><pre className="svc-evidence">{proposal}</pre></details><div className="ops-actions"><button type="button" className="button" onClick={async()=>{try{await navigator.clipboard.writeText(proposal);setCopyState('Rincian disalin.');}catch{setCopyState('Salin teks dari rincian atau gunakan Unduh.');}}}>Salin rincian invoice</button><button type="button" className="button" onClick={()=>download(`${p.order.number}-paper.txt`,proposal,'text/plain')}>Unduh rincian</button></div>{copyState&&<small role="status">{copyState}</small>}
 <label className="ops-field"><span>Payment link khusus invoice ini</span><input type="url" required maxLength={2000} value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://…paper.id/…"/></label><label className="ops-field"><span>Instruksi pembayaran untuk buyer</span><ResizableTextarea required maxLength={2000} value={instructions} onChange={e=>setInstructions(e.target.value)}/></label>
 <strong>Pratinjau pesan WhatsApp</strong><pre className="svc-evidence">{text}</pre><small>{text.length.toLocaleString('id-ID')} / 4.000 karakter</small>
 <Note>{p.order.test===true?'Simulasi: pesan disimpan tanpa mengirim WhatsApp.':'Pesan masuk ke percakapan buyer dan dikirim melalui WhatsApp CS. Jika lebih dari 24 jam sejak pesan terakhir buyer, pengiriman menunggu buyer chat kembali.'}</Note>
 <footer><button className="button primary" disabled={p.busy||text.length>4000}>Simpan & antrekan invoice</button></footer>
 </form></Modal>;
}
