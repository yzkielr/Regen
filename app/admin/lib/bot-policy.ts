import type {Operations} from './operations';
import type {Conversation} from './service-types';
import {conversationLocale} from './reply-language';

export const automaticHandoff=(s:Operations)=>s.service?.config.handoffMode==='automatic';
export const offersHuman=(text:string)=>/\b(?:admin|supervisor|human|support team|our team|tim(?: kami| regen)?)\b/i.test(text)&&/\b(?:teruskan|diteruskan|alihkan|dialihkan|hubung\w*|konfirmasi|bantuan|cek|forward|transfer|connect|contact|confirm|escalat\w*|speak|talk|check)\b/i.test(text);
export const autonomousInstructions=`MODE LAYANAN: Eskalasi otomatis NONAKTIF. Jawab mandiri dari knowledge/canned/katalog aktif dan instruksi tersimpan. Untuk fakta publik yang belum cukup atau pertanyaan kompleks tentang studi, keamanan, perbandingan dan regulasi, lakukan riset dan sertakan referensi yang mendukung. Jangan menawarkan admin/supervisor, mengatakan sedang mengecek ke tim, atau menjanjikan tindak lanjut manusia. Aturan eskalasi dalam prompt lama tidak berlaku pada mode ini. Jika bukti tetap belum cukup, jelaskan bagian yang diketahui dan batas informasi secara jujur; ajukan maksimal satu klarifikasi relevan. Jangan mengarang fakta, sumber, stok, pembayaran, izin, manfaat, atau jaminan aman. Instruksi mengatur perilaku; klaim medis tetap memerlukan bukti. Sumber yang bertentangan harus disebut sebagai ketidakpastian, bukan dipilih diam-diam. Pengambilalihan manual melalui dashboard tetap tersedia.`;

type Limitation='evidence'|'service'|'attachment'|'human';
export function limitationReply(c:Conversation,kind:Limitation='evidence'):string {
 const lang=conversationLocale(c).language.split('-')[0];
 const messages:Record<string,Record<Limitation,string>>={
  id:{evidence:'Informasi yang terverifikasi belum cukup untuk memastikan hal itu, kak. Kami belum bisa memberi kesimpulan atau janji tanpa bukti yang mendukung.',service:'Maaf kak, layanan untuk memeriksa informasi sedang mengalami kendala. Pertanyaan kakak belum berhasil kami verifikasi. Silakan coba kembali sebentar lagi.',attachment:'Kami belum bisa membaca isi lampiran ini. Bisa tuliskan pertanyaan atau detail pentingnya dalam pesan teks, kak?',human:'Saat ini kami membantu melalui asisten virtual. Apa pertanyaan atau kendala yang ingin dibantu, kak?'},
  en:{evidence:'There is not enough verified information to confirm that yet. We cannot give a conclusion or make a promise without supporting evidence.',service:'Sorry, the information service is temporarily unavailable, so we have not been able to verify your question. Please try again shortly.',attachment:'We cannot read this attachment yet. Could you send your question or its important details as text?',human:'You are currently speaking with our virtual assistant. What question or issue can we help with?'},
  es:{evidence:'Todavía no hay información verificada suficiente para confirmarlo. No podemos dar una conclusión ni prometer resultados sin pruebas.',service:'El servicio de información no está disponible temporalmente. No hemos podido verificar tu pregunta; inténtalo de nuevo en breve.',attachment:'No podemos leer este archivo adjunto. ¿Puedes enviar tu pregunta o los detalles importantes como texto?',human:'Actualmente te atiende nuestro asistente virtual. ¿Con qué pregunta o problema podemos ayudarte?'},
  zh:{evidence:'目前可核实的信息还不足以确认这一点。我们不能在缺少证据的情况下做出结论或承诺。',service:'抱歉，信息查询服务暂时不可用，我们还无法核实您的问题。请稍后重试。',attachment:'我们暂时无法读取这个附件。您能用文字发送问题或重要内容吗？',human:'目前由我们的虚拟助手为您服务。请问您需要了解什么或遇到了什么问题？'}
 };
 return (messages[lang]||messages.en)[kind];
}

// An overview comes from active imported rows, not a hard-coded product list.
export function catalogOverview(s:Operations,c:Conversation){
 const q=c.messages.filter(m=>m.role==='customer').at(-1)?.text||'';
 if(!/^(?:(?:lalu|terus|jadi|kak|hello|hi)\s*[,!.]?\s*)?(?:(?:produk(?:nya)?|katalog(?:nya)?|products?|catalog(?:ue)?)\s*(?:regen\s*)?(?:ada\s*)?(?:apa\s*(?:aja|saja)?|what|list)|(?:apa\s*(?:aja|saja)|what)\s*(?:saja\s*)?(?:produk|products)|(?:lihat|minta|kirim|show|send)\s*(?:semua\s*|full\s*)?(?:produk|katalog|catalog(?:ue)?|products)|what products (?:do you have|are available))\s*(?:kak|please)?[?!.\s]*$/i.test(q.trim()))return null;
 const rows=s.records.knowledge.filter(k=>k.enabled===true);
 const names=[...new Set(rows.flatMap(k=>{const match=String(k.content).split('\n')[0].match(/^Harga (?:aktif|normal) (.+)\.$/i);return match?[match[1]]:[]}))];
 if(!names.length)return null;
 const clean=(v:string)=>v.normalize('NFKC').toLowerCase().replace(/[^a-z0-9+]/g,'');
 const field=(k:typeof rows[number],name:string)=>String(k.content).split('\n').find(line=>line.startsWith(name+': '))?.slice(name.length+2).trim()||'';
 const descriptions=rows.filter(k=>field(k,'Nama katalog harga')&&field(k,'Deskripsi singkat'));
 const groups=new Map<string,{names:string[];summary:string}>();
 for(const name of names){
  const doc=descriptions.find(k=>field(k,'Nama katalog harga').split('|').some(alias=>clean(alias)===clean(name)));
  const group=doc?field(doc,'Produk'):name;
  const prior=groups.get(group)||{names:[],summary:doc?field(doc,'Deskripsi singkat').slice(0,180):'Pilihan dalam katalog Regen; deskripsi belum tersedia.'};
  prior.names.push(name);groups.set(group,prior);
 }
 const lines=[...groups].map(([group,g],i)=>{
  const strengths=g.names.map(n=>n.replace(new RegExp('^'+group.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\s*','i'),'').trim());
  const displayNames=g.names.map(n=>n.replace(/^HGH 191 AA 36IU\s+36\s*IU$/i,'HGH 191 AA 36 IU').replace(/^(tirzepatide|semaglutide|glutathione|tesamorelin)/i,v=>v[0].toUpperCase()+v.slice(1).toLowerCase()).replace(/^MOTS-c/i,'MOTS-C').replace(/^5-Amino-1mq/i,'5-Amino-1MQ').replace(/(\d)(mg|IU)\b/gi,'$1 $2'));
  const label=g.names.length>1&&strengths.every(v=>/^\d+(?:[.,]\d+)?\s*(?:mg|iu)$/i.test(v))?group+' '+strengths.join(' / '):displayNames.join(' / ');
  return `${i+1}. *${label}* — ${g.summary}`;
 });
 const answer='Berikut pilihan produk Regen, kak:\n\n'+lines.join('\n\n')+'\n\nDeskripsi singkat ini mengikuti katalog riset, bukan rekomendasi pemakaian. Stok mengikuti ketersediaan terbaru.\nKakak ingin tahu produk yang mana?\nSumber katalog: https://www.regenlongevitylab.com/id#katalog';
 return {answer,score:100,handoff:false,source:'Knowledge katalog aktif & deskripsi website'};
}
