'use client';
import { adminFetch } from './admin-client';
import { useEffect, useRef, useState } from 'react';
import type { ServiceState } from '../lib/service-types';

export function WhatsAppCsPanel({sync,refresh,botEnabled,enableBot}:{sync?:ServiceState['csSync'];refresh:()=>Promise<void>;botEnabled:boolean;enableBot:()=>Promise<unknown>}){
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[setup,setSetup]=useState(false);const running=useRef(false);
 const refreshRef=useRef(refresh);refreshRef.current=refresh;
 useEffect(()=>{const id=setInterval(()=>{if(document.visibilityState==='visible'&&!running.current)void refreshRef.current();},5000);return()=>clearInterval(id);},[]);
 async function run(){setBusy(true);running.current=true;setMessage('');try{const r=await adminFetch('/admin/api/service/whatsapp-cs',{method:'POST'});const d=await r.json() as {ok?:boolean;busy?:boolean;error?:string;received?:number;sent?:number};if(!r.ok||d.ok===false)throw new Error(d.error||'Sinkronisasi belum selesai.');setMessage(d.busy?'Antrean sedang diproses.':`${d.received||0} pembaruan diterima; ${d.sent||0} balasan dikirim.`);}catch(e){setMessage(e instanceof Error?e.message:'Koneksi belum tersedia.');}finally{await refresh();running.current=false;setBusy(false);}}
 async function copy(){try{const r=await adminFetch('/admin/api/service/whatsapp-cs/setup',{method:'POST'});if(!r.ok)throw new Error('Akses hanya untuk pemilik.');const d=await r.json();await navigator.clipboard.writeText(JSON.stringify(d));setMessage('Kredensial disalin. Tempel hanya pada kredensial Regen Admin di n8n.');}catch(e){setMessage(e instanceof Error?e.message:'Tidak dapat menyalin.');}}
 const background=!sync?.error&&!!sync?.lastBackgroundAt&&Date.now()-sync.lastBackgroundAt<180000;
 return <section className="ops-card" style={{padding:18,marginBottom:16}}><strong>WhatsApp CS · 0852-8783-4725</strong><p>{background?'Sinkronisasi latar belakang terhubung.':'Sinkronisasi latar belakang belum terkonfirmasi.'} {sync?.lastAt?`Pembaruan terakhir ${new Date(sync.lastAt).toLocaleString('id-ID',{timeZone:'Asia/Jakarta'})} WIB.`:'Belum ada sinkronisasi ke dashboard.'}</p>
 <div className="ops-actions"><button className="button primary" disabled={busy} onClick={()=>void run()}>{busy?'Memproses…':'Sinkronkan sekarang'}</button>{!botEnabled&&<button className="button" disabled={busy} onClick={async()=>{await enableBot();await run();}}>Aktifkan AI & sinkronkan</button>}<button className="button" onClick={()=>setSetup(!setup)}>Pengaturan koneksi</button></div>
 {(message||sync?.error)&&<p role="status">{message||sync?.error}</p>}
 {setup&&<div style={{marginTop:16}}><p>Agar bot bekerja saat dashboard ditutup, sambungkan kredensial Regen Admin pada workflow n8n. Pengaturan ini hanya perlu dilakukan sekali.</p><button className="button" onClick={()=>void copy()}>Salin kredensial koneksi n8n</button><p>Gunakan nama <b>Regen Admin Service</b>. Data yang disalin adalah kredensial pribadi; simpan hanya pada pengaturan autentikasi n8n.</p></div>}
 </section>;
}
