export function getDuePayments(payments) {
  return payments.filter((payment) => payment.status === 'overdue');
}

export function getDuePaymentTotal(payments) {
  return getDuePayments(payments).reduce((total, payment) => total + Number(payment.amount), 0);
}
