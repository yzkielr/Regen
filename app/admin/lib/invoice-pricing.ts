import {pricingKnowledgeData as data} from './pricing-knowledge-data';
type Product=Record<string,unknown>;
export type InvoicePriceChoice={pricingVariant:string;pricingPackage:string;price:number|null};
export type InvoicePriceSelection={pricingVariant?:string;pricingPackage?:string};
const normalize=(v:unknown)=>String(v||'').toLowerCase().normalize('NFKC').replace(/[^a-z0-9]+/g,'');
const packages=['Basic Package','Cartridge Set','Pen Complete Package'];
// Undefined means an unrelated inventory item. Null means a known peptide whose
// strength/package is ambiguous or unavailable: never guess a billable price.
function catalogRows(product:Product){
 const explicit=String(product.pricingVariant||'');
 const name=normalize(product.name),sku=normalize(product.sku);
 let rows=data.rows.filter(r=>explicit?explicit===r.product+' '+r.strength:[name,sku].some(v=>v.includes(normalize(r.product))));
 if(!explicit){
  const strengths=String(product.name||'')+' '+String(product.sku||'');
  const found=[...strengths.matchAll(/(\d+(?:[.,]\d+)?)\s*(mg|iu)\b/gi)].map(v=>normalize(v[0]));
  if(found.length)rows=rows.filter(r=>found.includes(normalize(r.strength.match(/^\d+(?:[.,]\d+)?\s*(?:mg|iu)/i)?.[0])));
 }
 return rows;
}
function packageIndex(product:Product):number|undefined {
 const label=String(product.pricingPackage||'');
 const text=String(product.name||'')+' '+String(product.sku||'');
 const candidates=label?[packages.indexOf(label)]:[/\b(?:basic|vial)\b/i,/\bcartridge\b/i,/\bpen\b/i].flatMap((r,i)=>r.test(text)?[i]:[]);
 return candidates.length===0?undefined:candidates.length===1?candidates[0]:-1;
}
export function invoicePriceOptions(product:Product|undefined):InvoicePriceChoice[]{
 if(!product||product.demoOnly===true)return [];
 const rows=catalogRows(product);if(rows.length!==1)return [];
 const fixed=packageIndex(product),row=rows[0];
 return packages.flatMap((pricingPackage,i)=>fixed===undefined||fixed===i?[{pricingVariant:row.product+' '+row.strength,pricingPackage,price:row.prices.IDR[i]}]:[]);
}
export function catalogPrice(product:Product|undefined):number|null|undefined {
 if(!product||product.demoOnly===true)return undefined;
 const rows=catalogRows(product);
 if(!rows.length){const name=normalize(product.name),sku=normalize(product.sku);return product.pricingVariant||data.rows.some(r=>[name,sku].some(v=>v.includes(normalize(r.product))))?null:undefined;}
 if(rows.length!==1)return null;
 const index=packageIndex(product);
 return index===undefined||index<0?null:rows[0].prices.IDR[index];
}
export function invoiceLinePricing(product:Product,requested:unknown,selection:InvoicePriceSelection={}){
 const choices=invoicePriceOptions(product),hasSelection=!!(selection.pricingVariant||selection.pricingPackage);
 const choice=hasSelection?choices.find(c=>(!selection.pricingVariant||c.pricingVariant===selection.pricingVariant)&&c.pricingPackage===selection.pricingPackage):choices.length===1?choices[0]:undefined;
 if(hasSelection&&!choice)throw Error(`Paket harga ${product.name} tidak sesuai dengan produk atau kekuatan katalog.`);
 if(choice){
  if(choice.price===null)throw Error(`Paket ${choice.pricingPackage} untuk ${choice.pricingVariant} tidak tersedia.`);
  return {name:choice.pricingVariant+' — '+choice.pricingPackage,...choice,price:invoiceUnitPrice({...product,pricingVariant:choice.pricingVariant,pricingPackage:choice.pricingPackage},requested)};
 }
 return {name:String(product.name),price:invoiceUnitPrice(product,requested)};
}
export function invoiceUnitPrice(product:Product,requested:unknown):unknown {
 const price=catalogPrice(product);
 if(price===null)throw Error(`Pilih paket harga ${product.name} pada item invoice. Pastikan kekuatan produk sudah tercantum di katalog dan paket tersedia.`);
 if(price===undefined)return requested;
 if(Number(requested)!==price)throw Error(`Harga ${product.name} sudah berubah menjadi Rp${price.toLocaleString('id-ID')}. Pilih ulang produk agar draft memakai harga setelah diskon.`);
 return price;
}
