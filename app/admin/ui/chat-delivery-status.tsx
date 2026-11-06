import {Check,CheckCheck} from 'lucide-react';

// Delivery receipts come from WhatsApp. Never infer delivery/read from time,
// a successful upload, or the fact that a reply has been queued.
export function ChatDeliveryStatus({status,label}:{status:string;label:string}){
 if(status!=='sent'&&status!=='delivered'&&status!=='read')return <span className={`svc-badge ${status}`}>{label}</span>;
 const description=status==='sent'?'Sudah dikirim; menunggu sampai ke penerima':status==='delivered'?'Sudah sampai ke penerima':'Sudah dibaca';
 const Icon=status==='sent'?Check:CheckCheck;
 return <span className={`svc-chat-receipt ${status}`} role="img" aria-label={description} title={description} style={{display:'inline-flex',alignItems:'center',color:status==='read'?'#168bd2':'#64748b',flexShrink:0}}><Icon size={17} strokeWidth={2} aria-hidden="true"/></span>;
}
