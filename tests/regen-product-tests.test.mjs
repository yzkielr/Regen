import test from 'node:test';
import assert from 'node:assert/strict';
import {COA_REPORTS} from '../lib/coa-reports.ts';
import {coaProducts,productTestReply} from '../sites/regen-inbox/lib/product-tests.ts';
test('every bot result links to a registered product with existing report documents',()=>{
 assert.equal(coaProducts.length,COA_REPORTS.length);
 for(const [name,slug] of coaProducts){const report=COA_REPORTS.find(r=>r.slug===slug);assert.ok(report?.documents.length,name);assert.ok(productTestReply([{role:'customer',text:'minta hasil tes '+name,status:'received'}]).answer.includes('/coa/'+slug));}
});
