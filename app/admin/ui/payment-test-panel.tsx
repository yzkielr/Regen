'use client';
import { adminFetch } from './admin-client';
import { useState } from 'react';
import type { Operations } from '../lib/operations';
import type { ServiceAction, WarehousePart } from '../lib/service-types';
import type { AdminRole } from '../lib/admin-roles';
import { canSupervise } from '../lib/admin-roles';
import { TEST_MAILBOX, TEST_WAREHOUSE, TEST_WARNING } from '../lib/payment-test';
import { warehouseBlock } from '../lib/payment-automation';
import { Card, Note, dt } from './operations-components';
const partLabel=(p?:WarehousePart)=>p?.delivery==='read'?'Dibaca':p?.delivery==='delivered'?'Tersampaikan':p?.delivery==='failed'?'Gagal':p?.status==='sent'?'Diterima Meta':p?.status==='failed'?'Gagal':p?.status==='unknown'?'Hasil belum pasti':p?.status==='sending'?'Mengirim':'Menunggu';
export function PaymentTestPanel({state,refresh,run,role}:{state:Operations;refresh:()=>Promise<void>;run:(a:ServiceAction)=>Promise<boolean>;role:AdminRole}){
 const [busy,setBusy]=useState(false),[message,setMessage]=useState('');const tests=state.service?.paymentTests||[];
 async function start(){setBusy(true);setMessage('');try{const res=await adminFetch('/admin/api/service/payment-test',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:crypto.randomUUID()})});const out=await res.json() as {error?:string};if(!res.ok)throw Error(out.error||'Uji belum dimulai.');setMessage('Pengujian dicatat. Pantau status email dan WhatsApp di bawah; jangan kirim ulang bila hasil belum pasti.');}catch(e){setMessage(e instanceof Error?e.message:'Pengujian gagal.');}finally{await refresh();setBusy(false);}}
 return <Card title="Uji email & WhatsApp warehouse"><Note><strong>{TEST_WARNING}</strong><br/>Mengirim email sungguhan dari sistem Regen ke {TEST_MAILBOX}, lalu detail pesanan contoh dan gambar salinan email ke WhatsApp {TEST_WAREHOUSE}. Tidak ada pembayaran, perubahan invoice asli, atau pengurangan stok. Ini tidak menguji format email asli Paper.id.</Note>
 <details><summary>Lihat data yang akan dikirim</summary><p>Pelanggan Uji Regen · Produk uji sistem × 1 · Nominal contoh Rp 1.000<br/>Telepon uji: {TEST_WAREHOUSE}<br/>Alamat contoh — bukan tujuan pengiriman. Semua pesan menyatakan jangan kemas atau kirim barang.</p></details>
 <div className="svc-actions">{canSupervise(role)&&<button className="button primary" disabled={busy} onClick={()=>void start()}>{busy?'Menjalankan pengujian…':'Kirim email & WhatsApp uji'}</button>}<button className="button" disabled={busy} onClick={()=>void refresh()}>Perbarui status</button></div>
 {message&&<Note>{message}</Note>}<p className="muted">Email dibaca kembali otomatis sekitar setiap 1 menit selama pengujian menunggu email. Untuk memeriksa segera, gunakan “Periksa email sekarang” di atas. WhatsApp memerlukan chat masuk dari nomor gudang ke CS Regen dalam 24 jam terakhir.</p>
 {tests.slice(0,10).map(r=>{const j=state.service?.jobs.find(j=>j.id===r.jobId);return <article className="svc-test-run" key={r.id}><strong>{r.reference}</strong><small>{dt(r.createdAt)} · {TEST_WARNING}</small><ol><li>Email: {r.emailStatus==='sent'?'Dikirim':r.emailStatus==='failed'?'Gagal':r.emailStatus==='unknown'?'Hasil belum pasti':r.emailStatus==='sending'?'Mengirim / menunggu hasil':'Menunggu'} — {r.emailReason}</li><li>Pembacaan & pencocokan: {r.receivedAt?`Cocok pada ${dt(r.receivedAt)}`:r.expiresAt<Date.now()?'Pengujian kedaluwarsa':'Menunggu email uji masuk'}</li><li>WhatsApp detail pesanan: {partLabel(j?.warehouse?.text)}</li><li>WhatsApp gambar email: {partLabel(j?.warehouse?.evidence)}</li></ol>{j&&<p>{['blocked','queued'].includes(j.status)?warehouseBlock(state,j)||j.reason:j.reason}</p>}{r.evidenceKey&&<a className="button" href={`/admin/api/service/payment-evidence?id=${encodeURIComponent(r.id)}`} target="_blank" rel="noreferrer">Lihat gambar email uji</a>}{j?.status==='failed'&&canSupervise(role)&&<button className="button" onClick={()=>void run({kind:'warehouse_retry',jobId:j.id})}>Ulangi bagian WhatsApp yang gagal</button>}</article>;})}
 </Card>;
}
