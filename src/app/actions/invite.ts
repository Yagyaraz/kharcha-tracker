"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/app/actions/auth";
import { addInvitor as insertInvitor } from "@/lib/invite";
import { parseInvitorName } from "@/lib/invite-constants";

export type AddInvitorState = {
  error?: string;
  ok?: boolean;
} | undefined;

export async function addInvitorAction(
  _prevState: AddInvitorState,
  formData: FormData
): Promise<AddInvitorState> {
  await requireSession();

  const parsed = parseInvitorName(formData.get("name"));
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  try {
    await insertInvitor(parsed.name);
    revalidatePath("/invitations");
    revalidatePath("/invite");
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not add invitator.";
    return { error: message };
  }
}
