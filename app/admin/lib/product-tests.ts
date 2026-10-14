import type { ServiceMessage } from './service-types';

// Existing, verified Regen report directory. Never build URLs from buyer text.
export const coaProducts=[['Tirzepatide','tirzepatide'],['Retatrutide','retatrutide'],['Semaglutide','semaglutide'],['Tesamorelin','tesamorelin'],['Cagrilintide','cagrilintide'],['BPC-157 + TB-500','bpc-157-tb-500'],['BPC-157','bpc-157'],['TB-500','tb-500'],['GHK-Cu','ghk-cu'],['KLOW80','klow80'],['NAD+','nad-plus'],['Ipamorelin','ipamorelin'],['CJC-1295 With DAC','cjc-1295-with-dac'],['CJC-1295 Without DAC','cjc-1295-without-dac'],['HGH 191AA','hgh-191aa'],['PT-141','pt-141'],['SS-31','ss-31'],['5-Amino-1MQ','5-amino-1mq'],['Semax','semax'],['Selank','selank'],['KPV','kpv'],['DSIP','dsip'],['MT-2','mt-2'],['AOD-9604','aod-9604'],['Epithalon','epithalon']];
type Product=typeof coaProducts[number];
type Turn=Pick<ServiceMessage,'role'|'text'|'status'> & {at?:number};
const normalize=(value:string)=>value.normalize('NFKC').toLowerCase().replace(/[^a-z0-9+]+/g,' ').trim();
const aliases:Record<string,string[]>={tirzepatide:['tirze','tirz'],retatrutide:['reta'],semaglutide:['sema'],'nad-plus':['nad plus'],'ss-31':['elamipretide'],'cjc-1295-with-dac':['cjc 1295 dengan dac'],'cjc-1295-without-dac':['cjc 1295 tanpa dac','cjc 1295 no dac']};
const escape=(value:string)=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const productPatterns=(p:Product)=>[p[0],p[1].replaceAll('-',' '),...(aliases[p[1]]||[])].map(name=>new RegExp('(^|[^a-z0-9])'+normalize(name).split(' ').map(escape).join(' *')+'(?=$|[^a-z0-9])','g'));
export function mentionedTestProducts(value:string):Product[]{
 let q=normalize(value);const found:Product[]=[];
 // Match longer names first, consuming a combo/variant so its components are
 // not incorrectly returned as additional products. Word boundaries prevent
 // partial matches such as MT-2 inside MT-20 or Semax inside another word.
 for(const p of [...coaProducts].sort((a,b)=>b[0].length-a[0].length)){
  const patterns=productPatterns(p);
  if(patterns.some(pattern=>pattern.test(q))){found.push(p);for(const pattern of patterns)q=q.replace(pattern,' ');}
 }
 return coaProducts.filter(p=>found.includes(p));
}
const testing=(text:string)=>/\b(?:coa|certificate|sertifikat|tes(?:nya)?|test(?:s|ed|ing)?|dites|ditest|teruji|uji(?:nya)?|diuji|pengujian|lab|laboratorium|purity|kemurnian|hplc|lc ms|endotoksin|endotoxin|sterilitas)\b/.test(normalize(text));
const clinical=(text:string)=>/\b(?:(?:uji|tes|studi) klinis|clinical trials?|(?:tes|diuji|uji|penelitian|studi)\b.{0,100}\bmanusia|human stud(?:y|ies)|efikasi|efektivitas)\b/.test(normalize(text));
const explicitCoa=(text:string)=>/\b(?:coa|certificate|sertifikat|purity|kemurnian|hplc|lc ms|endotoksin|endotoxin|sterilitas|lab|laboratorium)\b/.test(normalize(text));
// Only genuinely generic follow-ups may inherit an older product. An unknown
// name such as Ozempic must not silently fall back to a previous Tirzepatide.
function generic(text:string){
 const words=normalize(text).split(' ');
 const filler=new Set('apa apakah sudah udah belum pernah telah ada adakah punya memiliki menjalani lolos melalui dilakukan mendapat dapat bisa boleh tolong minta meminta kirim kirimkan berikan kasih lihat melihat liat mau ingin saya aku kak kakak ya iya dong deh aja saja semua semuanya seluruh selengkapnya lengkap hasil hasilnya tes tesnya test tests tested testing dites ditest teruji uji ujinya diuji pengujian coa certificate sertifikat lab laboratorium purity kemurnian hplc lc ms endotoksin endotoxin sterilitas produk produknya ini itu tersebut yang yg nya untuk terkait mengenai tentang dong bukti buktinya bagaimana gimana mana dimana apa saja dan atau juga sudahkah'.split(' '));
 return words.every(w=>!w||filler.has(w));
}
const followup=(text:string,products:Product[])=>generic(text)||products.length>0&&generic(products.reduce((q,p)=>{
 for(const pattern of productPatterns(p))q=q.replace(pattern,' ');return q;
},normalize(text)));

export function productTestReply(messages:Turn[]):{answer:string;source:string;handoff:boolean;score:number}|null {
 const turns=messages.filter(m=>m.role==='customer'||(m.role==='bot'||m.role==='admin')&&['sent','delivered','read','simulated'].includes(m.status));
 const last=turns.at(-1);if(!last||last.role!=='customer')return null;
 const prior=turns.slice(0,-1).filter(m=>!last.at||!m.at||last.at-m.at<=86400000).slice(-10);
 const products=mentionedTestProducts(last.text),previous=prior.at(-1);
 const inheritedTest=!!previous&&testing(previous.text)&&followup(last.text,products);
 if(!testing(last.text)&&!inheritedTest)return null;
 // Clinical-study requests continue through sourced research, not a lab-report
 // shortcut that could incorrectly imply a Regen batch has clinical approval.
 if(clinical(last.text)&&!explicitCoa(last.text)||/\b(?:admin|dosis|resep)\b/.test(normalize(last.text)))return null;
 if(inheritedTest&&previous&&clinical(previous.text)&&!explicitCoa(previous.text))return null;
 let selected=products;
 if(!selected.length&&/\b(?:semua|seluruh) produk(?: regen)?\b/.test(normalize(last.text)))selected=coaProducts;
 if(!selected.length&&generic(last.text)){
  for(const turn of [...prior].reverse()){const named=mentionedTestProducts(turn.text);if(named.length){selected=named;break;}}
 }
 if(!selected.length){
  if(!generic(last.text))return null;
  return {answer:'Hasil tes produk apa yang ingin kakak lihat? Sebutkan nama produknya ya.',source:'Klarifikasi COA',handoff:false,score:100};
 }
 const links=selected.map(([name,slug])=>`Hasil tes laboratorium / COA ${name}: https://www.regenlongevitylab.com/coa/${slug}`);
 return {answer:links.join('\n'),source:'Direktori COA Regen',handoff:false,score:100};
}
