import test from 'node:test';
import assert from 'node:assert/strict';
import {reportedPurchase, purchasedCustomers} from '../app/admin/lib/completed-orders.ts';

const message = (text, extra = {}) => ({id: 'm', text, role: 'customer', status: 'received', at: 100, ...extra});
const chat = (id = 'c', extra = {}) => ({id, contactId: 'buyer', test: false, updatedAt: 100, messages: [], ...extra});
const state = (extra = {}) => ({records: {contacts: [{id: 'buyer', name: 'Buyer', phone: '+62811111111'}], orders: []}, service: {conversations: [], payments: []}, ...extra});
const order = (extra = {}) => ({id: 'o', contactId: 'buyer', number: 'INV-1', status: 'awaiting_payment', createdAt: 200, updatedAt: 200, ...extra});

test('recognizes explicit Indonesian and English customer reports', () => {
  for (const text of ['sudah transfer kak', 'sudah saya bayar ya', 'udh tf kak', 'Saya sudah melakukan pembayaran', 'ini bukti transfer saya', 'I have already paid', 'I just transferred', 'Payment sent', 'pembayaran berhasil']) assert.equal(reportedPurchase(message(text)), 'payment_reported', text);
  for (const text of ['sudah order kak', 'Saya udah beli', 'saya order tadi pagi', 'I have purchased the pen', 'I already ordered', 'pesanan saya sudah sampai']) assert.equal(reportedPurchase(message(text)), 'order_reported', text);
  assert.equal(reportedPurchase(message('saya sudah bayar, kapan dikirim?')), 'payment_reported');
  assert.equal(reportedPurchase(message('sudah transfer tapi gagal')), null);
  assert.equal(reportedPurchase(message('sudah order tapi dibatalkan')), null);
});

test('does not turn intent, questions, instructions, or hypothetical text into purchases', () => {
  for (const text of ['mau order', 'saya belum bayar', 'belum saya transfer', 'kalau sudah transfer bagaimana', 'I have not paid', "I haven't ordered", 'Please send proof of payment', 'sudah transfer?', 'apa sudah bayar', 'have you paid', 'contoh: saya sudah bayar', 'apakah bisa pesan', 'ini foto pena', 'bukti transfer belum ada', 'minta bukti transfer', 'saya mau kirim bukti transfer']) assert.equal(reportedPurchase(message(text)), null, text);
});

test('only a received customer message is evidence; an image alone is not payment proof', () => {
  for (const role of ['admin', 'bot', 'note', 'owner']) assert.equal(reportedPurchase(message('sudah bayar', {role})), null);
  for (const status of ['draft', 'cancelled', 'simulated', 'failed']) assert.equal(reportedPurchase(message('sudah bayar', {status})), null);
  assert.equal(reportedPurchase(message('[Lampiran WhatsApp]', {image: {analysis: 'Pembayaran berhasil'}})), null);
});

test('includes historical chat reports without modifying state or marking an invoice paid', () => {
  const s = state(); s.service.conversations.push(chat('c', {messages: [message('sudah transfer')]}));
  const before = structuredClone(s);
  const result = purchasedCustomers(s);
  assert.equal(result[0].status, 'payment_reported');
  assert.equal(result[0].conversationId, 'c');
  assert.equal(result[0].orderCount, 0);
  assert.deepEqual(s, before);
});

test('excludes draft, cancelled, test, and demo orders and test chats', () => {
  const s = state();
  s.records.orders.push(order({status: 'draft'}), order({status: 'cancelled'}), order({test: true}), order({demoOnly: true}));
  s.service.conversations.push(chat('c', {test: true, messages: [message('sudah bayar')]}));
  assert.deepEqual(purchasedCustomers(s), []);
});

test('uses real issued/paid invoices, deduplicates buyers, and retains archived history', () => {
  const s = state();
  s.records.orders.push(order(), order({id: 'paid', number: 'INV-2', status: 'paid', paidAt: 300, archived: true}));
  s.service.conversations.push(chat());
  const rows = purchasedCustomers(s);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].status, 'paid');
  assert.equal(rows[0].orderCount, 2);
  assert.match(rows[0].evidence, /INV-2/);
  assert.equal(rows[0].conversationId, 'c');
});

test('a new unpaid order/report does not inherit payment status from an older purchase', () => {
  const s = state();
  s.records.orders.push(order({status: 'paid', paidAt: 100}), order({id: 'new', createdAt: 400, updatedAt: 400}));
  assert.equal(purchasedCustomers(s)[0].status, 'ordered');
  s.service.conversations.push(chat('c', {messages: [message('sudah transfer', {at: 500})]}));
  assert.equal(purchasedCustomers(s)[0].status, 'payment_reported');
});

test('only matched verified or manually reviewed payments count as paid', () => {
  const s = state(); s.records.orders.push(order());
  const p = {orderId: 'o', status: 'review', verified: true, receivedAt: 300};
  s.service.payments.push(p);
  assert.equal(purchasedCustomers(s)[0].status, 'ordered');
  p.status = 'matched'; p.verified = false;
  assert.equal(purchasedCustomers(s)[0].status, 'ordered');
  p.reviewedBy = 'Admin';
  assert.equal(purchasedCustomers(s)[0].status, 'paid');
  p.test = true;
  assert.equal(purchasedCustomers(s)[0].status, 'ordered');
});

test('a customer can remain listed without a chat; missing contacts are excluded', () => {
  const s = state(); s.records.orders.push(order(), order({id: 'missing', contactId: 'missing'}));
  const rows = purchasedCustomers(s);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].conversationId, undefined);
  assert.equal(purchasedCustomers(undefined).length, 0);
});

test('multiple chats for one buyer produce one entry; newest evidence sorts first', () => {
  const s = state(); s.records.contacts.push({id: 'other', name: 'Other'});
  s.service.conversations.push(chat('old', {messages: [message('sudah beli')]}), chat('new', {updatedAt: 600, messages: [message('sudah bayar', {at: 600})]}), chat('other', {contactId: 'other', messages: [message('sudah order', {at: 700})]}));
  const rows = purchasedCustomers(s);
  assert.equal(rows.length, 2);
  assert.equal(rows[0].contactId, 'other');
  assert.equal(rows[1].conversationId, 'new');
});
