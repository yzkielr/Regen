import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import {timingSafeEqual} from 'node:crypto';
const compile=path=>ts.transpileModule(fs.readFileSync(new URL(path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
let starts=[],enqueueFails=false;
const fakeWorkflow=()=>{};
const deps={
 'node:crypto':{timingSafeEqual},
 'workflow/api':{start:async(fn,args,options)=>{starts.push({fn,args,options});if(enqueueFails)throw Error('unavailable');}},
 '@/workflows/regen-mail-notification':{processRegenMailNotification:fakeWorkflow},
 '@/lib/admin-gateway-policy':{boundedAdminBody:async(request,limit)=>{const bytes=new Uint8Array(await request.arrayBuffer());if(bytes.length>limit)throw Error('too_large');return bytes;}}
};
const module={exports:{}};new Function('require','module','exports',compile('../app/api/mail/hostinger/webhook/route.ts'))(n=>deps[n],module,module.exports);
const secret='test-webhook-secret-never-a-real-key',prior=process.env.REGEN_HOSTINGER_WEBHOOK_SECRET;
test.after(()=>{if(prior===undefined)delete process.env.REGEN_HOSTINGER_WEBHOOK_SECRET;else process.env.REGEN_HOSTINGER_WEBHOOK_SECRET=prior;});
const req=(body='{}',token=secret,type='application/json')=>new Request('https://example.test/api/mail/hostinger/webhook',{method:'POST',headers:{authorization:'Bearer '+token,'content-type':type},body});
test('authenticated notification enqueues only server timestamp, never body or payment values',async()=>{
 process.env.REGEN_HOSTINGER_WEBHOOK_SECRET=secret;starts=[];
 const before=Date.now();assert.equal((await module.exports.POST(req(JSON.stringify({event:'message.received',amount:20000,paid:true,body:'private buyer data'})))).status,200);
 assert.equal(starts.length,1);assert.equal(starts[0].fn,fakeWorkflow);assert.equal(starts[0].args.length,1);assert.ok(starts[0].args[0]>=before);assert.deepEqual(starts[0].options,{experimental_retention:0});
});
test('incorrect bearer, malformed JSON and oversized events never start work',async()=>{
 starts=[];process.env.REGEN_HOSTINGER_WEBHOOK_SECRET=secret;
 assert.equal((await module.exports.POST(req('{}','bad'))).status,401);
 assert.equal((await module.exports.POST(req('{}','é'.repeat(secret.length)))).status,401);
 assert.equal((await module.exports.POST(req('{'))).status,400);
 assert.equal((await module.exports.POST(req('[]'))).status,400);
 assert.equal((await module.exports.POST(req('{}',secret,'text/plain'))).status,415);
 assert.equal((await module.exports.POST(req(JSON.stringify({body:'x'.repeat(262144)})))).status,413);
 assert.equal(starts.length,0);delete process.env.REGEN_HOSTINGER_WEBHOOK_SECRET;
 assert.equal((await module.exports.POST(req())).status,503);
});
test('failed durable enqueue is not acknowledged so the provider can retry',async()=>{
 process.env.REGEN_HOSTINGER_WEBHOOK_SECRET=secret;enqueueFails=true;
 try{assert.equal((await module.exports.POST(req())).status,503);}finally{enqueueFails=false;}
});
test('notification workflow waits for busy collector and retries scan failures without false success',async()=>{
 let notes=[],collections=[],sleeps=[],results=[{configured:true,busy:true},{configured:true,error:false}],fails=false;
 class RetryableError extends Error{}
 const dependencies={'workflow':{sleep:async duration=>sleeps.push(duration),RetryableError},'../lib/paper-mail-worker':{mailBackend:async action=>notes.push(action),collectPaperMail:async(...args)=>{collections.push(args);if(fails)return {configured:true,error:true};return results.shift();}}};
 const m={exports:{}};new Function('require','module','exports',compile('../workflows/regen-mail-notification.ts'))(n=>dependencies[n],m,m.exports);
 assert.deepEqual(await m.exports.processRegenMailNotification(123),{processed:true});assert.deepEqual(notes,[{kind:'mail_webhook',receivedAt:123}]);assert.deepEqual(collections,[[undefined,123],[undefined,123]]);assert.deepEqual(sleeps,['15s']);
 fails=true;await assert.rejects(()=>m.exports.processRegenMailNotification(456),RetryableError);
});
