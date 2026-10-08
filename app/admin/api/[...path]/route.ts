import { NextRequest } from 'next/server';
import { adminBackendHeaders, adminBackendOrigin } from '@/lib/admin-gateway';
import { ADMIN_COOKIE, allowedAdminRoute, boundedAdminBody, sameOrigin, validAdminSession } from '@/lib/admin-gateway-policy';
export const runtime='nodejs';export const dynamic='force-dynamic';export const maxDuration=300;
const json=(error:string,status:number)=>Response.json({error},{status,headers:{'Cache-Control':'private, no-store'}});
async function relay(request:NextRequest,{params}:{params:Promise<{path:string[]}>}){
 const {path}=await params;
 if(!allowedAdminRoute(path,request.method))return json('Tidak ditemukan.',404);
 if(request.method!=='GET'&&!sameOrigin(request))return json('Asal permintaan ditolak.',403);
 const session=request.cookies.get(ADMIN_COOKIE)?.value;if(!validAdminSession(session))return json('Silakan masuk.',401);
 try{
  const headers=adminBackendHeaders(session,request.headers.get('content-type')||undefined);
  if(request.headers.get('x-regen-user-active')==='1')headers.set('x-regen-user-active','1');
  const body=request.method==='GET'?undefined:await boundedAdminBody(request);
  const upstream=await fetch(`${adminBackendOrigin()}/api/${path.join('/')}${request.nextUrl.search}`,{method:request.method,headers,body:body as BodyInit|undefined,cache:'no-store',redirect:'manual',signal:AbortSignal.timeout(250000)});
  if(upstream.status>=300&&upstream.status<400)return json('Koneksi admin belum tersedia.',503);
  const out=new Headers({'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow'});
  for(const key of ['content-type','content-disposition','x-document-name','x-document-type','x-document-source']){const value=upstream.headers.get(key);if(value)out.set(key,value);}
  return new Response(upstream.body,{status:upstream.status,headers:out});
 }catch(e){return json(e instanceof Error&&e.message==='too_large'?'Maksimal 4 MB untuk unggahan melalui domain admin.':'Koneksi dashboard belum tersedia. Coba kembali.',e instanceof Error&&e.message==='too_large'?413:503);}
}
export const GET=relay;export const POST=relay;export const DELETE=relay;
