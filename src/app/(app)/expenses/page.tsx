import { getExpenses } from "@/app/actions";
import { ExpenseList } from "@/components/ExpenseList";

export const dynamic = 'force-dynamic';

export default async function ExpensesPage() {
  const expenses = await getExpenses();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Expenses</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage and track all your recorded expenses.</p>
      </div>

      <ExpenseList initialExpenses={expenses} />
    </div>
  );
}
