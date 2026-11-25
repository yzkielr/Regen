'use client';
import {useEffect,useRef,useState} from 'react';
import {Play} from 'lucide-react';
import {adminFetch} from './admin-client';
import {Card} from './operations-components';
import {ResizableTextarea} from './resizable-textarea';

type Result={id:string;question:string;status:'queued'|'running'|'complete'|'failed';error?:string;source?:string;messages?:{text:string;source?:string;image?:{fileId:string;mime:string}}[]};
const path='/admin/api/service/bot-preview',savedKey='regen-bot-preview';
function ReplyText({text}:{text:string}){return <>{text.split(/(https?:\/\/[^\s<>]+)/g).map((part,i)=>/^https?:\/\//.test(part)?<a key={i} href={part} target="_blank" rel="noopener noreferrer">{part}</a>:part)}</>;}
export default function BotTester(){
 const [question,setQuestion]=useState('Minta COA tirzepatide'),[result,setResult]=useState<Result|null>(null),[error,setError]=useState(''),[starting,setStarting]=useState(false),[pending,setPending]=useState('');
 const submitting=useRef(false);
 useEffect(()=>{try{const id=sessionStorage.getItem(savedKey);if(id)setPending(id);}catch{}},[]);
 useEffect(()=>{
  if(!pending)return;
  let closed=false,timer:ReturnType<typeof setTimeout>;const controller=new AbortController();let failures=0;
  const poll=async()=>{
   try{
    const response=await adminFetch(`${path}?id=${encodeURIComponent(pending)}`,{signal:controller.signal}),data=await response.json() as Result;
    if(!response.ok)throw Error(data.error||'Hasil uji belum dapat dimuat.');
    if(closed)return;failures=0;setResult(data);setError('');
    if(['complete','failed'].includes(data.status)){setPending('');try{sessionStorage.removeItem(savedKey);}catch{}return;}
   }catch(e){if(closed)return;failures++;setError(e instanceof Error?e.message:'Koneksi pengujian terputus.');if(failures>=5){setPending('');return;}}
   if(!closed)timer=setTimeout(poll,3000);
  };
  void poll();return()=>{closed=true;clearTimeout(timer);controller.abort();};
 },[pending]);
 async function start(){
  if(submitting.current||pending)return;submitting.current=true;setStarting(true);setError('');setResult(null);
  const id='preview-'+crypto.randomUUID();
  try{
   const response=await adminFetch(path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id,question})}),data=await response.json() as Result;
   if(!response.ok)throw Error(data.error||'Pengujian belum dapat dimulai.');
   setResult(data);setPending(id);try{sessionStorage.setItem(savedKey,id);}catch{}
  }catch(e){setError(e instanceof Error?e.message:'Pengujian gagal.');}finally{submitting.current=false;setStarting(false);}
 }
 const busy=starting||!!pending;
 return <Card title="Uji jawaban & eskalasi">
  <form onSubmit={e=>{e.preventDefault();void start();}} className="ops-test-form">
   <label className="ops-field"><span>Pesan pelanggan</span><ResizableTextarea required rows={3} maxLength={4000} value={question} disabled={busy} onChange={e=>setQuestion(e.target.value)}/></label>
   <button className="button primary" disabled={busy}><Play size={14}/>{busy?'Memproses jawaban…':'Uji jawaban'}</button>
  </form>
  <p className="ops-muted">Menguji alur bot aktif dengan instruksi dan knowledge terbaru. Setiap uji dimulai sebagai percakapan baru; tidak mengirim pesan ke WhatsApp.</p>
  <div aria-live="polite">
   {busy&&<p className="ops-muted">{result?.status==='running'?'Bot sedang membaca sumber dan menyusun jawaban.':'Menunggu pengujian dimulai…'}</p>}
   {(error||result?.error)&&<p role="alert" className="ops-error">{error||result?.error}</p>}
   {result?.status==='complete'&&<div className="bot-test-result"><span className="ops-chip">Hasil bot aktif</span><small style={{display:'block',marginTop:8}}>Pesan uji: {result.question}</small>
    {result.messages?.map((m,i)=><div key={i} style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere',border:'1px solid var(--ops-border, #d9e3f2)',borderRadius:12,padding:14,marginTop:12}}>{m.text&&<ReplyText text={m.text}/>}{m.image&&<a href={`/admin/api/files?id=${encodeURIComponent(m.image.fileId)}&inline=1`} target="_blank" rel="noopener noreferrer">Lihat foto yang disiapkan bot</a>}</div>)}
    <small style={{display:'block',marginTop:12}}>Sumber: {result.source}</small>
   </div>}
  </div>
 </Card>;
}
