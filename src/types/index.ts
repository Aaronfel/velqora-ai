export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  locale: 'es' | 'en';
  currency_preference: 'ARS' | 'USD';
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  type: 'personal' | 'family' | 'business';
  created_by: string;
  created_at: string;
}

export interface GroupMember {
  user_id: string;
  group_id: string;
  role: 'owner' | 'member' | 'viewer';
  joined_at: string;
  user?: User;
}

export interface Category {
  id: string;
  group_id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
  is_shared: boolean;
  sort_order: number;
}

export interface Transaction {
  id: string;
  group_id: string;
  user_id: string;
  category_id: string;
  amount: number;
  currency: 'ARS' | 'USD';
  type: 'income' | 'expense' | 'transfer';
  description: string;
  date: string;
  receipt_url: string | null;
  is_shared: boolean;
  ai_extracted: boolean;
  created_at: string;
  category?: Category;
  user?: User;
}

export interface Budget {
  id: string;
  group_id: string;
  category_id: string;
  amount: number;
  currency: 'ARS' | 'USD';
  period: 'monthly' | 'weekly';
  month: string;
  category?: Category;
}

export interface SavingsGoal {
  id: string;
  group_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  currency: 'ARS' | 'USD';
  deadline: string;
  icon: string;
  color: string;
}

export interface ExchangeRate {
  id: string;
  from_currency: string;
  to_currency: string;
  rate_type: 'blue';
  buy_rate: number;
  sell_rate: number;
  source: string;
  fetched_at: string;
  manual_override: boolean;
}

export interface HealthScore {
  id: string;
  group_id: string;
  score: number;
  breakdown: {
    savings_rate: number;
    budget_adherence: number;
    debt_ratio: number;
    spending_trends: number;
  };
  calculated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'budget_alert' | 'ai_tip' | 'invite' | 'system';
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

export type TransactionFilter = {
  dateRange?: { from: string; to: string };
  categories?: string[];
  members?: string[];
  visibility?: 'all' | 'shared' | 'personal';
  type?: 'income' | 'expense' | 'transfer' | 'all';
};
