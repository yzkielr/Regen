'use client';
import {useState} from 'react';
import {Minus,Plus} from 'lucide-react';
import type {Entry,Operations} from '../lib/operations';
import {Modal} from './operations-components';
import type {ModuleProps} from './operations-components';

export default function StockAdjustment({product,state,act,busy,onClose}:{product:Entry;state:Operations;act:ModuleProps['act'];busy:boolean;onClose:()=>void}){
 const initial=Number(product.stock),[value,setValue]=useState(String(initial)),[reason,setReason]=useState('');
 const current=state.records.products.find(p=>p.id===product.id),latest=Number(current?.stock),changed=!current||latest!==initial;
 const target=value.trim()===''?NaN:Number(value),valid=Number.isSafeInteger(target)&&target>=0&&target<=1000000,delta=target-initial;
 const step=(n:number)=>setValue(String(Math.max(0,Math.min(1000000,(valid?target:initial)+n))));
 return <Modal title={`Mutasi stok · ${product.name}`} onClose={onClose}><form className="ops-form" onSubmit={async e=>{e.preventDefault();if(valid&&delta&&!changed&&await act({type:'stock',id:product.id,quantity:delta,expectedStock:initial,reason}))onClose();}}>
  <p>Stok sekarang: <strong>{Number.isFinite(latest)?latest:'Produk tidak tersedia'}</strong></p>
  {changed&&<div className="ops-error" role="alert">Stok berubah saat formulir dibuka. Tutup lalu buka Mutasi kembali agar perubahan pesanan lain tetap tercatat.</div>}
  <label className="ops-field" htmlFor="stock-final"><span>Stok akhir</span></label>
  <div style={{display:'grid',gridTemplateColumns:'52px minmax(0,1fr) 52px',gap:12,alignItems:'stretch'}}>
   <button type="button" className="button" aria-label="Kurangi stok 1" disabled={busy||changed||valid&&target===0} onClick={()=>step(-1)}><Minus size={20}/></button>
   <input id="stock-final" aria-label="Stok akhir" type="number" inputMode="numeric" min={0} max={1000000} step={1} required value={value} disabled={busy||changed} onChange={e=>setValue(e.target.value)} style={{minWidth:0,width:'100%',minHeight:52,fontSize:24,textAlign:'center',border:'1px solid #cbd7ed',borderRadius:8}}/>
   <button type="button" className="button" aria-label="Tambah stok 1" disabled={busy||changed||valid&&target===1000000} onClick={()=>step(1)}><Plus size={20}/></button>
  </div>
  <p aria-live="polite">{valid?delta===0?'Stok belum berubah.':`${initial} → ${target} · ${delta>0?'Ditambah':'Dikurangi'} ${Math.abs(delta)} unit`:'Masukkan stok akhir berupa bilangan bulat mulai dari 0.'}</p>
  <label className="ops-field"><span>Alasan perubahan</span><input required maxLength={300} value={reason} disabled={busy} placeholder="Contoh: stok masuk, barang rusak, atau koreksi hasil hitung" onChange={e=>setReason(e.target.value)}/></label>
  <footer><button type="button" className="button" onClick={onClose} disabled={busy}>Batal</button><button className="button primary" disabled={busy||changed||!valid||delta===0||!reason.trim()}>{busy?'Menyimpan…':'Simpan mutasi'}</button></footer>
 </form></Modal>;
}
