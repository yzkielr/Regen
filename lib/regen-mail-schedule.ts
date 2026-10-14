import 'server-only';
import { randomUUID } from 'node:crypto';
import { start } from 'workflow/api';
import { monitorRegenMail } from '../workflows/regen-mail';
import { mailBackend, mailConfigured } from './paper-mail-worker';
export async function ensureMailSchedule(replace=false){
 if(!mailConfigured())return false;
 const {sync}=await mailBackend({kind:'status'});
 if(!replace&&sync?.generation&&(sync.scheduleUntil||0)>Date.now()&&sync.lastAt>Date.now()-(sync.intervalSeconds===60?5:25)*60000)return true;
 const generation=randomUUID();await mailBackend({kind:'mail_schedule',generation});
 await start(monitorRegenMail,[generation],{experimental_retention:0});return true;
}
