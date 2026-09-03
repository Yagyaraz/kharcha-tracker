import { NextResponse } from "next/server";
import { addInvitation, listInvitations } from "@/lib/invite";
import { parseInvitationInput } from "@/lib/invite-constants";
import { cookies } from "next/headers";
import { SESSION_COOKIE, isValidSessionToken } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = parseInvitationInput(body);
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const result = await addInvitation(parsed);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Could not add invitation.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const authed = isValidSessionToken(cookieStore.get(SESSION_COOKIE)?.value);
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await listInvitations();
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not load invitations." }, { status: 500 });
  }
}
