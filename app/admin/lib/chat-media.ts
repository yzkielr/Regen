import type {ChatAttachment,Conversation,ServiceMessage} from './service-types.ts';
export const CHAT_PHOTO_LIMIT=3_800_000;
export const CHAT_ATTACHMENT_LIMIT=25*1024*1024;
export function attachmentMetadata(value:unknown):ChatAttachment {
 const v=value&&typeof value==='object'?value as Record<string,unknown>:{};
 const mime=typeof v.mime==='string'&&/^[a-z0-9.+-]+\/[a-z0-9.+-]+$/i.test(v.mime)?v.mime.toLowerCase():'application/octet-stream';
 const kind=mime.startsWith('image/')?'image':mime.startsWith('video/')?'video':mime.startsWith('audio/')?'audio':'document';
 const name=typeof v.name==='string'?v.name.replace(/[\\/\r\n\x00-\x1f]/g,'').slice(0,180):'';
 return {kind,mime,name:name||({image:'Foto',video:'Video',audio:'Audio',document:'Lampiran'}[kind]),status:'pending'};
}
export function latestChatMessage(c:Conversation):ServiceMessage|undefined {
 return c.messages.filter(m=>m.role!=='note'&&!['draft','cancelled'].includes(m.status)).reduce<ServiceMessage|undefined>((last,m)=>!last||m.at>=last.at?m:last,undefined);
}
export function sortedConversations(chats:Conversation[]):Conversation[]{
 return [...chats].sort((a,b)=>(latestChatMessage(b)?.at||b.createdAt)-(latestChatMessage(a)?.at||a.createdAt)||a.id.localeCompare(b.id));
}
export function messagePreview(m?:ServiceMessage):string {
 if(!m)return 'Belum ada pesan';
 if(m.text&&m.text!=='[Lampiran WhatsApp]')return m.text;
 return m.attachment?({image:'Foto',video:'Video',audio:'Audio',document:m.attachment.name}[m.attachment.kind]):m.image?'Foto':m.text||'Pesan';
}
export function byteRange(header:string|null,size:number):{offset:number;length:number}|null {
 if(!header)return null;
 const match=/^bytes=(\d*)-(\d*)$/.exec(header);
 if(!match||(!match[1]&&!match[2]))throw Error('Range tidak valid.');
 let start=match[1]?Number(match[1]):Math.max(0,size-Number(match[2]));
 let end=match[1]?(match[2]?Number(match[2]):size-1):size-1;
 if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||start>=size||end<start||(!match[1]&&Number(match[2])===0))throw Error('Range tidak valid.');
 end=Math.min(end,size-1);return {offset:start,length:end-start+1};
}
