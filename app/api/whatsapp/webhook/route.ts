import { adminBackendHeaders, adminBackendOrigin } from '@/lib/admin-gateway';
import { boundedAdminBody } from '@/lib/admin-gateway-policy';
import { regenDirectEnabled, wakeRegenQueue } from '@/lib/regen-queue';
export const runtime='nodejs';export const dynamic='force-dynamic';export const maxDuration=300;
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(request:Request) {
 try {
  const query=new URL(request.url).searchParams;if(query.toString().length>1000)return json({error:'Invalid verification'},400);
  const params=new URLSearchParams();for(const key of ['hub.mode','hub.verify_token','hub.challenge'])params.set(key,query.get(key)||'');
  const response=await fetch(`${adminBackendOrigin()}/api/whatsapp/webhook?${params}`,{headers:adminBackendHeaders(),redirect:'error',cache:'no-store',signal:AbortSignal.timeout(15000)});
  return new Response(await response.text(),{status:response.status,headers:{'content-type':'text/plain','cache-control':'no-store'}});
 }catch{return json({error:'Verification unavailable'},503);}
}
export async function POST(request:Request) {
 if(!regenDirectEnabled())return json({error:'Not ready'},503);
 try {
  const signature=request.headers.get('x-hub-signature-256');if(!signature||!/^sha256=[a-f0-9]{64}$/.test(signature))return json({error:'Invalid signature'},401);
  const raw=await boundedAdminBody(request,1048576),headers=adminBackendHeaders(undefined,'application/json');headers.set('x-hub-signature-256',signature);
  const response=await fetch(`${adminBackendOrigin()}/api/whatsapp/webhook`,{method:'POST',headers,body:raw as BodyInit,redirect:'error',cache:'no-store',signal:AbortSignal.timeout(20000)});
  if(!response.ok)return json({error:'Event not accepted'},response.status);
  const result=await response.json();if(result.ok!==true)throw new Error('invalid_response');
  if(result.needsRun===true)await wakeRegenQueue();
  return json({ok:true});
 }catch(error){return json({error:'Event not acknowledged'},error instanceof Error&&error.message==='too_large'?413:503);}
}
