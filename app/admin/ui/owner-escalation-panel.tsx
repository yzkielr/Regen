'use client';
import type {Operations} from '../lib/operations';
import type {ServiceAction} from '../lib/service-types';
import {activeOwners,ownerWindow} from '../lib/owner-escalation';
import {REGEN_CS_PHONE} from '../lib/regen-phone';

export function OwnerConnectionPanel({state}:{state:Operations}){
 const owners=activeOwners(state),primary=owners[0];
 return <section className="owner-routing"><h3>Eskalasi melalui WhatsApp owner</h3><p>{primary?`Penerima eskalasi baru: ${primary.name} (${primary.phone}).`:'Tambahkan kontak owner dan aktifkan “Kontak aktif” untuk menerima eskalasi.'}</p><p>Owner mengirim <strong>/start</strong> ke CS Regen <strong>{REGEN_CS_PHONE}</strong> agar dapat menerima pesan. Jendela WhatsApp berlaku 24 jam sejak pesan terakhir owner; jika berakhir, eskalasi menunggu owner chat kembali.</p>{owners.map(o=><div className="owner-connection" key={o.id}><strong>{o.name}</strong><span>{ownerWindow(state,String(o.phone))?'Siap menerima pesan':'Menunggu pesan dari owner'}</span></div>)}<p>Balas dengan <code>/reply ESC-KODE jawaban Anda</code>, atau kutip pesan eskalasi lalu <code>/reply jawaban Anda</code>. Jawaban dirapikan sesuai bahasa buyer. Admin mengambil alih akan menutup eskalasi yang lama.</p></section>;
}
export function OwnerTicketPanel({state,conversationId,run,busy}:{state:Operations;conversationId:string;run:(a:ServiceAction)=>Promise<unknown>;busy:boolean}){
 const t=state.service?.ownerTickets?.find(t=>t.conversationId===conversationId);if(!t)return null;
 const notification=state.service?.jobs.find(j=>j.id===t.notificationJobId),answer=state.service?.jobs.find(j=>j.kind==='customer'&&j.ownerTicketId===t.id);
 const status=t.status==='cancelled'?'Ditutup · ditangani admin':t.status==='review'?'Balasan perlu diperiksa':t.status==='replied'?'Jawaban owner dikirim':t.status==='queued'?(answer?.status==='failed'?'Pengiriman gagal':answer?.status==='unknown'?'Status kirim belum pasti':'Jawaban menunggu pengiriman'):t.reply?'Jawaban owner sedang dirapikan':!t.ownerId?'Belum ada owner aktif':notification?.status==='failed'?'Eskalasi gagal dikirim':notification?.status==='unknown'?'Status eskalasi belum pasti':notification?.status==='sent'?'Menunggu jawaban owner':'Eskalasi diantrekan';
 return <aside className="owner-ticket" aria-label="Status eskalasi owner"><div><strong>Owner · {t.ownerName||'Belum ditentukan'}</strong><span>{status}</span></div><small>{t.id}</small>{t.status!=='cancelled'&&<p>{t.reply?.reason||answer?.reason||notification?.reason||t.reason}</p>}{t.status==='open'&&!t.ownerId&&<button className="button small" disabled={busy} onClick={()=>void run({kind:'owner_assign',ticketId:t.id})}>Antrekan ke owner aktif</button>}{t.status==='review'&&<button className="button small" disabled={busy} onClick={()=>void run({kind:'owner_retry',ticketId:t.id})}>Coba perapihan lagi</button>}{t.reply&&<details><summary>Lihat balasan asli owner</summary><p className="owner-raw">{t.reply.raw}</p><small>Teks asli internal. Buyer menerima versi yang sudah dirapikan.</small></details>}</aside>;
}
