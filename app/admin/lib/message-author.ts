import type {ServiceMessage} from './service-types';
export function messageAuthor(m:ServiceMessage,buyer='Buyer'){
 if(m.role==='customer')return buyer;
 if(m.role==='owner')return `Owner${m.authorName?' · '+m.authorName:''}`;
 if(m.role==='admin')return `Admin${m.authorName?' · '+m.authorName:''}${m.purpose==='invoice'?' · Invoice':''}`;
 if(m.role==='bot')return 'Bot · AI Regen';
 return 'Catatan internal';
}
