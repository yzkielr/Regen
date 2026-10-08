import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/admin-gateway';
import { ADMIN_COOKIE, sameOrigin } from '@/lib/admin-gateway-policy';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function POST(request:NextRequest){
 if(!sameOrigin(request))return NextResponse.json({error:'Asal permintaan ditolak.'},{status:403});
 try{await adminAuth('logout',request.cookies.get(ADMIN_COOKIE)?.value);}catch{/* Browser cookie is cleared even during a backend outage. */}
 const response=NextResponse.json({ok:true},{headers:{'Cache-Control':'no-store'}});response.cookies.set(ADMIN_COOKIE,'',{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/admin',maxAge:0});return response;
}
