import 'server-only';
import { start } from 'workflow/api';
import { processRegenQueue } from '@/workflows/regen-cs';
export function regenDirectEnabled(){return process.env.REGEN_DIRECT_ENABLED==='true';}
export async function wakeRegenQueue() {
 if(!regenDirectEnabled())return;
 if(!process.env.REGEN_DIRECT_SERVICE_KEY||!process.env.REGEN_ADMIN_BACKEND_ACCESS)throw new Error('Regen worker credentials are missing');
 // Await durable enqueue before acknowledging a webhook. Meta retries on failure.
 await start(processRegenQueue,[],{experimental_retention:0});
}
