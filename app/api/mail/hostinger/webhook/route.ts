import { timingSafeEqual } from 'node:crypto';
import { start } from 'workflow/api';
import { processRegenMailNotification } from '@/workflows/regen-mail-notification';
import { boundedAdminBody } from '@/lib/admin-gateway-policy';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=30;
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function POST(request:Request){
 const secret=process.env.REGEN_HOSTINGER_WEBHOOK_SECRET;
 if(!secret)return json({error:'Not configured'},503);
 const actual=Buffer.from(request.headers.get('authorization')||''),expected=Buffer.from(`Bearer ${secret}`);
 if(actual.length!==expected.length||!timingSafeEqual(actual,expected))return json({error:'Unauthorized'},401);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'JSON required'},415);
 try{
  const bytes=await boundedAdminBody(request,262144);
  let body;try{body=JSON.parse(new TextDecoder().decode(bytes));}catch{return json({error:'Invalid JSON'},400);}
  if(!body||typeof body!=='object'||Array.isArray(body))return json({error:'Invalid event'},400);
  // A notification only wakes the collector. Never trust the webhook's sender,
  // amount, or body to mark an invoice paid; verify original mail over IMAP/DKIM.
  // Keep message contents and the bearer token out of workflow history.
  await start(processRegenMailNotification,[Date.now()],{experimental_retention:0});
  return json({ok:true});
 }catch(e){return json({error:'Event not acknowledged'},e instanceof Error&&e.message==='too_large'?413:503);}
}
