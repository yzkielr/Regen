import {sleep,RetryableError} from 'workflow';
export async function monitorRegenKnowledge(generation:string){
 'use workflow';
 // Bounded history. The daily watchdog replaces the generation; the old run
 // then exits without modifying a file. Only status is retained in history.
 for(let pass=0;pass<2200;pass++){
  const result=await syncKnowledgeStep(generation);if(result.stop)return;
  await sleep(result.pending?'2s':'5m');
 }
 await renewKnowledgeStep();
}
async function syncKnowledgeStep(generation:string):Promise<{stop:boolean;pending:boolean}>{
 'use step';
 const {knowledgeBackend}=await import('../lib/regen-knowledge-schedule');
 try{return await knowledgeBackend({kind:'poll',generation});}
 catch{throw new RetryableError('Knowledge sync temporarily unavailable',{retryAfter:'1m'});}
}
syncKnowledgeStep.maxRetries=5;
async function renewKnowledgeStep(){
 'use step';
 const {ensureKnowledgeSchedule}=await import('../lib/regen-knowledge-schedule');await ensureKnowledgeSchedule(true);
}
