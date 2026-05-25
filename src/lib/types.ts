export type ExpenseCategory = 'Food' | 'Travel' | 'Shopping' | 'Bills' | 'Other';
export type Spender = 'Yagya' | 'Ramesh';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  photo_url: string | null;
  spend_by: Spender;
  is_edited: boolean;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseHistory {
  id: string;
  expense_id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  photo_url: string | null;
  spend_by: Spender;
  date: string;
  version_number: number;
  edited_at: string;
}
