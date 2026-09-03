import { notFound } from "next/navigation";
import { InvitationCardDownload } from "@/components/InvitationCardDownload";
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

      <InvitationCardDownload
        sambodhan={invitation.sambodhan}
        inviteeName={invitation.invitee_name}
      />
    </div>
  );
}
