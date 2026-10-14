import type { PaymentTestRun, ServiceJob } from '../app/admin/lib/service-types';
import { createHash, randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import { parsePaperReceipt, paymentSubject } from './paper-mail-parse';
import { verifiedPaperSignature } from './paper-mail-auth';
import { renderPaymentEmail } from './payment-evidence-render';
export { renderPaymentEmail };
const require=createRequire(import.meta.url);
const {dkimVerify}=require('mailauth/lib/dkim/verify');
const {convert}=require('html-to-text');
export function paymentMailText(parsed:{text?:string;html?:string|false}){
 const body=parsed.text?.trim()||(typeof parsed.html==='string'&&parsed.html.length<=1000000?convert(parsed.html,{wordwrap:false,selectors:[{selector:'a',options:{ignoreHref:true}},{selector:'img',format:'skip'},...['table','tr','td','th'].map(selector=>({selector,format:'block'}))]}).trim():'');
 if(!body||body.length>15000)throw Error('Isi email belum dapat dibaca lengkap. Periksa mailbox.');
 return body as string;
}
const endpoint='https://regen-inbox.hello-wearology.chatgpt.site/api/service/mail-collector';
type Cursor={webhookLastAt?:number;webhookProcessedAt?:number;webhookProcessedEventAt?:number;uid:number;uidValidity:string;generation?:string;scheduleUntil?:number;lastAt:number;until:number;intervalSeconds?:number;error?:string};
export function mailConfigured(){return !!(process.env.REGEN_MAIL_PASSWORD&&process.env.REGEN_ADMIN_BACKEND_ACCESS&&process.env.REGEN_DIRECT_SERVICE_KEY)&&process.env.REGEN_MAIL_ENABLED==='true';}
export async function mailBackend(action:Record<string,unknown>):Promise<{sync?:Cursor;accepted?:boolean;setupComplete?:boolean;tests?:PaymentTestRun[];testJobs?:ServiceJob[];fast?:boolean;paymentStatus?:unknown}>{
 const response=await fetch(endpoint,{method:'POST',redirect:'error',signal:AbortSignal.timeout(120000),headers:{'content-type':'application/json','OAI-Sites-Authorization':`Bearer ${process.env.REGEN_ADMIN_BACKEND_ACCESS}`,'x-regen-direct-key':process.env.REGEN_DIRECT_SERVICE_KEY||''},body:JSON.stringify(action)});
 if(!response.ok)throw Error(`Mailbox backend unavailable (${response.status})`);return response.json();
}
const hash=(v:string|Buffer)=>createHash('sha256').update(v).digest('hex');
export async function uploadPaymentEvidence(evidenceKey:string,image:Buffer){
   const upload=await fetch(endpoint+'?key='+encodeURIComponent(evidenceKey),{method:'POST',redirect:'error',signal:AbortSignal.timeout(20000),headers:{'content-type':'image/png','OAI-Sites-Authorization':`Bearer ${process.env.REGEN_ADMIN_BACKEND_ACCESS}`,'x-regen-direct-key':process.env.REGEN_DIRECT_SERVICE_KEY||''},body:new Uint8Array(image)});
   if(!upload.ok)throw Error('Bukti email belum tersimpan.');

}
export async function collectPaperMail(generation?:string,webhookAt?:number){
 if(!mailConfigured())return {configured:false,scanned:0,imported:0,stop:true};
 const before=await mailBackend({kind:'status'}),cursor=before.sync;
 const intervalSeconds=before.fast?60:600;
 if(!before.setupComplete)await mailBackend({kind:'configure',warehousePhone:'+6282114368729'});
 if(generation&&(cursor?.generation!==generation||(cursor?.scheduleUntil||0)<Date.now()))return {configured:true,scanned:0,imported:0,stop:true};
 if((cursor?.until||0)>Date.now())return {configured:true,scanned:0,imported:0,busy:true};
 const lease=randomUUID();try{await mailBackend({kind:'mail_lock',lease,generation});}catch{return {configured:true,scanned:0,imported:0,busy:true};}
 const client=new ImapFlow({host:'imap.hostinger.com',port:993,secure:true,auth:{user:'contact@lorenic.com',pass:process.env.REGEN_MAIL_PASSWORD!},logger:false,connectionTimeout:20000,greetingTimeout:20000,socketTimeout:30000,disableAutoIdle:true});
 client.on('error',()=>{});let uid=cursor?.uid||0,uidValidity=cursor?.uidValidity||'0',scanned=0,imported=0,error='';
 const deadline=Date.now()+160000;
 try{
  await client.connect();const box=await client.mailboxOpen('INBOX',{readOnly:true});uidValidity=String(box.uidValidity);
  if(uidValidity!==cursor?.uidValidity)uid=0;
  const found=await client.search(uid?{uid:`${uid+1}:*`,from:'paper.id'}:{since:new Date(Date.now()-7*86400000),from:'paper.id'},{uid:true});
  const ids=(found||[]).filter(n=>n>uid).sort((a,b)=>a-b).slice(0,30);
  for(const id of ids){
   if(Date.now()>deadline)break;
   const info=await client.fetchOne(String(id),{envelope:true,size:true,internalDate:true},{uid:true});if(!info){uid=id;continue;}
   const subject=info.envelope?.subject||'';
   if(!paymentSubject(subject)){uid=id;scanned++;continue;}
   if((info.size||0)>2000000)throw Error('Pesan pembayaran terlalu besar untuk dibaca otomatis. Periksa mailbox.');
   const record=await client.fetchOne(String(id),{source:true,internalDate:true},{uid:true});if(!record||!record.source)throw Error('Email belum dapat dibaca.');
   const receivedAt=new Date(record.internalDate||0).getTime();if(!receivedAt||receivedAt>Date.now()+300000)throw Error('Waktu penerimaan email tidak valid.');
   const parsed=await simpleParser(record.source,{skipHtmlToText:false,skipTextToHtml:true,skipImageLinks:true,maxHtmlLengthToParse:1000000});
   const body=paymentMailText(parsed);
   const from=parsed.from?.value?.length===1?parsed.from.value[0].address||'':'';
   const result=await dkimVerify(record.source,{curTime:new Date(receivedAt),strict:true}).catch(()=>null);
   const authenticated=verifiedPaperSignature(result,from),receipt=parsePaperReceipt(subject,body),digest=hash(record.source);
   const mailId='mail-'+hash('contact@lorenic.com\n'+(parsed.messageId||digest)),evidenceKey=`payment-mail/${digest}.png`;
   const image=await renderPaymentEmail(from,subject,receivedAt,body);
   await uploadPaymentEvidence(evidenceKey,image);
   await mailBackend({kind:'mail_received',lease,mail:{...receipt,id:mailId,hash:digest,from,subject:subject.slice(0,500),body,receivedAt,authenticated,evidenceKey,reason:authenticated?receipt.reason:'Tanda tangan/pengirim email belum terverifikasi. Periksa transaksi di Paper.id.',status:'review',paymentId:''}});
   uid=id;scanned++;imported++;
  }
  if(before.tests?.length){const {collectPaymentTestMail}=await import('./payment-test-mail');await collectPaymentTestMail(client,before.tests);}
 }catch{error='Sinkronisasi email belum selesai. Periksa koneksi mailbox atau email pembayaran terakhir; cursor disimpan sampai email yang berhasil diproses.';}
 finally{try{await client.logout();}catch{client.close();}await mailBackend({kind:'mail_finish',lease,uid,uidValidity,scanned,error,intervalSeconds,...(!error&&webhookAt?{webhookAt}:{})});}
 // Warehouse processing has independent claims; a scan retry never re-sends accepted parts.
 await mailBackend({kind:'warehouse'});
 return {configured:true,scanned,imported,error:!!error,fast:before.fast===true};
}
