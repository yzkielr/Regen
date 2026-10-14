import type { Entry } from './operations';

// Only harmless spelling/politeness differences qualify for a verbatim reply.
// Extra facts, negations, products, amounts, and question types stay significant.
const aliases:Record<string,string>={nyicil:'cicilan',cicil:'cicilan',mencicil:'cicilan',dicicil:'cicilan',angsuran:'cicilan',bayarnya:'bayar',bayaran:'bayar',pembayaran:'bayar',membayar:'bayar',pembayarannya:'bayar',ongkirnya:'ongkir',biayanya:'biaya',harganya:'harga',gimana:'bagaimana',gmn:'bagaimana',brp:'berapa',nggak:'tidak',enggak:'tidak',gak:'tidak',ga:'tidak',gk:'tidak'};
const filler=new Set('halo hai hi kak kaka kakak min ya yah dong nih deh sih kalau kalo apakah bisa boleh dapat tersedia ada dengan untuk saya aku mau ingin'.split(' '));
export function cannedTerms(text:string):string[]{
 const cleaned=text.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim()
  .replace(/\b(bisa|boleh|dapat)\s+(ga|gak|nggak|enggak|gk|tidak)\b/g,'$1')
  .replace(/\b(ga|gak|nggak|enggak|gk|tidak)(?:\s+(?:ya|yah|kak|dong))*$/,'');
 const words=cleaned.split(/\s+/).map(w=>aliases[w]||w).filter(w=>w&&!filler.has(w));
 return [...new Set(words.filter(w=>!(w==='bayar'&&words.includes('cicilan'))))].sort();
}
const usable=(r:Entry)=>r.enabled!==false&&String(r.title||'').trim()&&String(r.content||'').trim();
export function matchCannedReply(rows:Entry[],question:string){
 const terms=cannedTerms(question);if(!terms.length)return null;
 const key=terms.join('|'),matches=rows.filter(r=>usable(r)&&cannedTerms(String(r.title)).join('|')===key);
 // Conflicting saved answers need semantic review; never choose by list order.
 if(!matches.length||new Set(matches.map(r=>String(r.content))).size!==1)return null;
 // The WhatsApp queue accepts 4,000 characters; longer saved references are
 // still available to the AI to compose a response within that limit.
 if(String(matches[0].content).length>4000)return null;
 const r=matches[0];return {answer:String(r.content),source:`Jawaban cepat: ${r.title}`,handoff:false,score:100};
}
export function selectCannedReplies(rows:Entry[],question:string){
 const terms=cannedTerms(question);
 const ranked=rows.filter(usable).map(r=>{const title=cannedTerms(String(r.title)),body=cannedTerms(String(r.content));return {r,score:terms.reduce((n,t)=>n+(title.includes(t)?6:0)+(body.includes(t)?1:0),0)};})
  .filter(v=>v.score>0).sort((a,b)=>b.score-a.score||a.r.id.localeCompare(b.r.id));
 const selected:{id:string;title:string;content:string;category:string;source:string}[]=[];let budget=24000;
 for(const {r} of ranked){const content=String(r.content);if(content.length>budget)continue;selected.push({id:`canned:${r.id}`,title:String(r.title),content,category:String(r.category||''),source:`Jawaban cepat: ${r.title}`});budget-=content.length;if(selected.length===12)break;}
 return selected;
}
