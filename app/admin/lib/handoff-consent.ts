import type { Conversation } from './service-types';

export const HANDOFF_QUESTION = 'untuk informasi ini apakah mau diteruskan ke admin kak? agar dapat dikonfirmasi';
export const HANDOFF_ACCEPTED = 'Baik kak, saya teruskan ke admin agar informasinya dapat dikonfirmasi.';
export const HANDOFF_DECLINED = 'Baik kak, belum saya teruskan ke admin. Ada informasi lain yang ingin ditanyakan?';

type Consent = 'yes' | 'no' | 'other';
const delivered = (status:string) => ['sent','delivered','read','simulated'].includes(status);
const retryQuestion = (text:string) => /^(?:can (?:you|u) answer|could you answer|please answer|answer please|tolong jawab|bisa jawab|jawab dong)[?.!\s]*$/i.test(text.trim());

// Classify only explicit consent, never an LLM guess or a qualified/new question.
export function consentReply(value:string):Consent {
 const text=value.toLowerCase().normalize('NFKC').replace(/[.,!?;:]/g,' ').replace(/\s+/g,' ').trim();
 if(/\b(tidak|nggak|enggak|ga|gak|ngga|jangan|belum|batal|nanti|no|not)\b/.test(text))return 'no';
 const simple=text.replace(/\b(kak|kakak|ya|dong|deh|silakan|silahkan|tolong)\b/g,' ').replace(/\s+/g,' ').trim();
 if(/^(iya|iyah|iyaa|ya|mau|boleh|oke|ok|okay|setuju|yes)( (mau|boleh|setuju))?$/.test(simple)||
  /^(?:(?:iya|mau|boleh|oke|ok|setuju) )?(?:teruskan|diteruskan|lanjutkan|hubungkan|sambungkan)(?: (?:saja|aja))? ke admin$/.test(simple)||text==='ya'||text==='ya kak')return 'yes';
 if(/^(?:(?:yes|yeah|yea|yep|yup|sure|absolutely|certainly|of course|ok|okay|alright)(?: please| go ahead| please go ahead)?|go ahead|please do|do it|👍[🏻🏼🏽🏾🏿]?)$/.test(text))return 'yes';
 if(/^(?:yes please|yes please (?:connect|transfer|forward)(?: me| it)?(?: to (?:the )?admin)?|please (?:connect|transfer|forward)(?: me| it)? to (?:the )?(?:admin|agent)|oui|oui merci|sí|si por favor|sim|ja bitte|ja|はい|お願いします|네|是|好的|可以|نعم|да|ใช่|vâng|đồng ý|हाँ)$/.test(text))return 'yes';
 if(/^(?:non|no gracias|não|nein|いいえ|아니요|不|不要|لا|нет|ไม่|không|नहीं)$/.test(text))return 'no';
 return 'other';
}

// Keep the substantive question separate from consent. Older conversations may
// contain repeated offers whose replyTo points to "yeah" instead of the question.
// Follow only explicit message links, stopping at human intervention/new topics.
export function handoffQuestionId(c:Conversation, questionId=c.pendingHandoff?.questionId):string|undefined {
 const seen=new Set<string>();
 while(questionId&&!seen.has(questionId)){
  seen.add(questionId);
  const index=c.messages.findIndex(m=>m.id===questionId&&m.role==='customer');
  if(index<0)return;
  const question=c.messages[index];
  if(retryQuestion(question.text)){
   let previous=index-1;
   while(previous>=0&&c.messages[previous].role==='bot')previous--;
   if(c.messages[previous]?.role!=='customer')return;
   questionId=c.messages[previous].id;continue;
  }
  if(consentReply(question.text)!=='yes')return question.id;
  const offer=c.messages[index-1];
  if(offer?.role!=='bot'||offer.purpose!=='handoff_offer'||!delivered(offer.status)||!offer.replyTo||question.at<offer.at||question.at-offer.at>86400000)return;
  questionId=offer.replyTo;
 }
}

// A delivered offer authorizes only its original question. Consecutive explicit
// agreements are allowed (e.g. two inbound messages in one webhook batch), but a
// new question or human intervention invalidates the old consent context.
export function handoffConsent(c:Conversation,now:number):Consent {
 const pending=c.pendingHandoff,latest=c.messages.filter(m=>m.role==='customer').at(-1);
 const offerIndex=c.messages.findIndex(m=>m.id===pending?.offerId),offer=c.messages[offerIndex];
 const questionId=handoffQuestionId(c),questionIndex=c.messages.findIndex(m=>m.id===questionId);
 const latestIndex=c.messages.findIndex(m=>m.id===latest?.id);
 if(c.mode!=='bot'||!pending||!offer||offer.role!=='bot'||offer.purpose!=='handoff_offer'||!latest||
  questionIndex<0||questionIndex>=offerIndex||latestIndex<=offerIndex||!delivered(offer.status)||
  latest.at<offer.at||now-pending.at>86400000)return 'other';
 const intervening=c.messages.slice(questionIndex+1,latestIndex);
 if(intervening.some(m=>m.role==='customer'?consentReply(m.text)!=='yes'&&!retryQuestion(m.text):m.role!=='bot'||m.purpose!=='handoff_offer'))return 'other';
 return consentReply(latest.text);
}
