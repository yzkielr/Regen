import type {Conversation,ServiceMessage} from './service-types.ts';
export const CHAT_PHOTO_LIMIT=3_800_000;

// Match the existing Admin inbox: actual messages determine activity, not
// receipt updates, AI mode changes or the order returned by the server.
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
