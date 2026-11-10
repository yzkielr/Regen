export const MANUAL_ATTACHMENT_LIMIT=100_000_000;
export async function uploadChatAttachment(file:File,kind:'image'|'video'|'document',request:typeof fetch,onProgress:(percent:number)=>void,endpoint='/admin/api/files'){
 let id='';
 async function post(query:string,body:BodyInit,json=false){
  const response=await request(endpoint+'?upload='+query,{method:'POST',body,headers:json?{'Content-Type':'application/json'}:{'Content-Type':'application/octet-stream'},signal:AbortSignal.timeout(180000)});
  let result:any;try{result=await response.json();}catch{throw Error('Unggahan belum berhasil. Silakan coba lagi.');}
  if(!response.ok)throw Error(result.error||'Lampiran gagal diunggah.');return result;
 }
 if(file.size<1||file.size>MANUAL_ATTACHMENT_LIMIT)throw Error('Maksimal 100 MB per lampiran.');
 try{
  const start=await post('start',JSON.stringify({name:file.name,size:file.size,mime:file.type,kind}),true);id=start.upload;
  const chunk=Number(start.partSize);if(typeof id!=='string'||!Number.isInteger(chunk)||chunk<1||chunk>8*1024*1024)throw Error('Unggahan tidak valid.');
  const parts=[];onProgress(0);
  for(let offset=0;offset<file.size;offset+=chunk){
   const part=parts.length+1,end=Math.min(file.size,offset+chunk);let value:any;
   for(let attempt=0;attempt<3;attempt++){
    try{value=await post('part&id='+encodeURIComponent(id)+'&part='+part,file.slice(offset,end));break;}
    catch(e){if(attempt===2)throw e;await new Promise(resolve=>setTimeout(resolve,1000*(attempt+1)));}
   }
   if(value.partNumber!==part||typeof value.etag!=='string')throw Error('Bagian unggahan tidak valid.');parts.push(value);onProgress(Math.floor(end/file.size*95));
  }
  let result:any;
  for(let attempt=0;attempt<2;attempt++){try{result=await post('complete&id='+encodeURIComponent(id),JSON.stringify({parts}),true);break;}catch(e){if(attempt)throw e;}}
  if(!result.id)throw Error('Lampiran gagal disimpan.');onProgress(100);id='';return result.id as string;
 }finally{if(id)await post('abort&id='+encodeURIComponent(id),'').catch(()=>{});}
}
