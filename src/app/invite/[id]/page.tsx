import Link from "next/link";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { InvitationCard } from "@/components/InvitationCard";
import { getInvitation } from "@/lib/invite";

export const dynamic = "force-dynamic";

export default async function InvitationCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invitation = await getInvitation(id);

  if (!invitation) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-10 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#f8efd8]">Invitation card</h1>
        <p className="text-sm text-[#f8efd8]/70 mt-1">
          {invitation.invited_to}
        </p>
      </div>

        <InvitationCard
          sambodhan={invitation.sambodhan}
          inviteeName={invitation.invitee_name}
          className="max-w-[560px]"
        />

      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href={`/api/invite/${invitation.id}/download`}
          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium bg-[#c9a227] text-[#3b0c12] hover:bg-[#d4af37] transition-colors"
        >
          <Download className="w-4 h-4" />
          Download card
        </a>
        <Link
          href="/invite"
          className="flex-1 inline-flex items-center justify-center px-5 py-3 rounded-xl font-medium border border-[#c9a227]/50 text-[#f8efd8] hover:bg-white/5 transition-colors"
        >
          Create another
        </Link>
      </div>
    </div>
  );
}
