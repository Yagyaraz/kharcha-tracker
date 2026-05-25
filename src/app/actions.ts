"use server";

import { supabase } from "@/lib/supabase";
import { Expense, ExpenseHistory } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function getDashboardStats() {
  const { data: expenses, error } = await supabase
    .from("expenses")
    .select("*");

  if (error) {
    console.error("Error fetching dashboard stats:", error);
    return null;
  }

  const exps = expenses as Expense[];
  
  let grandTotal = 0;
  let totalYagya = 0;
  let totalRamesh = 0;
  const categoryTotals: Record<string, number> = {};
  
  exps.forEach(exp => {
    grandTotal += Number(exp.amount);
    if (exp.spend_by === "Yagya") totalYagya += Number(exp.amount);
    if (exp.spend_by === "Ramesh") totalRamesh += Number(exp.amount);
    
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + Number(exp.amount);
  });

  return {
    grandTotal,
    totalYagya,
    totalRamesh,
    totalCount: exps.length,
    categoryTotals,
    expenses: exps // we'll use this for recent activity or further monthly calcs
  };
}

export async function getExpenses() {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching expenses:", error);
    return [];
  }
  return data as Expense[];
}

export async function getExpenseHistory(expenseId: string) {
  const { data, error } = await supabase
    .from("expense_history")
    .select("*")
    .eq("expense_id", expenseId)
    .order("version_number", { ascending: false });

  if (error) {
    console.error("Error fetching expense history:", error);
    return [];
  }
  return data as ExpenseHistory[];
}

export async function addExpense(formData: FormData) {
  const title = formData.get("title") as string;
  const amount = Number(formData.get("amount"));
  const category = formData.get("category") as string;
  const spend_by = formData.get("spend_by") as string;
  const date = formData.get("date") as string || new Date().toISOString().split('T')[0];
  const photo_url = formData.get("photo_url") as string | null;

  const { error } = await supabase.from("expenses").insert({
    title,
    amount,
    category,
    spend_by,
    date,
    photo_url,
  });

  if (error) {
    console.error("Error adding expense:", error);
    throw new Error("Failed to add expense");
  }

  revalidatePath("/");
  revalidatePath("/expenses");
}

export async function editExpense(id: string, currentExpense: Expense, formData: FormData) {
  // First fetch the current max version from history
  const { data: historyData } = await supabase
    .from("expense_history")
    .select("version_number")
    .eq("expense_id", id)
    .order("version_number", { ascending: false })
    .limit(1);

  const nextVersion = historyData && historyData.length > 0 ? historyData[0].version_number + 1 : 1;

  // Insert current state into history
  await supabase.from("expense_history").insert({
    expense_id: id,
    title: currentExpense.title,
    amount: currentExpense.amount,
    category: currentExpense.category,
    spend_by: currentExpense.spend_by,
    date: currentExpense.date,
    photo_url: currentExpense.photo_url,
    version_number: nextVersion
  });

  const title = formData.get("title") as string;
  const amount = Number(formData.get("amount"));
  const category = formData.get("category") as string;
  const spend_by = formData.get("spend_by") as string;
  const date = formData.get("date") as string;
  const photo_url = formData.get("photo_url") as string | null;

  // Update expense
  const { error } = await supabase
    .from("expenses")
    .update({
      title,
      amount,
      category,
      spend_by,
      date,
      photo_url,
      is_edited: true,
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) {
    console.error("Error editing expense:", error);
    throw new Error("Failed to edit expense");
  }

  revalidatePath("/");
  revalidatePath("/expenses");
}
