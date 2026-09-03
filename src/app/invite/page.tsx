import { InviteForm } from "@/components/InviteForm";
import { listInvitors } from "@/lib/invite";

export const dynamic = "force-dynamic";

export default async function InvitePage() {
  const invitors = await listInvitors().catch(() => []);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-10">
      <InviteForm invitors={invitors} />
    </div>
  );
}
