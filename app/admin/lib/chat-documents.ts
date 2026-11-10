export const CHAT_DOCUMENT_LIMIT=100_000_000;
export const DOCUMENT_TYPES:Record<string,string>={
 pdf:'application/pdf',doc:'application/msword',
 docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
 xls:'application/vnd.ms-excel',xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
 ppt:'application/vnd.ms-powerpoint',pptx:'application/vnd.openxmlformats-officedocument.presentationml.presentation',
 txt:'text/plain',csv:'text/csv',rtf:'application/rtf',
};
export const CHAT_DOCUMENT_ACCEPT=Object.keys(DOCUMENT_TYPES).map(ext=>'.'+ext).join(',');
export function documentMime(name:string):string {
 const ext=name.split('.').at(-1)?.toLowerCase()||'';
 const mime=Object.hasOwn(DOCUMENT_TYPES,ext)?DOCUMENT_TYPES[ext]:undefined;
 if(!mime)throw Error('Pilih PDF, Word, Excel, PowerPoint, TXT, CSV, atau RTF. Untuk Google Docs, unduh sebagai PDF atau DOCX dahulu.');
 return mime;
}
export function documentName(name:string):string {
 const safe=name.replace(/[\\/\x00-\x1f\x7f]/g,'').trim();
 if(!safe||safe.length>180)throw Error('Nama file harus berisi 1–180 karakter.');
 return safe;
}
function zipContains(bytes:Uint8Array,entry:string):boolean {
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 for(let end=bytes.length-22;end>=Math.max(0,bytes.length-65557);end--){
  if(view.getUint32(end,true)!==0x06054b50||end+22+view.getUint16(end+20,true)!==bytes.length)continue;
  let pos=view.getUint32(end+16,true);const count=view.getUint16(end+10,true);
  for(let i=0;i<count;i++){
   if(pos+46>end||view.getUint32(pos,true)!==0x02014b50)return false;
   const length=view.getUint16(pos+28,true),next=pos+46+length+view.getUint16(pos+30,true)+view.getUint16(pos+32,true);
   if(next>end)return false;
   if(new TextDecoder().decode(bytes.subarray(pos+46,pos+46+length))===entry)return true;
   pos=next;
  }
  return false;
 }
 return false;
}
export function validateChatDocument(originalName:string,bytes:Uint8Array){
 const name=documentName(originalName),mime=documentMime(name),ext=name.split('.').at(-1)!.toLowerCase();
 if(!bytes.length||bytes.length>CHAT_DOCUMENT_LIMIT)throw Error('File harus berukuran 1 byte–100 MB.');
 const starts=(values:number[])=>values.every((v,i)=>bytes[i]===v);
 const head=new TextDecoder().decode(bytes.subarray(0,8));
 let valid=false;
 if(ext==='pdf')valid=head.startsWith('%PDF-');
 else if(['doc','xls','ppt'].includes(ext))valid=starts([0xd0,0xcf,0x11,0xe0,0xa1,0xb1,0x1a,0xe1]);
 else if(['docx','xlsx','pptx'].includes(ext)){
  const entry={docx:'word/document.xml',xlsx:'xl/workbook.xml',pptx:'ppt/presentation.xml'}[ext]!;
  valid=starts([80,75,3,4])&&zipContains(bytes,'[Content_Types].xml')&&zipContains(bytes,entry);
 }else if(ext==='rtf')valid=head.startsWith('{\\rtf');
 else valid=starts([255,254])||starts([254,255])||!bytes.includes(0);
 if(!valid)throw Error('Isi file tidak sesuai dengan formatnya. Pilih dokumen asli.');
 return {name,mime,size:bytes.length};
}
