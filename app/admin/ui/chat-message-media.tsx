'use client';
import {useState} from 'react';
import {FileText,Download} from 'lucide-react';
import type {ServiceMessage} from '../lib/service-types';
export function ChatMessageMedia({message:m,conversationId}:{message:ServiceMessage;conversationId:string}){
 const [failed,setFailed]=useState(false),a=m.attachment;
 if(!a&&!m.image)return null;
 const fileId=a?.fileId||m.image?.fileId;
 const url=fileId?`/admin/api/files?id=${encodeURIComponent(fileId)}&inline=1`:`/admin/api/files?conversation=${encodeURIComponent(conversationId)}&message=${encodeURIComponent(m.id)}`;
 const download=fileId?`/admin/api/files?id=${encodeURIComponent(fileId)}`:url;
 const name=a?.name||'Foto WhatsApp',kind=a?.kind||'image';
 if(a?.status==='pending')return <p role="status">Lampiran sedang diunduh…</p>;
 if(a?.status==='unavailable')return <p>Lampiran belum tersedia. {a.error||'Buka dari WhatsApp.'}</p>;
 return <div style={{display:'grid',gap:8,maxWidth:'100%'}}>
  {kind==='image'&&!failed&&<a href={url} target="_blank" rel="noopener noreferrer" className="svc-photo"><img src={url} alt={name} loading="lazy" onError={()=>setFailed(true)}/></a>}
  {kind==='video'&&!failed&&<video src={url} controls preload="metadata" style={{maxWidth:'100%',width:420,maxHeight:360,borderRadius:8}} onError={()=>setFailed(true)}/>}
  {kind==='audio'&&!failed&&<audio src={url} controls preload="metadata" style={{maxWidth:'100%'}} onError={()=>setFailed(true)}/>}
  {kind==='document'&&<div><FileText size={20}/> {name}</div>}
  {failed&&<small>Pratinjau tidak tersedia. Anda tetap dapat mengunduh lampiran.</small>}
  <a href={download} target="_blank" rel="noopener noreferrer" style={{display:'inline-flex',gap:6,alignItems:'center',overflowWrap:'anywhere'}}><Download size={14}/>Unduh {name}{a?.size?` (${(a.size/1024/1024).toFixed(1)} MB)`:''}</a>
 </div>;
}
