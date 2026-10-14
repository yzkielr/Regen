import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const source=fs.readFileSync(new URL('../sites/regen-inbox/app/api/service/direct-process/route.ts',import.meta.url),'utf8');
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
let authorized=false,reads=0;
const state={settings:{botEnabled:true},service:{csSync:{cursor:33,lastAt:123,until:0,error:'',lease:'PRIVATE-LEASE'},conversations:[{id:'chat',transport:'meta-cs',mode:'bot',messages:[{id:'in',role:'customer',text:'PRIVATE-CUSTOMER-MESSAGE',status:'received',at:1},{id:'out',role:'bot',text:'PRIVATE-ANSWER',status:'delivered',providerId:'wamid.1',at:2}]}],jobs:[{id:'job',transport:'meta-cs',text:'PRIVATE-ANSWER',destination:'+628000000000',status:'sent',providerId:'wamid.1',updatedAt:2,reason:'Sent'}]}};
const dependencies={
 '../../../../lib/direct-config':{directAuthorized:async()=>authorized,directConfig:()=>({REGEN_SERVICE_USER_ID:'test',OPENAI_API_KEY:'PRIVATE-KEY'}),directReady:()=>true},
 '../../../../lib/direct-inbox':{inboxPending:async()=>false},
 '../../../../lib/operations-store':{readOperations:async()=>{reads++;return {state,version:8};}},
 '../../../../lib/whatsapp-cs-server':{},'../../../../lib/whatsapp-test-server':{},
 '../../../../lib/direct-pending':{directPending:()=>false}
};
const module={exports:{}};new Function('require','module','exports',code)(name=>dependencies[name],module,module.exports);
test('direct status rejects unauthenticated requests before reading state',async()=>{authorized=false;reads=0;const result=await module.exports.GET(new Request('https://example.com'));assert.equal(result.status,401);assert.equal(reads,0);});
test('direct status reports delivery metadata without message bodies or secrets',async()=>{authorized=true;const result=await module.exports.GET(new Request('https://example.com'));assert.equal(result.status,200);const text=await result.text();assert.equal(text.includes('PRIVATE'),false);assert.equal(text.includes('+628000000000'),false);const data=JSON.parse(text);assert.equal(data.csSync.cursor,33);assert.equal(data.conversations[0].latest[1].status,'delivered');assert.equal(data.jobs[0].providerId,'wamid.1');});
