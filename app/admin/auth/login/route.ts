import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/admin-gateway';
import { ADMIN_COOKIE, boundedAdminBody, sameOrigin, validAdminSession } from '@/lib/admin-gateway-policy';
export const runtime='nodejs';export const dynamic='force-dynamic';
const json=(error:string,status:number)=>NextResponse.json({error},{status,headers:{'Cache-Control':'no-store'}});
export async function POST(request:Request){
 if(!sameOrigin(request))return json('Asal permintaan ditolak.',403);
 try{const body=JSON.parse(new TextDecoder().decode(await boundedAdminBody(request,2048)));if(typeof body.username!=='string'||typeof body.password!=='string'||body.username.length>64||body.password.length>128)return json('Username atau password tidak sesuai.',400);
  const ip=request.headers.get('x-vercel-forwarded-for')||request.headers.get('x-real-ip')||'unknown';
  const r=await adminAuth('login',null,{username:body.username,password:body.password},ip);if(r.status>=300&&r.status<400)return json('Koneksi admin belum dikonfigurasi.',503);const d=await r.json();
  if(!r.ok||!validAdminSession(d.token))return json([401,429,503].includes(r.status)?String(d.error||'Belum dapat masuk.'):'Layanan login belum tersedia.',[401,429,503].includes(r.status)?r.status:503);
  const response=NextResponse.json({ok:true},{headers:{'Cache-Control':'no-store'}});
  response.cookies.set(ADMIN_COOKIE,d.token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/admin'});
  return response;
 }catch(e){return json(e instanceof Error&&e.message==='too_large'?'Permintaan terlalu besar.':'Login belum tersedia. Hubungi pemilik untuk memeriksa koneksi hosting.',e instanceof Error&&e.message==='too_large'?413:503);}
}
