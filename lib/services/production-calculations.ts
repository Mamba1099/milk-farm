
export function calculateBalanceMorning(total_morning: number, balance_yesterday: number, posho_deduction_am: number = 0) {
  return total_morning + balance_yesterday - posho_deduction_am;
}

export function calculateBalanceEvening(total_evening: number, balance_morning: number, posho_deduction_pm: number = 0) {
  return total_evening + balance_morning - posho_deduction_pm;
}

export function calculateTotalMorning(morningBalances: Array<{ balance_am?: number }>, balance_yesterday: number = 0, posho_deduction_am: number = 0) {
  const total_morning = morningBalances.reduce((sum, rec) => sum + (rec.balance_am || 0), 0);
  return calculateBalanceMorning(total_morning, balance_yesterday, posho_deduction_am);
}

export function calculateTotalEvening(eveningBalances: Array<{ balance_pm?: number }>, balance_morning: number = 0, posho_deduction_pm: number = 0) {
  const total_evening = eveningBalances.reduce((sum, rec) => sum + (rec.balance_pm || 0), 0);
  return calculateBalanceEvening(total_evening, balance_morning, posho_deduction_pm);
}
