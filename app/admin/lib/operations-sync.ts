import type { Entry, OpsAction, OpsEnvelope, Operations } from './operations';

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
export function newerSnapshot(current: OpsEnvelope | null, incoming: OpsEnvelope) {
  return !current || incoming.version >= current.version ? incoming : current;
}
// Apply only fields edited in the open form to the latest record. Background
// updates to other fields must survive; overlapping edits require review.
export function mergeRecordEdit(original: Entry | undefined, draft: Record<string, unknown>, current: Entry | undefined) {
  if (!original) {
    if (current) throw Error('Data dengan ID ini sudah ada. Buka ulang formulir sebelum menyimpan.');
    return {...draft};
  }
  if (!current || current.id !== original.id || current.createdAt !== original.createdAt) {
    throw Error('Data ini sudah dihapus atau diganti. Isian Anda tetap ada; periksa daftar terbaru.');
  }
  const merged: Record<string, unknown> = {...current};
  for (const [key, value] of Object.entries(draft)) {
    if (['id', 'createdAt', 'updatedAt'].includes(key) || same(value, original[key])) continue;
    if (!same(current[key], original[key]) && !same(current[key], value)) {
      throw Error('Kolom yang Anda edit juga berubah di server. Isian belum disimpan; buka ulang formulir untuk memeriksa data terbaru.');
    }
    merged[key] = value;
  }
  return merged;
}
function recordContent(record: Entry | undefined) {
  if (!record) return record;
  const {updatedAt, ...content} = record;
  return content;
}
function replyContext(state: Operations, conversationId: unknown) {
  const chat = state.service?.conversations.find(c => c.id === conversationId);
  const contact = chat && state.records.contacts.find(c => c.id === chat.contactId);
  if (!chat || !contact) return null;
  return {
    epoch: chat.epoch, mode: chat.mode, assignee: chat.assignee,
    ownerRevision: chat.ownerRevision, contactId: chat.contactId,
    transport: chat.transport, test: chat.test, lastInboundAt: chat.lastInboundAt,
    phone: contact.phone, demoOnly: contact.demoOnly,
    messages: chat.messages.filter(m => m.role !== 'note').map(m => ({
      id: m.id, role: m.role, text: m.text, purpose: m.purpose,
      replyTo: m.replyTo, corrects: m.corrects,
      // Delivery receipts can advance while uploading. Draft activation or
      // cancellation changes what the customer will see and requires review.
      status: m.status === 'draft' || m.status === 'cancelled' ? m.status : 'visible',
      image: m.image && {fileId: m.image.fileId, mediaId: m.image.mediaId},
      attachment: m.attachment && {
        fileId: m.attachment.fileId, kind: m.attachment.kind,
        name: m.attachment.name, mime: m.attachment.mime,
      },
    })),
  };
}
// Retry only when the data this action edits has not changed. Server validation
// still runs against the latest complete state, including related orders.
export function canRetryOperation(before: Operations, after: Operations, action: OpsAction) {
  if (action.type === 'service' && action.data?.kind === 'order_alert_read') return true;
  if (action.type === 'service' && action.data?.kind === 'delete_chat') {
    if (action.data.confirmed !== true) return false;
    const previous = replyContext(before, action.data.conversationId);
    const current = replyContext(after, action.data.conversationId);
    if (!previous || !current || !same(previous, current)) return false;
    // Notes and owner tickets are also erased. New content must be reviewed;
    // background heartbeats and delivery receipts do not change that content.
    const related = (state: Operations) => ({
      notes: state.service?.conversations.find(c => c.id === action.data?.conversationId)?.messages.filter(m => m.role === 'note'),
      tickets: (state.service?.ownerTickets || []).filter(t => t.conversationId === action.data?.conversationId),
    });
    return same(related(before), related(after));
  }
  if (action.type === 'service' && action.data?.kind === 'reply') {
    const previous = replyContext(before, action.data.conversationId);
    const current = replyContext(after, action.data.conversationId);
    return !!previous && !!current && same(previous, current);
  }
  if (action.type === 'service' && action.data?.kind === 'mode') {
    const previous = before.service?.conversations.find(c => c.id === action.data?.conversationId);
    const current = after.service?.conversations.find(c => c.id === action.data?.conversationId);
    // A heartbeat or delivery receipt may update the workspace while the
    // admin clicks. Retry only if the chat and its control revision are intact.
    return !!previous && !!current && previous.epoch === current.epoch &&
      previous.mode === current.mode && previous.assignee === current.assignee &&
      previous.ownerRevision === current.ownerRevision && previous.contactId === current.contactId &&
      previous.transport === current.transport && previous.test === current.test &&
      before.settings.botEnabled === after.settings.botEnabled;
  }
  if (action.type === 'save' && action.collection) {
    try {
      mergeRecordEdit(before.records[action.collection]?.find(r => r.id === action.id), action.data || {}, after.records[action.collection]?.find(r => r.id === action.id));
      return true;
    } catch { return false; }
  }
  if (action.type === 'delete' && action.collection) {
    return same(recordContent(before.records[action.collection]?.find(r => r.id === action.id)), recordContent(after.records[action.collection]?.find(r => r.id === action.id)));
  }
  if (action.type === 'stock' && action.collection) return same(before.records[action.collection]?.find(r => r.id === action.id), after.records[action.collection]?.find(r => r.id === action.id));
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
  editingBase?: Entry,
) {
  let base = initial;
  if (action.type === 'save' && action.collection && editingBase) {
    action = {...action, data: mergeRecordEdit(editingBase, action.data || {}, initial.state.records[action.collection].find(r => r.id === action.id))};
  }
  for (let attempt = 0; attempt < 4; attempt++) {
    const result = await request(base.version, action);
    const next = result.data.state && Number.isSafeInteger(result.data.version) ? result.data as OpsEnvelope : null;
    if (next) accept(next);
    if (result.ok) {
      if (!next) throw Error('Server belum mengonfirmasi perubahan. Muat ulang sebelum mencoba kembali.');
      return;
    }
    if (result.status === 409 && next) {
      const retry = canRetryOperation(base.state, next.state, action);
      if (attempt < 3 && retry) {
        if (action.type === 'save' && action.collection) {
          action = {...action, data: mergeRecordEdit(base.state.records[action.collection].find(r => r.id === action.id), action.data || {}, next.state.records[action.collection].find(r => r.id === action.id))};
        }
        base = next;
        continue;
      }
      if (action.type === 'service' && action.data?.kind === 'delete_chat') {
        throw Error(retry
          ? 'Data sedang diperbarui. Riwayat belum dihapus; silakan coba kembali.'
          : 'Percakapan berubah. Periksa pesan terbaru sebelum menghapus kembali.');
      }
      if (action.type === 'service' && action.data?.kind === 'reply') {
        throw Error(retry
          ? 'Data sedang diperbarui. Balasan belum terkirim; silakan coba kembali.'
          : 'Percakapan berubah. Periksa pesan terbaru sebelum mengirim kembali.');
      }
    }
    if (result.status === 409 && next && ['save', 'delete', 'settings', 'knowledge_source', 'knowledge_import'].includes(action.type)) {
      const retry = canRetryOperation(base.state, next.state, action);
      throw Error(retry
        ? 'Data sedang diperbarui. Perubahan belum tersimpan; silakan coba kembali.'
        : action.type === 'delete'
          ? 'Data yang akan dihapus sudah berubah. Periksa data terbaru sebelum menghapus kembali.'
          : 'Data yang Anda edit sudah berubah. Isian Anda tetap ada; periksa data terbaru sebelum menyimpan kembali.');
    }
    throw Error(result.data.error || 'Perubahan belum tersimpan. Silakan coba kembali.');
  }
}
