import { sleep, RetryableError } from 'workflow';

// Workflow history contains only queue status, never customer messages or tokens.
export async function processRegenQueue() {
 'use workflow';
 for(let pass=0;pass<120;pass++) {
  const result=await processQueueStep();
  if(!result.pending)return {drained:true};
  await sleep(result.busy?'15s':'5s');
 }
 throw new Error('Regen queue is still pending; inspect processing status.');
}
async function processQueueStep():Promise<{pending:boolean;busy:boolean}> {
 'use step';
 const access=process.env.REGEN_ADMIN_BACKEND_ACCESS,key=process.env.REGEN_DIRECT_SERVICE_KEY;
 if(process.env.REGEN_DIRECT_ENABLED!=='true'||!access||!key)throw new RetryableError('Regen direct service is not configured',{retryAfter:'1m'});
 try {
  const response=await fetch('https://regen-inbox.hello-wearology.chatgpt.site/api/service/direct-process',{method:'POST',redirect:'error',signal:AbortSignal.timeout(245000),headers:{'OAI-Sites-Authorization':`Bearer ${access}`,'x-regen-direct-key':key}});
  if(!response.ok)throw new Error('backend_unavailable');
  const result=await response.json();if(typeof result.pending!=='boolean')throw new Error('invalid_response');
  return {pending:result.pending,busy:result.busy===true};
 }catch {throw new RetryableError('Regen processing temporarily unavailable',{retryAfter:'30s'});}
}
processQueueStep.maxRetries=10;
