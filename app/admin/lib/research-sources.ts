export type ResearchSource = { title:string; url:string };
export type ResearchEvidence = { provider:'OpenAI Web Search'; sources:ResearchSource[] };
export function publicSourceUrl(value:unknown):string {
 if(typeof value!=='string'||value.length>2000)return '';
 try{const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password||u.port||!u.hostname.includes('.')||/^(?:\d+\.){3}\d+$/.test(u.hostname)||u.hostname.includes(':')||/\.(?:local|localhost|internal|test|invalid)$/.test(u.hostname))return '';return u.href;}catch{return '';}
}
export function checkedResearchEvidence(value:unknown):ResearchEvidence {
 const raw=value as ResearchEvidence;
 if(!raw||raw.provider!=='OpenAI Web Search'||!Array.isArray(raw.sources)||!raw.sources.length||raw.sources.length>4)throw new Error('Sumber riset tidak valid.');
 return {provider:raw.provider,sources:raw.sources.map(s=>{const url=publicSourceUrl(s?.url);if(!url||typeof s.title!=='string'||!s.title.trim()||s.title.length>180)throw new Error('Tautan riset tidak valid.');return {title:s.title,url};})};
}
