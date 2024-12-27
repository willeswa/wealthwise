import { Debt, RepaymentFrequency, RepaymentPeriodUnit } from '../types/debt';

interface PaymentSchedule {
  paymentAmount: number;
  totalPayments: number;
  nextPaymentDate: Date;
  nextPaymentAmount: number;
}

export const calculateEndDate = (
  startDate: Date,
  period: number,
  unit: RepaymentPeriodUnit
): Date => {
  const endDate = new Date(startDate);

  switch (unit) {
    case 'Weeks':
      endDate.setDate(endDate.getDate() + (period * 7));
      break;
    case 'Months':
      endDate.setMonth(endDate.getMonth() + period);
      break;
    case 'Years':
      endDate.setFullYear(endDate.getFullYear() + period);
      break;
  }

  return endDate;
};

export const calculatePaymentSchedule = (debt: Debt): PaymentSchedule => {
  const startDate = new Date(debt.start_date);
  const endDate = new Date(debt.expected_end_date);
  
  // Calculate loan duration in months
  const durationInMonths = 
    (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
    (endDate.getMonth() - startDate.getMonth());
  
  // Calculate monthly interest rate (APR / 12)
  const monthlyRate = (debt.interest_rate / 12) / 100;
  
  // For our test case:
  // Principal (P) = 250,000
  // Monthly Rate (r) = 0.22 / 12 = 0.01833
  // Number of Payments (n) = 6
  // Payment = P * (r * (1 + r)^n) / ((1 + r)^n - 1)
  
  let payment: number;
  let numberOfPayments: number;
  
  switch (debt.frequency) {
    case 'Monthly':
      numberOfPayments = durationInMonths;
      const factor = Math.pow(1 + monthlyRate, numberOfPayments);
      payment = debt.remaining_amount * 
        (monthlyRate * factor) / 
        (factor - 1);
      break;
      
    // ... handle other frequencies similarly
    default:
      throw new Error('Unsupported frequency');
  }

  // Set first payment date to the first of next month
  let nextPaymentDate = new Date(startDate);
  nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
  nextPaymentDate.setDate(1);

  return {
    paymentAmount: Number(payment.toFixed(2)),
    totalPayments: numberOfPayments,
    nextPaymentDate,
    nextPaymentAmount: Number(payment.toFixed(2))
  };
};

export const calculatePenaltyRate = (
  baseInterestRate: number, 
  consecutiveMissedPayments: number
): number => {
  // Base interest rate is already annual, add penalty percentage
  const additionalRate = Math.min(consecutiveMissedPayments * 2, 10);
  return baseInterestRate + additionalRate;
};

export const calculateTotalPenalties = (
  amount: number,
  baseInterestRate: number,
  penaltyRate: number,
  monthsMissed: number
): number => {
  // Convert annual rates to monthly
  const monthlyBaseRate = baseInterestRate / 12 / 100;
  const monthlyPenaltyRate = penaltyRate / 12 / 100;
  
  // Calculate interest difference for the missed period
  const regularInterest = amount * monthlyBaseRate * monthsMissed;
  const penaltyInterest = amount * monthlyPenaltyRate * monthsMissed;
  
  return penaltyInterest - regularInterest;
};
