'use client';
import {useEffect,useState} from 'react';
import type {Entry} from '../lib/operations';
import {nextWibMonthAt,orderHistoryMonths,orderMonthLabel,ordersInMonth,wibMonthKey} from '../lib/order-periods';

export function useWibMonth(enabled=true){
 const [month,setMonth]=useState(()=>wibMonthKey(Date.now()));
 useEffect(()=>{
  if(!enabled)return;
  let timer:ReturnType<typeof setTimeout>;
  const update=()=>{
   clearTimeout(timer);const now=Date.now();setMonth(wibMonthKey(now));
   // Schedule the boundary directly, with hourly checks for clock changes.
   timer=setTimeout(update,Math.max(1,Math.min(3600000,nextWibMonthAt(now)-now)));
  };
  update();window.addEventListener('focus',update);document.addEventListener('visibilitychange',update);
  return()=>{clearTimeout(timer);window.removeEventListener('focus',update);document.removeEventListener('visibilitychange',update);};
 },[enabled]);
 return month;
}
export function useOrderPeriod(orders:Entry[],history=false,enabled=true){
 const currentMonth=useWibMonth(enabled),months=orderHistoryMonths(orders),[chosenMonth,setMonth]=useState('');
 const options=months.length?months:[currentMonth];
 const selectedMonth=options.includes(chosenMonth)?chosenMonth:options[0];
 const month=history?selectedMonth:currentMonth;
 return {currentMonth,months:options,selectedMonth,setMonth,month,orders:ordersInMonth(orders,month,history)};
}
export function OrderMonthSelect({months,value,onChange}:{months:string[];value:string;onChange:(value:string)=>void}){
 return <label className="ops-field"><span>Bulan invoice</span><select aria-label="Bulan history invoice" value={value} onChange={e=>onChange(e.target.value)}>{months.map(month=><option key={month} value={month}>{orderMonthLabel(month)}</option>)}</select></label>;
}
