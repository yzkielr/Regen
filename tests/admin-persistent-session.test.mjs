import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { NextResponse, NextRequest } from 'next/server.js';
import * as policy from '../lib/admin-gateway-policy.ts';
import { SESSION_LIFETIME } from '../app/admin/lib/admin-session-policy.ts';

const compile=path=>ts.transpileModule(fs.readFileSync(new URL(path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
function route(path,adminAuth){const module={exports:{}};const deps={'next/server':{NextResponse,NextRequest},'@/lib/admin-gateway':{adminAuth},'@/lib/admin-gateway-policy':policy,'@/app/admin/lib/admin-session-policy':{SESSION_LIFETIME}};new Function('require','module','exports',compile(path))(name=>{if(!(name in deps))throw Error('Unexpected import '+name);return deps[name];},module,module.exports);return module.exports;}
const token='a'.repeat(64);
const request=(path,origin='https://regen.example')=>new NextRequest('https://regen.example/admin/auth/'+path,{method:'POST',headers:{origin,'content-type':'application/json',cookie:`${policy.ADMIN_COOKIE}=${token}`},body:JSON.stringify({username:'test-admin',password:'ExampleOnly1!'})});

test('login sets a persistent HttpOnly cookie bounded by server expiry and keeps token out of JSON',async()=>{
 const prior=process.env.NODE_ENV;process.env.NODE_ENV='production';
 try{
  const expiresAt=Date.now()+SESSION_LIFETIME;
  const api=route('../app/admin/auth/login/route.ts',async()=>Response.json({token,expiresAt}));
  const response=await api.POST(request('login')),cookie=response.cookies.get(policy.ADMIN_COOKIE);
  assert.equal(response.status,200);assert.deepEqual(await response.json(),{ok:true});
  assert.equal(cookie.value,token);assert.equal(cookie.httpOnly,true);assert.equal(cookie.secure,true);assert.equal(cookie.sameSite,'strict');assert.equal(cookie.path,'/admin');
  assert.ok(cookie.maxAge>=30*86400-3&&cookie.maxAge<=30*86400);
  assert.ok(cookie.expires.getTime()<=expiresAt&&cookie.expires.getTime()>Date.now()+29*86400000);
  const short=route('../app/admin/auth/login/route.ts',async()=>Response.json({token,expiresAt:Date.now()+60000}));
  assert.ok((await short.POST(request('login'))).cookies.get(policy.ADMIN_COOKIE).maxAge<=60);
 }finally{if(prior===undefined)delete process.env.NODE_ENV;else process.env.NODE_ENV=prior;}
});

test('invalid backend expiry, bad login and cross-origin requests never create cookies',async()=>{
 for(const expiresAt of [undefined,Date.now()-1,'tomorrow',null]){
  const api=route('../app/admin/auth/login/route.ts',async()=>Response.json({token,expiresAt}));
  const response=await api.POST(request('login'));assert.equal(response.status,503);assert.equal(response.headers.has('set-cookie'),false);
 }
 const api=route('../app/admin/auth/login/route.ts',async()=>Response.json({error:'Invalid'},{status:401}));
 assert.equal((await api.POST(request('login'))).status,401);
 assert.equal((await api.POST(request('login','https://elsewhere.example'))).status,403);
});

test('manual logout still revokes the server session and expires the persistent cookie',async()=>{
 const calls=[];const api=route('../app/admin/auth/logout/route.ts',async(...args)=>{calls.push(args);});
 const response=await api.POST(request('logout'));assert.equal(response.status,200);
 assert.deepEqual(calls,[['logout',token]]);assert.equal(response.cookies.get(policy.ADMIN_COOKIE).maxAge,0);
 assert.equal(response.cookies.get(policy.ADMIN_COOKIE).path,'/admin');
});

test('a quiet browser tab never logs out locally; server expiry and manual logout still work',async()=>{
 let now=100000000,status=200;const listeners={},calls=[],redirects=[];
 class Clock extends Date {static now(){return now;}}
 const module={exports:{}};
 const document={visibilityState:'visible',addEventListener:(type,fn)=>{listeners[type]=fn;}};
 const context={module,exports:module.exports,Date:Clock,Headers,Error,document,window:{addEventListener:(type,fn,options)=>{listeners[type]=fn;assert.equal(options.capture,true);},location:{replace:path=>redirects.push(path)}},fetch:async(input,init)=>{calls.push({input,init});return new Response('{}',{status});}};
 vm.runInNewContext(compile('../app/admin/ui/admin-client.ts'),context);
 now+=2*86400000;
 await module.exports.adminFetch('/admin/api/operations');assert.equal(calls.length,1);assert.equal(calls[0].input,'/admin/api/operations');assert.equal(redirects.length,0);assert.equal(calls[0].init.headers.has('x-regen-user-active'),false);
 listeners.visibilitychange();await module.exports.adminFetch('/admin/api/operations');assert.equal(calls[1].init.headers.get('x-regen-user-active'),'1');
 status=503;await module.exports.adminFetch('/admin/api/operations');assert.equal(redirects.length,0);
 status=401;await module.exports.adminFetch('/admin/api/operations');assert.deepEqual(redirects,['/admin/login']);
 status=200;await module.exports.logoutAdmin();assert.equal(calls.at(-1).input,'/admin/auth/logout');assert.equal(calls.at(-1).init.method,'POST');
});
