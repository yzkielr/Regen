// Only payment notification subjects enter reconciliation. No generative parser.
export function paymentSubject(subject:string){return /(?:pembayaran|payment|invoice)/i.test(subject)&&!/(?:promo|kode akses|verifikasi|biaya transaksi|potong|diskon|pemeliharaan|libur|reminder|pengingat)/i.test(subject);}
export function rupiah(value:string):number {
 const raw=value.replace(/\s/g,'').replace(/^(?:Rp\.?|IDR)/i,'');
 const formats=[/^\d+$/, /^\d{1,3}(?:\.\d{3})+(?:,00)?$/, /^\d{1,3}(?:,\d{3})+(?:\.00)?$/, /^\d+[,.]00$/];
 if(!formats.some(r=>r.test(raw)))return 0;
 const decimal=raw.replace(/(?:,00|\.00)$/,'');const n=Number(decimal.replace(/[.,]/g,''));return Number.isSafeInteger(n)&&n>0&&n<=1e12?n:0;
}
export function parsePaperReceipt(subject:string,body:string){
 const text=body.replace(/\r/g,'');const full=subject+'\n'+text;
 const refs=[...new Set([...full.matchAll(/\bRGN-[A-Z0-9]+(?:-[A-Z0-9]+)*\b/gi)].map(m=>m[0].toUpperCase()))];
 const amounts=[...new Set([...text.matchAll(/(?:total\s+dana\s+diterima|total\s+pembayaran|jumlah\s+pembayaran|nominal\s+pembayaran|amount\s+paid|payment\s+amount)\s*[:：]?\s*((?:Rp\.?|IDR)\s*[\d.,]+)/gi)].map(m=>rupiah(m[1])).filter(Boolean))];
 const digitalReceipt=/^Notifikasi\s+Pembayaran\s+Digital\s+Payment\s+untuk\s+Reference\s+No\./i.test(subject)&&/\bPembayaran\s+Masuk\b/i.test(text)&&/Anda\s+menerima\s+pembayaran\s+dari\s+[^\n]{1,200}?\s+untuk\s+No\.\s*Invoice\s+RGN-/i.test(text)&&/Total\s+Dana\s+Diterima/i.test(text);
 const confirmed=digitalReceipt||/(?:pembayaran\s+(?:telah\s+)?(?:berhasil|diterima)|payment\s+(?:received|successful)|invoice[^\n]{0,120}(?:telah dibayar|lunas))/i.test(subject)&&/(?:pembayaran\s+(?:telah\s+)?(?:berhasil|diterima)|status\s*[:：]?\s*(?:lunas|paid|successful)|telah\s+(?:dibayar|lunas))/i.test(text);
 const bad=/(?:belum\s+(?:lunas|dibayar)|pembayaran\s+(?:gagal|sebagian)|partial\s+payment|refund|pengembalian\s+dana|dibatalkan)/i.test(full);
 const currency=/\b(?:USD|SGD|MYR|EUR)\b/.test(full)?'UNKNOWN':'IDR';
 const transactionIds=[...new Set([...text.matchAll(/(?:id\s+(?:transaksi|pembayaran)|transaction\s+id|payment\s+id|no\.\s*referensi)\s*[:：]?\s*([a-z0-9_.:-]{4,160})/gi)].map(m=>m[1]))];
 const subjectTransaction=digitalReceipt?subject.match(/Reference\s+No\.\s*([a-z0-9_.:-]{4,160})/i)?.[1]:'';
 if(subjectTransaction&&!transactionIds.includes(subjectTransaction))transactionIds.push(subjectTransaction);
 const transactionId=transactionIds.length===1?transactionIds[0]:'';
 const customer=text.match(/^(?:nama\s+(?:pembayar|partner)|customer|pelanggan)\s*[:：]?\s*([^\n]{1,200})/im)?.[1]?.trim()||'';
 const success=confirmed&&!bad&&refs.length===1&&amounts.length===1&&currency==='IDR'&&transactionIds.length<=1;
 return {reference:refs.length===1?refs[0]:'',amount:amounts.length===1?amounts[0]:0,currency,transactionId,customer,success,reason:success?'Format konfirmasi pembayaran dikenali.':'Format konfirmasi, referensi, nominal atau status pembayaran belum dapat dipastikan; periksa email asli.'};
}
