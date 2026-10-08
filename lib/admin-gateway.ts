import 'server-only';
import { cookies } from 'next/headers';
import { ADMIN_BACKEND, ADMIN_COOKIE, validAdminSession } from './admin-gateway-policy';
import type { AdminRole } from '@/app/admin/lib/admin-roles';

export function adminBackendOrigin() {
  const local=process.env.REGEN_ADMIN_BACKEND_URL;
  return process.env.NODE_ENV==='development' && local && /^http:\/\/127\.0\.0\.1:\d+$/.test(local) ? local : ADMIN_BACKEND;
}

export function adminBackendHeaders(token?: string | null, contentType?: string) {
  const access = process.env.REGEN_ADMIN_BACKEND_ACCESS;
  if (!access) throw new Error('backend_not_configured');
  const headers = new Headers({ 'OAI-Sites-Authorization': `Bearer ${access}`, origin: adminBackendOrigin() });
  if (validAdminSession(token)) headers.set('x-regen-admin-session', token);
  if (contentType) headers.set('content-type', contentType);
  return headers;
}
export async function adminAuth(action: 'login'|'logout'|'session', token?: string | null, data: Record<string, unknown> = {}, ip?: string) {
  const headers = adminBackendHeaders(token,'application/json');
  if (action === 'session') headers.set('x-regen-user-active','1');
  if (ip) headers.set('x-regen-client-ip',ip.slice(0,200));
  return fetch(`${adminBackendOrigin()}/api/admin-auth`,{method:'POST',headers,body:JSON.stringify({...data,action}),cache:'no-store',redirect:'manual',signal:AbortSignal.timeout(20000)});
}
export async function currentAdmin() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!validAdminSession(token)) return null;
  try { const response = await adminAuth('session',token); if (!response.ok) return null; const data = await response.json(); return typeof data.username === 'string' ? { username:data.username as string, displayName:typeof data.displayName==='string'?data.displayName:data.username, role:(data.role==='supervisor'?'supervisor':'admin') as AdminRole } : null; }
  catch { return null; }
}
