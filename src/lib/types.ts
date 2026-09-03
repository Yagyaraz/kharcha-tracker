export type Spender = 'Yagya' | 'Ramesh';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  photo_url: string | null;
  spend_by: Spender;
  is_edited: boolean;
  edit_reason?: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseHistory {
  id: string;
  expense_id: string;
  title: string;
  amount: number;
  photo_url: string | null;
  spend_by: Spender;
  edit_reason?: string;
  date: string;
  version_number: number;
  edited_at: string;
}

export interface Invitor {
  id: string;
  name: string;
}

export interface Invitation {
  id: string;
  invitor_id: string;
  sambodhan: string;
  invitee_name: string;
  invitor_phone: string | null;
  created_at: string;
}

export interface InvitationListItem {
  id: string;
  sambodhan: string;
  invitee_name: string;
  invited_to: string;
  invited_by: Invitor;
  invitor_phone: string | null;
  created_at: string;
}
