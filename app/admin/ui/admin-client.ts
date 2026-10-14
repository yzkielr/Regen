'use client';
let lastActivity = Date.now();
if(typeof window!=='undefined'){
 const active=()=>{lastActivity=Date.now();};
 for(const event of ['pointerdown','keydown','scroll','touchstart','focus'])window.addEventListener(event,active,{passive:true,capture:true});
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')active();});
}
export async function adminFetch(input:RequestInfo|URL,init?:RequestInit){
 // The server owns expiration. A quiet or sleeping tab must not revoke a valid session.
 const headers=new Headers(init?.headers);
 if(Date.now()-lastActivity<60000)headers.set('x-regen-user-active','1');
 const response=await fetch(input,{...init,headers,cache:'no-store'});
 if(response.status===401)window.location.replace('/admin/login');
 return response;
}
export async function logoutAdmin(){
 try{await fetch('/admin/auth/logout',{method:'POST'});}finally{window.location.replace('/admin/login');}
}
