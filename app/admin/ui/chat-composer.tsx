'use client';
import {adminFetch} from './admin-client';
import {useEffect,useRef,useState} from 'react';
import {FileText,ImagePlus,Paperclip,Send,Video,X} from 'lucide-react';
import {uploadChatAttachment} from '../lib/chat-upload-client';
import {ResizableTextarea} from './resizable-textarea';
import type {Conversation,ServiceAction} from '../lib/service-types';
import {CHAT_VIDEO_LIMIT,videoName} from '../lib/chat-videos';
import {CHAT_PHOTO_LIMIT} from '../lib/chat-media';
import {CHAT_DOCUMENT_ACCEPT,CHAT_DOCUMENT_LIMIT,documentMime,documentName} from '../lib/chat-documents';
type Props={chat:Conversation;text:string;setText:(v:string)=>void;corrects:string;setCorrects:(v:string)=>void;busy:boolean;ready:boolean;run:(a:ServiceAction)=>Promise<boolean>};
export function ChatComposer({chat,text,setText,corrects,setCorrects,busy,ready,run}:Props){
 const [file,setFile]=useState<File|null>(null),[kind,setKind]=useState<'image'|'document'|'video'>('image'),[preview,setPreview]=useState(''),[sending,setSending]=useState(false),[error,setError]=useState(''),[uploadProgress,setUploadProgress]=useState<number|null>(null);
 const uploaded=useRef<{file:File;id:string}|null>(null),photoPicker=useRef<HTMLInputElement>(null),filePicker=useRef<HTMLInputElement>(null),videoPicker=useRef<HTMLInputElement>(null),alive=useRef(true),lock=useRef(false);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
 useEffect(()=>{if(!file||!['image','video'].includes(kind)){setPreview('');return;}const url=URL.createObjectURL(file);setPreview(url);return()=>URL.revokeObjectURL(url);},[file,kind]);
 const canAttach=chat.transport==='waha'&&!chat.test;
 function choose(selected:File|undefined,type:'image'|'document'|'video'){
  setError('');if(!selected)return;
  try{
   if(type==='image'){
    if(!['image/png','image/jpeg','image/webp'].includes(selected.type)||!selected.size||selected.size>CHAT_PHOTO_LIMIT)throw Error('Pilih foto PNG, JPG, atau WEBP maksimal 100 MB.');
   }else if(type==='video'){
    videoName(selected.name);if(!selected.size||selected.size>CHAT_VIDEO_LIMIT)throw Error('Pilih video MP4 maksimal 100 MB.');
   }else{
    documentMime(documentName(selected.name));
    if(!selected.size||selected.size>CHAT_DOCUMENT_LIMIT)throw Error('File harus berukuran 1 byte–100 MB.');
   }
   uploaded.current=null;setKind(type);setFile(selected);
  }catch(e){setError(e instanceof Error?e.message:'File tidak valid.');}
 }
 function clearFile(){setFile(null);uploaded.current=null;}
 async function submit(){
  if(lock.current||busy||(!text.trim()&&!file)||file&&text.length>900)return;lock.current=true;setSending(true);setError('');setUploadProgress(null);
  try{
   let media:Record<string,unknown>={};
   if(file){
    if(uploaded.current?.file!==file){
     const id=await uploadChatAttachment(file,kind,adminFetch,setUploadProgress);
     uploaded.current={file,id};
    }
    media=kind==='image'?{image:{fileId:uploaded.current!.id}}:{attachment:{fileId:uploaded.current!.id,kind}};
   }
   const ok=await run({kind:'reply',conversationId:chat.id,text,corrects:corrects||undefined,...media});
   if(ok&&alive.current){setText('');setCorrects('');clearFile();}
  }catch(e){if(alive.current)setError(e instanceof Error?e.message:'Pengiriman gagal. Silakan ulangi.');}
  finally{lock.current=false;if(alive.current)setSending(false);}
 }
 return <form className="svc-composer" onSubmit={e=>{e.preventDefault();void submit();}}>
  {corrects&&<div className="svc-correction">Koreksi akan menjadi pesan baru; riwayat asli tetap tersimpan.<button type="button" className="icon-button" onClick={()=>setCorrects('')} aria-label="Batal koreksi"><X size={14}/></button></div>}
  {file&&<div style={{display:'flex',gap:12,alignItems:'center',padding:8,border:'1px solid #d8e2f2',borderRadius:8}}>
   {kind==='image'&&preview?<img src={preview} alt="Foto yang akan dikirim" style={{width:90,height:90,objectFit:'contain',borderRadius:6}}/>:kind==='video'&&preview?<video src={preview} controls playsInline preload="metadata" aria-label="Video yang akan dikirim" style={{width:160,maxHeight:120}}/>:<FileText size={32} aria-hidden="true"/>}
   <span style={{overflowWrap:'anywhere',flex:1}}>{file.name}<small style={{display:'block'}}>{(file.size/1000000).toFixed(2)} MB · {kind==='document'?'Dikirim sebagai file asli':kind==='video'?'Dikirim sebagai video':'Dikirim sebagai foto'}</small></span>
   <button type="button" className="icon-button" disabled={sending||busy} aria-label="Hapus lampiran dari balasan" onClick={clearFile}><X size={18}/></button>
  </div>}
  {error&&<p role="alert" style={{color:'#b42318'}}>{error}</p>}
  {file&&text.length>900&&<p role="alert" style={{color:'#b42318'}}>Keterangan lampiran maksimal 900 karakter.</p>}
  <ResizableTextarea compact aria-label={file?'Keterangan lampiran':'Balasan admin'} rows={2} placeholder={file?'Keterangan lampiran (boleh kosong)':'Tulis balasan admin… AI akan dijeda untuk chat ini.'} required={!file} maxLength={file?900:4000} disabled={busy||sending} value={text} onChange={e=>setText(e.target.value)}/>
  <div style={{flexWrap:'wrap',gap:8}}>
   {canAttach&&<>
    <input ref={photoPicker} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={e=>{choose(e.target.files?.[0],'image');e.target.value='';}}/>
    <input ref={filePicker} type="file" accept={CHAT_DOCUMENT_ACCEPT} hidden onChange={e=>{choose(e.target.files?.[0],'document');e.target.value='';}}/>
    <input ref={videoPicker} type="file" accept="video/mp4,.mp4" hidden onChange={e=>{choose(e.target.files?.[0],'video');e.target.value='';}}/>
    <button type="button" className="button" disabled={busy||sending} title="Video MP4 maksimal 100 MB." onClick={()=>videoPicker.current?.click()}><Video size={16}/>Tambah video</button>
    <button type="button" className="button" disabled={busy||sending} onClick={()=>photoPicker.current?.click()}><ImagePlus size={16}/>Tambah foto</button>
    <button type="button" className="button" disabled={busy||sending} title="PDF, Word, Excel, PowerPoint, TXT, CSV, RTF. Maksimal 100 MB." onClick={()=>filePicker.current?.click()}><Paperclip size={16}/>Tambah file</button>
   </>}
   <span style={{flex:1}}>{file?(kind==='video'?'Video MP4 maksimal 100 MB.':'Maksimal 100 MB per lampiran.'):chat.test?'Balasan disimpan sebagai simulasi.':ready?'Balasan dikirim melalui WhatsApp.':'Balasan masuk antrean WhatsApp.'}</span>
   <button className="button primary" disabled={busy||sending||(!text.trim()&&!file)||!!file&&text.length>900}><Send size={14}/>{sending?(uploadProgress!==null&&uploadProgress<100?'Mengunggah '+uploadProgress+'%':'Memproses…'):file?kind==='document'?'Kirim file':kind==='video'?'Kirim video':'Kirim foto':chat.test?'Balas di simulasi':'Kirim ke buyer'}</button>
  </div>
 </form>;
}
