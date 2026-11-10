import type {Entry} from './operations.ts';

const WIB_OFFSET=7*60*60*1000;
const validMonth=/^\d{4}-(0[1-9]|1[0-2])$/;
export const UNDATED_ORDER_MONTH='undated';

// Use the issue date once an invoice exists, otherwise the draft's creation
// date. Payment, edit and archive dates never move a record to another month.
export function orderPeriodTime(order:Entry):number {
 for(const value of [order.invoiceAt,order.createdAt]){
  const time=typeof value==='number'?value:typeof value==='string'&&value.trim()?(Number.isFinite(Number(value))?Number(value):Date.parse(value)):NaN;
  if(Number.isFinite(time)&&time>0&&Number.isFinite(new Date(time).getTime()))return time;
 }
 return 0;
}
export function wibMonthKey(time:number):string {
 return new Date(time+WIB_OFFSET).toISOString().slice(0,7);
}
export function orderMonthKey(order:Entry):string {
 const time=orderPeriodTime(order);return time?wibMonthKey(time):UNDATED_ORDER_MONTH;
}
export function orderMonthLabel(month:string):string {
 if(!validMonth.test(month))return 'Tanpa tanggal';
 return new Intl.DateTimeFormat('id-ID',{month:'long',year:'numeric',timeZone:'Asia/Jakarta'}).format(new Date(month+'-15T12:00:00Z'));
}
export function orderHistoryMonths(orders:Entry[]):string[] {
 const months=[...new Set(orders.map(orderMonthKey))];
 return months.filter(m=>m!==UNDATED_ORDER_MONTH).sort().reverse().concat(months.includes(UNDATED_ORDER_MONTH)?[UNDATED_ORDER_MONTH]:[]);
}
export function ordersInMonth(orders:Entry[],month:string,history=false):Entry[] {
 return orders.filter(o=>orderMonthKey(o)===month&&(history||o.archived!==true)).sort((a,b)=>orderPeriodTime(b)-orderPeriodTime(a)||b.id.localeCompare(a.id));
}
export function nextWibMonthAt(now:number):number {
 const local=new Date(now+WIB_OFFSET);
 return Date.UTC(local.getUTCFullYear(),local.getUTCMonth()+1,1)-WIB_OFFSET;
}
