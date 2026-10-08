import type { OpsAction, OpsEnvelope } from './operations';
export type AdminRole = 'owner' | 'supervisor' | 'admin';
export type AccountRole = Exclude<AdminRole, 'owner'>;
export type AccountActor = { role: AdminRole; accountId?: string; accountRevision?: number };
export type ManagedAccount = { id:string; username:string; displayName:string; role:AccountRole; enabled:boolean; revision:number; primary:boolean };
export const roleLabel = (role:AdminRole) => role === 'owner' ? 'Pemilik' : role === 'supervisor' ? 'Supervisor' : 'Admin';
export const canSupervise = (role:AdminRole) => role === 'owner' || role === 'supervisor';
export const canManageAccount = (actor:AdminRole,target:AccountRole) => actor === 'owner' || actor === 'supervisor' && target === 'admin';
export function canOpenAdminPage(role:AdminRole,page:string) {return canSupervise(role) || !['accounts','agents','owners','config'].includes(page);}
export function canPerformAdminAction(role:AdminRole,action:OpsAction) {
 if(canSupervise(role))return true;
 if(['restore','seed'].includes(action.type))return false;
 return !action.collection || !['agents','owners'].includes(action.collection);
}
// Filter every workspace response, including mutation and conflict responses.
export function visibleOperations(data:OpsEnvelope,role:AdminRole):OpsEnvelope {
 if(canSupervise(role))return data;
 return {...data,state:{...data.state,records:{...data.state.records,agents:[],owners:[]},logs:data.state.logs.filter(l=>!['agents','owners','accounts'].includes(l.area))}};
}
