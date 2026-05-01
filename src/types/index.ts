export interface Transaction {
  id: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  note?: string;
  walletId: string;
}

export interface Wallet {
  id: string;
  name: string;
  balance: number;
  currency: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
}

export interface Debt {
  id: string;
  amount: number;
  type: "pay" | "receive";
  person: string;
  dueDate?: string;
  status: "pending" | "resolved";
}

export interface Investment {
  id: string;
  name: string;
  amount: number;
  returnRate?: number;
}

export interface SplitBill {
  id: string;
  totalAmount: number;
  participants: Array<{
    name: string;
    amount: number;
    status: "paid" | "unpaid";
  }>;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt?: string;
}

export interface UserProgress {
  userId: string;
  level: number;
  points: number;
  achievements: Achievement[];
}
