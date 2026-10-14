import type { Operations } from './operations';
import type { PaymentTestRun, ServiceAction, ServiceContext, ServiceJob } from './service-types';
export const TEST_MAILBOX='contact@lorenic.com';
export const TEST_WAREHOUSE='+6282114368729';
export const TEST_WARNING='SIMULASI — BUKAN PEMBAYARAN';
const uuid=(v:unknown)=>typeof v==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(v);
export function paymentTestBlock(s:Operations,j:ServiceJob,now:number){
 const r=s.service?.paymentTests?.find(r=>r.id===j.testRunId);
 if(!r||!j.test||r.jobId!==j.id||!r.receivedAt||!r.evidenceKey||r.expiresAt<=now||j.destination!==r.destination||j.text!==r.packingText)return 'Pengujian belum cocok, kedaluwarsa, atau detailnya berubah.';
 return '';
}
// Diagnostics are separate from invoices, payments, stock and fulfilment.
export function applyPaymentTest(s:Operations,a:ServiceAction,now:number,ctx:ServiceContext):boolean{
 if(!a.kind.startsWith('payment_test_'))return false;
 if(!ctx.trusted)throw Error('Pengujian hanya dapat diproses layanan server.');
 const sv=s.service!;sv.paymentTests??=[];
 if(a.kind==='payment_test_start'){
  if(!uuid(a.runId))throw Error('ID pengujian tidak valid.');
  if(sv.paymentTests.some(r=>r.id===a.runId))return true;
  if(sv.config.warehousePhone!==TEST_WAREHOUSE)throw Error('Nomor gudang uji harus +6282114368729.');
  if(sv.paymentTests.some(r=>now-r.createdAt<60000)||sv.paymentTests.filter(r=>now-r.createdAt<3600000).length>=3)throw Error('Tunggu sebelum membuat pengujian baru (maksimal 3 per jam).');
  if(sv.paymentTests.length>=50)throw Error('Riwayat uji mencapai 50. Arsipkan sebelum menambah pengujian.');
  const reference='RGN-TEST-'+String(a.runId).toUpperCase(),amount=1000;
  const packingText=[TEST_WARNING,'JANGAN DIKEMAS / JANGAN DIKIRIM',`ORDER UJI #${reference}`,'Status: pembayaran simulasi; tidak ada dana diterima.','Customer: Pelanggan Uji Regen',`Telepon uji: ${TEST_WAREHOUSE}`,'Produk: Produk uji sistem (bukan barang pesanan)','Qty: 1','Alamat: Alamat contoh — bukan tujuan pengiriman','Nominal uji: Rp 1.000','Catatan: Uji koneksi email dan WhatsApp saja.'].join('\n');
  const run:PaymentTestRun={id:String(a.runId),reference,amount,destination:TEST_WAREHOUSE,createdAt:now,expiresAt:now+86400000,subject:`[UJI REGEN] ${reference} — BUKAN PEMBAYARAN`,body:[TEST_WARNING,'Email ini dibuat sistem Regen, bukan notifikasi Paper.id.','Tidak ada pembayaran sungguhan. Tidak boleh dipakai untuk memproses pesanan.',`Referensi uji: ${reference}`,`Nominal uji: IDR ${amount}`,'',packingText].join('\n'),packingText,emailStatus:'queued',emailReason:'Menunggu pengiriman email uji.'};
  sv.paymentTests.unshift(run);return true;
 }
 const r=sv.paymentTests.find(r=>r.id===a.runId);if(!r)throw Error('Pengujian tidak ditemukan.');
 if(a.kind==='payment_test_claim'){
  if(r.emailStatus!=='queued'||r.expiresAt<=now||!uuid(a.attemptId))throw Error('Email sudah diproses atau kedaluwarsa.');
  r.emailStatus='sending';r.attemptId=String(a.attemptId);r.emailReason='Mengirim email uji. Jangan ulangi pengiriman.';return true;
 }
 if(a.kind==='payment_test_email_result'){
  if(r.emailStatus!=='sending'||r.attemptId!==a.attemptId||!['sent','failed','unknown'].includes(String(a.status)))throw Error('Hasil pengiriman tidak cocok.');
  r.emailStatus=a.status as PaymentTestRun['emailStatus'];r.emailReason=String(a.reason||'').slice(0,500);return true;
 }
 if(a.kind==='payment_test_received'){
  if(r.receivedAt){if(r.emailHash!==a.hash)throw Error('Email pengujian memiliki isi berbeda.');return true;}
  if(!['sending','sent','unknown'].includes(r.emailStatus)||r.expiresAt<=now||!Number.isSafeInteger(a.receivedAt)||Number(a.receivedAt)<r.createdAt-300000||Number(a.receivedAt)>now+300000||a.reference!==r.reference||a.amount!==r.amount||!/^payment-mail\/[a-f0-9]{64}\.png$/.test(String(a.evidenceKey))||!/^[a-f0-9]{64}$/.test(String(a.hash)))throw Error('Email tidak cocok dengan pengujian aktif.');
  if(sv.jobs.length>=1000)throw Error('Antrean mencapai 1.000 item.');
  Object.assign(r,{receivedAt:a.receivedAt,emailHash:a.hash,evidenceKey:a.evidenceKey,jobId:'warehouse-test-'+r.id,emailStatus:'sent',emailReason:'Email uji diterima dan referensi serta nominal cocok.'});
  sv.jobs.unshift({id:r.jobId!,kind:'warehouse',testRunId:r.id,test:true,destination:r.destination,text:r.packingText,status:'blocked',reason:'Menunggu pengiriman uji WhatsApp.',createdAt:now,updatedAt:now});return true;
 }
 throw Error('Tindakan pengujian tidak valid.');
}
