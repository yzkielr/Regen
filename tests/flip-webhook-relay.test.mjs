import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import {boundedAdminBody} from '../lib/admin-gateway-policy.ts';
let wakes=0,failWake=false,enabled=true;
globalThis.__flipRelay={boundedAdminBody,adminBackendOrigin:()=> 'https://private.example',adminBackendHeaders:(_s,type)=>new Headers({'content-type':type,'OAI-Sites-Authorization':'Bearer test-only'}),regenDirectEnabled:()=>enabled,wakeRegenQueue:async()=>{wakes++;if(failWake)throw Error('queue unavailable');}};
let source=ts.transpileModule(fs.readFileSync(new URL('../app/api/flip/webhook/route.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
source=source.replace(/^import .*;\r?\n/gm,'');
source='const {boundedAdminBody,adminBackendOrigin,adminBackendHeaders,regenDirectEnabled,wakeRegenQueue}=globalThis.__flipRelay;\n'+source;
const {POST}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const body='token=test-only&data=%7B%22bill_link_id%22%3A2502091430251230005%7D';
const request=()=>new Request('https://www.regenlongevitylab.com/api/flip/webhook',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body});
test('relay preserves original body, fixed destination, and queues durably before acknowledgement',async()=>{
 const original=globalThis.fetch;wakes=0;
 globalThis.fetch=async(url,init)=>{assert.equal(url,'https://private.example/api/flip/webhook');assert.equal(new TextDecoder().decode(init.body),body);assert.equal(init.redirect,'error');return Response.json({ok:true,needsRun:true});};
 try{assert.equal((await POST(request())).status,200);assert.equal(wakes,1);failWake=true;assert.equal((await POST(request())).status,503);}finally{globalThis.fetch=original;failWake=false;}
});
test('unauthenticated or unconfigured events never wake worker; payload is bounded',async()=>{
 const original=globalThis.fetch;wakes=0;globalThis.fetch=async()=>Response.json({error:'bad token'},{status:401});
 try{assert.equal((await POST(request())).status,401);assert.equal(wakes,0);enabled=false;assert.equal((await POST(request())).status,503);enabled=true;const tooLarge=new Request('https://www.regenlongevitylab.com/api/flip/webhook',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:'x'.repeat(40001)});assert.equal((await POST(tooLarge)).status,413);}finally{globalThis.fetch=original;enabled=true;}
});
