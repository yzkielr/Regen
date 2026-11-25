import type { Entry, Operations } from './operations';
export const MAX_DOCUMENT_BYTES=8*1024*1024;
export const MAX_KNOWLEDGE_TEXT=160000;
// Drive adds tracking/account parameters to the same file in folder listings.
// Use its stable ID for identity; retain the original URL for opening/downloading.
export function knowledgeSourceKey(raw:unknown){
 const value=String(raw||'');try{
  const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password||u.port)return value;
  if(u.hostname==='drive.google.com'){
   const folder=u.pathname.match(/^\/drive(?:\/u\/\d+)?\/folders\/([\w-]+)(?:\/|$)/)?.[1];if(folder)return `drive-folder:${folder}`;
   const file=u.pathname.match(/^\/file\/d\/([\w-]+)(?:\/|$)/)?.[1]||(['\/open','\/uc'].includes(u.pathname)?u.searchParams.get('id'):null);if(file)return `google-file:${file}`;
  }
  if(u.hostname==='docs.google.com'){
   const file=u.pathname.match(/^\/(?:document|spreadsheets|presentation)(?:\/u\/\d+)?\/d\/([\w-]+)(?:\/|$)/)?.[1];if(file)return `google-file:${file}`;
  }
 }catch{}return value;
}
export type ExtractedDocument={name:string;kind:string;sections:{title:string;text:string}[];warnings:string[]};
// The website collection has many per-page citation URLs. Its source button
// opens the site's homepage, independent of which entry sorts first.
export function knowledgeSourceUrl(source:Entry){return source.sourceId==='regen-website-20261014'?'https://www.regenlongevitylab.com/':String(source.sourceUrl||'');}
export function hasKnowledgeOriginal(source:Entry){return Boolean(source.sourceFileId)||source.sourceId==='regen-pricing-v2-normal-20261012';}
export function cleanKnowledgeText(text:string){return text.replace(/\r\n?/g,'\n').replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g,'').replace(/[ \t]+\n/g,'\n').replace(/\n{4,}/g,'\n\n\n').trim();}
export function documentText(d:ExtractedDocument){return d.sections.filter(s=>s.text.trim()).map(s=>`[${s.title}]\n${s.text}`).join('\n\n');}
export function splitKnowledge(text:string){
 const value=cleanKnowledgeText(text);if(!value)throw new Error('Tidak ada teks untuk disimpan.');if(value.length>MAX_KNOWLEDGE_TEXT)throw new Error('Maksimal 160.000 karakter per impor. Pisahkan dokumen menjadi beberapa bagian.');
 const chunks:string[]=[];let rest=value;while(rest.length){let end=Math.min(3500,rest.length);if(end<rest.length){const newline=rest.lastIndexOf('\n',end),space=rest.lastIndexOf(' ',end);end=newline>2000?newline:space>2000?space:end;}chunks.push(rest.slice(0,end).trim());rest=rest.slice(end).trim();}return chunks;
}
const hash=(text:string)=>{let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(16);};
export function importKnowledge(s:Operations,data:Record<string,unknown>,id:string,now:number){
 const name=String(data.name??'').trim(),kind=String(data.kind??''),category=String(data.category??'document'),keywords=String(data.keywords??'').trim();
 if(!name||name.length>140||!['pdf','docx','xlsx','csv','txt'].includes(kind)||category.length>100||keywords.length>2000||typeof data.text!=='string')throw new Error('Data impor dokumen tidak valid.');
 const sourceUrl=data.sourceUrl?String(data.sourceUrl):'';if(sourceUrl){const u=new URL(sourceUrl);if(u.protocol!=='https:'||u.username||u.password||sourceUrl.length>2000)throw new Error('Link sumber tidak valid.');}
 const text=cleanKnowledgeText(data.text),parts=splitKnowledge(text),sourceHash=hash(text),replaceId=data.replaceId?String(data.replaceId):'';
 if(replaceId&&!s.records.knowledge.some(k=>k.sourceId===replaceId))throw new Error('Sumber lama tidak ditemukan. Muat ulang daftar.');
 const base=s.records.knowledge.filter(k=>!replaceId||k.sourceId!==replaceId);
 if(base.some(k=>k.sourceHash===sourceHash&&k.sourceName===name&&String(k.sourceUrl||'')===sourceUrl))throw new Error('Dokumen yang sama sudah diimpor. Gunakan Perbarui sumber untuk menggantinya.');
 if(base.length+parts.length>1000)throw new Error('Knowledge mencapai batas 1.000 bagian. Hapus sumber yang tidak diperlukan.');
 const sourceId=replaceId||`src-${id.slice(0,60)}`;const fileId=String(data.sourceFileId??'');const sourceMime=String(data.sourceMime||'');if(sourceMime&&!['image/png','image/jpeg','image/webp'].includes(sourceMime))throw Error('Format media tidak valid.');if(fileId&&!/^[a-zA-Z0-9_-]{1,80}$/.test(fileId))throw new Error('ID file tidak valid.');
 s.records.knowledge=[...parts.map((content,i)=>({id:`${id.slice(0,60)}-${i+1}`,createdAt:now,updatedAt:now,title:`${name} · ${i+1}/${parts.length}`,content,category,keywords,enabled:data.enabled===true,sourceId,sourceName:name,sourceKind:kind,sourceUrl,sourceFileId:fileId,...(sourceMime?{sourceMime}:{}),sourceHash,sourcePart:i+1,sourceParts:parts.length,importedAt:now})),...base];
 return parts.length;
}
export function changeKnowledgeSource(s:Operations,data:Record<string,unknown>,now:number){
 const rows=s.records.knowledge.filter(k=>k.sourceId===data.sourceId);if(!rows.length)throw new Error('Sumber tidak ditemukan.');
 if(data.command==='delete')s.records.knowledge=s.records.knowledge.filter(k=>k.sourceId!==data.sourceId);
 else if(data.command==='enable'||data.command==='disable')for(const row of rows){row.enabled=data.command==='enable';row.updatedAt=now;}
 else throw new Error('Tindakan sumber tidak valid.');
}
const tokens=(q:string)=>[...new Set(q.toLowerCase().normalize('NFKC').match(/[\p{L}\p{N}][\p{L}\p{N}+_-]{1,}/gu)||[])].filter(t=>!['yang','apa','dan','dari','untuk','saya','mau','kak','bisa','the','what','this','itu','ini','dengan','berapa','bagaimana'].includes(t));
export function selectKnowledge(rows:Entry[],question:string,maxChars=32000){
 const terms=tokens(question),priceQuestion=/\b(?:harga|berapa|price|pricing|cost|biaya|rp|idr|aud|usd|eur|gbp|sgd|myr)\b/i.test(question);
 const ranked=rows.filter(k=>k.enabled===true).map((k,i)=>{const head=`${k.title} ${k.keywords||''}`.toLowerCase(),body=String(k.content).toLowerCase();let score=terms.reduce((n,t)=>n+(head.includes(t)?6:0)+(body.includes(t)?2:0),0);
  // Repeated price tables mention every package/currency; they must not crowd
  // actual descriptions out of an 8k context for a non-price question.
  if(!priceQuestion&&k.category==='Harga produk')score*=0.25;
  return {k,i,score};}).sort((a,b)=>b.score-a.score||a.i-b.i);
 const chosen:Entry[]=[];let budget=maxChars;for(const {k,score} of ranked){if(chosen.length>=24)break;if(!score&&chosen.length>=5)continue;const content=String(k.content).slice(0,4000);if(content.length>budget)continue;chosen.push({...k,content});budget-=content.length;}return chosen;
}
