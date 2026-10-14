import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import ts from 'typescript';
import sharp from 'sharp';
const require=createRequire(import.meta.url);
const modules=new Map();
function load(name){
 if(modules.has(name))return modules.get(name);
 const code=ts.transpileModule(fs.readFileSync(new URL('./'+name+'.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 const module={exports:{}};new Function('require','module','exports',code)(dep=>dep.startsWith('./')?load(dep.slice(2)):require(dep),module,module.exports);modules.set(name,module.exports);return module.exports;
}
const {paymentEvidenceDetails,renderPaymentEmail}=load('payment-evidence-render');
// Fixture transcribed from the email screenshot supplied by the user, for layout QA only.
const subject='Notifikasi Pembayaran Digital Payment untuk Reference No. 1791537071NZX6G dari atmint sebesar Rp Rp 20.000';
const body=['Pembayaran Masuk','Halo regen,','Anda menerima pembayaran dari atmint untuk No. Invoice RGN-20261009-B30DC4, dengan detail sebagai berikut:','Total Dana Diterima','Rp 20.000','Detail Transaksi','No. Invoice','RGN-20261009-B30DC4','Tgl. Pembayaran','Jumat, 09 Oktober 2026, 16:11 WIB','Detail Pengirim','Nama Partner','atmint','No. Telp Partner','6282110769186','Metode Pembayaran','Digital Payment - Credit Card - Visa','No. Referensi','1791537071NZX6G'].join('\n\n');
const receivedAt=Date.parse('2026-10-09T16:11:50+07:00');

test('sparse Paper email becomes structured fields without changing payment facts',()=>{
 const d=paymentEvidenceDetails('invoicer@paper.id',subject,receivedAt,body);
 assert.equal(d.amount,'Rp 20.000');assert.equal(d.reference,'RGN-20261009-B30DC4');assert.equal(d.customer,'atmint');assert.equal(d.phone,'6282110769186');assert.equal(d.method,'Digital Payment - Credit Card - Visa');assert.equal(d.transaction,'1791537071NZX6G');assert.equal(d.paidAt,'Jumat, 09 Oktober 2026, 16:11 WIB');assert.equal(d.review,false);assert.match(d.receivedAt,/16[.:]11 WIB/);
 const missing=paymentEvidenceDetails('invoicer@paper.id',subject,receivedAt,'Nama Partner\nNo. Telp Partner\nMetode Pembayaran');
 assert.equal(missing.customer,'Tidak tercantum');assert.equal(missing.phone,'Tidak tercantum');assert.equal(missing.amount,'Periksa email asli');assert.equal(missing.review,true);
});

test('normal and long email evidence are always square, with bounded readable fields',async()=>{
 const image=await renderPaymentEmail('invoicer@paper.id',subject,receivedAt,body);
 const meta=await sharp(image).metadata();assert.equal(meta.format,'png');assert.equal(meta.width,1200);assert.equal(meta.height,1200);
 assert.ok(image.length<5*1024*1024);assert.ok((await sharp(image).stats()).channels[0].stdev>5);
 fs.writeFileSync(new URL('../artifacts/payment-evidence-square-preview.png',import.meta.url),image);
 const long=body.replace('Nama Partner\n\natmint','Nama Partner\n\n'+('Pelanggan <uji> & perusahaan '.repeat(9))).replace('Digital Payment - Credit Card - Visa','Metode pembayaran yang sangat panjang '.repeat(16));
 assert.match(paymentEvidenceDetails('invoicer@paper.id',subject,receivedAt,long).customer,/Pelanggan <uji> & perusahaan/);
 const longImage=await renderPaymentEmail('invoicer@paper.id',subject,receivedAt,long+'\n'.repeat(1000)+'Footer email '.repeat(150));
 assert.equal((await sharp(longImage).metadata()).height,1200);fs.writeFileSync(new URL('../artifacts/payment-evidence-square-long.png',import.meta.url),longImage);
});

test('simulation keeps a warning and uses only its labelled amount',async()=>{
 const testBody='SIMULASI — BUKAN PEMBAYARAN\nReferensi uji: RGN-TEST-123\nNominal uji: IDR 1000\nCustomer: Pelanggan Uji Regen\nTelepon uji: +6282114368729\nNominal uji: Rp 1.000';
 const d=paymentEvidenceDetails('contact@lorenic.com','[UJI REGEN] RGN-TEST-123',receivedAt,testBody,true);
 assert.equal(d.test,true);assert.equal(d.amount,'Rp 1.000');assert.equal(d.reference,'RGN-TEST-123');assert.equal(d.customer,'Pelanggan Uji Regen');
 const image=await renderPaymentEmail('contact@lorenic.com','[UJI REGEN] RGN-TEST-123',receivedAt,testBody,true);
 assert.equal((await sharp(image).metadata()).width,1200);fs.writeFileSync(new URL('../artifacts/payment-evidence-square-test.png',import.meta.url),image);
});
