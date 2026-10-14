import type { Entry, Operations } from './operations';
import { money, orderLines, orderTotal } from './operations';

export function invoiceConversation(s:Operations,o:Entry) {
 const candidates=(s.service?.conversations||[]).filter(c=>c.contactId===o.contactId&&c.test===(o.test===true)&&(c.test||c.transport==='meta-cs'));
 return o.conversationId?candidates.find(c=>c.id===o.conversationId):candidates.length===1?candidates[0]:undefined;
}
export function invoiceMessage(o:Entry,url=String(o.paymentLink||''),instructions=String(o.paymentInstructions||'')) {
 return [`Invoice ${o.number}`,`Total: ${money(orderTotal(o))}`,url,instructions].filter(Boolean).join('\n');
}
export function paperProposal(s:Operations,o:Entry) {
 const customer=s.records.contacts.find(c=>c.id===o.contactId);
 return [`Nomor invoice: ${o.number}`,`Customer: ${customer?.name||''}`,`WhatsApp: ${customer?.phone||''}`,`Alamat: ${o.address||'Belum diisi'}`,'',...orderLines(o).map(l=>`${l.name} | ${l.quantity} × ${money(l.price)} = ${money(l.quantity*l.price)}`),`Diskon: ${money(Number(o.discount||0))}`,`Pajak: ${Number(o.taxPercent||0)}%`,`Ongkir: ${money(Number(o.shipping||0))}`,`TOTAL: ${money(orderTotal(o))}`,`Catatan: ${o.notes||'—'}`].join('\n');
}
export function invoiceDelivery(s:Operations,o:Entry,now=Date.now()) {
 const j=s.service?.jobs.find(j=>j.kind==='customer'&&j.orderId===o.id);
 const c=invoiceConversation(s,o),m=c?.messages.find(m=>m.id===j?.messageId);
 const base={job:j,message:m,canQueue:false,status:m?.status||j?.status||'draft',detail:''};
 if(!o.paymentLink)return {...base,detail:o.status==='draft'?'Periksa draft lalu siapkan invoice.':o.provider==='flip'?'Menunggu pembuatan payment link melalui Flip API.':'Masukkan payment link dari Paper.id.'};
 if(['sent','delivered','read','unknown','sending','simulated'].includes(base.status))return {...base,detail:base.status==='unknown'?'Status kirim belum pasti. Periksa WhatsApp sebelum tindakan lain.':j?.reason||''};
 if(o.status!=='awaiting_payment')return {...base,detail:'Invoice tidak menunggu pembayaran; pesan tidak dikirim.'};
 if(o.test===true)return {...base,detail:'Simulasi; tidak dikirim ke buyer.'};
 if(!c)return {...base,detail:'Belum ada satu percakapan WhatsApp yang cocok. Buyer perlu chat ke nomor CS Regen.'};
 if(!c.lastInboundAt||now-c.lastInboundAt>=86400000||c.lastInboundAt>now+300000)return {...base,detail:'Menunggu pesan baru buyer; batas balasan WhatsApp 24 jam sudah lewat.'};
 return {...base,canQueue:!j||j.status==='failed'||j.status==='blocked'&&!j.messageId,detail:j?.status==='failed'?j.reason:j?.messageId?'Pesan masuk antrean WhatsApp.':'Siap dihubungkan ke percakapan buyer.'};
}
