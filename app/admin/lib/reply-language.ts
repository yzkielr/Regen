import type {Conversation} from './service-types';
import {contextualEvidenceQuestion,mentionedTestProducts,technicalProductQuestion,comparisonQuestion} from './product-tests';
export type ReplyLocale={language:string;offer:string;accepted:string;declined:string;sources:string};
const id:ReplyLocale={language:'id',offer:'untuk informasi ini apakah mau diteruskan ke admin kak? agar dapat dikonfirmasi',accepted:'Baik kak, saya teruskan ke admin agar informasinya dapat dikonfirmasi.',declined:'Baik kak, belum saya teruskan ke admin. Ada informasi lain yang ingin ditanyakan?',sources:'Sumber:'};
const en:ReplyLocale={language:'en',offer:'Would you like me to forward this question to our admin team so they can confirm the information?',accepted:'I will forward your question to our admin team for confirmation.',declined:'I have not forwarded your question to the admin team. What else would you like to know?',sources:'Sources:'};
export function detectLanguage(text:string):string {
 if(/[\u3040-\u30ff]/u.test(text))return 'ja';if(/[\uac00-\ud7af]/u.test(text))return 'ko';if(/[\u4e00-\u9fff]/u.test(text))return 'zh';if(/[\u0600-\u06ff]/u.test(text))return 'ar';if(/[\u0e00-\u0e7f]/u.test(text))return 'th';if(/[\u0900-\u097f]/u.test(text))return 'hi';if(/[\u0400-\u04ff]/u.test(text))return 'ru';
 if(/\b(kak|apa|apakah|gimana|bagaimana|berapa|hamil|ibu|bayar|boleh|bisa|saya|pakai|kalo|kalau|untuk|mau|tolong|jelaskan|bandingkan|bedanya|fungsi|fungsinya|manfaat|tidak|nggak)\b/i.test(text))return 'id';
 if(/\b(what|how|can|could|would|please|thanks|thank you|hello|hi|the|does|explain|pregnant|benefits|risks|safe|safety|tested|I['’]m)\b/i.test(text))return 'en';
 if(/\b(hola|gracias|puedo|puede|quiero|embarazada|qué|cómo)\b/i.test(text))return 'es';
 if(/\b(bonjour|merci|pouvez|voudrais|enceinte|comment|est-ce)\b/i.test(text))return 'fr';
 if(/\b(hallo|danke|kann|schwanger|bitte|möchte)\b/i.test(text))return 'de';
 if(/\b(olá|obrigado|obrigada|posso|grávida|você)\b/i.test(text))return 'pt';return '';
}
export function checkedLocale(value:unknown):ReplyLocale|undefined {
 if(!value||typeof value!=='object')return;const v=value as ReplyLocale;
 if(typeof v.language!=='string'||!/^([a-z]{2,3})(-[A-Za-z]{2,8})?$/.test(v.language))return;
 if(!(['offer','accepted','declined','sources'] as const).every(k=>typeof v[k]==='string'&&!!v[k].trim()&&v[k].length<=400&&!/https?:|www\./i.test(v[k])))return;
 const labels:Record<string,string>={id:'Sumber:',en:'Sources:',es:'Fuentes:',fr:'Sources :',de:'Quellen:',pt:'Fontes:',zh:'来源：',ja:'出典：',ko:'출처:',ar:'المصادر:',ru:'Источники:',th:'แหล่งข้อมูล:'};
 return {language:v.language,offer:v.offer.trim(),accepted:v.accepted.trim(),declined:v.declined.trim(),sources:labels[v.language.split('-')[0]]||'Sources:'};
}
export function conversationLocale(c:Conversation):ReplyLocale {
 const text=c.messages.filter(m=>m.role==='customer').at(-1)?.text||'',language=detectLanguage(text),saved=checkedLocale(c.replyLocale);
 if(saved&&(!language||saved.language.split('-')[0]===language))return saved;
 return language==='id'||!language&&!saved?id:en;
}
export function questionToAnswer(c:Conversation):string {
 const questions=c.messages.filter(m=>m.role==='customer'),last=questions.at(-1)?.text||'';
 const evidence=contextualEvidenceQuestion(c.messages);if(evidence)return evidence;
 const technical=contextualTechnicalQuestion(c);if(technical)return technical;
 const followup=productFollowupQuestion(last,questions.slice(0,-1).map(m=>m.text));
 if(followup)return followup;
 // Only explicit retry requests inherit the immediately preceding substantive question.
 if(/^(?:can (?:you|u) answer|could you answer|please answer|answer please|tolong jawab|bisa jawab|jawab dong)[?.!\s]*$/i.test(last.trim())){
  for(let i=questions.length-2;i>=0;i--){if(!/^(?:can (?:you|u) answer|could you answer|please answer|answer please|tolong jawab|bisa jawab|jawab dong)[?.!\s]*$/i.test(questions[i].text.trim()))return questions[i].text;}
 }
 return last;
}
// Carry product identity across short technical follow-ups. Only delivered
// replies count; stop at a changed customer topic and at the 24-hour boundary.
export function contextualTechnicalQuestion(c:Conversation):string {
 const turns=c.messages.filter(m=>m.role==='customer'||['bot','admin','owner'].includes(m.role)&&['sent','delivered','read','simulated'].includes(m.status));
 const last=turns.at(-1);if(!last||last.role!=='customer'||!technicalProductQuestion(last.text))return '';
 const named=mentionedTestProducts(last.text),compare=comparisonQuestion(last.text);
 if(named.length>=(compare?2:1))return '';
 if(!compare&&!/^(?:[\s?!.,]|fungsi(?:nya)?|guna(?:nya)?|kegunaan|manfaat(?:nya)?|kerja(?:nya)?|cara|apa|itu|ini|produk(?:nya)?|tersebut|yang|yg|nya|kak|kalo|kalau|boleh|bisa|tahu|tau|tapi|dan|untuk|jelaskan|tolong|ya|bagaimana|gimana|what|is|it|its|this|the|product|does|do|how|work|works|benefits?|purpose|used|for|please|explain)+$/i.test(last.text.trim()))return '';
 let fallback:string[]=[];
 for(const turn of turns.slice(0,-1).slice(-12).reverse()){
  if(last.at&&turn.at&&last.at-turn.at>86400000)break;
  const found=mentionedTestProducts(turn.text).map(p=>p[0]);
  if(turn.role==='customer'){
   if(found.length){const subjects=[...new Set([...found,...named.map(p=>p[0])])];return subjects.length<=(compare?2:1)?`${last.text} (${subjects.join(' dan ')})`:'';}
   if(!technicalProductQuestion(turn.text)&&! /^(?:ya|iya|yeah|yes|ok|okay|oke|thanks|terima kasih|harga(?:nya)?(?: berapa)?|berapa harganya)[.!?\s]*$/i.test(turn.text.trim()))break;
  }else if(!fallback.length&&found.length===1)fallback=found;
 }
 const subjects=[...new Set([...fallback,...named.map(p=>p[0])])];return subjects.length===(compare?2:1)?`${last.text} (${subjects.join(' dan ')})`:'';
}
// Resolve only a short, named-product follow-up. Reconstruct its intent instead
// of copying previous messages, so prices/COA stay internal and private medical
// details never become a search query. Stop at the nearest substantive question.
export function productFollowupQuestion(text:string,previous:string[]):string {
 const match=text.trim().match(/^(?:(?:kalo|kalau|bagaimana dengan|gimana dengan|what about|how about|and|dan)\s+)?(tirzepatide|tirze|tirz|retatrutide|reta|semaglutide|sema)(?:\s+(?:gimana|bagaimana|kak|ya))?[?!.\s]*$/i);
 if(!match)return '';
 const name=/^tirz/i.test(match[1])?'Tirzepatide':/^reta/i.test(match[1])?'Retatrutide':'Semaglutide';
 const english=/^(?:what|how|and)\b/i.test(text.trim());
 const prior=[...previous].reverse().find(q=>! /^(?:ya|iya|yeah|yes|ok|okay|oke|thanks|terima kasih)[.!?\s]*$/i.test(q.trim()))||'';
 if(/\b(?:harga|price|cost|berapa)\b/i.test(prior))return english?`What is the price of ${name}?`:`Berapa harga ${name}?`;
 if(/\b(?:coa|sertifikat|certificate|batch)\b/i.test(prior))return english?`COA for ${name}?`:`COA ${name}?`;
 if(/\b(?:saya|aku|my|hamil|pregnan\w*|dosis|dose|dosage|suntik|injeksi|order|pesanan|bayar|refund)\b/i.test(prior))return '';
 if(/\b(?:efek samping|risiko|resiko|side effects?|risks?)\b/i.test(prior))return english?`What are the general risks of ${name}?`:`Apa risiko umum ${name}?`;
 if(/\b(?:manfaat|benefits?)\b/i.test(prior))return english?`What is ${name} studied for?`:`Apa manfaat ${name} yang sedang diteliti?`;
 if(/\b(?:cara kerja|how.*work|mechanism)\b/i.test(prior))return english?`How does ${name} work?`:`Bagaimana cara kerja ${name}?`;
 if(!prior||/\b(?:apa|itu|what|explain|jelaskan|pengertian|definisi)\b/i.test(prior))return english?`What is ${name}?`:`Apa itu ${name}?`;
 return '';
}
export function explicitHumanRequest(text:string):boolean{return /\b(?:hubungkan|teruskan|bicara|ngobrol|minta|ingin|mau)\b.{0,35}\b(?:admin|manusia|agen)\b|\b(?:speak|talk|connect|transfer|human|contact)\b.{0,35}\b(?:admin|agent|person|human|support)\b|^(?:admin|human agent)[.!?\s]*$/i.test(text);}
