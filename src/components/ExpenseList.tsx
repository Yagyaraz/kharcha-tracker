"use client";

import { useState, useMemo } from "react";
import { Expense } from "@/lib/types";
import { format } from "date-fns";
import { Search, Filter, ArrowUpDown, Plus, History, Edit2, Receipt } from "lucide-react";
import { ExpenseForm } from "./ExpenseForm";
import { ExpenseHistoryModal } from "./ExpenseHistoryModal";
import clsx from "clsx";

export function ExpenseList({ initialExpenses }: { initialExpenses: Expense[] }) {
  const [expenses] = useState<Expense[]>(initialExpenses);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [spenderFilter, setSpenderFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [historyExpenseId, setHistoryExpenseId] = useState<string | null>(null);

  const filteredAndSorted = useMemo(() => {
    let result = [...expenses];
    
    if (search) {
      result = result.filter(e => e.title.toLowerCase().includes(search.toLowerCase()));
    }
    if (categoryFilter !== "All") {
      result = result.filter(e => e.category === categoryFilter);
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
  }, [expenses, search, categoryFilter, spenderFilter, sortBy, sortOrder]);

  const categories = ["All", "Food", "Travel", "Shopping", "Bills", "Other"];
  const spenders = ["All", "Yagya", "Ramesh"];

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingExpense(null);
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
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(c => <option key={c} value={c} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{c}</option>)}
            </select>
            <select 
              value={spenderFilter}
              onChange={(e) => setSpenderFilter(e.target.value)}
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
              <th className="p-4">Category</th>
              <th className="p-4">Spender</th>
              <th className="p-4 cursor-pointer hover:text-blue-500 transition-colors" onClick={() => { setSortBy("date"); setSortOrder(sortOrder === "asc" ? "desc" : "asc") }}>
                <div className="flex items-center gap-1">Date {sortBy === "date" && <ArrowUpDown className="w-3 h-3"/>}</div>
              </th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSorted.length > 0 ? (
              filteredAndSorted.map(expense => (
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
                    ₹{expense.amount.toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {expense.category}
                    </span>
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
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {expense.is_edited && (
                        <button onClick={() => setHistoryExpenseId(expense.id)} className="p-1.5 text-slate-400 hover:text-purple-500 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors" title="View History">
                          <History className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => handleEdit(expense)} className="p-1.5 text-slate-400 hover:text-emerald-500 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors" title="Edit">
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

      {isFormOpen && <ExpenseForm expense={editingExpense} onClose={closeForm} />}
      {historyExpenseId && <ExpenseHistoryModal expenseId={historyExpenseId} onClose={() => setHistoryExpenseId(null)} />}
    </div>
  );
}
