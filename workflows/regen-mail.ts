import { sleep } from 'workflow';
export async function monitorRegenMail(generation:string){
 'use workflow';
 // Daily replacement bounds each run; an old generation stops without polling.
 for(let pass=0;pass<520;pass++){
  const result=await pollMailStep(generation);if(result.stop)return;
  if(!result.fast)await sleep('10m');
 }
}
async function pollMailStep(generation:string):Promise<{stop:boolean;fast:boolean}>{
 'use step';
 const {collectPaperMail}=await import('../lib/paper-mail-worker');
 // Bundle up to four one-minute checks per step, limiting workflow events and
 // replay history. Stay below the hosting function's five-minute ceiling.
 const deadline=Date.now()+240000;
 for(let pass=0;pass<4;pass++){
  const result=await collectPaperMail(generation);
  if(result.stop)return {stop:true,fast:false};
  if(result.fast===false)return {stop:false,fast:false};
  if(pass===3||Date.now()+90000>deadline)break;
  await new Promise(resolve=>setTimeout(resolve,60000));
 }
 return {stop:false,fast:true};
}
pollMailStep.maxRetries=2;
