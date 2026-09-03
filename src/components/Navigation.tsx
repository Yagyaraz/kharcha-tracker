"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, Lock } from "lucide-react";
import clsx from "clsx";
import { logout } from "@/app/actions/auth";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Expenses", href: "/expenses", icon: Receipt },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 w-full md:relative md:w-64 md:h-screen border-r border-[var(--border)] bg-[var(--card)] z-50">
      <div className="flex flex-col h-full">
        <div className="hidden md:flex h-16 items-center px-6 border-b border-[var(--border)]">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
            Kharcha Tracker
          </h1>
        </div>
        
        <div className="flex-1 py-4 md:py-6">
          <ul className="flex md:flex-col justify-around md:justify-start gap-2 px-2 md:px-4 h-full md:flex-1 pb-safe">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <li key={item.name} className="flex-1 md:flex-none">
                  <Link
                    href={item.href}
                    className={clsx(
                      "flex flex-col md:flex-row items-center gap-2 p-3 md:px-4 md:py-3 rounded-xl transition-all duration-200",
                      isActive
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 font-medium"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50"
                    )}
                  >
                    <Icon className={clsx("w-6 h-6 md:w-5 md:h-5", isActive && "scale-110 transition-transform")} />
                    <span className="text-xs md:text-sm">{item.name}</span>
                  </Link>
                </li>
              );
            })}
            <li className="flex-1 md:flex-none md:mt-auto">
              <form action={logout}>
                <button
                  type="submit"
                  className="w-full flex flex-col md:flex-row items-center gap-2 p-3 md:px-4 md:py-3 rounded-xl transition-all duration-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50"
                >
                  <Lock className="w-6 h-6 md:w-5 md:h-5" />
                  <span className="text-xs md:text-sm">Lock</span>
                </button>
              </form>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
