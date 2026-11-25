import {unzipSync} from 'fflate';
import type {CSSProperties} from 'react';
import type {Cell,CellValue,Worksheet} from 'exceljs';

export function validateOfficePreview(bytes:Uint8Array){
 if(!bytes.length||bytes.length>10_000_000)throw Error('Pratinjau mendukung file maksimal 10 MB.');
 let entries=0,total=0;
 unzipSync(bytes,{filter:file=>{entries++;total+=file.originalSize;if(entries>2500||total>25*1024*1024||file.originalSize>12*1024*1024)throw Error('Dokumen terlalu besar untuk pratinjau. Unduh file asli untuk membukanya.');return false;}});
}
export function previewCellText(value:CellValue):string{
 if(value===null||value===undefined)return '';
 if(value instanceof Date)return value.toLocaleDateString('id-ID',{timeZone:'UTC'});
 if(typeof value==='object'){
  if('richText' in value)return value.richText.map(t=>t.text).join('');
  if('error' in value)return value.error;
  if('formula' in value||'sharedFormula' in value)return value.result!==undefined?previewCellText(value.result):'='+('formula' in value?value.formula:value.sharedFormula);
  if('text' in value)return value.text;
 }
 return String(value);
}
const color=(argb:unknown)=>typeof argb==='string'&&/^[0-9a-f]{8}$/i.test(argb)?'#'+argb.slice(2):typeof argb==='string'&&/^[0-9a-f]{6}$/i.test(argb)?'#'+argb:undefined;
function formattedCell(cell:Cell){
 const raw=cell.value;const value=typeof raw==='object'&&raw!==null&&'result' in raw?raw.result:raw;
 if(typeof value!=='number'||!cell.numFmt)return previewCellText(raw);
 const fmt=cell.numFmt.split(';')[0];if(fmt==='General'||/[ymdhis]/i.test(fmt.replace(/"[^"]*"|\[[^\]]*\]/g,'')))return previewCellText(raw);
 const decimal=fmt.match(/[0#],?(?:[0#]+)?\.([0#]+)/)?.[1];const places=Math.min(8,decimal?.length||0);
 const percent=fmt.includes('%'),number=new Intl.NumberFormat('en-US',{useGrouping:fmt.includes(','),minimumFractionDigits:decimal?.replace(/#/g,'').length||0,maximumFractionDigits:places}).format(percent?value*100:value);
 const prefix=fmt.match(/"([^"]+)"/)?.[1]||(/^\$/.test(fmt)?'$':'');return prefix+number+(percent?'%':'');
}
export type PreviewCell={text:string;style:CSSProperties;rowSpan:number;colSpan:number;skip:boolean};
export type PreviewSheet={name:string;rows:PreviewCell[][];widths:number[];heights:number[];truncated:boolean;rowCount:number;columnCount:number};
export function worksheetPreview(sheet:Worksheet):PreviewSheet{
 const rowCount=Math.max(sheet.rowCount,1),columnCount=Math.max(sheet.columnCount,1),rows=Math.min(rowCount,200),cols=Math.min(columnCount,60);
 const grid:PreviewCell[][]=[];
 for(let r=1;r<=rows;r++){
  const row:PreviewCell[]=[];
  for(let c=1;c<=cols;c++){
   const cell=sheet.getCell(r,c),font=cell.font,alignment=cell.alignment,fill=cell.fill;
   const style:CSSProperties={fontWeight:font?.bold?700:undefined,fontStyle:font?.italic?'italic':undefined,fontSize:font?.size?Math.min(40,Math.max(8,font.size))+'pt':undefined,color:color(font?.color?.argb),background:fill?.type==='pattern'?color(fill.fgColor?.argb):undefined,textAlign:alignment?.horizontal==='center'?'center':alignment?.horizontal==='right'?'right':'left',verticalAlign:alignment?.vertical==='middle'?'middle':alignment?.vertical==='bottom'?'bottom':'top',whiteSpace:'pre-wrap'};
   row.push({text:formattedCell(cell),style,rowSpan:1,colSpan:1,skip:cell.isMerged&&cell.master.address!==cell.address});
  }grid.push(row);
 }
 for(const merge of sheet.model.merges||[]){
  const range=sheet.getCell(merge.split(':')[0]);const end=sheet.getCell(merge.split(':')[1]||merge);const r=Number(range.row),c=Number(range.col);
  if(r<=rows&&c<=cols){grid[r-1][c-1].rowSpan=Math.min(rows,Number(end.row))-r+1;grid[r-1][c-1].colSpan=Math.min(cols,Number(end.col))-c+1;}
 }
 return {name:sheet.name,rows:grid,widths:Array.from({length:cols},(_,i)=>Math.min(420,Math.max(80,(sheet.getColumn(i+1).width||13)*7+12))),heights:Array.from({length:rows},(_,i)=>Math.min(300,Math.max(24,(sheet.getRow(i+1).height||18)*1.33))),truncated:rowCount>rows||columnCount>cols,rowCount,columnCount};
}
export async function spreadsheetPreview(bytes:Uint8Array){
 validateOfficePreview(bytes);const module=await import('exceljs');const ExcelJS=module.default||module;const book=new ExcelJS.Workbook();await book.xlsx.load(new Uint8Array(bytes).buffer);
 if(book.worksheets.length>30)throw Error('Workbook memiliki lebih dari 30 sheet. Unduh file asli untuk membukanya.');
 return book.worksheets.filter(s=>s.state==='visible').map(worksheetPreview);
}
export const PREVIEW_CSP="default-src 'none'; img-src data: blob:; style-src 'unsafe-inline'; font-src data: blob:; base-uri 'none'; form-action 'none'";
export function previewDocumentHtml(styles:string,body:string){return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${PREVIEW_CSP}"><style>body{margin:0;background:#eef2f6}.docx-wrapper{padding:24px;overflow:auto}a{pointer-events:none;color:inherit}</style>${styles}</head><body>${body}</body></html>`;}
export async function wordPreview(bytes:Uint8Array){
 validateOfficePreview(bytes);const {renderAsync}=await import('docx-preview');const body=document.createElement('div'),style=document.createElement('div');
 await renderAsync(bytes,body,style,{useBase64URL:true,renderAltChunks:false,renderComments:false,ignoreLastRenderedPageBreak:false});
 // Render only in an inert container, then isolate the result in a sandboxed
 // iframe with no network, scripts, forms, navigation or parent-page access.
 for(const el of [...body.querySelectorAll('script,iframe,object,embed,form')])el.remove();
 for(const el of [...body.querySelectorAll('*')])for(const a of [...el.attributes])if(a.name.toLowerCase().startsWith('on'))el.removeAttribute(a.name);
 return previewDocumentHtml(style.innerHTML,body.innerHTML);
}
export function columnLabel(index:number){let label='';for(let n=index+1;n>0;n=Math.floor((n-1)/26))label=String.fromCharCode(65+(n-1)%26)+label;return label;}
