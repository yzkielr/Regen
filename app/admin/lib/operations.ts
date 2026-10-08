import { REGEN_CS_PHONE, REGEN_PHONE_REVISION } from './regen-phone';
import { importKnowledge, changeKnowledgeSource } from './knowledge';
import { applyService, createService } from './service';
import type { ServiceState, ServiceContext } from './service-types';
export type Entry = { id: string; createdAt: number; updatedAt: number; [key: string]: string | number | boolean };
export const collections = ['contacts','knowledge','replies','guardrails','automations','agents','owners','campaigns','products','orders','appointments','shipments','rates','calls','channels','adEvents','integrations'] as const;
export type Collection = typeof collections[number];
export type Settings = { businessName: string; phone: string; email: string; address: string; timezone: string; serviceHours: string; botName: string; botPrompt: string; botEnabled: boolean; confidence: number; fallback: string; greeting: string; invoicePrefix: string; taxPercent: number; currency: string };
export type Log = { id: string; at: number; area: string; message: string; level: 'info' | 'warning' | 'error' };
export type Operations = { businessPhoneRevision?: number; records: Record<Collection, Entry[]>; settings: Settings; logs: Log[]; processed: string[]; service?:ServiceState; movements: { id: string; productId: string; quantity: number; reason: string; at: number }[] };
export type OpsEnvelope = { state: Operations; version: number };
export type OpsAction = { type: 'save' | 'delete' | 'settings' | 'stock' | 'order_status' | 'automation' | 'seed' | 'restore' | 'test_event' | 'import_rows' | 'service' | 'knowledge_import' | 'knowledge_source'; requestId: string; collection?: Collection; id?: string; data?: Record<string, unknown>; quantity?: number; reason?: string; status?: string; backup?: unknown; rows?: Record<string,unknown>[] };
const idPattern = /^[a-zA-Z0-9_-]{1,80}$/;
const required: Record<Collection, string[]> = { contacts:['name'], knowledge:['title','content'], replies:['title','content'], guardrails:['name','keywords','response'], automations:['name','trigger','action'], agents:['name','email'], owners:['name','phone'], campaigns:['name','message'], products:['name','sku'], orders:['contactId','items'], appointments:['contactId','agent','start','end'], shipments:['orderId','courier','tracking'], rates:['destination','courier','service'], calls:['contactId','direction','outcome'], channels:['name','provider'], adEvents:['eventId','event','contactId'], integrations:['name','provider'] };
export function createOperations(): Operations {
  return { businessPhoneRevision: REGEN_PHONE_REVISION, records: Object.fromEntries(collections.map(c => [c, []])) as unknown as Operations['records'], processed: [], logs: [], movements: [], service:createService(), settings: {
    businessName:'Regen Longevity Lab', phone:REGEN_CS_PHONE, email:'', address:'', timezone:'Asia/Jakarta', serviceHours:'Senin–Jumat, 09.00–17.00 WIB', botName:'Admin Regen', botPrompt:'Jawab berdasarkan pengetahuan terverifikasi. Jika tidak menemukan informasi, teruskan ke admin. Untuk COA, berikan hanya link produk yang ditanya.', botEnabled:false, confidence:70, fallback:'Saya teruskan ke admin agar informasinya dapat dikonfirmasi.', greeting:'Halo, terima kasih sudah menghubungi Regen. Ada yang bisa dibantu?', invoicePrefix:'RGN', taxPercent:0, currency:'IDR'
  } };
}
export const money = (n: number) => new Intl.NumberFormat('id-ID', { style:'currency', currency:'IDR', maximumFractionDigits:0 }).format(n);
export function numeric(value: unknown, name: string, min = 0, max = 1e12): number { const n = Number(value ?? 0); if (!Number.isFinite(n) || n < min || n > max) throw new Error(`${name} harus antara ${min} dan ${max}.`); return n; }
function text(v: unknown, limit = 4000): string { if (typeof v !== 'string' || v.length > limit) throw new Error(`Teks tidak valid (maksimal ${limit} karakter).`); return v.trim(); }
function rowBy(s: Operations, c: Collection, id: unknown): Entry { const r=s.records[c].find(r=>r.id===id); if(!r) throw new Error(`Data ${c} tidak ditemukan.`); return r; }
export type Line = { productId: string; name: string; quantity: number; price: number };
export function orderLines(row: Entry): Line[] { return JSON.parse(String(row.items || '[]')); }
export function orderTotal(row: Entry): number { const subtotal=orderLines(row).reduce((n,i)=>n+i.price*i.quantity,0); return Math.round((subtotal-Number(row.discount||0))*(1+Number(row.taxPercent||0)/100)+Number(row.shipping||0)); }
export function checkEntry(s: Operations, c: Collection, input: Record<string, unknown>, id: string, now: number): Entry {
  if (!idPattern.test(id)) throw new Error('ID tidak valid.');
  const previous=s.records[c].find(r=>r.id===id);
  const r: Entry={id,createdAt:previous?.createdAt??now,updatedAt:now};
  for(const [k,v] of Object.entries(input)) {
    if(['__proto__','constructor','prototype','id','createdAt','updatedAt'].includes(k)) continue;
    if(!/^[a-zA-Z][a-zA-Z0-9]*$/.test(k) || !['string','boolean','number'].includes(typeof v)) throw new Error('Format kolom tidak valid.');
    if(typeof v==='number' && !Number.isFinite(v)) throw new Error('Angka tidak valid.');
    if(typeof v==='string' && v.length>16000) throw new Error('Isi terlalu panjang.');
    r[k]=typeof v==='string'?v.trim():v as number|boolean;
  }
  if(previous?.demoOnly===true)r.demoOnly=true;
  for(const k of required[c]) if(!String(r[k]??'').trim()) throw new Error(`Kolom ${k} wajib diisi.`);
  if(r.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(r.email))) throw new Error('Email tidak valid.');
  if(r.phone && !/^\+?[0-9 ()-]{7,22}$/.test(String(r.phone))) throw new Error('Nomor telepon tidak valid.');
  if(r.phone){let phone=String(r.phone).replace(/[ ()-]/g,'');if(phone.startsWith('0'))phone='+62'+phone.slice(1);else if(phone.startsWith('62'))phone='+'+phone;if(!/^\+\d{8,15}$/.test(phone))throw new Error('Gunakan kode negara, misalnya +62811….');r.phone=phone;}
  for(const key of ['due','schedule','followUp'])if(r[key]&&!Number.isFinite(Date.parse(String(r[key]))))throw new Error(`Waktu ${key} tidak valid.`);
  for(const k of ['url','trackingUrl','endpoint']) if(r[k]) { const u=new URL(String(r[k])); if(u.protocol!=='https:') throw new Error('Gunakan URL HTTPS.'); }
  if(c==='contacts' && r.phone && s.records.contacts.some(a=>a.id!==id && a.phone===r.phone)) throw new Error('Nomor pelanggan sudah terdaftar.');
  if(c==='products') {
    if(s.records.products.some(a=>a.id!==id && String(a.sku).toLowerCase()===String(r.sku).toLowerCase())) throw new Error('SKU sudah digunakan.');
    r.price=numeric(r.price,'Harga'); r.minimum=numeric(r.minimum,'Stok minimum',0,1000000);
    r.stock=previous?previous.stock:numeric(r.stock,'Stok awal',0,1000000);
    if(!Number.isInteger(r.stock)||!Number.isInteger(r.minimum)) throw new Error('Stok harus bilangan bulat.');
  }
  if(c==='orders') {
    for(const key of ['provider','flipBillId','paymentInstructions','paymentLink','paymentId','paymentStatus','invoiceState','invoiceAt','paidAt','fulfillment','tracking','courier','conversationId','test']) {delete r[key];if(previous&&key in previous)r[key]=previous[key];}
    rowBy(s,'contacts',r.contactId);
    if(previous && previous.status!=='draft') throw new Error('Hanya pesanan draft yang dapat diubah.');
    let raw: unknown; try{raw=JSON.parse(String(r.items));}catch{throw new Error('Daftar item tidak valid.');}
    if(!Array.isArray(raw)||!raw.length||raw.length>50) throw new Error('Pesanan memerlukan 1–50 item.');
    const used=new Set<string>();
    const lines: Line[]=raw.map(i=>{ const product=rowBy(s,'products',i.productId); if(used.has(product.id)) throw new Error('Gabungkan jumlah untuk produk yang sama.'); used.add(product.id); const quantity=numeric(i.quantity,'Jumlah',1,1000000); if(!Number.isInteger(quantity)) throw new Error('Jumlah harus bulat.'); return {productId:product.id,name:String(product.name),quantity,price:numeric(i.price,'Harga')}; });
    r.items=JSON.stringify(lines); r.shipping=numeric(r.shipping,'Ongkir'); r.taxPercent=numeric(r.taxPercent,'Pajak',0,100); r.discount=numeric(r.discount,'Diskon',0,lines.reduce((n,i)=>n+i.price*i.quantity,0)); r.status='draft';
    r.number=previous?.number??`${s.settings.invoicePrefix}-${new Date(now).toISOString().slice(0,10).replaceAll('-','')}-${id.slice(-6).toUpperCase()}`;
  }
  if(c==='appointments') {
    rowBy(s,'contacts',r.contactId); rowBy(s,'agents',r.agent); const start=Date.parse(String(r.start)),end=Date.parse(String(r.end));
    if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start) throw new Error('Waktu akhir harus setelah waktu mulai.');
    if(!['scheduled','done','cancelled'].includes(String(r.status))) throw new Error('Status jadwal tidak valid.');
    if(r.status==='scheduled' && s.records.appointments.some(a=>a.id!==id && a.agent===r.agent && a.status==='scheduled' && start<Date.parse(String(a.end)) && end>Date.parse(String(a.start)))) throw new Error('Jadwal petugas bertabrakan. Pilih waktu lain.');
  }
  if(c==='rates') {r.base=numeric(r.base,'Biaya awal');r.perKg=numeric(r.perKg,'Biaya per kg');}
  if(c==='agents')r.capacity=numeric(r.capacity,'Kapasitas',1,100);
  if(c==='integrations'&&r.mapping){try{const mapping=JSON.parse(String(r.mapping));if(!mapping||typeof mapping!=='object'||Array.isArray(mapping)||Object.values(mapping).some(v=>typeof v!=='string'))throw new Error();}catch{throw new Error('Pemetaan harus objek JSON: {"kolom_tujuan":"kolom_sumber"}.');}}
  if(c==='shipments') {rowBy(s,'orders',r.orderId);r.cost=numeric(r.cost,'Biaya pengiriman');}
  if(c==='calls') {rowBy(s,'contacts',r.contactId);r.duration=numeric(r.duration,'Durasi',0,86400);}
  if(c==='adEvents') {rowBy(s,'contacts',r.contactId);r.value=numeric(r.value,'Nilai');if(s.records.adEvents.some(a=>a.id!==id&&a.eventId===r.eventId)) throw new Error('Event ID sudah ada.');r.delivery='local';}
  if(c==='automations' && (!['low_stock','upcoming_appointment','unpaid_order'].includes(String(r.trigger))||!['log','priority','tag'].includes(String(r.action)))) throw new Error('Pemicu atau aksi tidak didukung.');
  if(c==='guardrails' && !['handoff','block'].includes(String(r.action))) throw new Error('Pilih alihkan ke admin atau blokir jawaban.');
  if(['channels','integrations'].includes(c)) r.status='configured';
  if(c==='campaigns') r.status='draft';
  return r;
}
const log=(s:Operations,a:OpsAction,now:number,area:string,message:string,level:Log['level']='info')=>{s.logs.unshift({id:a.requestId,at:now,area,message,level});s.logs=s.logs.slice(0,500);};
export function applyOps(original:Operations,a:OpsAction,now=Date.now(),context:ServiceContext={}):Operations {
  if(!a||!idPattern.test(a.requestId??'')||a.requestId.length<8) throw new Error('ID tindakan tidak valid.');
  if(original.processed.includes(a.requestId)) return original;
  const s=structuredClone(original);
  if(a.type==='knowledge_import'){const count=importKnowledge(s,a.data??{},a.requestId,now);log(s,a,now,'knowledge',`Dokumen diimpor: ${String(a.data?.name)} (${count} bagian)`);
  } else if(a.type==='knowledge_source'){changeKnowledgeSource(s,a.data??{},now);log(s,a,now,'knowledge',`Sumber knowledge: ${String(a.data?.command)}`);
  } else if(a.type==='service') {
    applyService(s,a.data as {kind:string},a.requestId,now,context);
  } else if(a.type==='save') {
    if(!a.collection||!collections.includes(a.collection)) throw new Error('Modul tidak valid.');
    if(s.records[a.collection].length>=1000&&!s.records[a.collection].some(r=>r.id===a.id)) throw new Error('Batas 1.000 data per modul. Ekspor dan arsipkan data lama.');
    const r=checkEntry(s,a.collection,a.data??{},a.id??a.requestId,now);
    s.records[a.collection]=[r,...s.records[a.collection].filter(i=>i.id!==r.id)]; log(s,a,now,a.collection,`Disimpan: ${r.name??r.title??r.number??r.id}`);
  } else if(a.type==='delete') {
    if(!a.collection||!collections.includes(a.collection)) throw new Error('Modul tidak valid.');
    const r=rowBy(s,a.collection,a.id);
    if(a.collection==='contacts'&&s.service?.conversations.some(c=>c.contactId===r.id))throw new Error('Kontak masih digunakan dalam percakapan CS.');
    if(a.collection==='contacts' && ['orders','appointments','calls','adEvents'].some(c=>s.records[c as Collection].some(e=>e.contactId===r.id))) throw new Error('Kontak masih digunakan pada transaksi. Simpan kontak untuk menjaga riwayat.');
    if(a.collection==='products' && s.records.orders.some(o=>orderLines(o).some(l=>l.productId===r.id))) throw new Error('Produk masih digunakan pada pesanan.');
    if(a.collection==='agents' && s.records.appointments.some(o=>o.agent===r.id)) throw new Error('Petugas masih digunakan pada jadwal konsultasi.');
    if(a.collection==='orders' && (r.status!=='draft'||s.records.shipments.some(e=>e.orderId===r.id))) throw new Error('Pesanan ini memiliki riwayat; gunakan status batal.');
    s.records[a.collection]=s.records[a.collection].filter(i=>i.id!==r.id);log(s,a,now,a.collection,`Dihapus: ${r.name??r.title??r.id}`);
  } else if(a.type==='settings') {
    const d=a.data??{};const next={...s.settings};
    for(const k of Object.keys(next) as (keyof Settings)[]) if(k in d) {
      if(k==='botEnabled') {if(typeof d[k]!=='boolean') throw new Error('Status bot tidak valid.');next.botEnabled=d[k];}
      else if(k==='confidence'||k==='taxPercent') next[k]=numeric(d[k],k,0,100);
      else next[k]=text(d[k],k==='botPrompt'?8000:2000);
    }
    if(!next.businessName||!next.fallback||!next.invoicePrefix||!/^[A-Z0-9-]{1,12}$/.test(next.invoicePrefix)) throw new Error('Nama, jawaban eskalasi, dan awalan invoice harus valid.');
    if(next.timezone!=='Asia/Jakarta'||next.currency!=='IDR') throw new Error('Versi ini menggunakan WIB dan IDR.');
    if(s.settings.botEnabled&&!next.botEnabled&&s.service){
      for(const c of s.service.conversations){c.epoch++;for(const m of c.messages)if(m.role==='bot'&&m.status==='queued')m.status='cancelled';}
      for(const j of s.service.jobs)if(['blocked','queued'].includes(j.status)&&s.service.conversations.find(c=>c.id===j.conversationId)?.messages.find(m=>m.id===j.messageId)?.role==='bot'){j.status='cancelled';j.reason='AI global dijeda.';j.updatedAt=now;}
    }
    s.settings=next;log(s,a,now,'settings','Pengaturan disimpan.');
  } else if(a.type==='stock') {
    const p=rowBy(s,'products',a.id); const q=numeric(a.quantity,'Perubahan stok',-1000000,1000000);if(!Number.isInteger(q)||!q) throw new Error('Perubahan stok harus bilangan bulat selain nol.');
    if(Number(p.stock)+q<0) throw new Error('Stok tidak mencukupi.'); const reason=text(a.reason??'',300);if(!reason) throw new Error('Isi alasan perubahan stok.');
    p.stock=Number(p.stock)+q;p.updatedAt=now;s.movements.unshift({id:a.requestId,productId:p.id,quantity:q,reason,at:now});log(s,a,now,'products',`${p.sku}: ${q>0?'+':''}${q} (${reason})`);
  } else if(a.type==='order_status') {
    const order=rowBy(s,'orders',a.id);const from=String(order.status),to=String(a.status);
    if(order.provider||order.conversationId||s.records.contacts.find(c=>c.id===order.contactId)?.demoOnly===true||orderLines(order).some(l=>s.records.products.find(p=>p.id===l.productId)?.demoOnly===true))throw new Error('Gunakan alur invoice dan rekonsiliasi pada Pusat CS untuk pesanan ini.');
    const transitions:Record<string,string[]>={draft:['confirmed','cancelled'],confirmed:['paid','cancelled'],paid:['shipped','cancelled'],shipped:['completed'],completed:[],cancelled:[]};
    if(!transitions[from]?.includes(to)) throw new Error('Perubahan status pesanan tidak valid.');
    if(from==='draft'&&to==='confirmed') {for(const l of orderLines(order)) if(Number(rowBy(s,'products',l.productId).stock)<l.quantity) throw new Error(`Stok ${l.name} tidak mencukupi.`);for(const l of orderLines(order)){ const p=rowBy(s,'products',l.productId);p.stock=Number(p.stock)-l.quantity;s.movements.unshift({id:`${a.requestId}-${p.id}`,productId:p.id,quantity:-l.quantity,reason:`Pesanan ${order.number}`,at:now});}}
    if(to==='cancelled'&&['confirmed','paid'].includes(from)) for(const l of orderLines(order)){const p=rowBy(s,'products',l.productId);p.stock=Number(p.stock)+l.quantity;s.movements.unshift({id:`${a.requestId}-${p.id}`,productId:p.id,quantity:l.quantity,reason:`Pembatalan ${order.number}`,at:now});}
    order.status=to;order.updatedAt=now;log(s,a,now,'orders',`${order.number}: ${from} → ${to}`);
  } else if(a.type==='automation') {
    const rule=rowBy(s,'automations',a.id);if(!rule.enabled) throw new Error('Aktifkan aturan terlebih dahulu.');
    const targets=rule.trigger==='low_stock'?s.records.products.filter(p=>Number(p.stock)<=Number(p.minimum)):rule.trigger==='unpaid_order'?s.records.orders.filter(o=>o.status==='confirmed'):s.records.appointments.filter(v=>v.status==='scheduled'&&Date.parse(String(v.start))>=now&&Date.parse(String(v.start))<now+86400000);
    for(const t of targets) {if(rule.action==='priority')t.priority=true;if(rule.action==='tag')t.tags=[...new Set(`${t.tags??''},${rule.value||'Perlu tindak lanjut'}`.split(',').filter(Boolean))].join(', ');}
    rule.lastRun=now;rule.matched=targets.length;log(s,a,now,'automations',`${rule.name}: ${targets.length} data cocok; aksi ${rule.action} dijalankan.`);
  } else if(a.type==='test_event') {
    const d=a.data??{};if(!idPattern.test(String(d.eventId??''))||!/^\+\d{8,15}$/.test(String(d.phone??''))||!['incoming','outgoing'].includes(String(d.direction))||!String(d.text??'').trim()||String(d.text).length>4000) throw new Error('Payload harus memiliki eventId, phone format +62…, direction incoming/outgoing, dan text (maks. 4.000).');
    log(s,a,now,'api',`Payload uji ${d.eventId} valid (${d.direction}); tidak diteruskan ke WhatsApp.`);
  } else if(a.type==='import_rows') {
    const c=a.collection;if(!c||!['contacts','products','rates'].includes(c)||!Array.isArray(a.rows)||!a.rows.length||a.rows.length>200)throw new Error('Impor mendukung 1–200 kontak, produk, atau tarif.');
    for(let i=0;i<a.rows.length;i++){const input=a.rows[i];const id=String(input.id??`${a.requestId.slice(0,60)}-${i}`);if(s.records[c].some(r=>r.id===id))throw new Error(`ID ${id} sudah ada; impor hanya menambahkan data baru.`);const r=checkEntry(s,c,input,id,now);s.records[c].push(r);}
    if(s.records[c].length>1000)throw new Error('Batas 1.000 data per modul.');log(s,a,now,'integrations',`${a.rows.length} data ${c} diimpor.`);
  } else if(a.type==='seed') {
    if(collections.some(c=>s.records[c].length)) throw new Error('Data contoh hanya bisa dimuat pada ruang operasional kosong.');
    const e=(id:string,fields:Record<string,string|number|boolean>):Entry=>({id,createdAt:now,updatedAt:now,...fields});
    s.records.contacts=[e('sample-customer',{name:'Pelanggan Contoh',phone:'+628000000001',city:'Jakarta',tags:'contoh',stage:'lead',consent:false,notes:'Data contoh — bukan pelanggan asli.'})];
    s.records.products=[e('sample-product',{name:'Produk Contoh',sku:'DEMO-001',stock:12,minimum:5,price:100000,unit:'unit',category:'Contoh'})];
    s.records.agents=[e('sample-agent',{name:'Admin Contoh',email:'admin@example.com',role:'agent',availability:'available',capacity:10})];
    s.records.automations=[e('sample-rule',{name:'Tandai stok menipis',trigger:'low_stock',action:'priority',enabled:true,value:''})];log(s,a,now,'settings','Data contoh dimuat.');
  } else if(a.type==='restore') {
    if(s.service?.conversations.length||s.service?.payments.length||s.service?.jobs.length)throw new Error('Pemulihan operasional dibatasi saat ada riwayat CS/transaksi agar hubungan datanya tidak terhapus. Ekspor cadangan lengkap terlebih dahulu.');
    const backup=a.backup as Operations;if(!backup||!backup.records||!backup.settings) throw new Error('File cadangan tidak valid.');
    const next=createOperations();for(const c of collections){if(!Array.isArray(backup.records[c])||backup.records[c].length>1000)throw new Error(`Data ${c} tidak valid.`);const ids=new Set();for(const r of backup.records[c]){if(ids.has(r.id))throw new Error('ID ganda pada cadangan.');ids.add(r.id);if(c==='orders') {const status=r.status;const checked=checkEntry(next,c,r,r.id,now);if(!['draft','confirmed','paid','shipped','completed','cancelled'].includes(String(status)))throw new Error('Status pesanan tidak valid.');checked.status=status;next.records[c].push(checked);}else next.records[c].push(checkEntry(next,c,r,r.id,now));}}
    for(const c of collections) for(const row of next.records[c]) {
      const saved=backup.records[c].find(r=>r.id===row.id)!;
      for(const key of ['createdAt','updatedAt'] as const){const timestamp=Number(saved[key]);if(!Number.isSafeInteger(timestamp)||timestamp<0||timestamp>8640000000000000)throw new Error('Waktu pada cadangan tidak valid.');row[key]=timestamp;}
      if(c==='orders'){const number=String(saved.number??'');if(!/^[A-Z0-9-]{1,80}$/.test(number))throw new Error('Nomor invoice cadangan tidak valid.');row.number=number;}
    }
    next.settings=applyOps(next,{type:'settings',requestId:`${a.requestId}-settings`.slice(0,80),data:backup.settings},now).settings;
    s.records=next.records;s.settings=next.settings;s.movements=[];log(s,a,now,'settings','Cadangan dipulihkan. Riwayat stok baru dimulai dari saldo cadangan.');
  } else throw new Error('Tindakan tidak dikenal.');
  s.processed=[...s.processed,a.requestId].slice(-500);s.movements=s.movements.slice(0,2000);
  if(JSON.stringify(s).length>3000000) throw new Error('Data ruang kerja melebihi batas. Ekspor dan kurangi data lama.');
  return s;
}
export const coaProducts=[['Tirzepatide','tirzepatide'],['Retatrutide','retatrutide'],['Semaglutide','semaglutide'],['Tesamorelin','tesamorelin'],['Cagrilintide','cagrilintide'],['BPC-157 + TB-500','bpc-157-tb-500'],['BPC-157','bpc-157'],['TB-500','tb-500'],['GHK-Cu','ghk-cu'],['KLOW80','klow80'],['NAD+','nad-plus'],['Ipamorelin','ipamorelin'],['CJC-1295 With DAC','cjc-1295-with-dac'],['CJC-1295 Without DAC','cjc-1295-without-dac'],['HGH 191AA','hgh-191aa'],['PT-141','pt-141'],['SS-31','ss-31'],['5-Amino-1MQ','5-amino-1mq'],['Semax','semax'],['Selank','selank'],['KPV','kpv'],['DSIP','dsip'],['MT-2','mt-2'],['AOD-9604','aod-9604'],['Epithalon','epithalon']];
export function previewBot(s:Operations,question:string):{answer:string;source:string;handoff:boolean;score:number} {
  const q=question.toLowerCase().replace(/[^a-z0-9+]+/g,' ').trim();
  for(const r of s.records.guardrails.filter(r=>r.enabled)) if(String(r.keywords).split(',').some(k=>k.trim()&&q.includes(k.trim().toLowerCase()))) return {answer:String(r.response),source:`Guardrail: ${r.name}`,handoff:true,score:100};
  if(/\b(admin|manusia|dosis|resep|efek samping)\b/.test(q))return {answer:s.settings.fallback,source:'Eskalasi admin',handoff:true,score:0};
  if(/\b(coa|certificate|sertifikat)\b/.test(q)) {
    const matches=coaProducts.filter(([name])=>q.includes(name.toLowerCase().replace(/[^a-z0-9+]+/g,' ')));
    const combined=matches.find(([name])=>name.includes(' + '));const found=combined?[combined]:matches;
    if(found.length)return {answer:found.map(([name,slug])=>`COA ${name}: https://www.regenlongevitylab.com/coa/${slug}`).join('\n'),source:'Direktori COA Regen',handoff:false,score:100};
    return {answer:'COA produk apa yang ingin Anda lihat? Sebutkan nama produknya.',source:'Klarifikasi COA',handoff:false,score:100};
  }
  const words=q.split(' ').filter(w=>w.length>2);
  const ranked=s.records.knowledge.filter(k=>k.enabled).map(k=>{const hay=`${k.title} ${k.keywords} ${k.content}`.toLowerCase();return {k,score:words.length?Math.round(words.filter(w=>hay.includes(w)).length/words.length*100):0};}).sort((a,b)=>b.score-a.score);
  if(ranked[0]&&ranked[0].score>=s.settings.confidence)return {answer:String(ranked[0].k.content),source:String(ranked[0].k.title),handoff:false,score:ranked[0].score};
  return {answer:s.settings.fallback,source:'Tidak ada pengetahuan yang cukup cocok',handoff:true,score:ranked[0]?.score??0};
}
export function campaignAudience(s:Operations,c:Entry):Entry[] { return s.records.contacts.filter(p=>p.consent===true&&p.phone&&(!c.segment||String(p.tags??'').toLowerCase().includes(String(c.segment).toLowerCase()))); }
export function csv(rows:Record<string,unknown>[]):string {const keys=[...new Set(rows.flatMap(Object.keys))];const cell=(v:unknown)=>{let s=String(v??'');if(/^[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};return '\uFEFF'+[keys.map(cell).join(','),...rows.map(r=>keys.map(k=>cell(r[k])).join(','))].join('\r\n');}
