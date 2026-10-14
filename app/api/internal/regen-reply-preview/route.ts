import { timingSafeEqual } from 'node:crypto';
import { ADMIN_BACKEND } from '@/lib/admin-gateway-policy';
export const runtime='nodejs';
export const dynamic='force-dynamic';
// Maintenance preview using the existing operator secret. No AI calls or
// WhatsApp sends; service credentials remain on the server.
export async function GET(request:Request){
 const secret=process.env.CRON_SECRET,auth=Buffer.from(request.headers.get('authorization')||''),expected=Buffer.from(`Bearer ${secret}`);
 if(!secret||auth.length!==expected.length||!timingSafeEqual(auth,expected))return Response.json({error:'Unauthorized'},{status:401});
 const question=new URL(request.url).searchParams.get('question');
 if(!question?.trim()||question.length>500)return Response.json({error:'Invalid question'},{status:400});
 const access=process.env.REGEN_ADMIN_BACKEND_ACCESS,key=process.env.REGEN_DIRECT_SERVICE_KEY;
 if(!access||!key)return Response.json({error:'Not configured'},{status:503});
 try{
  const response=await fetch(`${ADMIN_BACKEND}/api/service/direct-process?preview=${encodeURIComponent(question)}`,{headers:{'OAI-Sites-Authorization':`Bearer ${access}`,'x-regen-direct-key':key},redirect:'error',signal:AbortSignal.timeout(20000),cache:'no-store'});
  return Response.json(await response.json(),{status:response.status,headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Preview unavailable'},{status:503});}
}
