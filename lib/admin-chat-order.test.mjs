import test from 'node:test';
import assert from 'node:assert/strict';
import {latestChatMessage,messagePreview,sortedConversations} from '../app/admin/lib/chat-media.ts';
const message=(at,extra={})=>({id:String(at),at,role:'customer',status:'received',text:'Halo',...extra});
const chat=(id,messages,extra={})=>({id,createdAt:1,updatedAt:1,messages,...extra});

test('new inbound message moves its conversation to the top without mutating server state',()=>{
 const a=chat('a',[message(20)]),b=chat('b',[message(10)]),list=[a,b];
 const before=structuredClone(list);
 assert.deepEqual(sortedConversations(list).map(c=>c.id),['a','b']);
 assert.deepEqual(list,before);
 b.messages.push(message(30));
 assert.deepEqual(sortedConversations(list).map(c=>c.id),['b','a']);
 assert.equal(list[0],a);
});

test('delivery updates, AI notes and drafts cannot make an old conversation look newest',()=>{
 const old=chat('old',[message(10),message(99,{role:'note'}),message(100,{role:'bot',status:'draft'}),message(101,{role:'bot',status:'cancelled'})],{updatedAt:999});
 const recent=chat('recent',[message(30),message(20)]);
 assert.equal(sortedConversations([old,recent])[0],recent);
 assert.equal(latestChatMessage(recent).at,30);
});

test('captionless photo/video/file messages count as activity and have useful previews',()=>{
 for(const [kind,name,label] of [['image','a.png','Foto'],['video','a.mp4','Video'],['document','a.pdf','a.pdf']]){
  const m=message(40,{text:'[Lampiran WhatsApp]',attachment:{kind,name,status:'pending'}});
  const newest=chat(kind,[m]);
  assert.equal(sortedConversations([chat('text',[message(30)]),newest])[0],newest);
  assert.equal(messagePreview(latestChatMessage(newest)),label);
 }
});

test('sent replies count as activity, and equal timestamps have stable order',()=>{
 const a=chat('a',[message(50,{role:'admin',status:'sent'})]);
 const b=chat('b',[message(50,{role:'bot',status:'delivered'})]);
 assert.deepEqual(sortedConversations([b,a]).map(c=>c.id),['a','b']);
 assert.deepEqual(sortedConversations([chat('empty',[],{createdAt:5}),chat('older',[message(2)])]).map(c=>c.id),['empty','older']);
});
