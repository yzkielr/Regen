import 'server-only';
import {randomUUID} from 'node:crypto';
import {start} from 'workflow/api';
import {monitorRegenKnowledge} from '../workflows/regen-knowledge';
import type {KnowledgeSync} from '../app/admin/lib/knowledge-sync';
export async function knowledgeBackend(action:Record<string,unknown>){
 const access=process.env.REGEN_ADMIN_BACKEND_ACCESS,key=process.env.REGEN_DIRECT_SERVICE_KEY;
 if(!access||!key)throw Error('Penjadwal knowledge belum terhubung.');
 const response=await fetch('https://regen-inbox.hello-wearology.chatgpt.site/api/service/knowledge-sync',{method:'POST',redirect:'error',signal:AbortSignal.timeout(210000),headers:{'Content-Type':'application/json','OAI-Sites-Authorization':`Bearer ${access}`,'x-regen-direct-key':key},body:JSON.stringify(action)});
 if(!response.ok)throw Error(`Sinkronisasi knowledge belum tersedia (${response.status}).`);return response.json();
}
export async function ensureKnowledgeSchedule(replace=false){
 const state=await knowledgeBackend({kind:'status'}) as KnowledgeSync;
 if(!state.folders.some(f=>f.enabled))return false;
 if(!replace&&state.generation&&(state.scheduleUntil||0)>Date.now()&&(state.lastRunAt||0)>Date.now()-15*60000)return true;
 const generation=randomUUID(),claimed=await knowledgeBackend({kind:'schedule',generation,previous:state.generation||''});
 if(!claimed.accepted)return true;
 try{await start(monitorRegenKnowledge,[generation],{experimental_retention:0});return true;}
 catch(e){await knowledgeBackend({kind:'schedule_failed',generation});throw e;}
}
