// Shared by the owner form and server-side account configuration.
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;
export const PASSWORD_REQUIREMENTS = 'Minimal 8 karakter, dengan huruf kecil, huruf besar, angka, dan setidaknya satu simbol pilihan Anda (misalnya ! atau ?).';

export function passwordValid(value: unknown): value is string {
  return typeof value === 'string'
    && value.length >= MIN_PASSWORD_LENGTH
    && value.length <= MAX_PASSWORD_LENGTH
    && /[a-z]/.test(value)
    && /[A-Z]/.test(value)
    && /[0-9]/.test(value)
    && /[\p{P}\p{S}]/u.test(value);
}
