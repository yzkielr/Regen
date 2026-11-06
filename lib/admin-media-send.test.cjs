const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
const root=path.resolve(__dirname,'..');
function load(file,mocks={}){const code=ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;const m={exports:{}};new Function('require','module','exports',code)(name=>Object.hasOwn(mocks,name)?mocks[name]:require(name),m,m.exports);return m.exports;}
const docs=load('app/admin/lib/chat-documents.ts'),videos=load('app/admin/lib/chat-videos.ts',{'./chat-documents':docs});
const base={'./admin-client':{adminFetch:()=>{throw Error('Unexpected upload');}},'./resizable-textarea':{ResizableTextarea:p=>React.createElement('textarea',p)},'../lib/chat-media':{CHAT_PHOTO_LIMIT:3800000},'../lib/chat-documents':docs,'../lib/chat-videos':videos};
const props={chat:{id:'c1',transport:'waha',test:false},text:'',setText:()=>{},corrects:'',setCorrects:()=>{},busy:false,ready:true,run:async()=>true};
test('live WhatsApp composer restores all three attachment controls, while test chats remain text-only',()=>{
 const {ChatComposer}=load('app/admin/ui/chat-composer.tsx',base);
 const render=p=>renderToStaticMarkup(React.createElement(ChatComposer,{...props,...p}));
 const html=render({});for(const label of ['Tambah foto','Tambah file','Tambah video'])assert.ok(html.includes(label));assert.match(html,/accept="video\/mp4,.mp4"/);assert.match(html,/\.pdf,.doc,.docx,.xls,.xlsx/);
 assert.doesNotMatch(render({chat:{...props.chat,test:true}}),/Tambah foto|Tambah file|Tambah video/);
 const source=fs.readFileSync(path.join(root,'app/admin/ui/service-console.tsx'),'utf8');assert.match(source,/<ChatComposer key=\{chat.id\}/);
});
function nodes(el){if(!el||typeof el!=='object')return[];return[el,...React.Children.toArray(el.props?.children).flatMap(nodes)];}
test('attachment survives a failed send, reuse avoids reupload, and duplicate clicks cannot enqueue twice',async()=>{
 let slots=[],cursor=0,uploads=0,runs=0,actions=[];
 const hooks={...React,useEffect:()=>{},useState:initial=>{const i=cursor++;if(!(i in slots))slots[i]=initial;return[slots[i],v=>{slots[i]=v}];},useRef:initial=>{const i=cursor++;return slots[i]??(slots[i]={current:initial});}};
 const {ChatComposer}=load('app/admin/ui/chat-composer.tsx',{...base,react:hooks,'./admin-client':{adminFetch:async(url,options)=>{uploads++;assert.equal(url,'/admin/api/files');assert.equal(options.body.get('purpose'),'chat-video');return Response.json({id:'private-video'});}}});
 const run=async a=>{actions.push(a);runs++;return runs>1;};const render=()=>{cursor=0;return ChatComposer({...props,run});};
 let tree=render(),input=nodes(tree).find(e=>e.type==='input'&&e.props.accept==='video/mp4,.mp4');
 input.props.onChange({target:{files:[new File([new Uint8Array(24)],'demo.mp4',{type:'video/mp4'})],value:'selected'}});
 tree=render();tree.props.onSubmit({preventDefault(){}});tree.props.onSubmit({preventDefault(){}});await new Promise(setImmediate);
 assert.equal(uploads,1);assert.equal(runs,1);assert.equal(actions[0].attachment.kind,'video');assert.equal(actions[0].conversationId,'c1');
 tree=render();assert.ok(nodes(tree).some(e=>React.Children.toArray(e.props?.children).includes('demo.mp4')));tree.props.onSubmit({preventDefault(){}});await new Promise(setImmediate);
 assert.equal(uploads,1);assert.equal(runs,2);tree=render();assert.equal(nodes(tree).some(e=>React.Children.toArray(e.props?.children).includes('demo.mp4')),false);
});
const policy=load('lib/admin-gateway-policy.ts');
const relay=load('app/admin/api/[...path]/route.ts',{'next/server':{after:()=>{}},'@/lib/admin-gateway':{adminBackendHeaders:()=>new Headers(),adminBackendOrigin:()=> 'https://backend.test'},'@/lib/regen-queue':{regenDirectEnabled:()=>false},'@/lib/admin-gateway-policy':policy});
function request(size,route='files',token='a'.repeat(64)){const r=new Request('https://admin.test/admin/api/'+route,{method:'POST',headers:{origin:'https://admin.test'},body:new Uint8Array(size)});r.nextUrl=new URL(r.url);r.cookies={get:()=>token?{value:token}:undefined};return r;}
test('file relay permits a 10 MB video plus multipart overhead but retains other limits and authentication',async()=>{
 const original=global.fetch;let calls=0;global.fetch=async(_url,options)=>{calls++;assert.equal(options.body.length,10_001_000);return Response.json({id:'file-id'},{status:201});};
 try{const context=route=>({params:Promise.resolve({path:[route]})});assert.equal((await relay.POST(request(10_001_000),context('files'))).status,201);assert.equal(calls,1);
 assert.equal((await relay.POST(request(11_000_001),context('files'))).status,413);assert.equal((await relay.POST(request(4_000_001,'operations'),context('operations'))).status,413);assert.equal((await relay.POST(request(24,'files',null),context('files'))).status,401);assert.equal(calls,1);
 }finally{global.fetch=original;}
});
