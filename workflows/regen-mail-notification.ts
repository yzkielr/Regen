import { sleep, RetryableError } from 'workflow';
export async function processRegenMailNotification(receivedAt:number){
 'use workflow';
 await noteMailNotification(receivedAt);
 // Another scan may hold the four-minute lease. Retry after it releases; the
 // existing message/transaction IDs prevent duplicate payment and warehouse jobs.
 for(let pass=0;pass<21;pass++){
  if(await collectNotifiedMail(receivedAt))return {processed:true};
  await sleep('15s');
 }
 throw new Error('Mailbox remained busy; scheduled collection is still enabled.');
}
async function noteMailNotification(receivedAt:number){
 'use step';
 const {mailBackend}=await import('../lib/paper-mail-worker');
 try{await mailBackend({kind:'mail_webhook',receivedAt});}
 catch{throw new RetryableError('Mailbox notification could not be recorded',{retryAfter:'15s'});}
}
async function collectNotifiedMail(receivedAt:number):Promise<boolean>{
 'use step';
 const {collectPaperMail}=await import('../lib/paper-mail-worker');
 try{
  const result=await collectPaperMail(undefined,receivedAt);
  if(!result.configured||result.error)throw new Error('Collection unavailable');
  return !result.busy;
 }catch{throw new RetryableError('Mailbox collection needs retry',{retryAfter:'15s'});}
}
noteMailNotification.maxRetries=8;
collectNotifiedMail.maxRetries=8;
