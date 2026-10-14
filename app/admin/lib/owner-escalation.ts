import type {Operations,Entry} from './operations';
import type {Conversation,OwnerTicket,ServiceAction,ServiceContext,ServiceJob,ServiceMessage} from './service-types';
import type {CsEvent} from './whatsapp-cs';
import {conversationLocale,detectLanguage} from './reply-language';
import {REGEN_CS_PHONE} from './regen-phone';

const validPhone=(v:unknown)=>typeof v==='string'&&/^\+[1-9]\d{6,14}$/.test(v)&&v!==REGEN_CS_PHONE;
export const activeOwners=(s:Operations)=>s.records.owners.filter(o=>o.enabled===true&&validPhone(o.phone)).sort((a,b)=>a.createdAt-b.createdAt||a.id.localeCompare(b.id));
export function ownerWindow(s:Operations,phone:string,now=Date.now()) {
 const last=Math.max(s.service?.ownerInbound?.[phone]||0,...(s.service?.conversations.filter(c=>!c.test&&c.transport==='meta-cs'&&s.records.contacts.some(v=>v.id===c.contactId&&v.phone===phone)).map(c=>c.lastInboundAt||0)||[]));
 return last>0&&now-last<86400000&&last<=now+300000;
}
export function ticketCurrent(s:Operations,t:OwnerTicket,now=Date.now()) {
 const c=s.service?.conversations.find(c=>c.id===t.conversationId);
 return !!c&&!c.test&&c.transport==='meta-cs'&&c.mode==='human'&&(c.ownerRevision||0)===t.revision&&now-t.createdAt<7*86400000&&t.createdAt<=now&&t.status!=='cancelled'&&s.records.contacts.some(v=>v.id===c.contactId&&v.phone===t.buyerPhone&&v.demoOnly!==true)&&activeOwners(s).some(o=>o.id===t.ownerId&&o.phone===t.ownerPhone);
}
function addJob(s:Operations,j:ServiceJob){if(s.service!.jobs.some(v=>v.id===j.id))return;if(s.service!.jobs.length>=1000)throw Error('Antrean mencapai 1.000 item.');s.service!.jobs.unshift(j);}
function note(c:Conversation,id:string,text:string,now:number){if(c.messages.length>=500)throw Error('Batas pesan percakapan tercapai.');c.messages.push({id,at:now,role:'note',text,status:'received'});c.updatedAt=now;}
function notify(s:Operations,t:OwnerTicket,now:number){
 const c=s.service!.conversations.find(c=>c.id===t.conversationId)!,buyer=s.records.contacts.find(v=>v.id===c.contactId)!;
 const question=c.messages.find(m=>m.id===t.questionId)?.text||'[Pertanyaan tidak tersedia]';
 // The full question remains in the dashboard; WhatsApp has a 4,096 character limit.
 const text=[`ESKALASI REGEN • ${t.id}`,`Buyer: ${String(buyer.name).slice(0,160)}`,`Nomor: ${t.buyerPhone}`,`Bahasa: ${conversationLocale(c).language}`,`Alasan: ${t.reason.slice(0,350)}`,'',`Pertanyaan buyer:\n${question.slice(0,2700)}${question.length>2700?'\n[Lanjutan tersedia di Manajemen Chat]':''}`,'',`Balas: /reply ${t.id} jawaban Anda`,'Atau kutip pesan ini lalu ketik /reply jawaban Anda.','Jawaban dirapikan sesuai bahasa buyer, lalu dikirim.'].join('\n');
 t.notificationJobId=`owner-${t.id}`;
 addJob(s,{id:t.notificationJobId,kind:'owner',ownerId:t.ownerId,ownerTicketId:t.id,destination:t.ownerPhone,text,test:false,transport:'meta-cs',status:'blocked',reason:'Menunggu WhatsApp owner aktif. Owner dapat mengirim /start ke nomor CS Regen.',createdAt:now,updatedAt:now});
}
export function queueOwnerEscalation(s:Operations,c:Conversation,questionId:string,consentMessageId:string,id:string,now:number,reason:string){
 if(c.test||c.transport!=='meta-cs')return;
 const tickets=s.service!.ownerTickets??=[];
 if(tickets.some(t=>t.conversationId===c.id&&t.consentMessageId===consentMessageId))return;
 if(tickets.length>=1000){c.reason='Eskalasi owner penuh; admin perlu menangani percakapan ini.';return;}
 let code='ESC-'+id.replace(/[^a-z0-9]/gi,'').slice(-12).toUpperCase(),suffix=1;while(tickets.some(t=>t.id===code))code='ESC-'+id.replace(/[^a-z0-9]/gi,'').slice(-12).toUpperCase()+'-'+(++suffix);
 const owner=activeOwners(s)[0],buyer=s.records.contacts.find(v=>v.id===c.contactId)!;
 const t:OwnerTicket={id:code,conversationId:c.id,questionId,consentMessageId,revision:c.ownerRevision||0,createdAt:now,ownerId:owner?.id||'',ownerName:String(owner?.name||''),ownerPhone:String(owner?.phone||''),buyerPhone:String(buyer.phone),status:'open',reason};tickets.unshift(t);
 if(owner)notify(s,t,now);else c.reason='Buyer menyetujui eskalasi. Tambahkan kontak owner aktif, lalu antrekan eskalasi dari chat ini.';
 note(c,`${id}-owner-note`,owner?`Eskalasi ${t.id} diantrekan ke owner ${t.ownerName}.`:`Eskalasi ${t.id} menunggu kontak owner aktif.`,now);
}
export function cancelOwnerEscalations(s:Operations,c:Conversation,now:number){
 c.ownerRevision=(c.ownerRevision||0)+1;
 for(const t of s.service?.ownerTickets||[])if(t.conversationId===c.id&&t.status!=='cancelled'){t.status='cancelled';t.reason='Admin mengambil alih atau mengubah mode percakapan.';}
 for(const j of s.service?.jobs||[])if(j.ownerTicketId&&['queued','blocked'].includes(j.status)&&s.service!.ownerTickets?.some(t=>t.id===j.ownerTicketId&&t.conversationId===c.id)){j.status='cancelled';j.reason='Ditangani admin.';j.updatedAt=now;const m=c.messages.find(m=>m.id===j.messageId);if(m?.status==='queued')m.status='cancelled';}
}
export function ownerNotificationAllowed(s:Operations,j:ServiceJob,now:number){
 if(j.kind!=='owner'||j.test||j.transport!=='meta-cs'||!['blocked','queued','sending'].includes(j.status)||!validPhone(j.destination)||!activeOwners(s).some(o=>o.id===j.ownerId&&o.phone===j.destination)||!ownerWindow(s,j.destination,now))return false;
 if(!j.ownerTicketId)return true; // A help/receipt response, created only from a verified owner event.
 const t=s.service?.ownerTickets?.find(t=>t.id===j.ownerTicketId);
 return !!t&&t.notificationJobId===j.id&&t.status==='open'&&!t.reply&&ticketCurrent(s,t,now);
}
export function ownerBuyerMessageAllowed(s:Operations,c:Conversation,m:ServiceMessage,j:ServiceJob,now:number){
 const t=s.service?.ownerTickets?.find(t=>t.id===m.ownerTicketId);
 return !!t&&ticketCurrent(s,t,now)&&t.status==='queued'&&t.reply?.status==='queued'&&t.reply.formatted===m.text&&j.text===m.text&&j.ownerTicketId===t.id&&j.destination===t.buyerPhone&&c.id===t.conversationId;
}
function receipt(s:Operations,owner:Entry,eventId:string,text:string,now:number){addJob(s,{id:`owner-receipt-${eventId}`,kind:'owner',ownerId:owner.id,destination:String(owner.phone),text,test:false,transport:'meta-cs',status:'blocked',reason:'Balasan perintah owner.',createdAt:now,updatedAt:now});}
export function handleOwnerIncoming(s:Operations,e:CsEvent,id:string,now:number){
 if(e.kind!=='incoming')return false;
 const owner=activeOwners(s).find(o=>o.phone===e.customerPhone),sv=s.service!;
 if(owner){sv.ownerInbound??={};sv.ownerInbound[e.customerPhone]=Math.max(sv.ownerInbound[e.customerPhone]||0,e.at);}
 const text=e.text||'',command=/^\/(reply|start|help)(?:\s|$)/i.exec(text);
 if(!command)return false;
 // Commands never enter buyer AI context, including forged commands from non-owners.
 if(!owner)return true;
 sv.ownerEvents??=[];if(sv.ownerEvents.includes(e.providerId))return true;sv.ownerEvents.push(e.providerId);sv.ownerEvents=sv.ownerEvents.slice(-1000);
 const help='Owner Regen aktif. Gunakan /reply ESC-KODE jawaban Anda, atau kutip pesan eskalasi lalu /reply jawaban Anda. Satu balasan per eskalasi. Jawaban dirapikan dalam bahasa buyer sebelum dikirim.';
 if(command[1].toLowerCase()!=='reply'){receipt(s,owner,id,help,now);return true;}
 const body=text.slice(command[0].length).trim(),codeMatch=/^(ESC-[A-Z0-9-]+)(?:\s+([\s\S]*))?$/i.exec(body);
 const quoted=e.replyToProviderId?sv.jobs.find(j=>j.kind==='owner'&&j.ownerTicketId&&j.providerId===e.replyToProviderId&&j.destination===e.customerPhone):undefined;
 const code=codeMatch?.[1].toUpperCase()||quoted?.ownerTicketId,raw=codeMatch?(codeMatch[2]||'').trim():body;
 if(!code||!raw||raw.length>3500||codeMatch&&quoted&&quoted.ownerTicketId!==code){receipt(s,owner,id,'Balasan belum dikirim. Cantumkan kode eskalasi yang benar dan jawaban (maks. 3.500 karakter).\n'+help,now);return true;}
 const t=sv.ownerTickets?.find(t=>t.id===code&&t.ownerId===owner.id&&t.ownerPhone===e.customerPhone);
 if(!t||!ticketCurrent(s,t,now)||t.status!=='open'||t.reply){receipt(s,owner,id,'Balasan belum dikirim: eskalasi tidak aktif, sudah dijawab, atau sedang ditangani admin. Periksa Manajemen Chat.',now);return true;}
 if(e.at<t.createdAt){receipt(s,owner,id,'Balasan belum dikirim: waktu pesan mendahului eskalasi.',now);return true;}
 const c=sv.conversations.find(c=>c.id===t.conversationId)!;
 const language=c.replyLocale?.language||detectLanguage(c.messages.find(m=>m.id===t.questionId)?.text||'')||conversationLocale(c).language;
 t.reply={providerId:e.providerId,raw,receivedAt:e.at,language,status:'pending'};
 note(c,`${id}-owner-received`,`Owner ${t.ownerName} membalas ${t.id}. Jawaban sedang dirapikan sebelum dikirim.`,now);
 receipt(s,owner,id,`Jawaban ${t.id} diterima dan sedang dirapikan. Status pengiriman ke buyer dapat dipantau di Manajemen Chat.`,now);return true;
}
export function checkedOwnerAnswer(raw:string,language:string,value:unknown):string {
 const v=value as Record<string,unknown>;
 if(!v||v.needsReview!==false||v.language!==language||typeof v.answer!=='string'||!v.answer.trim()||v.answer.length>4000)throw Error('Jawaban owner perlu diperiksa admin sebelum dikirim.');
 const facts=(x:string)=>[...new Set((x.match(/https?:\/\/[^\s)]+|\d+(?:[.,]\d+)*/g)||[]).map(v=>v.replace(/[.,;!?]+$/,'')))].sort();
 if(JSON.stringify(facts(raw))!==JSON.stringify(facts(v.answer)))throw Error('Angka atau tautan berubah saat perapihan. Admin perlu memeriksa jawaban.');
 return v.answer.trim();
}
export function applyOwnerAction(s:Operations,a:ServiceAction,id:string,now:number,ctx:ServiceContext){
 if(!['owner_retry','owner_assign','owner_reply_claim','owner_reply_result','owner_reply_error'].includes(a.kind))return false;
 const t=s.service?.ownerTickets?.find(t=>t.id===a.ticketId);if(!t)throw Error('Eskalasi tidak ditemukan.');
 const c=s.service!.conversations.find(c=>c.id===t.conversationId)!;
 if(a.kind==='owner_assign'){
  if(t.ownerId||t.status!=='open'||c.mode!=='human'||(c.ownerRevision||0)!==t.revision||now-t.createdAt>=7*86400000)throw Error('Eskalasi sudah berubah.');
  const o=activeOwners(s)[0];if(!o)throw Error('Tambahkan nomor owner aktif terlebih dahulu.');t.ownerId=o.id;t.ownerName=String(o.name);t.ownerPhone=String(o.phone);notify(s,t,now);return true;
 }
 if(!ticketCurrent(s,t,now))throw Error('Eskalasi tidak aktif atau sudah ditangani admin.');
 if(a.kind==='owner_retry'){
  if(!t.reply||t.reply.status!=='review'||t.status!=='review')throw Error('Hanya perapihan yang gagal yang dapat dicoba lagi.');
  t.status='open';t.reply.status='pending';delete t.reply.lease;delete t.reply.until;delete t.reply.reason;return true;
 }
 if(!ctx.trusted)throw Error('Hanya server yang boleh merapikan balasan owner.');
 const r=t.reply;if(!r)throw Error('Belum ada balasan owner.');
 if(a.kind==='owner_reply_claim'){
  if(t.status!=='open'||!(r.status==='pending'||r.status==='processing'&&(r.until||0)<=now)||typeof a.lease!=='string'||!/^[a-zA-Z0-9_-]{8,80}$/.test(a.lease))throw Error('Perapihan sedang diproses atau sudah selesai.');
  r.status='processing';r.lease=a.lease;r.until=now+90000;return true;
 }
 if(r.status!=='processing'||r.lease!==a.lease||(r.until||0)<now)throw Error('Hasil perapihan sudah kedaluwarsa.');
 if(a.kind==='owner_reply_error'){
  r.status='review';r.reason=String(a.reason||'Perapihan belum berhasil.').slice(0,500);t.status='review';c.needsAttention=true;c.reason=`Balasan owner ${t.id} perlu diperiksa: ${r.reason}`;return true;
 }
 const answer=checkedOwnerAnswer(r.raw,r.language,a.result);
 if(c.messages.length>=500)throw Error('Batas pesan percakapan tercapai.');
 const messageId=`${t.id}-answer`;
 c.messages.push({id:messageId,at:now,role:'owner',authorName:t.ownerName,ownerTicketId:t.id,purpose:'owner_reply',replyTo:t.questionId,text:answer,status:'queued',source:'Balasan owner melalui WhatsApp · bahasa dirapikan AI'});c.updatedAt=now;c.assignee=`Owner: ${t.ownerName}`;c.needsAttention=false;c.reason='Jawaban owner menunggu pengiriman ke buyer. AI tetap dijeda.';
 r.formatted=answer;r.status='queued';t.status='queued';
 addJob(s,{id:`msg-${messageId}`,kind:'customer',ownerId:t.ownerId,ownerTicketId:t.id,conversationId:c.id,messageId,destination:t.buyerPhone,text:answer,test:false,transport:'meta-cs',status:'blocked',reason:'Jawaban owner siap; menunggu jendela WhatsApp buyer aktif.',createdAt:now,updatedAt:now});return true;
}
export function ownerJobStatus(s:Operations,j:ServiceJob,now:number){
 if(j.kind!=='customer'||!j.ownerTicketId)return;
 const t=s.service?.ownerTickets?.find(t=>t.id===j.ownerTicketId),c=s.service?.conversations.find(c=>c.id===j.conversationId);if(!t||!c)return;
 if(j.status==='sent'){if(t.status!=='cancelled')t.status='replied';if((c.ownerRevision||0)===t.revision)c.reason='Jawaban owner dikirim ke WhatsApp buyer. AI tetap dijeda.';}
 if(['failed','unknown'].includes(j.status)){c.needsAttention=true;c.reason=`Balasan owner ${t.id}: ${j.reason}`;}
}
