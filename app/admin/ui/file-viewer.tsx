'use client';
import {adminFetch} from './admin-client';
import {useEffect,useState} from 'react';
import {Download,FileText,ArrowLeft,ExternalLink} from 'lucide-react';
import type {PreviewSheet} from '../lib/file-preview';
import {columnLabel} from '../lib/file-preview';

export default function FileViewer({id,source}:{id:string;source:string}){
 const [name,setName]=useState('Dokumen'),[url,setUrl]=useState(''),[kind,setKind]=useState(''),[html,setHtml]=useState(''),[sheets,setSheets]=useState<PreviewSheet[]>([]),[sheet,setSheet]=useState(0),[text,setText]=useState(''),[loading,setLoading]=useState(true),[error,setError]=useState('');
 const endpoint=source?`/admin/api/knowledge/source?id=${encodeURIComponent(source)}`:`/admin/api/files?id=${encodeURIComponent(id)}`;
 useEffect(()=>{
  const abort=new AbortController();let alive=true,objectUrl='';
  setLoading(true);setError('');setHtml('');setSheets([]);setText('');setUrl('');
  void (async()=>{try{
   if(!/^[\w-]{1,100}$/.test(source||id))throw Error('File tidak valid.');
   const response=await adminFetch(endpoint,{cache:'no-store',signal:abort.signal});
   if(!response.ok){const result=await response.json() as {error?:string};throw Error(result.error||'File belum dapat dibuka.');}
   const disposition=response.headers.get('content-disposition')||'',encoded=disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
   let fileName='Dokumen';try{fileName=encoded?decodeURIComponent(encoded):disposition.match(/filename="([^"]+)"/i)?.[1]||fileName;}catch{}
   const blob=await response.blob();if(blob.size>10_000_000)throw Error('File terlalu besar untuk pratinjau. Gunakan Unduh file asli.');
   if(!alive)return;objectUrl=URL.createObjectURL(blob);setUrl(objectUrl);setName(fileName);const ext=fileName.split('.').at(-1)?.toLowerCase()||'';setKind(ext);
   if(ext==='xlsx'||ext==='docx'){
    const bytes=new Uint8Array(await blob.arrayBuffer()),preview=await import('../lib/file-preview');
    if(ext==='xlsx'){const result=await preview.spreadsheetPreview(bytes);if(alive){setSheets(result);setSheet(Math.max(0,result.findIndex(s=>s.name==='idr pricing v2')));}}
    else {const result=await preview.wordPreview(bytes);if(alive)setHtml(result);}
   }else if(['txt','csv','json'].includes(ext)){const value=await blob.text();if(alive)setText(value.slice(0,500000));}
   else if(ext!=='pdf'&&!['png','jpg','jpeg','webp','gif'].includes(ext))throw Error('Format ini belum memiliki pratinjau. Unduh file asli untuk membuka di aplikasinya.');
  }catch(e){if(alive)setError(e instanceof Error?e.message:'File belum dapat dibuka.');}finally{if(alive)setLoading(false);}})();
  return ()=>{alive=false;abort.abort();if(objectUrl)URL.revokeObjectURL(objectUrl);};
 },[endpoint,id,source]);
 const current=sheets[sheet];
 return <main className="file-viewer"><header className="file-viewer-header"><div><a href="/admin/#knowledge"><ArrowLeft size={16}/>Kembali ke knowledge</a><h1><FileText size={24}/>{name}</h1><p>Pratinjau file sumber · hanya baca</p></div><a className="file-viewer-download" href={url||endpoint} download={url?name:undefined}><Download size={16}/>Unduh file asli</a></header>
 {loading&&<p className="file-viewer-status" role="status">Membuka file…</p>}{error&&<p className="file-viewer-status file-viewer-error" role="alert">{error}</p>}
 {url&&kind==='pdf'&&<object className="file-viewer-frame" data={url} type="application/pdf" aria-label={name}><a href={url} target="_blank" rel="noreferrer">Buka PDF asli <ExternalLink size={14}/></a></object>}
 {html&&<><p className="file-viewer-note">Pratinjau Word menampilkan isi dan tata letak dokumen. Beberapa fitur khusus Word dapat berbeda; file unduhan tetap file asli.</p><iframe className="file-viewer-frame" title={name} sandbox="" srcDoc={html}/></>}
 {!!sheets.length&&<><p className="file-viewer-note">Pilih sheet untuk melihat isinya. Nilai rumus memakai hasil terakhir yang tersimpan. Grafik, gambar, dan fitur khusus Excel dapat berbeda; file unduhan tetap file asli.</p><div className="file-sheet-tabs" role="tablist" aria-label="Sheet workbook">{sheets.map((s,i)=><button key={i} type="button" role="tab" aria-selected={i===sheet} aria-controls="file-sheet-panel" id={`file-sheet-tab-${i}`} onClick={()=>setSheet(i)}>{s.name}</button>)}</div>{current&&<><div id="file-sheet-panel" role="tabpanel" aria-labelledby={`file-sheet-tab-${sheet}`} className="file-sheet-scroll"><table className="file-sheet" style={{width:45+current.widths.reduce((sum,width)=>sum+width,0)}}><colgroup><col style={{width:45}}/>{current.widths.map((w,i)=><col key={i} style={{width:w}}/>)}</colgroup><thead><tr><th></th>{current.widths.map((_,i)=><th key={i}>{columnLabel(i)}</th>)}</tr></thead><tbody>{current.rows.map((row,r)=><tr key={r} style={{height:current.heights[r]}}><th>{r+1}</th>{row.map((cell,c)=>cell.skip?null:<td key={c} style={cell.style} rowSpan={cell.rowSpan} colSpan={cell.colSpan}>{cell.text}</td>)}</tr>)}</tbody></table></div>{current.truncated&&<p className="file-viewer-note">Pratinjau dibatasi 200 baris × 60 kolom. Unduh file asli untuk membuka seluruh {current.rowCount} baris dan {current.columnCount} kolom.</p>}</>}</>}
 {text&&<pre className="file-text-preview">{text}</pre>}{url&&['png','jpg','jpeg','webp','gif'].includes(kind)&&<img className="file-image-preview" src={url} alt={name}/>}
 </main>;
}
