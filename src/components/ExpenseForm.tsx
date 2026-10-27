"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Expense } from "@/lib/types";
import { addExpense, editExpense } from "@/app/actions";
import { X, Loader2, Upload, Clipboard, ImagePlus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import imageCompression from "browser-image-compression";

export function ExpenseForm({ expense, onClose }: { expense: Expense | null, onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [pasteFlash, setPasteFlash] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Existing photo URL from the DB
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(expense?.photo_url || null);

  // Local file selection state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  // Shared compression + preview pipeline
  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Only image files are supported.");
      return;
    }
    setError("");
    try {
      const options = {
        maxSizeMB: 0.2,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
        fileType: "image/jpeg" as const,
      };
      const compressed = await imageCompression(file, options);
      setSelectedFile(compressed);
      setLocalPreviewUrl(URL.createObjectURL(compressed));
      setExistingPhotoUrl(null);
    } catch (err: any) {
      setError(err.message || "Failed to compress photo");
    }
  }, []);

  // --- File input change ---
  const handlePhotoSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  // --- Clipboard paste (document-wide) ---
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            setPasteFlash(true);
            setTimeout(() => setPasteFlash(false), 600);
            processFile(file);
          }
          break;
        }
      }
    };
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [processFile]);

  // --- Drag & drop ---
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  // Clean up object URL
  useEffect(() => {
    return () => {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    };
  }, [localPreviewUrl]);

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
                <label className="block text-sm font-medium mb-1">Amount (रु.) <span className="text-red-500">*</span></label>
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
              {expense && (
                <div>
                  <label className="block text-sm font-medium mb-1">Reason for editing <span className="text-red-500">*</span></label>
                  <input 
                    name="edit_reason" 
                    required 
                    defaultValue={expense?.edit_reason || ""}
                    className="w-full p-3 bg-transparent border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                    placeholder="Why are you editing this?"
                  />
                </div>
              )}

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
              <div
                ref={dropZoneRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={[
                  "mt-1 border-2 border-dashed rounded-xl transition-all duration-200",
                  isDragging
                    ? "border-blue-400 bg-blue-50 dark:bg-blue-500/10 scale-[1.01]"
                    : pasteFlash
                    ? "border-green-400 bg-green-50 dark:bg-green-500/10"
                    : "border-slate-300 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50",
                ].join(" ")}
              >
                {previewSource ? (
                  /* ── Preview ── */
                  <div className="relative flex flex-col items-center p-4 gap-3">
                    <div className="relative">
                      <img src={previewSource} alt="Bill preview" className="mx-auto max-h-40 object-contain rounded-lg shadow-md" />
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                        title="Remove photo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <label className="cursor-pointer text-xs text-blue-600 hover:text-blue-500 font-medium flex items-center gap-1">
                      <ImagePlus className="w-3.5 h-3.5" />
                      Replace photo
                      <input type="file" className="sr-only" accept="image/*" onChange={handlePhotoSelection} disabled={loading} />
                    </label>
                  </div>
                ) : (
                  /* ── Empty state ── */
                  <div className="flex flex-col items-center gap-3 px-6 py-6 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      {isDragging
                        ? <Upload className="w-7 h-7 text-blue-500 animate-bounce" />
                        : <Upload className="w-7 h-7 text-slate-400" />}
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        {isDragging ? "Drop to upload" : "Upload bill photo"}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">Drag &amp; drop, paste, or browse</p>
                    </div>

                    {/* Action pills */}
                    <div className="flex flex-wrap justify-center gap-2">
                      <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium cursor-pointer hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/30">
                        <Upload className="w-3.5 h-3.5" />
                        Browse file
                        <input type="file" className="sr-only" accept="image/*" onChange={handlePhotoSelection} disabled={loading} />
                      </label>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-medium">
                        <Clipboard className="w-3.5 h-3.5" />
                        Ctrl+V to paste
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400">PNG, JPG, WEBP · compressed automatically</p>
                  </div>
                )}
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
