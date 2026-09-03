import { supabase } from "@/lib/supabase";
import { Invitation, InvitationListItem, Invitor } from "@/lib/types";
import { formatInvitedTo } from "@/lib/invite-constants";

export async function addInvitation(input: {
  sambodhan: string;
  inviteeName: string;
  invitorId: string;
  phone: string | null;
}) {
  const invitor = await getInvitor(input.invitorId);
  if (!invitor) {
    throw new Error("Please choose a valid invitator.");
  }

  const { data, error } = await supabase
    .from("invitations")
    .insert({
      invitor_id: invitor.id,
      sambodhan: input.sambodhan,
      invitee_name: input.inviteeName,
      invitor_phone: input.phone,
    })
    .select()
    .single();

  if (error || !data) {
    console.error("Error adding invitation:", error);
    throw missingTableError(error, "Failed to save invitation");
  }

  const invitation = data as Invitation;
  return {
    invitation,
    invitor,
    invited_to: formatInvitedTo(invitation.sambodhan, invitation.invitee_name),
    invited_by: invitor,
  };
}

export async function listInvitors() {
  const { data, error } = await supabase
    .from("invitors")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    if (isMissingTable(error)) return [];
    console.error("Error listing invitors:", error);
    throw new Error("Failed to load invitators");
  }

  return (data ?? []) as Invitor[];
}

export async function addInvitor(name: string) {
  const { data, error } = await supabase
    .from("invitors")
    .insert({ name })
    .select("id, name")
    .single();

  if (error || !data) {
    if (error?.code === "23505") {
      throw new Error("That invitator name is already in the list.");
    }
    console.error("Error inserting invitor:", error);
    throw missingTableError(error);
  }

  return data as Invitor;
}

export async function listInvitations() {
  const { data, error } = await supabase
    .from("invitations")
    .select("id, sambodhan, invitee_name, invitor_phone, created_at, invitors ( id, name )")
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingTable(error)) {
      return { invitations: [], invitors: [] };
    }
    console.error("Error listing invitations:", error);
    throw new Error("Failed to load invitations");
  }

  const invitations: InvitationListItem[] = (data ?? []).flatMap((row) => {
    const invitor = unwrapInvitor(row.invitors);
    if (!invitor) return [];
    return [{
      id: row.id as string,
      sambodhan: row.sambodhan as string,
      invitee_name: row.invitee_name as string,
      invited_to: formatInvitedTo(row.sambodhan as string, row.invitee_name as string),
      invited_by: invitor,
      invitor_phone: (row.invitor_phone as string | null) ?? null,
      created_at: row.created_at as string,
    }];
  });

  return {
    invitations,
    invitors: await listInvitors(),
  };
}

export async function getInvitation(id: string) {
  const { data, error } = await supabase
    .from("invitations")
    .select("id, sambodhan, invitee_name, invitor_phone, created_at, invitor_id, invitors ( id, name )")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching invitation:", error);
    throw missingTableError(error, "Failed to load invitation");
  }
  if (!data) return null;

  const invitor = unwrapInvitor(data.invitors);
  if (!invitor) return null;

  return {
    id: data.id as string,
    sambodhan: data.sambodhan as string,
    invitee_name: data.invitee_name as string,
    invited_to: formatInvitedTo(data.sambodhan as string, data.invitee_name as string),
    invited_by: invitor,
    invitor_phone: (data.invitor_phone as string | null) ?? null,
    created_at: data.created_at as string,
  };
}

async function getInvitor(id: string) {
  const { data, error } = await supabase
    .from("invitors")
    .select("id, name")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error finding invitor:", error);
    throw missingTableError(error, "Failed to load invitator");
  }
  return (data as Invitor | null) ?? null;
}

function unwrapInvitor(value: unknown): Invitor | null {
  if (!value) return null;
  if (Array.isArray(value)) return (value[0] as Invitor) ?? null;
  return value as Invitor;
}

function isMissingTable(error: { code?: string; message?: string } | null) {
  return (
    error?.code === "PGRST205" ||
    error?.code === "PGRST204" ||
    Boolean(error?.message?.includes("Could not find the table")) ||
    Boolean(error?.message?.includes("Could not find the"))
  );
}

function missingTableError(
  error: { code?: string; message?: string } | null,
  fallback = "Failed to save invitation data"
) {
  if (isMissingTable(error)) {
    return new Error("Invitation tables are not set up yet. Run the SQL script in the Supabase SQL editor.");
  }
  return new Error(fallback);
}
