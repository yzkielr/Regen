import { adminBackendHeaders, adminBackendOrigin } from '@/lib/admin-gateway';
import { boundedAdminBody } from '@/lib/admin-gateway-policy';
import { regenDirectEnabled, wakeRegenQueue } from '@/lib/regen-queue';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});

export async function POST(request:Request) {
 if(!regenDirectEnabled())return json({error:'Not configured'},503);
 const contentType=request.headers.get('content-type')||'';
 if(!contentType.toLowerCase().startsWith('application/x-www-form-urlencoded'))return json({error:'Invalid content type'},415);
 try {
  const raw=await boundedAdminBody(request,40000);
  const response=await fetch(`${adminBackendOrigin()}/api/flip/webhook`,{
   method:'POST',headers:adminBackendHeaders(undefined,'application/x-www-form-urlencoded'),
   body:raw as BodyInit,redirect:'error',cache:'no-store',signal:AbortSignal.timeout(15000),
  });
  if(!response.ok)return json({error:'Flip callback not accepted'},response.status);
  const result=await response.json();if(result.ok!==true)throw new Error('invalid_response');
  // Enqueue durably before acknowledging. A retry only wakes the same idempotent jobs.
  if(result.needsRun===true)await wakeRegenQueue();
  return json({ok:true});
 }catch(error){return json({error:'Flip callback not acknowledged'},error instanceof Error&&error.message==='too_large'?413:503);}
}
