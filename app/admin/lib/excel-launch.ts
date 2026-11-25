export function excelLaunchUri(ticket:string,name:string){
 if(ticket.length>1200||! /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]{43}$/.test(ticket)||! /\.xlsx$/i.test(name)||/[\r\n\x00-\x1f]/.test(name))throw Error('Tautan Excel tidak valid.');
 // The public gateway checks the signed capability; it exposes one original
 // workbook for five minutes, never a general browser/admin session.
 return 'ms-excel:ofv|u|https://www.regenlongevitylab.com/api/regen-media/office/'+encodeURIComponent(ticket)+'/'+encodeURIComponent(name);
}
