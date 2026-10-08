import type { Operations } from './operations';
import type { ServiceJob } from './service-types';
import { botMessageSendAllowed } from './service-types';
import { REGEN_CS_PHONE } from './regen-phone';

export const CS_PHONE_ID='1417834054746717';
export type CsEvent={kind:'incoming'|'delivery';customerPhone:string;providerId:string;at:number;name?:string;text?:string;unsupported?:boolean;status?:string};
export function parseCsEvent(raw:unknown,now=Date.now()):CsEvent {
 const v=raw as Record<string,unknown>;
 if(!v||v.phoneNumberId!==CS_PHONE_ID||v.businessPhone!==REGEN_CS_PHONE)throw new Error('Nomor bisnis berbeda.');
 if(typeof v.customerPhone!=='string'||!/^\+[1-9]\d{6,14}$/.test(v.customerPhone)||v.customerPhone===REGEN_CS_PHONE)throw new Error('Nomor pelanggan tidak valid.');
 if(typeof v.providerId!=='string'||!/^[A-Za-z0-9_.:@+=\/-]{1,512}$/.test(v.providerId))throw new Error('ID pesan tidak valid.');
 if(typeof v.at!=='number'||!Number.isSafeInteger(v.at)||v.at<1||v.at>now+300000)throw new Error('Waktu pesan tidak valid.');
 const base={customerPhone:v.customerPhone,providerId:v.providerId,at:v.at};
 if(v.kind==='incoming'){
  if(typeof v.text!=='string'||!v.text.trim()||v.text.length>4096||typeof v.name!=='string'||v.name.length>200)throw new Error('Isi pesan tidak valid.');
  return {...base,kind:'incoming',text:v.text.trim(),name:v.name,unsupported:v.unsupported===true};
 }
 if(v.kind==='delivery'&&['sent','delivered','read','failed'].includes(String(v.status)))return {...base,kind:'delivery',status:String(v.status)};
 throw new Error('Jenis pesan tidak didukung.');
}
export function csSendAllowed(s:Operations,j:ServiceJob,now=Date.now()){
 const c=s.service?.conversations.find(c=>c.id===j.conversationId),m=c?.messages.find(m=>m.id===j.messageId);
 const contact=s.records.contacts.find(v=>v.id===c?.contactId);
 if(!c||c.test||c.transport!=='meta-cs'||j.test||j.transport!=='meta-cs'||j.kind!=='customer'||!m||!['bot','admin'].includes(m.role)||contact?.demoOnly===true||j.destination!==contact?.phone)return false;
 if(!/^\+[1-9]\d{6,14}$/.test(j.destination)||j.destination===REGEN_CS_PHONE||!['blocked','queued','sending'].includes(j.status)||m.status!=='queued')return false;
 if(!c.lastInboundAt||now-c.lastInboundAt>=86400000||c.lastInboundAt>now+300000)return false;
 if(m.role==='bot'&&!botMessageSendAllowed(c,m,s.settings.botEnabled))return false;
 return true;
}
