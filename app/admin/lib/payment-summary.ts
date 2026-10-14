import type { Payment } from './service-types';

export function successfulPaymentSummary(payments: readonly Payment[]) {
  const result = { count: 0, amount: 0, simulatedCount: 0, simulatedAmount: 0 };
  for (const payment of payments) {
    if (payment.status !== 'matched') continue;
    if (payment.test) {
      result.simulatedCount++;
      result.simulatedAmount += payment.amount;
    } else {
      result.count++;
      result.amount += payment.amount;
    }
  }
  return result;
}
