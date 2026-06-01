"use client";

import { useState, useEffect } from "react";
import { ExpenseHistory, Expense } from "@/lib/types";
import { getExpenseHistory } from "@/app/actions";
import { X, Loader2, History, ArrowRight, MessageSquareText, Calendar, User, DollarSign, FileText, Image } from "lucide-react";
import { format } from "date-fns";
import clsx from "clsx";

interface ExpenseHistoryModalProps {
  expenseId: string;
  currentExpense: Expense;
  onClose: () => void;
}

type FieldKey = "title" | "amount" | "spend_by" | "date" | "photo_url";

const FIELDS: { key: FieldKey; label: string; icon: React.ReactNode }[] = [
  { key: "title",     label: "Title",   icon: <FileText className="w-3.5 h-3.5" /> },
  { key: "amount",    label: "Amount",  icon: <DollarSign className="w-3.5 h-3.5" /> },
  { key: "spend_by",  label: "Spender", icon: <User className="w-3.5 h-3.5" /> },
  { key: "date",      label: "Date",    icon: <Calendar className="w-3.5 h-3.5" /> },
  { key: "photo_url", label: "Receipt", icon: <Image className="w-3.5 h-3.5" /> },
];

function formatFieldValue(key: FieldKey, value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  if (key === "amount") return `रु.${Number(value).toLocaleString()}`;
  if (key === "date")   return format(new Date(value as string), "MMM d, yyyy");
  if (key === "photo_url") return "Has receipt photo";
  return String(value);
}

function DiffField({
  label,
  icon,
  oldVal,
  newVal,
}: {
  label: string;
  icon: React.ReactNode;
  oldVal: string;
  newVal: string;
}) {
  const changed = oldVal !== newVal;
  return (
    <div className={clsx(
      "grid grid-cols-[1fr_auto_1fr] gap-2 items-center px-3 py-2.5 rounded-xl text-sm transition-colors",
      changed
        ? "bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20"
        : "bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50"
    )}>
      {/* Label */}
      <div className="col-span-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">
        {icon}
        {label}
        {changed && (
          <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-700 dark:bg-amber-500/30 dark:text-amber-300">
            changed
          </span>
        )}
      </div>

      {/* Old value */}
      <div className={clsx(
        "font-medium text-center px-2 py-1.5 rounded-lg text-xs break-all",
        changed
          ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300 line-through opacity-80"
          : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300"
      )}>
        {oldVal}
      </div>

      {/* Arrow */}
      <div className="flex items-center justify-center">
        <ArrowRight className={clsx("w-3.5 h-3.5 shrink-0", changed ? "text-amber-500" : "text-slate-300 dark:text-slate-600")} />
      </div>

      {/* New value */}
      <div className={clsx(
        "font-medium text-center px-2 py-1.5 rounded-lg text-xs break-all",
        changed
          ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300 font-bold"
          : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300"
      )}>
        {newVal}
      </div>
    </div>
  );
}

export function ExpenseHistoryModal({ expenseId, currentExpense, onClose }: ExpenseHistoryModalProps) {
  const [history, setHistory] = useState<ExpenseHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadHistory() {
      try {
        const data = await getExpenseHistory(expenseId);
        setHistory(data);
      } catch {
        setError("Failed to load history.");
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [expenseId]);

  // Build pairs: each history record is the OLD state; the NEXT record (or current) is the NEW state
  // history is ordered newest-first (version_number desc)
  // So history[0] is the most recent old state → current expense is the NEW
  // history[1] is next old state → history[0] is the NEW
  const pairs: { old: ExpenseHistory; newRecord: ExpenseHistory | Expense; editReason?: string; versionLabel: string }[] = [];

  if (history.length > 0) {
    // Most recent change: old = history[0], new = currentExpense
    pairs.push({
      old: history[0],
      newRecord: currentExpense,
      editReason: currentExpense.edit_reason,
      versionLabel: `v${history[0].version_number} → Current`,
    });

    // Older changes
    for (let i = 1; i < history.length; i++) {
      pairs.push({
        old: history[i],
        newRecord: history[i - 1],
        editReason: history[i - 1].edit_reason,
        versionLabel: `v${history[i].version_number} → v${history[i - 1].version_number}`,
      });
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-[var(--card)] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-gradient-to-r from-slate-50 to-purple-50/40 dark:from-slate-900 dark:to-purple-950/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
              <History className="w-4.5 h-4.5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Edit History</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{currentExpense.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Column headers */}
        {!loading && !error && pairs.length > 0 && (
          <div className="grid grid-cols-[1fr_auto_1fr] px-6 pt-4 pb-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            <span className="text-center text-red-400">← Old Record</span>
            <span className="w-6" />
            <span className="text-center text-green-500">New Record →</span>
          </div>
        )}

        {/* Body */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-5">
          {loading ? (
            <div className="flex justify-center p-10">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">{error}</div>
          ) : pairs.length === 0 ? (
            <div className="text-center p-10 text-slate-500">
              <History className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              No edit history found.
            </div>
          ) : (
            pairs.map((pair, idx) => {
              const oldRecord = pair.old;
              const newRecord = pair.newRecord as any;

              return (
                <div key={idx} className="rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm">
                  
                  {/* Version badge + timestamp */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border-b border-[var(--border)]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300">
                        {pair.versionLabel}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      Edited {format(new Date(oldRecord.edited_at), "MMM d, yyyy · h:mm a")}
                    </span>
                  </div>

                  {/* Edit reason */}
                  {pair.editReason && (
                    <div className="flex items-start gap-2.5 px-4 py-3 bg-blue-50/60 dark:bg-blue-500/10 border-b border-blue-100 dark:border-blue-500/20">
                      <MessageSquareText className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-0.5">Reason for Edit</p>
                        <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">{pair.editReason}</p>
                      </div>
                    </div>
                  )}

                  {/* Field diffs */}
                  <div className="p-3 space-y-2">
                    {FIELDS.map(({ key, label, icon }) => (
                      <DiffField
                        key={key}
                        label={label}
                        icon={icon}
                        oldVal={formatFieldValue(key, oldRecord[key as keyof ExpenseHistory] as any)}
                        newVal={formatFieldValue(key, newRecord[key] as any)}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
