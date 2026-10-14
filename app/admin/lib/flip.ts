// Flip V3 IDs can contain 19 digits. Preserve long integer tokens before JSON parsing.
export function parseFlipJson(raw:string):Record<string,unknown>{
 if(raw.length>1000000)throw new Error('Respons Flip terlalu besar.');let out='',quoted=false,escape=false;
 for(let i=0;i<raw.length;){const ch=raw[i];if(quoted){out+=ch;i++;if(escape)escape=false;else if(ch==='\\')escape=true;else if(ch==='"')quoted=false;continue;}if(ch==='"'){quoted=true;out+=ch;i++;continue;}if(/[0-9-]/.test(ch)){const match=raw.slice(i).match(/^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/);if(match){const token=match[0];out+=/^-?\d{16,}$/.test(token)?JSON.stringify(token):token;i+=token.length;continue;}}out+=ch;i++;}
 const data=JSON.parse(out);if(!data||typeof data!=='object'||Array.isArray(data))throw new Error('Respons Flip tidak valid.');return data;
}
export function flipUrl(value:unknown){if(typeof value!=='string')throw new Error('Tautan Flip kosong.');const u=new URL(value.startsWith('https://')?value:`https://${value}`);if(u.protocol!=='https:'||u.username||u.password||u.port||!(u.hostname==='flip.id'||u.hostname.endsWith('.flip.id')||u.hostname==='bigflip.id'))throw new Error('Tautan Flip tidak valid.');return u.href;}
export type FlipBill={reference:string;amount:number;title:string};
export async function createFlipBill(bill:FlipBill,key:string,sandbox:boolean,send:typeof fetch=fetch){
 if(!key)throw new Error('API key Flip belum dikonfigurasi.');if(!/^[A-Z0-9-]{1,80}$/.test(bill.reference)||!Number.isSafeInteger(bill.amount)||bill.amount<10000||bill.amount>1e12)throw new Error('Referensi atau nominal Flip tidak valid (minimal Rp10.000).');
 const endpoint=sandbox?'https://bigflip.id/big_sandbox_api/v3/pwf/bill':'https://bigflip.id/api/v3/pwf/bill';
 const r=await send(endpoint,{method:'POST',redirect:'error',signal:AbortSignal.timeout(20000),headers:{Authorization:`Basic ${btoa(key+':')}`,'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({title:bill.title,type:'SINGLE',amount:bill.amount,reference_id:bill.reference,step:'checkout',is_address_required:false,is_phone_number_required:false})});
 if(!r.ok)throw new Error(`Flip mengembalikan HTTP ${r.status}. Periksa penyedia sebelum mencoba ulang.`);const d=parseFlipJson(await r.text());const id=String(d.link_id??'');if(!/^\d{1,25}$/.test(id)||d.reference_id!==bill.reference||Number(d.amount)!==bill.amount)throw new Error('Respons invoice Flip tidak cocok. Periksa penyedia.');return {billId:id,url:flipUrl(d.link_url)};
}
export function normalizeFlipCallback(data:Record<string,unknown>,test:boolean){
 const exactId=(value:unknown)=>typeof value==='string'?value:typeof value==='number'&&Number.isSafeInteger(value)?String(value):'';
 const transactionId=exactId(data.id),billId=exactId(data.bill_link_id),reference=String(data.reference_id??'').trim().toUpperCase();
 if(!/^[A-Za-z0-9_-]{1,160}$/.test(transactionId)||!/^\d{1,25}$/.test(billId))throw new Error('ID transaksi / tagihan Flip tidak valid.');
 if(reference&&!/^[A-Z0-9-]{1,100}$/.test(reference))throw new Error('Referensi Flip tidak valid.');
 const amount=Number(data.amount);if(!Number.isSafeInteger(amount)||amount<=0||amount>1e12)throw new Error('Nominal Flip tidak valid.');
 if(!['SUCCESSFUL','CANCELLED','FAILED'].includes(String(data.status)))throw new Error('Status Flip tidak valid.');
 const raw=String(data.completed_at||data.created_at||'');
 const occurredAt=Date.parse(/^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d$/.test(raw)?raw.replace(' ','T')+'+07:00':raw);
 if(!Number.isFinite(occurredAt))throw new Error('Waktu transaksi Flip tidak valid.');
 return {provider:'flip',transactionId,billId,reference,amount,currency:'IDR',occurredAt,customer:String(data.sender_name??''),test,verified:true,paymentStatus:String(data.status),evidence:`Flip transaction ${transactionId}; bill ${billId}; status ${data.status}`};
}

// Authenticate the original form body before treating any payload field as payment evidence.
export async function authenticatedFlipCallback(raw:string,keys:{live?:string;sandbox?:string}) {
 if(raw.length>40000)throw new Error('Payload Flip terlalu besar.');
 const form=new URLSearchParams(raw);
 if(form.getAll('token').length!==1||form.getAll('data').length!==1)throw new Error('Format callback Flip tidak valid.');
 const supplied=form.get('token')||'';
 const digest=async(v:string)=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v)));
 const equal=async(expected?:string)=>{if(!supplied||!expected||supplied.length>1000)return false;const [a,b]=await Promise.all([digest(supplied),digest(expected)]);let diff=0;for(let i=0;i<a.length;i++)diff|=a[i]^b[i];return diff===0;};
 const [live,sandbox]=await Promise.all([equal(keys.live),equal(keys.sandbox)]);
 if(live===sandbox)throw new Error('Token callback Flip ditolak.');
 return normalizeFlipCallback(parseFlipJson(form.get('data')!),sandbox);
}
