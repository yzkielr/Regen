import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const source=fs.readFileSync(new URL('../app/api/whatsapp/webhook/route.ts',import.meta.url),'utf8');
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
let enabled=true,wakes=0,wakeError=false;
const dependencies={
 '@/lib/admin-gateway':{adminBackendOrigin:()=> 'https://regen-inbox.hello-wearology.chatgpt.site',adminBackendHeaders:()=>new Headers({'OAI-Sites-Authorization':'Bearer test-only'})},
 '@/lib/admin-gateway-policy':{boundedAdminBody:async(r,limit)=>{const body=new Uint8Array(await r.arrayBuffer());if(body.length>limit)throw Error('too_large');return body;}},
 '@/lib/regen-queue':{regenDirectEnabled:()=>enabled,wakeRegenQueue:async()=>{wakes++;if(wakeError)throw Error('queue down');}}
};
const module={exports:{}};new Function('require','module','exports',code)(name=>dependencies[name],module,module.exports);const route=module.exports;
const request=()=>new Request('https://www.regenlongevitylab.com/api/whatsapp/webhook',{method:'POST',headers:{'x-hub-signature-256':'sha256='+'a'.repeat(64)},body:'{"test":1}'});
test('gateway ACK follows persistence and durable enqueue; enqueue failure causes Meta retry',async()=>{const old=globalThis.fetch;let forwards=0;globalThis.fetch=async(url,init)=>{forwards++;assert.equal(url,'https://regen-inbox.hello-wearology.chatgpt.site/api/whatsapp/webhook');assert.equal(init.headers.get('x-hub-signature-256'),'sha256='+'a'.repeat(64));assert.equal(new TextDecoder().decode(init.body),'{"test":1}');return Response.json({ok:true,needsRun:true});};try{wakes=0;wakeError=false;assert.equal((await route.POST(request())).status,200);assert.equal(wakes,1);wakeError=true;assert.equal((await route.POST(request())).status,503);assert.equal(wakes,2);assert.equal(forwards,2);}finally{globalThis.fetch=old;wakeError=false;}});
test('bad signatures and disabled transport never contact backend or start work',async()=>{const old=globalThis.fetch;globalThis.fetch=async()=>{throw Error('must not fetch')};try{enabled=false;assert.equal((await route.POST(request())).status,503);enabled=true;assert.equal((await route.POST(new Request('https://example.com',{method:'POST',body:'{}'}))).status,401);}finally{globalThis.fetch=old;enabled=true;}});
