"use client";

import { useState, useEffect } from "react";
import { ExpenseHistory } from "@/lib/types";
import { getExpenseHistory } from "@/app/actions";
import { X, Loader2, History, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import clsx from "clsx";

export function ExpenseHistoryModal({ expenseId, onClose }: { expenseId: string, onClose: () => void }) {
  const [history, setHistory] = useState<ExpenseHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadHistory() {
      try {
        const data = await getExpenseHistory(expenseId);
        setHistory(data);
      } catch (err: any) {
        setError("Failed to load history.");
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [expenseId]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--card)] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-slate-500" />
            <h2 className="text-xl font-bold">Edit History</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/20">
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">
              {error}
            </div>
          ) : history.length === 0 ? (
            <div className="text-center p-8 text-slate-500">
              No history found for this expense.
            </div>
          ) : (
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent dark:before:via-slate-700">
              {history.map((record) => (
                <div key={record.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[var(--card)] bg-blue-100 dark:bg-blue-900 text-blue-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <span className="text-xs font-bold">v{record.version_number}</span>
                  </div>
                  
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-card p-4 rounded-xl shadow">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                        {format(new Date(record.edited_at), "MMM d, yyyy h:mm a")}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between border-b border-[var(--border)] pb-1">
                        <span className="text-slate-500">Title</span>
                        <span className="font-medium">{record.title}</span>
                      </div>
                      <div className="flex justify-between border-b border-[var(--border)] pb-1">
                        <span className="text-slate-500">Amount</span>
                        <span className="font-medium font-bold text-slate-700 dark:text-slate-200">₹{record.amount}</span>
                      </div>
                      <div className="flex justify-between border-b border-[var(--border)] pb-1">
                        <span className="text-slate-500">Category</span>
                        <span>{record.category}</span>
                      </div>
                      <div className="flex justify-between border-b border-[var(--border)] pb-1">
                        <span className="text-slate-500">Spender</span>
                        <span>{record.spend_by}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Date</span>
                        <span>{format(new Date(record.date), "MMM d, yyyy")}</span>
                      </div>
                      {record.photo_url && (
                         <div className="mt-2 pt-2 border-t border-[var(--border)] text-xs text-blue-500 font-medium">
                            Included photo receipt
                         </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
