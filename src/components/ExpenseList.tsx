"use client";

import { useState, useMemo } from "react";
import { Expense } from "@/lib/types";
import { format } from "date-fns";
import { Search, Filter, ArrowUpDown, Plus, History, Edit2, Receipt, ChevronLeft, ChevronRight } from "lucide-react";
import { ExpenseForm } from "./ExpenseForm";
import { ExpenseHistoryModal } from "./ExpenseHistoryModal";
import clsx from "clsx";

const ITEMS_PER_PAGE = 10;

export function ExpenseList({ initialExpenses: expenses }: { initialExpenses: Expense[] }) {
  const [search, setSearch] = useState("");
  const [spenderFilter, setSpenderFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [historyExpenseId, setHistoryExpenseId] = useState<string | null>(null);
  const [historyExpense, setHistoryExpense] = useState<Expense | null>(null);

  const filteredAndSorted = useMemo(() => {
    let result = [...expenses];
    
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(e => 
        e.title.toLowerCase().includes(searchLower) || 
        e.amount.toString().includes(searchLower)
      );
    }
    if (spenderFilter !== "All") {
      result = result.filter(e => e.spend_by === spenderFilter);
    }
    
    result.sort((a, b) => {
      if (sortBy === "date") {
        const valA = new Date(a.date).getTime();
        const valB = new Date(b.date).getTime();
        return sortOrder === "asc" ? valA - valB : valB - valA;
      } else {
        return sortOrder === "asc" ? a.amount - b.amount : b.amount - a.amount;
      }
    });
    
    return result;
  }, [expenses, search, spenderFilter, sortBy, sortOrder]);

  // Reset to page 1 when filters change
  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedExpenses = filteredAndSorted.slice(startIndex, endIndex);

  // Reset page when filters change
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleSpenderFilterChange = (value: string) => {
    setSpenderFilter(value);
    setCurrentPage(1);
  };

  const spenders = ["All", "Yagya", "Ramesh"];

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingExpense(null);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push("...");
      for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) {
        pages.push(i);
      }
      if (safePage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="glass-card overflow-hidden flex flex-col min-h-[600px]">
      <div className="p-4 md:p-6 border-b border-[var(--border)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search expenses..." 
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={spenderFilter}
              onChange={(e) => handleSpenderFilterChange(e.target.value)}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {spenders.map(s => <option key={s} value={s} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{s}</option>)}
            </select>
          </div>
        </div>
        
        <button 
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors whitespace-nowrap shadow-lg shadow-blue-500/30"
        >
          <Plus className="w-5 h-5" />
          Add Expense
        </button>
      </div>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-[var(--border)] text-sm font-medium text-slate-500 dark:text-slate-400">
              <th className="p-4 w-16">Receipt</th>
              <th className="p-4">Title</th>
              <th className="p-4 cursor-pointer hover:text-blue-500 transition-colors" onClick={() => { setSortBy("amount"); setSortOrder(sortOrder === "asc" ? "desc" : "asc") }}>
                <div className="flex items-center gap-1">Amount {sortBy === "amount" && <ArrowUpDown className="w-3 h-3"/>}</div>
              </th>
              <th className="p-4">Spender</th>
              <th className="p-4 cursor-pointer hover:text-blue-500 transition-colors" onClick={() => { setSortBy("date"); setSortOrder(sortOrder === "asc" ? "desc" : "asc") }}>
                <div className="flex items-center gap-1">Date {sortBy === "date" && <ArrowUpDown className="w-3 h-3"/>}</div>
              </th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedExpenses.length > 0 ? (
              paginatedExpenses.map(expense => (
                <tr key={expense.id} className="border-b border-[var(--border)] hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="p-4">
                    {expense.photo_url ? (
                      <a 
                        href={expense.photo_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block w-12 h-12 rounded-xl overflow-hidden border border-[var(--border)] hover:opacity-80 hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer bg-slate-100 dark:bg-slate-800"
                        title="View Full Image"
                      >
                        <img 
                          src={expense.photo_url} 
                          alt="Receipt" 
                          className="w-full h-full object-cover"
                        />
                      </a>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-700 text-[10px] text-slate-400 font-medium text-center leading-tight">
                        No<br/>Image
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="font-medium flex items-center gap-2">
                      {expense.title}
                      {expense.is_edited && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 whitespace-nowrap">
                          EDITED
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 font-bold text-slate-700 dark:text-slate-200">
                    रु.{expense.amount.toLocaleString()}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm">
                      <div className={clsx("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm shrink-0", expense.spend_by === "Yagya" ? "bg-gradient-to-br from-blue-400 to-indigo-500" : "bg-gradient-to-br from-emerald-400 to-teal-500")}>
                        {expense.spend_by[0]}
                      </div>
                      {expense.spend_by}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-500 whitespace-nowrap">
                    {format(new Date(expense.date), "MMM d, yyyy")}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {expense.is_edited && (
                        <button
                          onClick={() => { setHistoryExpenseId(expense.id); setHistoryExpense(expense); }}
                          className="p-1.5 rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:hover:bg-purple-500/30 transition-colors"
                          title="View Edit History"
                        >
                          <History className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(expense)}
                        className="p-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/30 transition-colors"
                        title="Edit Expense"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <Receipt className="w-8 h-8 text-slate-300" />
                    <p>No expenses found.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredAndSorted.length > 0 && (
        <div className="p-4 md:p-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Showing <span className="font-medium text-slate-700 dark:text-slate-200">{startIndex + 1}</span> to{" "}
              <span className="font-medium text-slate-700 dark:text-slate-200">{Math.min(endIndex, filteredAndSorted.length)}</span> of{" "}
              <span className="font-medium text-slate-700 dark:text-slate-200">{filteredAndSorted.length}</span> expenses
            </p>
            {(search || spenderFilter !== "All") && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Filtered Total: <span className="font-medium text-slate-700 dark:text-slate-200">रु.{filteredAndSorted.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Previous button */}
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className={clsx(
                "p-2 rounded-lg border transition-all duration-200",
                safePage === 1
                  ? "border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 dark:hover:bg-blue-500/10 dark:hover:border-blue-500/30 dark:hover:text-blue-400"
              )}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page numbers */}
            {getPageNumbers().map((page, idx) =>
              page === "..." ? (
                <span key={`dots-${idx}`} className="px-2 text-slate-400 dark:text-slate-500 text-sm select-none">
                  …
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={clsx(
                    "min-w-[36px] h-9 rounded-lg text-sm font-medium transition-all duration-200",
                    safePage === page
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  {page}
                </button>
              )
            )}

            {/* Next button */}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className={clsx(
                "p-2 rounded-lg border transition-all duration-200",
                safePage === totalPages
                  ? "border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 dark:hover:bg-blue-500/10 dark:hover:border-blue-500/30 dark:hover:text-blue-400"
              )}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {isFormOpen && <ExpenseForm expense={editingExpense} onClose={closeForm} />}
      {historyExpenseId && historyExpense && <ExpenseHistoryModal expenseId={historyExpenseId} currentExpense={historyExpense} onClose={() => { setHistoryExpenseId(null); setHistoryExpense(null); }} />}
    </div>
  );
}
