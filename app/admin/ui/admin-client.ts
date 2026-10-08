'use client';
let lastActivity = Date.now();
if(typeof window!=='undefined'){
 for(const event of ['pointerdown','keydown','scroll','touchstart'])window.addEventListener(event,()=>{lastActivity=Date.now();},{passive:true});
}
export async function adminFetch(input:RequestInfo|URL,init?:RequestInit){
 if(Date.now()-lastActivity>=30*60*1000){await logoutAdmin();throw Error('Sesi berakhir.');}
 const headers=new Headers(init?.headers);
 if(Date.now()-lastActivity<60000)headers.set('x-regen-user-active','1');
 const response=await fetch(input,{...init,headers,cache:'no-store'});
 if(response.status===401)window.location.replace('/admin/login');
 return response;
}
export async function logoutAdmin(){
 try{await fetch('/admin/auth/logout',{method:'POST'});}finally{window.location.replace('/admin/login');}
}
