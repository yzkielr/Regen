import { timingSafeEqual } from 'node:crypto';
import { ensureMailSchedule } from '@/lib/regen-mail-schedule';
import { collectPaperMail, mailBackend, renderPaymentEmail } from '@/lib/paper-mail-worker';
export const runtime='nodejs';export const dynamic='force-dynamic';export const maxDuration=300;
export async function GET(request:Request){
 const secret=process.env.CRON_SECRET,auth=request.headers.get('authorization')||'',expected=`Bearer ${secret}`;
 if(!secret||auth.length!==expected.length||!timingSafeEqual(Buffer.from(auth),Buffer.from(expected)))return Response.json({error:'Unauthorized'},{status:401});
 try{
  const mode=new URL(request.url).searchParams.get('mode');
  if(mode==='render-check'){const bytes=await renderPaymentEmail('invoicer@paper.id','Uji renderer — bukan bukti pembayaran',Date.now(),'Pemeriksaan internal. Tidak dikirim atau disimpan sebagai transaksi.');const {default:sharp}=await import('sharp');const stats=await sharp(bytes).extract({left:84,top:76,width:400,height:64}).stats();const metadata=await sharp(bytes).metadata();return Response.json({width:metadata.width,height:metadata.height,square:metadata.width===1200&&metadata.height===1200,renderer:bytes.length>8&&bytes[0]===137,bytes:bytes.length,hasText:stats.channels[0].stdev>5});}
  if(mode==='status'){const {sync,setupComplete,tests,testJobs}=await mailBackend({kind:'status'});return Response.json({setupComplete,webhookConfigured:!!process.env.REGEN_HOSTINGER_WEBHOOK_SECRET,webhookLastAt:sync?.webhookLastAt,webhookProcessedAt:sync?.webhookProcessedAt,webhookProcessedEventAt:sync?.webhookProcessedEventAt,lastAt:sync?.lastAt,until:sync?.until,scheduleUntil:sync?.scheduleUntil,intervalSeconds:sync?.intervalSeconds,error:sync?.error,tests:tests?.slice(0,3).map(r=>({id:r.id,emailStatus:r.emailStatus,emailReason:r.emailReason,receivedAt:r.receivedAt,hasEvidence:!!r.evidenceKey,jobId:r.jobId})),testJobs:testJobs?.slice(0,3).map(j=>({id:j.id,status:j.status,reason:j.reason,warehouse:j.warehouse}))},{headers:{'Cache-Control':'no-store'}});}
  if(mode==='receipt'){const reference=new URL(request.url).searchParams.get('reference');if(!reference||!/^RGN-[A-Z0-9-]{1,100}$/.test(reference))return Response.json({error:'Invalid reference'},{status:400});return Response.json(await mailBackend({kind:'payment_status',reference}),{headers:{'Cache-Control':'no-store'}});}
  if(mode==='scan'){const result=await collectPaperMail();await ensureMailSchedule();return Response.json(result);}
  return Response.json({scheduled:await ensureMailSchedule(true)});
 }catch{return Response.json({error:'Scheduler unavailable'},{status:503});}
}
export async function POST(request:Request){
 const secret=process.env.CRON_SECRET,auth=request.headers.get('authorization')||'',expected=`Bearer ${secret}`;
 if(!secret||auth.length!==expected.length||!timingSafeEqual(Buffer.from(auth),Buffer.from(expected)))return Response.json({error:'Unauthorized'},{status:401});
 try{const raw=await request.text();if(raw.length>1000)throw Error();const {runId}=JSON.parse(raw);if(!/^[a-f0-9-]{36}$/.test(runId))throw Error();
  await mailBackend({kind:'payment_test_start',runId});const {sendPaymentTestEmail}=await import('@/lib/payment-test-mail');const result=await sendPaymentTestEmail(runId);await collectPaperMail();await ensureMailSchedule();return Response.json(result,{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Pengujian tidak dapat diproses. Periksa status sebelum mencoba kembali.'},{status:409});}
}
