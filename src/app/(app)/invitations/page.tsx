import Link from "next/link";
import { format } from "date-fns";
import { Mail, RefreshCw } from "lucide-react";
import { requireSession } from "@/app/actions/auth";
import { AddInvitorForm } from "@/components/AddInvitorForm";
import { listInvitations } from "@/lib/invite";

export const dynamic = "force-dynamic";

export default async function InvitationsPage() {
  await requireSession();
  const { invitations, invitors } = await listInvitations();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Invitations</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Who was invited, and by whom.
        </p>
      </div>

      <div className="glass-card p-4 md:p-6 space-y-4">
        <AddInvitorForm />
        {invitors.length > 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Invitators: {invitors.map((invitor) => invitor.name).join(", ")}
          </p>
        )}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Invited to</th>
                <th className="px-4 py-3 font-medium">Invited by</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium text-right">Card</th>
              </tr>
            </thead>
            <tbody>
              {invitations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                    <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No invitations yet.
                  </td>
                </tr>
              ) : (
                invitations.map((item) => (
                  <tr key={item.id} className="border-t border-[var(--border)]">
                    <td className="px-4 py-3 font-medium">{item.invited_to}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{item.invited_by.name}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{item.invitor_phone || "—"}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      {format(new Date(item.created_at), "dd MMM yyyy, hh:mm a")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <Link
                          href={`/invite/${item.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Regenerate card
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
