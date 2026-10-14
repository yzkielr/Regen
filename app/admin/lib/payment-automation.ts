import { paymentTestBlock } from './payment-test';
import type { Operations } from './operations';
import type { ServiceAction, ServiceContext, ServiceJob, PaymentMail, WarehousePart } from './service-types';
import { receivePayment, serviceOf, applyService } from './service';
import { orderTotal } from './operations';

export const PAYMENT_WINDOW=48*60*60*1000;
export function invoiceInPaymentWindow(invoiceAt:unknown,receivedAt:number){const at=Number(invoiceAt);return Number.isSafeInteger(at)&&at>0&&at<=receivedAt&&receivedAt-at<=PAYMENT_WINDOW;}
export function warehouseBlock(s:Operations,j:ServiceJob,now=Date.now()):string {
 if(j.kind!=='warehouse'||j.test&&!j.testRunId)return 'Hanya pesanan asli atau pengujian pengiriman terverifikasi untuk gudang.';
 if(j.testRunId){const blocked=paymentTestBlock(s,j,now);if(blocked)return blocked;}
 const o=s.records.orders.find(o=>o.id===j.orderId),sv=serviceOf(s);
 if(!j.testRunId&&(!o||!['paid','ready_for_packing','shipped','completed'].includes(String(o.status))))return 'Pesanan belum lunas.';
 if(!/^\+[1-9]\d{7,14}$/.test(j.destination)||j.destination!==sv.config.warehousePhone)return 'Nomor gudang belum diatur atau berubah; periksa tujuan.';
 const p=sv.payments.find(p=>p.id===o?.paymentId&&p.status==='matched'&&p.orderId===o?.id);
 const mail=sv.paymentMail?.find(m=>m.id===p?.emailId);
 if(!j.testRunId){
  if(!p||p.test!==false||p.provider!==o?.provider)return 'Pembayaran belum cocok dengan order.';
  if(p.provider==='flip'){
   if(!p.verified||p.paymentStatus!=='SUCCESSFUL'||!p.billId||p.billId!==o?.flipBillId)return 'Pembayaran Flip belum terverifikasi.';
  }else if(!mail?.evidenceKey)return 'Bukti email pembayaran belum tersedia.';
 }
 if(!j.testRunId&&!String(o?.address||'').trim()||!j.text.trim()||j.text.length>4096)return 'Lengkapi alamat atau ringkas packing list (maks. 4.096 karakter).';
 const latest=Math.max(0,...sv.conversations.filter(c=>!c.test&&c.transport==='meta-cs'&&s.records.contacts.some(v=>v.id===c.contactId&&v.phone===j.destination)).map(c=>c.lastInboundAt||0));
 if(!latest||latest>now+300000||now-latest>=86400000)return 'Menunggu gudang chat ke nomor CS Regen untuk membuka jendela WhatsApp 24 jam.';
 return '';
}
export function warehouseParts(s:Operations,j:ServiceJob):('text'|'evidence')[]{
 const o=s.records.orders.find(o=>o.id===j.orderId);
 return !j.testRunId&&o?.provider==='flip'?['text']:['text','evidence'];
}
export function warehousePending(s:Operations,now=Date.now()) {
 return serviceOf(s).jobs.some(j=>j.kind==='warehouse'&&(j.status==='sending'||['blocked','queued'].includes(j.status)&&!warehouseBlock(s,j,now)));
}
const validId=(v:unknown)=>typeof v==='string'&&/^[A-Za-z0-9_.:@+=/-]{1,512}$/.test(v);
export function applyPaymentAutomation(s:Operations,a:ServiceAction,id:string,now:number,ctx:ServiceContext):boolean {
 if(!['mail_webhook','mail_lock','mail_finish','mail_received','mail_review','mail_schedule','warehouse_claim','warehouse_result','warehouse_expire','warehouse_retry'].includes(a.kind))return false;
 const sv=serviceOf(s);
 if(a.kind==='mail_review'){
  const m=sv.paymentMail?.find(m=>m.id===a.mailId),o=s.records.orders.find(o=>o.id===a.orderId);
  if(!m||m.status==='matched'||!o||o.test===true||o.provider!=='paper'||o.status!=='awaiting_payment'||a.confirmed!==true||typeof a.reason!=='string'||a.reason.trim().length<5||a.reason.length>2000||a.amount!==orderTotal(o)||Number(a.amount)<=0)throw Error('Periksa invoice, nominal, dan konfirmasi pembayaran asli di Paper.id.');
  let p=sv.payments.find(p=>p.id===m.paymentId);
  if(p&&p.amount!==a.amount)throw Error('Nominal email berbeda. Periksa pembayaran parsial atau transaksi lain.');
  if(!p){p=receivePayment(s,{id:m.id,provider:'paper',transactionId:m.transactionId||m.id,reference:m.reference,amount:a.amount,currency:'IDR',customer:m.customer,receivedAt:m.receivedAt,occurredAt:m.receivedAt,verified:false,test:false,evidence:m.body,emailId:m.id},now,{...ctx,trusted:true});m.paymentId=p.id;}
  applyService(s,{kind:'payment_review',paymentId:p.id,orderId:o.id,decision:'approve',confirmed:true,reason:a.reason},id+'-review',now,ctx);m.status='matched';m.reason=p.reason;return true;
 }
 if(a.kind==='warehouse_retry'){
  const j=sv.jobs.find(j=>j.id===a.jobId&&j.kind==='warehouse');if(!j||j.status!=='failed')throw Error('Hanya pengiriman yang dipastikan gagal dapat dicoba kembali.');
  for(const part of Object.values(j.warehouse||{}))if(part.status==='failed')Object.assign(part,{status:'pending',providerId:undefined,attemptId:undefined,delivery:undefined});
  j.status='blocked';j.reason='Menunggu pengiriman ulang bagian yang gagal.';j.updatedAt=now;return true;
 }
 if(!ctx.trusted)throw Error('Tindakan ini hanya untuk layanan server.');
 sv.mailSync??={lastAt:0,until:0,lease:'',uid:0,uidValidity:'',error:'',scanned:0,mailbox:'contact@lorenic.com'};
 if(a.kind==='mail_webhook'){
  if(!Number.isSafeInteger(a.receivedAt)||Number(a.receivedAt)<=0||Number(a.receivedAt)>now+300000)throw Error('Waktu notifikasi email tidak valid.');
  sv.mailSync.webhookLastAt=Math.max(sv.mailSync.webhookLastAt||0,Number(a.receivedAt));return true;
 }
 if(a.kind==='mail_schedule'){if(!validId(a.generation))throw Error('Jadwal tidak valid.');sv.mailSync.generation=String(a.generation);sv.mailSync.scheduleUntil=now+26*3600000;return true;}
 if(a.kind==='mail_lock'){
  if(sv.mailSync.until>now)throw Error('Email sedang disinkronkan.');
  if(!validId(a.lease))throw Error('Lease tidak valid.');
  if(a.generation&&a.generation!==sv.mailSync.generation)throw Error('Jadwal sudah digantikan.');
  sv.mailSync.lease=String(a.lease);sv.mailSync.until=now+240000;return true;
 }
 if(a.kind==='mail_finish'){
  if(sv.mailSync.lease!==a.lease)throw Error('Lease email berubah.');
  if(!Number.isSafeInteger(a.uid)||Number(a.uid)<0||!/^\d{1,30}$/.test(String(a.uidValidity)))throw Error('Cursor tidak valid.');
  if(sv.mailSync.uidValidity===a.uidValidity&&Number(a.uid)<sv.mailSync.uid)throw Error('Cursor mundur.');
  if(a.webhookAt!==undefined){
   if(a.error||!Number.isSafeInteger(a.webhookAt)||Number(a.webhookAt)<=0||Number(a.webhookAt)>(sv.mailSync.webhookLastAt||0))throw Error('Notifikasi email belum terverifikasi.');
   sv.mailSync.webhookProcessedEventAt=Math.max(sv.mailSync.webhookProcessedEventAt||0,Number(a.webhookAt));sv.mailSync.webhookProcessedAt=now;
  }
  Object.assign(sv.mailSync,{uid:a.uid,uidValidity:a.uidValidity,until:0,lastAt:now,error:String(a.error||'').slice(0,500),scanned:Number(a.scanned)||0,intervalSeconds:a.intervalSeconds===60?60:600});return true;
 }
 if(a.kind==='mail_received'){
  if(sv.mailSync.lease!==a.lease||sv.mailSync.until<now)throw Error('Lease email berakhir.');
  const m=a.mail as PaymentMail;
  if(!m||!/^mail-[a-f0-9]{64}$/.test(m.id)||!Number.isSafeInteger(m.receivedAt)||m.receivedAt>now+300000||m.receivedAt<=0||typeof m.subject!=='string'||m.subject.length>500||typeof m.from!=='string'||m.from.length>300||typeof m.body!=='string'||m.body.length>16000||!/^payment-mail\/[a-f0-9]{64}\.png$/.test(m.evidenceKey)||!Number.isSafeInteger(m.amount)||m.amount<0||m.amount>1e12||typeof m.reference!=='string'||m.reference.length>100||typeof m.transactionId!=='string'||m.transactionId.length>512||!/^([a-f0-9]{64})$/.test(m.hash))throw Error('Email tidak valid.');
  sv.paymentMail??=[];const existing=sv.paymentMail.find(v=>v.id===m.id);
  if(existing){if(existing.hash!==m.hash)throw Error('ID email sama memiliki isi berbeda.');return true;}
  if(sv.paymentMail.length>=200)throw Error('Arsip email mencapai 200. Ekspor dan arsipkan sebelum melanjutkan.');
  const stored:PaymentMail={...m,body:m.body.slice(0,3000),status:'review',paymentId:'',reason:m.reason||'Perlu diperiksa.'};sv.paymentMail.unshift(stored);
  const duplicate=sv.payments.find(p=>p.provider==='paper'&&!p.test&&p.transactionId===(m.transactionId||m.id));
  if(duplicate&&(duplicate.amount!==m.amount||duplicate.reference!==m.reference||duplicate.currency!==m.currency)){stored.reason='ID transaksi sama memiliki data berbeda. Periksa transaksi di Paper.id.';return true;}
  if(m.amount>0){const p=receivePayment(s,{id:m.id,provider:'paper',transactionId:m.transactionId||m.id,reference:m.reference,amount:m.amount,currency:m.currency||'IDR',customer:m.customer||'',occurredAt:m.receivedAt,receivedAt:m.receivedAt,verified:m.authenticated===true&&m.success===true,paymentStatus:m.success?'SUCCESSFUL':'UNKNOWN',test:false,evidence:`${m.from}\n${m.subject}\n${stored.body}`,emailId:m.id},now,ctx);stored.paymentId=p.id;stored.status=p.status==='matched'?'matched':'review';stored.reason=p.reason;if(!m.authenticated||!m.success)stored.reason=p.reason=m.reason||'Email belum terverifikasi sebagai pembayaran sukses.';}
  return true;
 }
 const j=sv.jobs.find(j=>j.id===a.jobId&&j.kind==='warehouse');if(!j)throw Error('Antrean gudang tidak ditemukan.');
 const required=warehouseParts(s,j);
 j.warehouse??={text:{status:'pending',updatedAt:now},...(required.includes('evidence')?{evidence:{status:'pending' as const,updatedAt:now}}:{})};
 if(!required.includes(a.part as 'text'|'evidence'))throw Error('Bagian pesan tidak diperlukan untuk penyedia ini.');
 const part=j.warehouse[a.part as 'text'|'evidence'];if(!part)throw Error('Bagian pesan tidak valid.');
 if(a.kind==='warehouse_expire'){if(part.status==='sending'&&now-part.updatedAt>120000){part.status='unknown';part.reason='Pengiriman terputus; periksa WhatsApp sebelum tindakan manual.';}else return true;}
 if(a.kind==='warehouse_claim'){
  const block=warehouseBlock(s,j,now);if(block||!ctx.whatsappReady)throw Error(block||'WhatsApp belum aktif.');
  if(!['blocked','queued','sending'].includes(j.status)||part.status!=='pending'||!validId(a.attemptId))throw Error('Bagian pesan sudah diproses.');
  part.status='sending';part.attemptId=String(a.attemptId);part.updatedAt=now;j.status='sending';j.updatedAt=now;return true;
 }
 if(a.kind==='warehouse_result'){
  if(part.status!=='sending'||part.attemptId!==a.attemptId||!['sent','failed','unknown'].includes(String(a.status)))throw Error('Percobaan pengiriman berbeda.');
  if(a.status==='sent'&&!validId(a.providerId))throw Error('ID pesan Meta belum tersedia.');
  Object.assign(part,{status:a.status,providerId:a.providerId,reason:String(a.reason||'').slice(0,500),updatedAt:now});
 }
 const parts=required.map(key=>j.warehouse![key]!) as WarehousePart[];
 j.status=parts.some(p=>p.status==='unknown')?'unknown':parts.some(p=>p.status==='failed')?'failed':parts.every(p=>p.status==='sent')?'sent':parts.some(p=>p.status==='sending')?'sending':'blocked';
 j.reason=j.status==='sent'?(required.includes('evidence')?'Packing list dan salinan email diterima Meta; lihat status tersampaikan.':'Packing list pembayaran Flip diterima Meta; lihat status tersampaikan.'):part.reason||'Menunggu bagian pengiriman berikutnya.';j.updatedAt=now;return true;
}
