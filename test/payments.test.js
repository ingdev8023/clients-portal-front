import { describe, expect, it } from 'vitest';
import { getDuePayments, getDuePaymentTotal } from '../src/lib/payments';

const payments = [
  { id: '1', status: 'paid', amount: '100000' },
  { id: '2', status: 'overdue', amount: '250000' },
  { id: '3', status: 'pending', amount: '50000' },
  { id: '4', status: 'overdue', amount: '75000' },
];

describe('payment status helpers', () => {
  it('returns only explicitly overdue payments', () => expect(getDuePayments(payments).map((payment) => payment.id)).toEqual(['2', '4']));
  it('totals overdue amounts as numbers', () => expect(getDuePaymentTotal(payments)).toBe(325000));
});
