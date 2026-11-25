import type {Entry,Operations} from './operations';
import {websiteKnowledgeData as data} from './website-knowledge-data';
import {PRICING_KNOWLEDGE_WORKSPACE} from './pricing-knowledge';
export const WEBSITE_KNOWLEDGE_SOURCE='regen-website-20261014';
export const WEBSITE_KNOWLEDGE_REVISION=WEBSITE_KNOWLEDGE_SOURCE+'-'+data.sourceHash.slice(0,12);
export type WebsiteKnowledgeImport={revision:string;importedAt:number;entries:number;sourceHash:string;verifiedPages:number};
export function websiteKnowledgeEntries(now:number):Entry[]{return data.entries.map((row,i)=>({...row,id:`${WEBSITE_KNOWLEDGE_SOURCE}-${i+1}`,createdAt:now,updatedAt:now,sourceId:WEBSITE_KNOWLEDGE_SOURCE,sourceName:'Website Regen — produk, FAQ, layanan & COA (14 Okt 2026)',sourceKind:'txt',sourceHash:data.sourceHash,sourceFileId:'',sourcePart:i+1,sourceParts:data.entries.length,importedAt:now}));}
// Explicit, once-only owner import. Later edits/deletions/disable actions in
// Knowledge Base remain authoritative, including after future deployments.
export function migrateWebsiteKnowledge(state:Operations,userId:string,now:number):Operations {
 if(userId!==PRICING_KNOWLEDGE_WORKSPACE||state.websiteKnowledgeImport?.revision===WEBSITE_KNOWLEDGE_REVISION)return state;
 const entries=websiteKnowledgeEntries(now);if(state.records.knowledge.length+entries.length>1000)throw Error('Knowledge penuh; kosongkan ruang sebelum impor website.');
 const next=structuredClone(state);next.records.knowledge.push(...entries);
 next.websiteKnowledgeImport={revision:WEBSITE_KNOWLEDGE_REVISION,importedAt:now,entries:entries.length,sourceHash:data.sourceHash,verifiedPages:data.verifiedPages};
 next.logs.unshift({id:WEBSITE_KNOWLEDGE_SOURCE,at:now,area:'knowledge',level:'info',message:`Website Regen diimpor: ${entries.length} bagian, ${data.verifiedPages} halaman diperiksa. Harga Google Sheets aktif tetap diprioritaskan; sumber website dapat diedit/dinonaktifkan di Knowledge Base.`});next.logs=next.logs.slice(0,500);return next;
}
export function websiteKnowledgeRules(s:Operations){return s.records.knowledge.some(k=>k.sourceId===WEBSITE_KNOWLEDGE_SOURCE&&k.enabled===true)?'\nSUMBER WEBSITE REGEN: gunakan informasi produk, format paket, FAQ, layanan, wilayah, dan link COA yang relevan beserta sourceUrl. Snapshot website bukan pemantauan perubahan otomatis. Harga tetap mengikuti knowledge harga aktif dan stok dari inventori. Deskripsi pemasaran bukan bukti klinis. Pertanyaan fungsi/manfaat/mekanisme/perbandingan/keamanan wajib didukung jurnal primer atau regulator, bukan hanya instruksi atau katalog. COA hanya berlaku pada batch/sampel terkait. Konten review berlabel contoh tidak boleh dianggap testimoni terverifikasi; dokumen privasi berstatus draf tidak boleh dianggap kebijakan final. Ikuti mode layanan aktif, bukan ajakan menghubungi tim yang dikutip dari halaman website.':'';}
