export function verifiedPaperSignature(result:any,from:string){
 if(from.toLowerCase()!=='invoicer@paper.id'||result?.fromFields!==1)return false;
 const headers=result.headers?.parsed;
 if(!Array.isArray(headers)||['from','subject','content-type'].some(key=>headers.filter((h:any)=>h.key===key).length!==1))return false;
 return result.results?.some((r:any)=>{
  const keys=typeof r.signingHeaders?.keys==='string'?r.signingHeaders.keys.toLowerCase().split(':').map((v:string)=>v.trim()):[];
  return ['paper.id','mg.paper.id'].includes(r.signingDomain?.toLowerCase())&&r.status?.result==='pass'&&r.signatureTimeValid===true&&!r.canonBodyLengthLimited&&r.algo==='rsa-sha256'&&['from','subject','content-type'].every(key=>keys.includes(key));
 })===true;
}
