"use client";

import { useActionState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { addInvitorAction } from "@/app/actions/invite";

export function AddInvitorForm() {
  const [state, formAction, pending] = useActionState(addInvitorAction, undefined);

  return (
    <form action={formAction} className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
        <div className="flex-1">
          <label htmlFor="invitor_name" className="block text-sm font-medium mb-2">
            Add invitator
          </label>
          <input
            id="invitor_name"
            name="name"
            required
            minLength={2}
            maxLength={80}
            placeholder="e.g. Ramesh Sharma"
            className="w-full p-3 bg-transparent border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="px-5 py-3 rounded-xl font-medium bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
          {pending ? "Adding..." : "Add name"}
        </button>
      </div>
      {state?.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
      {state?.ok && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">Invitator added to the dropdown.</p>
      )}
    </form>
  );
}
