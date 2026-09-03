import { Shield } from "lucide-react";
import { OtpForm } from "@/components/OtpForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-card p-8">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center mb-4">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Kharcha Tracker</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Enter OTP to open Dashboard and Expenses. Session lasts 1 hour.
          </p>
        </div>
        <OtpForm />
      </div>
    </div>
  );
}
