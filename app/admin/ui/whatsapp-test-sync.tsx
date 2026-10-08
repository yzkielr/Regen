'use client';
import { adminFetch } from './admin-client';
import { useEffect, useRef, useState } from 'react';

export function WhatsAppTestSync({refresh,ready}:{refresh:()=>Promise<void>;ready:boolean}){
 const [running,setRunning]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[last,setLast]=useState('');
 const update=useRef(refresh);update.current=refresh;
 useEffect(()=>{
  if(!running)return;
  let stopped=false;let timer:ReturnType<typeof setTimeout>;
  async function tick(){
   if(stopped)return;setBusy(true);
   try{const r=await adminFetch('/admin/api/service/whatsapp-test',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});const d=await r.json() as {ok?:boolean;error?:string};if(!r.ok||d.ok===false)throw new Error(d.error||'Sinkronisasi belum berhasil.');if(!stopped){setError('');setLast(new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit',second:'2-digit'}));}}
   catch(e){if(!stopped)setError(e instanceof Error?e.message:'Sinkronisasi gagal.');}
   finally{try{await update.current();}catch{if(!stopped)setError('Riwayat belum diperbarui. Sinkronisasi akan mencoba lagi.');}if(!stopped){setBusy(false);timer=setTimeout(tick,5000);}}
  }
  void tick();return()=>{stopped=true;clearTimeout(timer);};
 },[running]);
 return <section className="ops-card" style={{padding:18,marginBottom:16}} aria-label="Uji WhatsApp Meta">
  <div className="ops-actions" style={{justifyContent:'space-between'}}><strong>Uji WhatsApp Meta</strong><button disabled={!ready} className={`button ${running?'':'primary'}`} onClick={()=>{setRunning(!running);setBusy(false);}}>{!ready?'Menunggu koneksi penerimaan':running?'Jeda sinkronisasi':'Mulai sinkronisasi uji'}</button></div>
  <p>+1 (555) 146-9188 → HP penguji +62 852-8783-4725. Pesan benar-benar dikirim melalui Meta.</p>
  <p>Biarkan halaman ini terbuka selama pengujian. Untuk balasan otomatis, aktifkan AI global dan pilih AI ON pada percakapan. Ambil alih untuk membalas sebagai admin.</p>
  <small>{!ready?'Pengiriman nomor uji sudah diperiksa. Koneksi penerimaan pesan belum diaktifkan.':running?(busy?'Memproses pesan…':`Sinkronisasi aktif${last?` · terakhir ${last}`:''}`):'Sinkronisasi dijeda. Pesan masuk tetap tersimpan di konektor.'}</small>
  {error&&<p className="ops-error" role="alert">{error}</p>}
  {!running&&last&&<p>Permintaan yang sudah diproses dapat selesai. Gunakan AI OFF atau Ambil alih untuk menghentikan balasan bot berikutnya.</p>}
 </section>;
}
