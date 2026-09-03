export const SAMBODHAN_OPTIONS = [
  "आदरणीय",
  "श्री",
  "श्रीमती",
  "सुश्री",
  "Mr.",
  "Mrs.",
  "Ms.",
  "Miss",
  "Dr.",
] as const;

export const CUSTOM_SAMBODHAN_VALUE = "__custom__";

export type Sambodhan = (typeof SAMBODHAN_OPTIONS)[number];

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function formatInvitedTo(sambodhan: string, inviteeName: string) {
  return `${sambodhan} ${inviteeName}`.replace(/\s+/g, " ").trim();
}

export function parseInvitorName(raw: unknown) {
  const name = String(raw ?? "").replace(/\s+/g, " ").trim();
  if (name.length < 2 || name.length > 80) {
    return { error: "Please enter the invitator's name (2–80 characters)." };
  }
  return { name };
}

export function normalizePhone(input: string) {
  let phone = input.replace(/[^\d+]/g, "");
  if (phone.startsWith("+977")) phone = phone.slice(4);
  else if (phone.startsWith("977") && phone.length === 13) phone = phone.slice(3);
  return phone;
}

export function isValidPhone(phone: string) {
  return /^9\d{9}$/.test(phone);
}

export function parseInvitationInput(body: {
  sambodhan?: unknown;
  invitee_name?: unknown;
  invitor_id?: unknown;
  invitor_phone?: unknown;
}) {
  const sambodhan = String(body.sambodhan ?? "").trim();
  const inviteeName = String(body.invitee_name ?? "").trim();
  const invitorId = String(body.invitor_id ?? "").trim();
  const phone = normalizePhone(String(body.invitor_phone ?? ""));

  if (sambodhan.length < 1 || sambodhan.length > 40 || sambodhan === CUSTOM_SAMBODHAN_VALUE) {
    return { error: "Please enter sambodhan / addressing." };
  }
  if (inviteeName.length < 2 || inviteeName.length > 80) {
    return { error: "Please enter the invitee's name (2–80 characters)." };
  }
  if (!UUID_PATTERN.test(invitorId)) {
    return { error: "Please choose who is inviting (Invited by)." };
  }
  if (phone && !isValidPhone(phone)) {
    return { error: "Please enter a valid 10-digit Nepali mobile number." };
  }

  return {
    sambodhan,
    inviteeName,
    invitorId,
    phone: phone || null,
  };
}
