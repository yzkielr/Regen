import type {Entry,Operations} from './operations';
import {pricingKnowledgeData as data} from './pricing-knowledge-data';

export const PRICING_KNOWLEDGE_SOURCE='regen-pricing-v2-normal-20261012';
export const PRICING_KNOWLEDGE_WORKSPACE='sn91ghXntwbytisraDyKgJeAwFGMaE0l3ccpOwKD6MgqMq5RWyICDy';
export const PRICING_KNOWLEDGE_REVISION='20261012-'+data.sourceHash.slice(0,12);
export type PricingKnowledgeImport={revision:string;source:string;sourceHash:string;normalOnly:boolean;entries:number;prices:number;fingerprint:string;importedAt:number};
const packages=['Basic Package','Cartridge Set','Pen Complete Package'];
const currencies=['IDR','EUR','GBP','AUD','SGD','USD','MYR'] as const;
const aliases:Record<string,string>={Retatrutide:'reta',Tesamorelin:'tesa','GHK-Cu':'ghk ghkcu','NAD+':'nad nadplus',KLOW:'klow80 klow 80','CJC-1295 (No DAC) + Ipamorelin':'cjc ipamorelin no dac','MOTS-c':'mots mot sc',tirzepatide:'tirze tirz',semaglutide:'sema',Cagrilintide:'cagri','5-Amino-1mq':'5 amino 1mq'};
const format=(currency:typeof currencies[number],value:number)=>currency==='IDR'?'Rp'+value.toLocaleString('id-ID'):currency+' '+value.toLocaleString('en-US');

export function pricingKnowledgeEntries(now:number):Entry[]{
 return data.rows.map((row,i)=>({
  id:`${PRICING_KNOWLEDGE_SOURCE}-${row.row}`,createdAt:now,updatedAt:now,
  title:`Harga normal ${row.product} ${row.strength} — IDR Pricing v2`,
  category:'Harga produk',keywords:`${row.product} ${row.strength} ${aliases[row.product]||''} harga price pricing cost IDR EUR GBP AUD SGD USD MYR Indonesia Australia Singapore Malaysia Basic Cartridge Pen paket`,
  content:[`Harga normal ${row.product} ${row.strength}.`,...packages.map((name,p)=>{
   if(row.availability[p]!=='priced')return `${name}: ${row.availability[p]==='out-of-stock'?'sumber menandai out of stock; harga normal tidak tersedia':'paket tidak tercantum tersedia dalam sumber; harga tidak tersedia'}.`;
   return `${name}: `+currencies.map(currency=>format(currency,row.prices[currency][p]!)).join('; ')+'.';
  }),`Sumber: ${data.sourceName}, sheet ${data.sheet}, baris ${row.row}. Harga normal IDR berasal dari sel ${row.cells.IDR.join(', ')}. Harga tiap mata uang tercantum langsung dalam sumber, bukan hasil konversi kurs.`].join('\n'),
  enabled:true,sourceId:PRICING_KNOWLEDGE_SOURCE,sourceName:'regen pricing web.xlsx — idr pricing v2 (harga normal)',sourceKind:'xlsx',sourceHash:data.sourceHash,sourceFileId:'',sourcePart:i+1,sourceParts:data.rows.length,importedAt:now,
 }));
}

export function pricingKnowledgeFingerprint(rows:Entry[]):string {
 const text=JSON.stringify(rows.map(k=>[k.id,k.title,k.content]));let hash=2166136261;
 for(let i=0;i<text.length;i++){hash^=text.charCodeAt(i);hash=Math.imul(hash,16777619);}
 return (hash>>>0).toString(16);
}

// Owner-requested, one-time data import. The revision is consumed even if an
// admin subsequently edits, disables or deletes this source; never overwrite
// those later edits. Scope the import to the existing Regen workspace only.
export function migratePricingKnowledge(state:Operations,userId:string,now:number):Operations {
 if(userId!==PRICING_KNOWLEDGE_WORKSPACE||state.pricingKnowledgeImport?.revision===PRICING_KNOWLEDGE_REVISION)return state;
 const entries=pricingKnowledgeEntries(now),retained=state.records.knowledge.filter(k=>k.sourceId!==PRICING_KNOWLEDGE_SOURCE);
 if(retained.length+entries.length>1000)throw Error('Knowledge penuh; impor harga normal memerlukan 19 bagian.');
 const info:PricingKnowledgeImport={revision:PRICING_KNOWLEDGE_REVISION,source:PRICING_KNOWLEDGE_SOURCE,sourceHash:data.sourceHash,normalOnly:true,entries:entries.length,prices:data.rows.flatMap(r=>currencies.flatMap(c=>r.prices[c])).filter(v=>typeof v==='number').length,fingerprint:pricingKnowledgeFingerprint(entries),importedAt:now};
 const next:Operations={pricingKnowledgeImport:info,...structuredClone(state)};
 next.pricingKnowledgeImport=info;
 next.records.knowledge=[...entries,...next.records.knowledge.filter(k=>k.sourceId!==PRICING_KNOWLEDGE_SOURCE)];
 next.logs.unshift({id:PRICING_KNOWLEDGE_SOURCE,at:now,area:'knowledge',level:'info',message:`Knowledge harga normal diperbarui dari idr pricing v2: ${info.entries} produk/kekuatan, ${info.prices} harga dalam 7 mata uang. Kolom after voucher dan voucher amount tidak diimpor.`});
 next.logs=next.logs.slice(0,500);
 return next;
}

export function pricingKnowledgeRules(state:Operations):string {
 if(!state.records.knowledge.some(k=>k.sourceId===PRICING_KNOWLEDGE_SOURCE&&k.enabled===true))return '';
 return '\nSUMBER HARGA AKTIF: knowledge berjudul Harga normal ... — IDR Pricing v2 adalah daftar harga resmi terbaru yang ditetapkan admin. Untuk produk/kekuatan/paket/mata uang yang tercantum di sana, gunakan harga normal tersebut, mendahului harga lama pada knowledge lain, canned atau field price katalog inventori. Katalog tetap menjadi sumber ID produk dan stok. Cocokkan kekuatan, Basic Package/Cartridge Set/Pen Complete Package dan mata uang sebelum mengutip harga; tanyakan yang belum jelas. Jangan menyamakan ketiga paket atau mengonversi mata uang jika harga langsung tersedia. Harga yang kosong atau tidak tersedia bukan nol. Tidak ada promo atau potongan harga yang diaktifkan dari sumber ini. Jangan menggunakan atau menghitung harga setelah voucher maupun nominal voucher. Penggantian harga knowledge tidak mengubah harga invoice yang sudah dibuat.';
}
