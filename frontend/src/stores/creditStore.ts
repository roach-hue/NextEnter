import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CreditTransaction {
  id: number;
  date: string;
  amount: number;
  type: "충전" | "사용";
  description: string;
  balance: number;
}

export interface Coupon {
  id: number;
  discount: string;
  label: string;
  expiryDate?: string;
  isUsed: boolean;
}

interface CreditState {
  creditBalance: number;
  creditTransactions: CreditTransaction[];
  coupons: Coupon[];
  setCreditBalance: (balance: number) => void;
  addCreditTransaction: (
    transaction: Omit<CreditTransaction, "id" | "balance">,
  ) => void;
  useCoupon: (id: number) => void;
}

export const useCreditStore = create<CreditState>()(
  persist(
    (set, get) => ({
      creditBalance: 0,
      creditTransactions: [],
      coupons: [],

      setCreditBalance: (balance) => set({ creditBalance: balance }),

      addCreditTransaction: (transaction) => {
        const newBalance = get().creditBalance + transaction.amount;
        const newTransaction: CreditTransaction = {
          ...transaction,
          id: Date.now(),
          balance: newBalance,
        };
        set((s) => ({
          creditBalance: newBalance,
          creditTransactions: [newTransaction, ...s.creditTransactions],
        }));
      },

      useCoupon: (id) =>
        set((s) => ({
          coupons: s.coupons.map((c) =>
            c.id === id ? { ...c, isUsed: true } : c,
          ),
        })),
    }),
    { name: "nextenter_credit_store" },
  ),
);
