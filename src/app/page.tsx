import { getDashboardStats } from "./actions";
import { 
  Users, 
  Receipt,
  TrendingUp,
  CreditCard,
  Utensils,
  Plane,
  ShoppingBag,
  Zap,
  MoreHorizontal
} from "lucide-react";
import clsx from "clsx";

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const stats = await getDashboardStats();

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <div className="p-4 bg-red-50 text-red-600 rounded-xl max-w-md text-center border border-red-200">
          <h2 className="text-lg font-bold mb-2">Failed to load data</h2>
          <p className="text-sm">Please check your Supabase connection settings in .env.local and ensure the tables exist.</p>
        </div>
      </div>
    );
  }

  const { grandTotal, totalYagya, totalRamesh, totalCount } = stats;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400">Welcome back! Here's an overview of your expenses.</p>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Grand Total" 
          amount={grandTotal} 
          icon={<span className="text-base font-bold">रु.</span>} 
          trend="+12%" 
          color="blue"
        />
        <StatCard 
          title="Total by Yagya" 
          amount={totalYagya} 
          icon={<Users className="w-5 h-5" />} 
          color="indigo"
        />
        <StatCard 
          title="Total by Ramesh" 
          amount={totalRamesh} 
          icon={<Users className="w-5 h-5" />} 
          color="violet"
        />
        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Expenses</h3>
            <div className="p-2 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold">{totalCount}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Recorded items</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-6">Monthly Report</h2>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white shadow-lg">
                  Y
               </div>
               <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Yagya's Share</p>
                  <p className="text-lg font-bold">{grandTotal > 0 ? Math.round((totalYagya/grandTotal)*100) : 0}%</p>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-lg">
                  R
               </div>
               <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Ramesh's Share</p>
                  <p className="text-lg font-bold">{grandTotal > 0 ? Math.round((totalRamesh/grandTotal)*100) : 0}%</p>
               </div>
            </div>
            
            <div className="pt-6 border-t border-[var(--border)]">
              <p className="text-sm text-slate-500 mb-2">Who owes whom?</p>
              {totalYagya > totalRamesh ? (
                 <p className="font-medium text-emerald-600 dark:text-emerald-400">
                   Ramesh owes Yagya रु.{((totalYagya - totalRamesh)/2).toLocaleString()}
                 </p>
              ) : totalRamesh > totalYagya ? (
                 <p className="font-medium text-blue-600 dark:text-blue-400">
                   Yagya owes Ramesh रु.{((totalRamesh - totalYagya)/2).toLocaleString()}
                 </p>
              ) : (
                 <p className="font-medium text-slate-600 dark:text-slate-300">
                   All settled up!
                 </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, amount, icon, color = "blue", trend }: { title: string, amount: number, icon: React.ReactNode, color?: string, trend?: string }) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
    indigo: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400",
    violet: "bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400",
  };
  
  return (
    <div className="glass-card p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h3>
        <div className={clsx("p-2 rounded-full", colorMap[color] || colorMap.blue)}>
          {icon}
        </div>
      </div>
      <div>
        <div className="text-3xl font-bold flex items-baseline gap-1">
          <span className="text-lg text-slate-400 font-normal">रु.</span>
          {amount.toLocaleString()}
        </div>
        {trend && (
          <p className="text-xs text-emerald-500 flex items-center gap-1 mt-2 font-medium">
            <TrendingUp className="w-3 h-3" />
            {trend} from last month
          </p>
        )}
      </div>
    </div>
  );
}
