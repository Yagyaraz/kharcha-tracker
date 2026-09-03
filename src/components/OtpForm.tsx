"use client";

import { useActionState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { verifyOtp } from "@/app/actions/auth";

export function OtpForm() {
  const [state, formAction, pending] = useActionState(verifyOtp, undefined);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="otp" className="block text-sm font-medium mb-2">
          One-time password
        </label>
        <input
          id="otp"
          name="otp"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          autoFocus
          placeholder="Enter 6-digit OTP"
          className="w-full p-3 text-center text-2xl tracking-[0.4em] bg-transparent border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-3 py-2">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full px-5 py-3 rounded-xl font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
      >
        {pending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ShieldCheck className="w-4 h-4" />
        )}
        {pending ? "Verifying..." : "Continue"}
      </button>
    </form>
  );
}
