"use client";

import { useState, useEffect } from "react";
import { Expense } from "@/lib/types";
import { addExpense, editExpense } from "@/app/actions";
import { X, Loader2, Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";
import imageCompression from "browser-image-compression";

export function ExpenseForm({ expense, onClose }: { expense: Expense | null, onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Existing photo URL from the DB
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(expense?.photo_url || null);
  
  // Local file selection state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  // Clean up object URL when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  const handlePhotoSelection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setError("");
      const file = e.target.files?.[0];
      if (!file) return;

      // Image Compression
      const options = {
        maxSizeMB: 0.2,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
        fileType: "image/jpeg"
      };
      
      const compressedFile = await imageCompression(file, options);
      
      // Update local state for preview
      setSelectedFile(compressedFile);
      setLocalPreviewUrl(URL.createObjectURL(compressedFile));
      // Clear existing photo if a new one is selected
      setExistingPhotoUrl(null); 
    } catch (err: any) {
      setError(err.message || "Failed to compress photo");
    }
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setLocalPreviewUrl(null);
    setExistingPhotoUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setLoading(true);
    setError("");
    
    try {
      let finalPhotoUrl = existingPhotoUrl;

      // Upload if there's a new compressed file
      if (selectedFile) {
        const fileExt = "jpg"; // we forced jpeg in compression
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('expense_receipts')
          .upload(filePath, selectedFile, {
             contentType: 'image/jpeg'
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data } = supabase.storage.from('expense_receipts').getPublicUrl(filePath);
        finalPhotoUrl = data.publicUrl;
      }

      if (finalPhotoUrl) {
        formData.set("photo_url", finalPhotoUrl);
      }
      
      if (expense) {
        // Pass empty if removed
        if (!finalPhotoUrl) formData.set("photo_url", ""); 
        await editExpense(expense.id, expense, formData);
      } else {
        await addExpense(formData);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save expense");
    } finally {
      setLoading(false);
    }
  };

  const previewSource = localPreviewUrl || existingPhotoUrl;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--card)] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-slate-50 dark:bg-slate-900">
          <h2 className="text-xl font-bold">{expense ? "Edit Expense" : "Add New Expense"}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="p-3 mb-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-200">
              {error}
            </div>
          )}
          
          <form id="expense-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title / Item <span className="text-red-500">*</span></label>
              <input 
                name="title" 
                required 
                defaultValue={expense?.title}
                className="w-full p-3 bg-transparent border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" 
                placeholder="E.g., Bamboo, Cement, Ply Board, etc."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amount (₹) <span className="text-red-500">*</span></label>
                <input 
                  type="number" 
                  step="0.01"
                  name="amount" 
                  required 
                  defaultValue={expense?.amount}
                  className="w-full p-3 bg-transparent border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" 
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input 
                  type="date" 
                  name="date" 
                  defaultValue={expense?.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                  className="w-full p-3 bg-transparent border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow dark:[color-scheme:dark]" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category <span className="text-red-500">*</span></label>
                <select 
                  name="category" 
                  required 
                  defaultValue={expense?.category || "Other"}
                  className="w-full p-3 bg-transparent border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow appearance-none"
                >
                  <option value="Food" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Food</option>
                  <option value="Travel" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Travel</option>
                  <option value="Shopping" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Shopping</option>
                  <option value="Bills" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Bills</option>
                  <option value="Other" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Spend By <span className="text-red-500">*</span></label>
                <select 
                  name="spend_by" 
                  required 
                  defaultValue={expense?.spend_by || "Yagya"}
                  className="w-full p-3 bg-transparent border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow appearance-none"
                >
                  <option value="Yagya" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Yagya</option>
                  <option value="Ramesh" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Ramesh</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Bill Photo</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="space-y-1 text-center">
                  {previewSource ? (
                    <div className="relative">
                      <img src={previewSource} alt="Bill preview" className="mx-auto h-32 object-contain rounded-md" />
                      <button 
                        type="button" 
                        onClick={handleRemovePhoto} 
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                        title="Remove photo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto h-12 w-12 text-slate-400" />
                      <div className="flex text-sm text-slate-500 justify-center">
                        <label className="relative cursor-pointer bg-transparent rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                          <span>Select a photo</span>
                          <input type="file" className="sr-only" accept="image/*" onChange={handlePhotoSelection} disabled={loading} />
                        </label>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 10MB (will be compressed)</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
        
        <div className="p-4 border-t border-[var(--border)] bg-slate-50 dark:bg-slate-900 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            form="expense-form"
            type="submit" 
            disabled={loading}
            className="px-5 py-2.5 rounded-xl font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-colors disabled:opacity-70"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {expense ? "Save Changes" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
