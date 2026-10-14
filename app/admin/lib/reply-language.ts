import type {Conversation} from './service-types';
export type ReplyLocale={language:string;offer:string;accepted:string;declined:string;sources:string};
const id:ReplyLocale={language:'id',offer:'untuk informasi ini apakah mau diteruskan ke admin kak? agar dapat dikonfirmasi',accepted:'Baik kak, saya teruskan ke admin agar informasinya dapat dikonfirmasi.',declined:'Baik kak, belum saya teruskan ke admin. Ada informasi lain yang ingin ditanyakan?',sources:'Sumber:'};
const en:ReplyLocale={language:'en',offer:'Would you like me to forward this question to our admin team so they can confirm the information?',accepted:'I will forward your question to our admin team for confirmation.',declined:'I have not forwarded your question to the admin team. What else would you like to know?',sources:'Sources:'};
export function detectLanguage(text:string):string {
 if(/[\u3040-\u30ff]/u.test(text))return 'ja';if(/[\uac00-\ud7af]/u.test(text))return 'ko';if(/[\u4e00-\u9fff]/u.test(text))return 'zh';if(/[\u0600-\u06ff]/u.test(text))return 'ar';if(/[\u0e00-\u0e7f]/u.test(text))return 'th';if(/[\u0900-\u097f]/u.test(text))return 'hi';if(/[\u0400-\u04ff]/u.test(text))return 'ru';
 if(/\b(kak|apa|apakah|gimana|bagaimana|berapa|hamil|ibu|bayar|boleh|bisa|saya|pakai|kalo|kalau|untuk|mau|tolong|jelaskan|tidak|nggak)\b/i.test(text))return 'id';
 if(/\b(what|how|can|could|would|please|thanks|thank you|hello|hi|the|does|explain|pregnant|benefits|risks|I['’]m)\b/i.test(text))return 'en';
 if(/\b(hola|gracias|puedo|puede|quiero|embarazada|qué|cómo)\b/i.test(text))return 'es';
 if(/\b(bonjour|merci|pouvez|voudrais|enceinte|comment|est-ce)\b/i.test(text))return 'fr';
 if(/\b(hallo|danke|kann|schwanger|bitte|möchte)\b/i.test(text))return 'de';
 if(/\b(olá|obrigado|obrigada|posso|grávida|você)\b/i.test(text))return 'pt';return '';
}
export function checkedLocale(value:unknown):ReplyLocale|undefined {
 if(!value||typeof value!=='object')return;const v=value as ReplyLocale;
 if(typeof v.language!=='string'||!/^([a-z]{2,3})(-[A-Za-z]{2,8})?$/.test(v.language))return;
 if(!(['offer','accepted','declined','sources'] as const).every(k=>typeof v[k]==='string'&&!!v[k].trim()&&v[k].length<=400&&!/https?:|www\./i.test(v[k])))return;
 return {language:v.language,offer:v.offer.trim(),accepted:v.accepted.trim(),declined:v.declined.trim(),sources:v.sources.trim()};
}
export function conversationLocale(c:Conversation):ReplyLocale {
 const text=c.messages.filter(m=>m.role==='customer').at(-1)?.text||'',language=detectLanguage(text),saved=checkedLocale(c.replyLocale);
 if(saved&&(!language||saved.language.split('-')[0]===language))return saved;
 return language==='id'||!language&&!saved?id:en;
}
export function questionToAnswer(c:Conversation):string {
 const questions=c.messages.filter(m=>m.role==='customer'),last=questions.at(-1)?.text||'';
 // Only explicit retry requests inherit the immediately preceding substantive question.
 if(/^(?:can (?:you|u) answer|could you answer|please answer|answer please|tolong jawab|bisa jawab|jawab dong)[?.!\s]*$/i.test(last.trim())){
  for(let i=questions.length-2;i>=0;i--){if(!/^(?:can (?:you|u) answer|could you answer|please answer|answer please|tolong jawab|bisa jawab|jawab dong)[?.!\s]*$/i.test(questions[i].text.trim()))return questions[i].text;}
 }
 return last;
}
export function explicitHumanRequest(text:string):boolean{return /\b(?:hubungkan|teruskan|bicara|ngobrol|minta|ingin|mau)\b.{0,35}\b(?:admin|manusia|agen)\b|\b(?:speak|talk|connect|transfer|human|contact)\b.{0,35}\b(?:admin|agent|person|human|support)\b|^(?:admin|human agent)[.!?\s]*$/i.test(text);}
