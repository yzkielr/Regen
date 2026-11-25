import type {Entry,Operations} from './operations';
import type {Conversation} from './service-types';
import {PRICING_KNOWLEDGE_SOURCE} from './pricing-knowledge';

const normalize=(v:string)=>v.toLowerCase().normalize('NFKC').replace(/[^a-z0-9+]+/g,' ').trim();
const priceIntent=(q:string)=>/\b(?:harga(?:nya)?|price(?:s)?|pricing|cost|how much)\b/i.test(q);
const aliases:Record<string,string[]>={retatrutide:['reta'],tirzepatide:['tirz','tirze'],semaglutide:['sema'],tesamorelin:['tesa'],'ghk cu':['ghk','ghkcu'],'nad+':['nad','nadplus'],'mots c':['mots','mot sc'],klow:['klow80'],'cjc 1295 no dac + ipamorelin':['cjc','ipamorelin']};
function descriptor(k:Entry){
 const match=String(k.content).split('\n')[0].match(/^Harga (?:aktif|normal) (.+?) (\d+(?:[.,]\d+)?\s*(?:mg|iu)(?:\s*\([^\n]+\))?)\.$/i);
 return match?{row:k,product:match[1],strength:match[2]}:null;
}
const names=(product:string)=>[normalize(product),...(aliases[normalize(product)]||[])];
function mentions(text:string,product:string){const q=' '+normalize(text)+' ';return names(product).some(n=>q.includes(' '+n+' '));}
function genericPrice(q:string){
 return normalize(q).split(' ').every(w=>new Set('harga harganya nya berapa berapaan ya kak kakak dong kalau kalo untuk yang ini itu tersebut produk produknya dan atau how much is it the price prices pricing cost of this that please thanks basic package cartridge set pen complete paket idr rp rupiah eur gbp aud sgd usd myr indonesia australia singapore malaysia'.split(' ')).has(w)||/^\d+$/.test(w)||['mg','iu'].includes(w));
}
const currencyOf=(q:string)=>q.match(/\b(IDR|EUR|GBP|AUD|SGD|USD|MYR)\b/i)?.[1].toUpperCase()||(/\b(rupiah|rp|indonesia)\b/i.test(q)?'IDR':/\baustralia\b/i.test(q)?'AUD':/\bsingapore\b/i.test(q)?'SGD':/\bmalaysia\b/i.test(q)?'MYR':'');
const strengthOf=(q:string)=>q.match(/\b\d+(?:[.,]\d+)?\s*(?:mg|iu)\b/i)?.[0].replace(/\s/g,'').toLowerCase()||'';
const packageOf=(q:string)=>/\bcartridge\b/i.test(q)?'Cartridge Set':/\bpen(?: complete)?\b/i.test(q)?'Pen Complete Package':/\bbasic\b/i.test(q)?'Basic Package':'';

export function pricingContext(s:Operations,c:Conversation){
 const turns=c.messages.filter(m=>m.role==='customer'||['bot','admin','owner'].includes(m.role)&&['sent','delivered','read','simulated'].includes(m.status));
 const last=turns.at(-1);if(!last||last.role!=='customer')return null;
 const q=last.text,prior=turns.slice(0,-1).slice(-12).reverse().filter(m=>last.at-m.at<=86400000);
 const inheritedPackage=!priceIntent(q)&&!!packageOf(q)&&genericPrice(q)&&prior.some(m=>priceIntent(m.text));
 if(!priceIntent(q)&&!inheritedPackage)return null;
 // Mixed pricing / clinical or transaction requests still go through the full planner.
 if(/\b(?:aman|safe|risiko|risk|dosis|dose|refund|invoice|bayar|order|pesan|beli)\b/i.test(q))return null;
 const rows=s.records.knowledge.filter(k=>k.enabled===true&&k.sourceId===PRICING_KNOWLEDGE_SOURCE).map(descriptor).filter((v):v is NonNullable<typeof v>=>!!v);
 if(!rows.length)return null;
 let productRows=rows.filter(r=>mentions(q,r.product)),context=q;
 if(!productRows.length&&genericPrice(q)){
  for(const turn of prior){
   const found=rows.filter(r=>mentions(turn.text,r.product));
   if(found.length){productRows=found;context=q+'\n'+turn.text;break;}
   if(turn.role==='customer'&&!genericPrice(turn.text)&&! /^(?:ya|iya|yeah|yes|ok|okay|oke)[.!?\s]*$/i.test(turn.text.trim()))break;
  }
 }
 const products=[...new Set(productRows.map(r=>r.product))];
 const strength=strengthOf(q)||strengthOf(context);
 const selected=strength?productRows.filter(r=>strengthOf(r.strength)===strength):productRows;
 return {question:context,rows:selected,products,strength,currency:currencyOf(q)||currencyOf(context),package:packageOf(q),generic:genericPrice(q)};
}

export function pricingReply(s:Operations,c:Conversation){
 const ctx=pricingContext(s,c);if(!ctx)return null;
 const reply=(answer:string,source='Klarifikasi harga')=>({answer,source,score:100,handoff:false});
 if(ctx.products.length!==1)return ctx.generic||ctx.products.length>1?reply('Harga produk yang mana, kak? Sebutkan nama produknya ya.'):null;
 if(!ctx.rows.length)return reply(`Harga ${ctx.products[0]} ${ctx.strength} belum tercantum di daftar aktif. Mau cek varian lain?`);
 if(ctx.rows.length>1)return reply(`Untuk ${ctx.products[0]}, mau ukuran ${[...new Set(ctx.rows.map(r=>r.strength))].join(' atau ')}?`);
 const {row,product,strength}=ctx.rows[0],currency=ctx.currency||'IDR';
 const prices=String(row.content).split('\n').flatMap(line=>{
  const name=line.match(/^(Basic Package|Cartridge Set|Pen Complete Package):/)?.[1];if(!name)return [];
  const match=currency==='IDR'?line.match(/\bRp\s*([\d.]+(?:,\d+)?)(?=;|\.$|$)/):line.match(new RegExp('\\b'+currency+' ([\\d,]+(?:\\.\\d+)?)(?=;|\\.$|$)'));
  if(!match)return [];
  const amount=Number(currency==='IDR'?match[1].replaceAll('.','').replace(',','.'):match[1].replaceAll(',',''));
  return Number.isFinite(amount)&&amount>0?[{name,amount,text:currency==='IDR'?'Rp'+amount.toLocaleString('id-ID'):currency+' '+amount.toLocaleString('en-US')}]:[];
 });
 const source='Knowledge harga aktif: '+row.title;
 if(ctx.package){const p=prices.find(p=>p.name===ctx.package);return p?reply(`Harga ${product} ${strength} — ${p.name}: ${p.text}.`,source):reply(`Harga ${product} ${strength} untuk ${ctx.package} belum tersedia di daftar aktif. Mau cek paket lain?`,source);}
 if(!prices.length)return reply(`Harga ${product} ${strength} dalam ${currency} belum tersedia di daftar aktif. Mau cek mata uang lain?`,source);
 const min=[...prices].sort((a,b)=>a.amount-b.amount)[0];
 return reply(`Harga ${product} ${strength} mulai ${min.text} (${min.name}).\n${prices.map(p=>`${p.name}: ${p.text}`).join('\n')}\nMau paket yang mana, kak?`,source);
}
