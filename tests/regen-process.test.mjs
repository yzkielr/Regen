import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const source=fs.readFileSync(new URL('../sites/regen-inbox/app/api/service/direct-process/route.ts',import.meta.url),'utf8');
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
let authorized=true,ingested=false;
const dependencies={
 '../../../../lib/direct-config':{directAuthorized:async()=>authorized,directConfig:()=>({REGEN_SERVICE_USER_ID:'test'}),directReady:()=>true},
 '../../../../lib/direct-inbox':{drainMetaInbox:async()=>{ingested=true;},inboxPending:async()=>false},
 '../../../../lib/operations-store':{readOperations:async()=>{assert.equal(ingested,true,'incoming events must invalidate old AI before testing lease');return {state:{service:{csSync:{until:Date.now()+60000}}}};}},
 '../../../../lib/whatsapp-cs-server':{syncWhatsAppCs:async()=>{throw Error('must not acquire busy worker');}},
 '../../../../lib/whatsapp-test-server':{syncWhatsAppTest:async()=>{throw Error('must not acquire busy worker');}},
 '../../../../lib/warehouse-server':{syncWarehouse:async()=>{}},
 '../../../../lib/service-flip':{syncFlipInvoices:async()=>{},flipPending:()=>false},
 '../../../../lib/payment-automation':{warehousePending:()=>false},
 '../../../../lib/direct-pending':{directPending:()=>false}
};
const module={exports:{}};new Function('require','module','exports',code)(name=>dependencies[name],module,module.exports);
test('busy worker still ingests new customer messages so stale AI can be cancelled',async()=>{ingested=false;authorized=true;const response=await module.exports.POST(new Request('https://example.com',{method:'POST'}));assert.equal(response.status,200);assert.deepEqual(await response.json(),{pending:true,busy:true});assert.equal(ingested,true);});
test('unauthorized requests cannot start processing or access chat state',async()=>{ingested=false;authorized=false;const response=await module.exports.POST(new Request('https://example.com',{method:'POST'}));assert.equal(response.status,401);assert.equal(ingested,false);authorized=true;});
