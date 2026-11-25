export function incomingImage(raw:unknown){
 if(raw===undefined)return undefined;const value=raw as Record<string,unknown>;
 if(!value||typeof value.mediaId!=='string'||!/^\d{1,100}$/.test(value.mediaId)||!['image/png','image/jpeg','image/webp'].includes(String(value.mime)))throw Error('Lampiran gambar tidak valid.');
 return {mediaId:value.mediaId,mime:String(value.mime)};
}
