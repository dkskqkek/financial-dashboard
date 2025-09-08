import { StateCreator } from 'zustand'
import type { Loan, LoanPayment } from '@/types'

export interface LoansSlice {
  // Loans
  loans: Loan[]
  loanPayments: LoanPayment[]
  setLoans: (loans: Loan[]) => void
  setLoanPayments: (payments: LoanPayment[]) => void
  addLoan: (loan: Loan) => void
  addLoanPayment: (payment: LoanPayment) => void
  updateLoan: (id: string, updates: Partial<Loan>) => void
  updateLoanPayment: (id: string, updates: Partial<LoanPayment>) => void
  deleteLoan: (id: string) => void
  deleteLoanPayment: (id: string) => void
}

export const createLoansSlice: StateCreator<LoansSlice, [], [], LoansSlice> = (set, get) => ({
  // Loans
  loans: [],
  loanPayments: [],
  setLoans: loans => set({ loans }),
  setLoanPayments: loanPayments => set({ loanPayments }),
  addLoan: loan =>
    set(state => ({
      loans: [...state.loans, loan],
    })),
  addLoanPayment: payment =>
    set(state => ({
      loanPayments: [...state.loanPayments, payment],
    })),
  updateLoan: (id, updates) =>
    set(state => ({
      loans: state.loans.map(loan => (loan.id === id ? { ...loan, ...updates } : loan)),
    })),
  updateLoanPayment: (id, updates) =>
    set(state => ({
      loanPayments: state.loanPayments.map(payment => (payment.id === id ? { ...payment, ...updates } : payment)),
    })),
  deleteLoan: id =>
    set(state => ({
      loans: state.loans.filter(loan => loan.id !== id),
    })),
  deleteLoanPayment: id =>
    set(state => ({
      loanPayments: state.loanPayments.filter(payment => payment.id !== id),
    })),
})
