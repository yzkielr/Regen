const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
const root=path.resolve(__dirname,'..');
function load(file,mocks={}){
 const code=ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 const module={exports:{}};new Function('require','module','exports',code)(name=>Object.hasOwn(mocks,name)?mocks[name]:require(name),module,module.exports);return module.exports;
}
const {ChatMessageMedia}=load('app/admin/ui/chat-message-media.tsx');
const render=message=>renderToStaticMarkup(React.createElement(ChatMessageMedia,{message:{id:'message-1',...message},conversationId:'chat-1'}));
test('received photo renders the authenticated preview and download instead of only the placeholder',()=>{
 const html=render({text:'[Lampiran WhatsApp]',attachment:{kind:'image',status:'ready',fileId:'photo 1',name:'Customer photo.jpg',mime:'image/jpeg',size:1024}});
 assert.match(html,/<img /);assert.match(html,/src="\/admin\/api\/files\?id=photo%201&amp;inline=1"/);assert.match(html,/href="\/admin\/api\/files\?id=photo%201"/);assert.match(html,/Customer photo.jpg/);
 const timeline=fs.readFileSync(path.join(root,'app/admin/ui/service-console.tsx'),'utf8');assert.match(timeline,/<ChatMessageMedia message=\{m\} conversationId=\{chat.id\}/);
});
test('video has inline playback controls without autoplay and audio/documents retain appropriate controls',()=>{
 const base={status:'ready',fileId:'attachment-1',name:'Customer attachment'};
 const video=render({attachment:{...base,kind:'video',mime:'video/mp4'}});
 assert.match(video,/<video /);assert.match(video,/controls=""/);assert.match(video,/playsInline=""/);assert.match(video,/preload="metadata"/);assert.doesNotMatch(video,/autoplay/i);
 assert.match(render({attachment:{...base,kind:'audio',mime:'audio/mpeg'}}),/<audio /);
 const doc=render({attachment:{...base,kind:'document',mime:'application/pdf'}});assert.match(doc,/Unduh Customer attachment/);assert.doesNotMatch(doc,/<(?:img|video|iframe) /);
});
test('pending and unavailable attachments do not load a broken preview or file listing',()=>{
 for(const status of ['pending','unavailable']){const html=render({attachment:{kind:'image',status,name:'Photo',mime:'image/jpeg'}});assert.doesNotMatch(html,/<img |\/api\/files/);assert.match(html,status==='pending'?/sedang diunduh/:/belum tersedia/);}
 const missing=render({attachment:{kind:'video',status:'ready',name:'Video',mime:'video/mp4'}});assert.doesNotMatch(missing,/\/api\/files/);assert.match(missing,/belum tersedia/);
 assert.equal(render({text:'Normal text'}),'');
});
test('legacy images and bot product images remain accessible without exposing external URLs',()=>{
 assert.match(render({image:{mediaId:'legacy-id'}}),/conversation=chat-1&amp;message=message-1/);
 assert.match(render({image:{fileId:'product-photo'}}),/id=product-photo&amp;inline=1/);
});
const policy=load('lib/admin-gateway-policy.ts');
const gateway=load('app/admin/api/[...path]/route.ts',{
 'next/server':{after:()=>{throw Error('No background mutation should run');}},
 '@/lib/admin-gateway':{adminBackendHeaders:()=>new Headers({'x-regen-admin-session':'valid-session'}),adminBackendOrigin:()=> 'https://backend.example'},
 '@/lib/regen-queue':{regenDirectEnabled:()=>false},
 '@/lib/admin-gateway-policy':policy,
});
function request(url,token='a'.repeat(64),headers={}){const r=new Request(url,{headers});r.nextUrl=new URL(url);r.cookies={get:()=>token?{value:token}:undefined};return r;}
test('video byte ranges reach the backend and the exact 206 body and media headers reach the browser',async()=>{
 const original=global.fetch;let seen;
 global.fetch=async(url,options)=>{seen={url,options};return new Response(new Uint8Array([1,2,3,4]),{status:206,headers:{'content-type':'video/mp4','content-range':'bytes 0-3/1000','accept-ranges':'bytes','content-length':'4','content-disposition':'inline','content-security-policy':"sandbox; default-src 'none'"}});};
 try{const result=await gateway.GET(request('https://www.regenlongevitylab.com/admin/api/files?id=video-1&inline=1',undefined,{range:'bytes=0-3'}),{params:Promise.resolve({path:['files']})});
 assert.equal(seen.options.headers.get('range'),'bytes=0-3');assert.equal(seen.options.headers.get('x-regen-admin-session'),'valid-session');assert.equal(result.status,206);for(const [key,value] of Object.entries({'content-range':'bytes 0-3/1000','accept-ranges':'bytes','content-length':'4','content-type':'video/mp4','cache-control':'private, no-store','content-security-policy':"sandbox; default-src 'none'"}))assert.equal(result.headers.get(key),value);assert.deepEqual([...new Uint8Array(await result.arrayBuffer())],[1,2,3,4]);
 }finally{global.fetch=original;}
});
test('missing login stays private; denied file and invalid range responses are preserved',async()=>{
 const original=global.fetch;let calls=0;
 global.fetch=async()=>{calls++;return new Response(null,{status:416,headers:{'content-range':'bytes */1000'}});};
 try{const context={params:Promise.resolve({path:['files']})};assert.equal((await gateway.GET(request('https://admin.example/admin/api/files?id=x',null),context)).status,401);assert.equal(calls,0);
 const result=await gateway.GET(request('https://admin.example/admin/api/files?id=x'),context);assert.equal(result.status,416);assert.equal(result.headers.get('content-range'),'bytes */1000');
 global.fetch=async()=>Response.json({error:'File tidak ditemukan.'},{status:404});assert.equal((await gateway.GET(request('https://admin.example/admin/api/files?id=x'),context)).status,404);
 }finally{global.fetch=original;}
});
