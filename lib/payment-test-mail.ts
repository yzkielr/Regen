import { createHmac, createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import nodemailer from 'nodemailer';
import { simpleParser } from 'mailparser';
import type { ImapFlow } from 'imapflow';
import type { PaymentTestRun } from '../app/admin/lib/service-types';
import { mailBackend, mailConfigured, renderPaymentEmail, uploadPaymentEvidence } from './paper-mail-worker';
const mailbox='contact@lorenic.com';
export function testMailSignature(run:PaymentTestRun,key:string){return createHmac('sha256',key).update(JSON.stringify(['regen-payment-transport-test-v1',run.id,run.createdAt,run.destination,run.subject,run.body])).digest('hex');}
export function testMailMatches(run:PaymentTestRun,mail:{id:string;signature:string;from:string;to:string;subject:string;body:string},key:string){
 const expected=testMailSignature(run,key),normalize=(s:string)=>s.replace(/\r\n/g,'\n').trim();
 return mail.id===run.id&&mail.from===mailbox&&mail.to===mailbox&&mail.subject===run.subject&&normalize(mail.body)===normalize(run.body)&&/^[a-f0-9]{64}$/.test(mail.signature)&&timingSafeEqual(Buffer.from(expected),Buffer.from(mail.signature));
}
export async function sendPaymentTestEmail(runId:string){
 if(!mailConfigured())throw Error('Mailbox belum dikonfigurasi.');
 const before=await mailBackend({kind:'status'}),run=before.tests?.find(r=>r.id===runId);
 if(!run)throw Error('Pengujian tidak ditemukan.');
 // A repeated HTTP request cannot send this email twice, including uncertain SMTP results.
 if(run.emailStatus!=='queued')return {started:true,emailStatus:run.emailStatus};
 const attemptId=randomUUID();await mailBackend({kind:'payment_test_claim',runId,attemptId});
 const transport=nodemailer.createTransport({host:'smtp.hostinger.com',port:465,secure:true,auth:{user:mailbox,pass:process.env.REGEN_MAIL_PASSWORD!},logger:false,debug:false,connectionTimeout:20000,greetingTimeout:20000,socketTimeout:30000,disableFileAccess:true,disableUrlAccess:true});
 let status:'sent'|'failed'|'unknown'='unknown',reason='Hasil SMTP belum pasti. Periksa mailbox; tidak dikirim ulang otomatis.';
 try{
  const out=await transport.sendMail({from:{name:'Regen — Pengujian Sistem',address:mailbox},to:mailbox,subject:run.subject,text:run.body,messageId:`<regen-test-${run.id}@lorenic.com>`,headers:{'X-Regen-Test-Id':run.id,'X-Regen-Test-Signature':testMailSignature(run,process.env.REGEN_DIRECT_SERVICE_KEY!)}});
  if(out.accepted?.includes(mailbox)){status='sent';reason='Server email menerima pesan uji; menunggu pembacaan mailbox.';}else{status='failed';reason='Server email menolak penerima pengujian.';}
 }catch(e){const code=(e as {code?:string}).code;if(['EAUTH','EENVELOPE','EDNS'].includes(code||'')){status='failed';reason='Koneksi atau izin pengiriman email ditolak. Periksa pengaturan mailbox.';}}
 finally{transport.close();}
 await mailBackend({kind:'payment_test_email_result',runId,attemptId,status,reason});return {started:true,emailStatus:status};
}
export async function collectPaymentTestMail(client:ImapFlow,runs:PaymentTestRun[]){
 let imported=0;
 for(const run of runs.filter(r=>!r.receivedAt&&r.expiresAt>Date.now()&&['sending','sent','unknown'].includes(r.emailStatus)).slice(0,3)){
  const found=await client.search({header:{'X-Regen-Test-Id':run.id},since:new Date(run.createdAt-86400000)},{uid:true});
  for(const id of (found||[]).slice(0,10)){
   const info=await client.fetchOne(String(id),{size:true},{uid:true});if(!info||(info.size||0)>100000)continue;
   const record=await client.fetchOne(String(id),{source:true,internalDate:true},{uid:true});if(!record||!record.source)continue;
   const parsed=await simpleParser(record.source,{skipTextToHtml:true,skipImageLinks:true,maxHtmlLengthToParse:100000});
   const recipients=Array.isArray(parsed.to)?parsed.to.flatMap(a=>a.value):parsed.to?.value||[];
   if(parsed.from?.value.length!==1||recipients.length!==1)continue;
   const mail={id:String(parsed.headers.get('x-regen-test-id')||''),signature:String(parsed.headers.get('x-regen-test-signature')||''),from:parsed.from.value[0].address||'',to:recipients[0].address||'',subject:parsed.subject||'',body:parsed.text||''};
   if(!testMailMatches(run,mail,process.env.REGEN_DIRECT_SERVICE_KEY!))continue;
   const receivedAt=new Date(record.internalDate||0).getTime();if(!receivedAt||receivedAt<run.createdAt-300000||receivedAt>Date.now()+300000)continue;
   const hash=createHash('sha256').update(record.source).digest('hex'),evidenceKey=`payment-mail/${hash}.png`;
   const image=await renderPaymentEmail(mail.from,mail.subject,receivedAt,mail.body,true);await uploadPaymentEvidence(evidenceKey,image);
   await mailBackend({kind:'payment_test_received',runId:run.id,reference:run.reference,amount:run.amount,receivedAt,hash,evidenceKey});imported++;break;
  }
 }
 return imported;
}
