import { NextResponse } from "next/server";
import { getInvitation } from "@/lib/invite";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invitation = await getInvitation(id);
    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found." }, { status: 404 });
    }
    return NextResponse.json(invitation);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not load invitation." }, { status: 500 });
  }
}
