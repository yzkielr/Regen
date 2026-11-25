import {adminBackendHeaders,adminBackendOrigin} from '@/lib/admin-gateway';
export const runtime='nodejs';export const dynamic='force-dynamic';
const headers={'Cache-Control':'private, no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow, noarchive'};
async function serve(request:Request,{params}:{params:Promise<{ticket:string;name:string}>}){
 const {ticket,name}=await params;
 if(ticket.length>1200||! /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]{43}$/.test(ticket)||! /\.xlsx$/i.test(name))return new Response('Tautan file tidak valid.',{status:400,headers});
 try{
  // The backend validates the ticket signature, expiry and file ownership.
  // No session cookie or arbitrary upstream URL is accepted by this gateway.
  const response=await fetch(adminBackendOrigin()+'/api/files/office?ticket='+encodeURIComponent(ticket),{method:request.method,headers:adminBackendHeaders(),redirect:'manual',cache:'no-store',signal:AbortSignal.timeout(30000)});
  if(response.status>=300&&response.status<400)return new Response('File belum dapat dibuka.',{status:503,headers});
  const out=new Headers(headers);for(const key of ['content-type','content-length','content-disposition']){const value=response.headers.get(key);if(value)out.set(key,value);}
  return new Response(request.method==='HEAD'?null:response.body,{status:response.status,headers:out});
 }catch{return new Response('File belum dapat dibuka. Coba kembali dari Media Library.',{status:503,headers});}
}
export const GET=serve;export const HEAD=serve;
