import type { Operations } from './operations';

export const REGEN_CS_PHONE = '+6285287834725';
export const LEGACY_REGEN_CS_PHONE = '+6281188063832';
export const REGEN_PHONE_REVISION = 1;

export function displayPhone(value: string): string {
  return value.replace(/^\+62(\d{3})(\d{4})(\d{4})$/, '+62 $1-$2-$3');
}

/** One-time migration of the previous CS setting; customer/history data stays intact. */
export function migrateRegenPhone(state: Operations, now: number): Operations {
  if ((state.businessPhoneRevision ?? 0) >= REGEN_PHONE_REVISION) return state;
  const current = state.settings.phone.replace(/[ ()-]/g, '').replace(/^0/, '+62').replace(/^62/, '+62');
  const changed = current === LEGACY_REGEN_CS_PHONE;
  return {
    ...state,
    businessPhoneRevision: REGEN_PHONE_REVISION,
    settings: changed ? { ...state.settings, phone: REGEN_CS_PHONE } : state.settings,
    logs: changed ? [{
      id: 'regen-cs-phone-20261007', at: now, area: 'settings', level: 'info' as const,
      message: `Nomor CS diperbarui ke ${displayPhone(REGEN_CS_PHONE)}. Koneksi WhatsApp masih perlu disiapkan.`,
    }, ...state.logs].slice(0, 500) : state.logs,
  };
}
