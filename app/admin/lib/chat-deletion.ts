import type {Operations} from './operations';

// Remove history, not the customer or business records. A tiny per-contact
// cutoff prevents delayed provider events from recreating the erased history.
export function deleteConversation(s:Operations,id:string,now:number,confirmed:boolean){
 if(!confirmed)throw Error('Konfirmasi penghapusan percakapan diperlukan.');
 const sv=s.service!,c=sv.conversations.find(c=>c.id===id);
 if(!c)return;
 const ticketIds=new Set((sv.ownerTickets||[]).filter(t=>t.conversationId===id).map(t=>t.id));
 const related=(j:typeof sv.jobs[number])=>j.conversationId===id||!!j.ownerTicketId&&ticketIds.has(j.ownerTicketId);
 if(sv.jobs.some(j=>related(j)&&j.status==='sending'))throw Error('Ada pesan sedang dikirim. Tunggu sebentar lalu hapus kembali.');
 const contact=s.records.contacts.find(v=>v.id===c.contactId);
 if(contact)contact[c.test?'testChatDeletedAt':'chatDeletedAt']=now;
 sv.jobs=sv.jobs.filter(j=>{
  if(!related(j))return true;
  if(!j.orderId)return false;
  // Invoice/payment delivery records remain attached to the order. Pending
  // messages must be explicitly re-queued once a new conversation exists.
  if(['queued','blocked'].includes(j.status)){j.status='blocked';j.reason='Riwayat chat dihapus. Kirim ulang invoice dari Order & Invoice setelah buyer chat kembali.';j.updatedAt=now;}
  delete j.conversationId;delete j.messageId;return true;
 });
 sv.ownerTickets=sv.ownerTickets?.filter(t=>!ticketIds.has(t.id));
 for(const o of s.records.orders)if(o.conversationId===id)delete o.conversationId;
 sv.conversations=sv.conversations.filter(c=>c.id!==id);
}
