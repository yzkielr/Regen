export const ADMIN_COOKIE = 'regen_admin_session';
export const ADMIN_BACKEND = 'https://regen-inbox.hello-wearology.chatgpt.site';
export const MAX_ADMIN_BODY = 4_000_000;
const routes: Record<string, readonly string[]> = {
  operations: ['GET','POST'], workspace: ['GET','POST'], files: ['GET','POST','DELETE'], health: ['GET'], whatsapp: ['GET'],
  'knowledge/link': ['POST'], 'service/status': ['GET'], 'service/ai': ['POST'], 'service/flip': ['POST'],
  'service/whatsapp-test': ['POST'], 'service/whatsapp-cs': ['POST'], 'service/whatsapp-cs/setup': ['POST'],
};
export function allowedAdminRoute(path: string[], method: string) {
  return path.every(part => /^[a-z-]+$/.test(part)) && !!routes[path.join('/')]?.includes(method);
}
export function sameOrigin(request: Request) {
  const url = new URL(request.url);
  // Next.js may use its internal hostname in request.url behind a reverse proxy.
  // Host is set by the browser/hosting proxy and cannot be changed by browser JS.
  const expected = `${url.protocol}//${request.headers.get('host') || url.host}`;
  return request.headers.get('origin') === expected && !['cross-site','same-site'].includes(request.headers.get('sec-fetch-site') || '');
}
export function validAdminSession(value: unknown): value is string { return typeof value === 'string' && /^[a-f0-9]{64}$/.test(value); }
export async function boundedAdminBody(request: Request, limit = MAX_ADMIN_BODY) {
  if (Number(request.headers.get('content-length') || 0) > limit) throw new Error('too_large');
  const reader = request.body?.getReader(); if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = []; let total = 0;
  while (true) { const { done, value } = await reader.read(); if (done) break; total += value.length; if (total > limit) { await reader.cancel(); throw new Error('too_large'); } chunks.push(value); }
  const body = new Uint8Array(total); let offset = 0; for (const chunk of chunks) { body.set(chunk,offset); offset += chunk.length; } return body;
}
