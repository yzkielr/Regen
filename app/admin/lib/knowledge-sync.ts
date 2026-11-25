import type {Operations} from './operations.ts';
import {importKnowledge} from './knowledge';
export type SyncFile={url:string;digest:string;sourceId:string;checkedAt:number;error?:string};
export type SyncFolder={id:string;url:string;name:string;enabled:boolean;autoActivate:boolean;revision:string;files:SyncFile[];queue:string[];lastAt:number;nextAt:number;error:string;warnings:string[]};
export type KnowledgeSync={folders:SyncFolder[];generation?:string;scheduleUntil?:number;lastRunAt?:number;lease?:string;leaseUntil?:number};
export const syncState=(s:Operations):KnowledgeSync=>s.knowledgeSync??(s.knowledgeSync={folders:[]});
export function driveFolderUrl(raw:string){
 const u=new URL(raw),id=u.pathname.match(/^\/drive(?:\/u\/\d+)?\/folders\/([\w-]{10,200})\/?$/)?.[1];
 if(u.protocol!=='https:'||u.hostname!=='drive.google.com'||u.username||u.password||u.port||!id)throw Error('Gunakan link folder Google Drive.');
 const key=u.searchParams.get('resourcekey');if(key&&!/^[\w-]{1,200}$/.test(key))throw Error('Link folder tidak valid.');
 return {id,url:`https://drive.google.com/drive/folders/${id}${key?'?resourcekey='+key:''}`};
}
export function configureSync(s:Operations,input:{url:string;name?:string;enabled:boolean;autoActivate?:boolean},now:number){
 const {id,url}=driveFolderUrl(input.url),sync=syncState(s);let folder=sync.folders.find(f=>f.id===id);
 if(!folder){if(sync.folders.length>=10)throw Error('Maksimal 10 folder sinkronisasi.');folder={id,url,name:(input.name||'Folder Drive').slice(0,180),enabled:false,autoActivate:true,revision:'',files:[],queue:[],lastAt:0,nextAt:0,error:'',warnings:[]};sync.folders.push(folder);}
 folder.url=url;folder.enabled=input.enabled;folder.autoActivate=input.autoActivate!==false;folder.revision=crypto.randomUUID();folder.nextAt=0;folder.queue=[];folder.error='';
 if(input.name)folder.name=input.name.slice(0,180);
 return folder;
}
export function syncFileCommit(s:Operations,folderId:string,revision:string,url:string,digest:string,data:Record<string,unknown>|undefined,now:number){
 const folder=syncState(s).folders.find(f=>f.id===folderId);if(!folder?.enabled||folder.revision!==revision)return false;
 let tracked=folder.files.find(f=>f.url===url);
 if(tracked?.sourceId&&!s.records.knowledge.some(k=>k.sourceId===tracked!.sourceId)){tracked.checkedAt=now;tracked.error='Dihapus di Regen; tidak diimpor kembali otomatis.';return false;}
 const existing=s.records.knowledge.find(k=>k.sourceUrl===url);
 if(data)importKnowledge(s,{...data,sourceUrl:url,replaceId:existing?.sourceId||'',enabled:existing?existing.enabled===true:folder.autoActivate},crypto.randomUUID(),now);
 const source=s.records.knowledge.find(k=>k.sourceUrl===url);if(!source)throw Error('Sumber hasil sinkronisasi tidak ditemukan.');
 if(!tracked){tracked={url,digest,sourceId:String(source.sourceId),checkedAt:now};folder.files.push(tracked);}
 else Object.assign(tracked,{digest,sourceId:String(source.sourceId),checkedAt:now,error:''});
 return true;
}
