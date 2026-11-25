import {timingSafeEqual} from 'node:crypto';
import {ensureKnowledgeSchedule,knowledgeBackend} from '@/lib/regen-knowledge-schedule';
export const runtime='nodejs';export const dynamic='force-dynamic';export const maxDuration=300;
function authorized(request:Request){const secret=process.env.CRON_SECRET,a=Buffer.from(request.headers.get('authorization')||''),b=Buffer.from(`Bearer ${secret}`);return !!secret&&a.length===b.length&&timingSafeEqual(a,b);}
export async function GET(request:Request){
 if(!authorized(request))return Response.json({error:'Unauthorized'},{status:401});
 try{if(new URL(request.url).searchParams.get('mode')==='status')return Response.json(await knowledgeBackend({kind:'status'}),{headers:{'Cache-Control':'no-store'}});return Response.json({scheduled:await ensureKnowledgeSchedule(true)});}
 catch{return Response.json({error:'Knowledge scheduler unavailable'},{status:503});}
}
export async function POST(request:Request){
 if(!authorized(request))return Response.json({error:'Unauthorized'},{status:401});
 try{const raw=await request.text();if(raw.length>4000)throw Error();const input=JSON.parse(raw);if(input.kind!=='configure')throw Error();await knowledgeBackend({kind:'configure',url:input.url,enabled:input.enabled===true,autoActivate:input.autoActivate!==false});return Response.json({scheduled:await ensureKnowledgeSchedule(),sync:await knowledgeBackend({kind:'status'})},{headers:{'Cache-Control':'no-store'}});}
 catch{return Response.json({error:'Pengaturan sinkronisasi belum dapat diproses.'},{status:409});}
}
