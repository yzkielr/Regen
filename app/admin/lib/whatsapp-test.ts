import type { Operations } from './operations';
import type { Conversation, ServiceJob } from './service-types';

export const META_TEST_PHONE = '+15551469188';
export const META_TEST_PHONE_ID = '1310478815485552';
export const META_TEST_WABA = '2033196024050773';
export const META_TEST_RECIPIENT = '+6285287834725';
export const META_TEST_TRANSPORT = 'meta-test' as const;
export const isWhatsAppTest = (c:Conversation) => c.transport === META_TEST_TRANSPORT && c.test;
export const isSimulation = (c:Conversation) => c.test && !isWhatsAppTest(c);

export type TestEvent = {kind:'incoming'|'delivery';providerId:string;at:number;text?:string;name?:string;status?:string;unsupported?:boolean};
export function parseTestEvent(value:unknown,now=Date.now()):TestEvent {
  const v=value as Record<string,unknown>;
  if(!v||typeof v!=='object'||v.phoneNumberId!==META_TEST_PHONE_ID||v.customerPhone!==META_TEST_RECIPIENT)throw new Error('Event di luar saluran uji.');
  if(typeof v.providerId!=='string'||!/^[A-Za-z0-9_.:@+\-=]{1,160}$/.test(v.providerId))throw new Error('ID pesan uji tidak valid.');
  if(typeof v.at!=='number'||!Number.isSafeInteger(v.at)||v.at<1||v.at>now+300000)throw new Error('Waktu pesan uji tidak valid.');
  if(v.kind==='incoming'){
    if(typeof v.text!=='string'||!v.text.trim()||v.text.length>4000||typeof v.name!=='string'||v.name.length>200)throw new Error('Isi pesan uji tidak valid.');
    return {kind:'incoming',providerId:v.providerId,at:v.at,text:v.text,name:v.name,unsupported:v.unsupported===true};
  }
  if(v.kind==='delivery'&&['sent','delivered','read','failed'].includes(String(v.status)))return {kind:'delivery',providerId:v.providerId,at:v.at,status:String(v.status)};
  throw new Error('Jenis event uji tidak didukung.');
}
export function testSendAllowed(state:Operations,j:ServiceJob,now:number):boolean {
  const c=state.service?.conversations.find(c=>c.id===j.conversationId);
  const m=c?.messages.find(m=>m.id===j.messageId);
  if(!c||!isWhatsAppTest(c)||j.transport!==META_TEST_TRANSPORT||j.kind!=='customer'||j.destination!==META_TEST_RECIPIENT||!m||!['admin','bot'].includes(m.role))return false;
  if(!['blocked','queued','sending'].includes(j.status)||!['queued'].includes(m.status))return false;
  if(!c.lastInboundAt||now-c.lastInboundAt>=24*60*60*1000||c.lastInboundAt>now+300000)return false;
  if(m.role==='bot'&&(!state.settings.botEnabled||c.mode!=='bot'||c.messages.filter(x=>x.role==='customer').at(-1)?.id!==m.replyTo))return false;
  return true;
}
