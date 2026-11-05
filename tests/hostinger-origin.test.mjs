import test from 'node:test';
import assert from 'node:assert/strict';
import {sameOrigin} from '../lib/admin-gateway-policy.ts';
const prior=process.env.REGEN_HOSTED_ORIGIN;
test.after(()=>{if(prior===undefined)delete process.env.REGEN_HOSTED_ORIGIN;else process.env.REGEN_HOSTED_ORIGIN=prior;});
test('trusted HTTPS origin behind private HTTP proxy still rejects foreign origins and hosts',()=>{
 process.env.REGEN_HOSTED_ORIGIN='https://www.regenlongevitylab.com';
 const request=(origin,host='www.regenlongevitylab.com',site='same-origin')=>new Request('http://localhost:3000/admin/api/operations',{method:'POST',headers:{origin,host,'sec-fetch-site':site}});
 assert.equal(sameOrigin(request('https://www.regenlongevitylab.com')),true);
 assert.equal(sameOrigin(request('https://evil.example')),false);
 assert.equal(sameOrigin(request('https://www.regenlongevitylab.com','evil.example')),false);
 assert.equal(sameOrigin(request('https://www.regenlongevitylab.com','www.regenlongevitylab.com','cross-site')),false);
 assert.equal(sameOrigin(request('http://www.regenlongevitylab.com')),false);
});
