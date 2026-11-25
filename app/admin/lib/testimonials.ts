import type {Operations} from './operations';
import type {Conversation,ServiceJob} from './service-types';
import {mentionedTestProducts} from './product-tests';
import {conversationLocale,detectLanguage} from './reply-language';
export function testimonialReply(s:Operations,c:Conversation){
 const latest=c.messages.filter(m=>m.role==='customer').at(-1);if(!latest||!/(?:\btesti(?:moni(?:al)?s?)?\b|\btestimonials?\b|\breviews?\b|ulasan|pengalaman (?:customer|pelanggan)|before\s*(?:and|&)\s*after)/i.test(latest.text))return null;
 const english=(detectLanguage(latest.text)||(/\b(?:testimonials|reviews|any|show me|can you)\b/i.test(latest.text)?'en':conversationLocale(c).language))==='en';
 const sources=[...new Map(s.records.knowledge.filter(k=>k.enabled===true&&k.category==='testimonial'&&k.sourceFileId&&['image/png','image/jpeg'].includes(String(k.sourceMime))).map(k=>[String(k.sourceId),k])).values()];
 let products=mentionedTestProducts(latest.text);
 if(!products.length&&/^(?:(?:boleh|bisa|ada|minta|mau|lihat|liat|kirim|foto|testi|testimoni|testimonials?|reviews?|please|send|show|me|any|do|you|have|can|i|see|customer|photos?|kak|dong|nya|produk|ini|itu)[\s?!.,]*)+$/i.test(latest.text)){
  for(const m of c.messages.filter(m=>m.id!==latest.id&&(m.role==='customer'||['sent','read','delivered','simulated'].includes(m.status))).slice(-6).reverse()){products=mentionedTestProducts(m.text);if(products.length)break;}
 }
 if(!products.length)return {answer:english?'Which product would you like to see testimonials for?':'Mau lihat foto testimoni produk yang mana, kak?',sourceIds:[] as string[]};
 const matched=sources.filter(k=>{const tagged=mentionedTestProducts(String(k.keywords||'')+' '+String(k.sourceName||''));return tagged.some(p=>products.some(v=>v[1]===p[1]));}).slice(0,3);
 const names=products.map(p=>p[0]).join(', ');
 return {answer:matched.length?(english?`Here are customer testimonial photos for ${names}. Individual experiences vary; these are not clinical evidence or a guarantee of results.`:`Berikut foto testimoni ${names}, kak`):(english?`There are no approved testimonial photos for ${names} in our current collection yet.`:`${names}`),sourceIds:matched.map(k=>String(k.sourceId))};
}
export function testimonialJobAllowed(s:Operations,j:ServiceJob){
 if(!j.image)return true;
 return s.records.knowledge.some(k=>k.enabled===true&&k.category==='testimonial'&&k.sourceId===j.image?.sourceId&&k.sourceFileId===j.image?.fileId&&k.sourceMime===j.image?.mime);
}
