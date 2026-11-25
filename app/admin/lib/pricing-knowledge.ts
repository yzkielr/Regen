import type {Entry,Operations} from './operations';
import {pricingKnowledgeData as data} from './pricing-knowledge-data';
import {catalogPrice} from './invoice-pricing';

export const PRICING_KNOWLEDGE_SOURCE='regen-pricing-v2-after-discount-20261019';
export const PRICING_KNOWLEDGE_WORKSPACE='sn91ghXntwbytisraDyKgJeAwFGMaE0l3ccpOwKD6MgqMq5RWyICDy';
export const PRICING_KNOWLEDGE_REVISION='20261019-'+data.sourceHash.slice(0,12);
export type PricingKnowledgeImport={revision:string;source:string;sourceHash:string;normalOnly:boolean;entries:number;prices:number;fingerprint:string;importedAt:number;retatrutideCartridgeOverride?:string};
const retaOverride='20261026-idr-1099000';
const retaOverrideNote='Penyesuaian pemilik 26 Oktober 2026: hanya harga IDR Retatrutide 10 mg Cartridge Set menjadi Rp1.099.000, menggantikan nilai R6 pada sheet. Harga paket lain dan mata uang lain tetap.';
const obsoletePriceSource=(id:unknown)=>[PRICING_KNOWLEDGE_SOURCE,'regen-pricing-v2-normal-20261012','regen-n8n-prices-20261015'].includes(String(id));
const packages=['Basic Package','Cartridge Set','Pen Complete Package'];
const currencies=['IDR','EUR','GBP','AUD','SGD','USD','MYR'] as const;
const aliases:Record<string,string>={Retatrutide:'reta',Tesamorelin:'tesa','GHK-Cu':'ghk ghkcu','NAD+':'nad nadplus',KLOW:'klow80 klow 80','CJC-1295 (No DAC) + Ipamorelin':'cjc ipamorelin no dac','MOTS-c':'mots mot sc',tirzepatide:'tirze tirz',semaglutide:'sema',Cagrilintide:'cagri','5-Amino-1mq':'5 amino 1mq'};
const format=(currency:typeof currencies[number],value:number)=>currency==='IDR'?'Rp'+value.toLocaleString('id-ID'):currency+' '+value.toLocaleString('en-US');

export function pricingKnowledgeEntries(now:number):Entry[]{
 return data.rows.map((row,i)=>({
  id:`${PRICING_KNOWLEDGE_SOURCE}-${row.row}`,createdAt:now,updatedAt:now,
  title:`Harga aktif ${row.product} ${row.strength} — IDR Pricing v2`,
  category:'Harga produk',keywords:`${row.product} ${row.strength} ${aliases[row.product]||''} harga price pricing cost IDR EUR GBP AUD SGD USD MYR Indonesia Australia Singapore Malaysia Basic Cartridge Pen paket`,
  content:[`Harga aktif ${row.product} ${row.strength}.`,...packages.map((name,p)=>{
   if(row.availability[p]!=='priced')return `${name}: ${row.availability[p]==='out-of-stock'?'sumber menandai out of stock; harga aktif tidak tersedia':'paket tidak tercantum tersedia dalam sumber; harga tidak tersedia'}.`;
   return `${name}: `+currencies.map(currency=>format(currency,row.prices[currency][p]!)).join('; ')+'.';
  }),`Sumber: ${data.sourceName}, sheet ${data.sheet}, baris ${row.row}. Harga final IDR setelah diskon berasal dari sel ${row.cells.IDR.join(', ')}. Angka IDR sudah final; jangan kurangi voucher lagi. Harga tiap mata uang tercantum langsung dalam sumber, bukan hasil konversi kurs.`].join('\n'),
  enabled:true,sourceId:PRICING_KNOWLEDGE_SOURCE,sourceName:'Google Sheets — idr pricing v2 (IDR setelah diskon)',sourceKind:'txt',sourceUrl:data.sourceUrl,sourceHash:data.sourceHash,sourceFileId:'',sourcePart:i+1,sourceParts:data.rows.length,importedAt:now,
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
 if(userId!==PRICING_KNOWLEDGE_WORKSPACE)return state;
 if(state.pricingKnowledgeImport?.revision===PRICING_KNOWLEDGE_REVISION)return migrateRetatrutideCartridgePrice(state,now);
 const entries=pricingKnowledgeEntries(now),retained=state.records.knowledge.filter(k=>!obsoletePriceSource(k.sourceId));
 if(retained.length+entries.length>1000)throw Error('Knowledge penuh; impor harga aktif memerlukan 19 bagian.');
 const info:PricingKnowledgeImport={revision:PRICING_KNOWLEDGE_REVISION,source:PRICING_KNOWLEDGE_SOURCE,sourceHash:data.sourceHash,normalOnly:false,entries:entries.length,prices:data.rows.flatMap(r=>currencies.flatMap(c=>r.prices[c])).filter(v=>typeof v==='number').length,fingerprint:pricingKnowledgeFingerprint(entries),importedAt:now};
 const next:Operations={pricingKnowledgeImport:info,...structuredClone(state)};
 next.pricingKnowledgeImport=info;
 next.records.knowledge=[...entries,...next.records.knowledge.filter(k=>!obsoletePriceSource(k.sourceId))];
 for(const product of next.records.products){if(product.demoOnly===true)continue;const price=catalogPrice(product);if(price===undefined)continue;product.pricingNeedsReview=price===null;if(price!==null)product.price=price;product.updatedAt=now;}
 next.logs.unshift({id:PRICING_KNOWLEDGE_SOURCE,at:now,area:'knowledge',level:'info',message:`Knowledge harga aktif diperbarui dari idr pricing v2: ${info.entries} produk/kekuatan, ${info.prices} harga dalam 7 mata uang. IDR memakai I/R/AA setelah diskon; mata uang lain tetap sesuai sumber. Invoice lama tidak diubah.`});
 next.logs=next.logs.slice(0,500);
 return migrateRetatrutideCartridgePrice(next,now);
}

// Apply only the owner-requested price, once. Preserve other admin edits,
// inventory quantities, every saved order, and all unrelated knowledge.
function migrateRetatrutideCartridgePrice(state:Operations,now:number):Operations {
 if(!state.pricingKnowledgeImport||state.pricingKnowledgeImport.retatrutideCartridgeOverride===retaOverride)return state;
 const next=structuredClone(state),row=next.records.knowledge.find(k=>k.id===`${PRICING_KNOWLEDGE_SOURCE}-6`);
 if(row){row.content=String(row.content).replace(/^Cartridge Set:\s*Rp[\d.,]+(?=;)/m,'Cartridge Set: Rp1.099.000')+'\n'+retaOverrideNote;row.updatedAt=now;}
 for(const product of next.records.products){if(product.demoOnly===true)continue;const price=catalogPrice(product);if(price===1099000&&String(product.pricingVariant||product.name||'').toLowerCase().includes('retatrutide')){product.price=price;product.updatedAt=now;}}
 next.pricingKnowledgeImport={...next.pricingKnowledgeImport!,retatrutideCartridgeOverride:retaOverride,fingerprint:pricingKnowledgeFingerprint(next.records.knowledge.filter(k=>k.sourceId===PRICING_KNOWLEDGE_SOURCE))};
 next.logs.unshift({id:'reta-cartridge-'+retaOverride,at:now,area:'knowledge',level:'info',message:retaOverrideNote});next.logs=next.logs.slice(0,500);
 return next;
}

export function pricingKnowledgeRules(state:Operations):string {
 if(!state.records.knowledge.some(k=>k.sourceId===PRICING_KNOWLEDGE_SOURCE&&k.enabled===true))return '';
 return '\nSUMBER HARGA AKTIF: knowledge berjudul Harga aktif ... — IDR Pricing v2 adalah daftar harga resmi terbaru yang ditetapkan admin. Untuk produk/kekuatan/paket/mata uang yang tercantum di sana, gunakan harga aktif tersebut, mendahului harga lama pada knowledge lain, canned atau field price katalog inventori. Katalog tetap menjadi sumber ID produk dan stok. Cocokkan produk, kekuatan dan mata uang. Jika format belum disebut dan harga tersedia, sebutkan harga aktif terendah yang tersedia dengan frasa mulai dari, lalu tanyakan Basic Package/Cartridge Set/Pen Complete Package. Jika kekuatan atau mata uang ambigu, tanyakan satu hal yang belum jelas. Jangan menyamakan ketiga paket atau mengonversi mata uang jika harga langsung tersedia. Harga yang kosong atau tidak tersedia bukan nol. Harga IDR memakai nilai final setelah diskon dari I/R/AA. Jangan kurangi voucher atau diskon ini sekali lagi. Mata uang lain tetap menggunakan angka yang tercantum langsung. Untuk invoice baru, cocokkan produk, kekuatan, dan paket dengan katalog; jangan menebak varian. Penggantian harga knowledge tidak mengubah harga invoice yang sudah dibuat.';
}
