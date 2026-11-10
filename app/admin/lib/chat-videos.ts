import {documentName} from './chat-documents';
export const CHAT_VIDEO_LIMIT=100_000_000;
export function videoName(name:string){
 const safe=documentName(name);
 if(!/\.mp4$/i.test(safe))throw Error('Pilih video MP4 maksimal 100 MB.');
 return safe;
}
export function validateChatVideo(name:string,bytes:Uint8Array){
 const safe=videoName(name);
 if(bytes.length<24||bytes.length>CHAT_VIDEO_LIMIT)throw Error('Pilih video MP4 maksimal 100 MB.');
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 const size=view.getUint32(0),type=new TextDecoder().decode(bytes.subarray(4,8));
 if(type!=='ftyp'||size<16||size>bytes.length)throw Error('Isi file tidak sesuai dengan format MP4.');
 return {name:safe,mime:'video/mp4',size:bytes.length};
}
