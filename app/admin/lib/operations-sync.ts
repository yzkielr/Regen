import type { OpsAction, OpsEnvelope, Operations } from './operations';

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
export function newerSnapshot(current: OpsEnvelope | null, incoming: OpsEnvelope) {
  return !current || incoming.version >= current.version ? incoming : current;
}
// Retry only when the data this action edits has not changed. Server validation
// still runs against the latest complete state, including related orders.
export function canRetryOperation(before: Operations, after: Operations, action: OpsAction) {
  if (['save', 'delete', 'stock'].includes(action.type) && action.collection) {
    return same(before.records[action.collection]?.find(r => r.id === action.id), after.records[action.collection]?.find(r => r.id === action.id));
  }
  if (action.type === 'stock') return same(before.records.products.find(r => r.id === action.id), after.records.products.find(r => r.id === action.id));
  if (action.type === 'settings') return Object.keys(action.data || {}).every(key => same(before.settings[key as keyof typeof before.settings], after.settings[key as keyof typeof after.settings]));
  if (action.type === 'knowledge_source' || action.type === 'knowledge_import') {
    const sourceId = action.type === 'knowledge_source' ? action.data?.sourceId : action.data?.replaceId;
    return !sourceId || same(before.records.knowledge.filter(r => r.sourceId === sourceId), after.records.knowledge.filter(r => r.sourceId === sourceId));
  }
  return false;
}

export async function submitOperation(
  request: (version: number, action: OpsAction) => Promise<{ok: boolean; status: number; data: Partial<OpsEnvelope> & {error?: string}}>,
  initial: OpsEnvelope, action: OpsAction, accept: (data: OpsEnvelope) => void,
) {
  let base = initial;
  for (let attempt = 0; attempt < 4; attempt++) {
    const result = await request(base.version, action);
    const next = result.data.state && Number.isSafeInteger(result.data.version) ? result.data as OpsEnvelope : null;
    if (next) accept(next);
    if (result.ok) {
      if (!next) throw Error('Server belum mengonfirmasi perubahan. Muat ulang sebelum mencoba kembali.');
      return;
    }
    if (result.status === 409 && next && attempt < 3 && canRetryOperation(base.state, next.state, action)) { base = next; continue; }
    throw Error(result.data.error || 'Perubahan belum tersimpan. Silakan coba kembali.');
  }
}
