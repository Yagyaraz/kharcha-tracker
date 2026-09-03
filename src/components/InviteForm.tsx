"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { InvitationCard } from "@/components/InvitationCard";
import { CUSTOM_SAMBODHAN_VALUE, SAMBODHAN_OPTIONS } from "@/lib/invite-constants";
import type { Invitor } from "@/lib/types";

export function InviteForm({ invitors }: { invitors: Invitor[] }) {
  const router = useRouter();
  const [sambodhanChoice, setSambodhanChoice] = useState<string>(SAMBODHAN_OPTIONS[0]);
  const [customSambodhan, setCustomSambodhan] = useState("");
  const [inviteeName, setInviteeName] = useState("");
  const [invitorId, setInvitorId] = useState(invitors[0]?.id ?? "");
  const [invitorPhone, setInvitorPhone] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const isCustom = sambodhanChoice === CUSTOM_SAMBODHAN_VALUE;
  const sambodhan = isCustom ? customSambodhan : sambodhanChoice;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setPending(true);

    try {
      const response = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sambodhan,
          invitee_name: inviteeName,
          invitor_id: invitorId,
          invitor_phone: invitorPhone,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Could not create invitation.");
        return;
      }
      router.push(`/invite/${data.invitation.id}`);
    } catch {
      setError("Could not create invitation.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <form onSubmit={handleSubmit} className="bg-[#10151f] text-[#f3e6b3] rounded-2xl p-6 md:p-8 shadow-xl space-y-5 border border-[#d4af37]/40">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#e4c56a]">Moonlight चौतारी</h1>
          <p className="text-sm text-white/70 mt-1">
            निमन्त्रणा कार्ड बनाउन सम्बोधन, नाम र निम्तो गर्नेको फोन लेख्नुहोस् ।
          </p>
        </div>

        <div>
          <label htmlFor="sambodhan" className="block text-sm font-medium mb-2">
            Sambodhan / Addressing
          </label>
          <select
            id="sambodhan"
            value={sambodhanChoice}
            onChange={(e) => setSambodhanChoice(e.target.value)}
            className="w-full p-3 rounded-xl border border-[#d4af37]/50 bg-[#070b14] text-[#f3e6b3] focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
          >
            {SAMBODHAN_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
            <option value={CUSTOM_SAMBODHAN_VALUE}>Other / आफैं लेख्नुहोस्</option>
          </select>
          {isCustom && (
            <input
              id="sambodhan_custom"
              value={customSambodhan}
              onChange={(e) => setCustomSambodhan(e.target.value)}
              required
              maxLength={40}
              placeholder="Sambodhan / Addressing लेख्नुहोस्"
              className="mt-3 w-full p-3 rounded-xl border border-[#d4af37]/50 bg-[#070b14] text-[#f3e6b3] placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
            />
          )}
        </div>

        <div>
          <label htmlFor="invitee_name" className="block text-sm font-medium mb-2">
            Name of the invited person
          </label>
          <input
            id="invitee_name"
            value={inviteeName}
            onChange={(e) => setInviteeName(e.target.value)}
            required
            minLength={2}
            maxLength={80}
            placeholder="e.g. Ram Bahadur Sharma"
            className="w-full p-3 rounded-xl border border-[#d4af37]/50 bg-[#070b14] text-[#f3e6b3] placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
          />
        </div>

        <div>
          <label htmlFor="invitor_id" className="block text-sm font-medium mb-2">
            Invited by
          </label>
          <select
            id="invitor_id"
            value={invitorId}
            onChange={(e) => setInvitorId(e.target.value)}
            required
            disabled={invitors.length === 0}
            className="w-full p-3 rounded-xl border border-[#d4af37]/50 bg-[#070b14] text-[#f3e6b3] focus:outline-none focus:ring-2 focus:ring-[#d4af37] disabled:opacity-60"
          >
            {invitors.length === 0 ? (
              <option value="">No invitators yet</option>
            ) : (
              invitors.map((invitor) => (
                <option key={invitor.id} value={invitor.id}>
                  {invitor.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label htmlFor="invitor_phone" className="block text-sm font-medium mb-2">
            Phone number of the person who invites
          </label>
          <input
            id="invitor_phone"
            value={invitorPhone}
            onChange={(e) => setInvitorPhone(e.target.value)}
            inputMode="tel"
            placeholder="98XXXXXXXX (optional)"
            className="w-full p-3 rounded-xl border border-[#d4af37]/50 bg-[#070b14] text-[#f3e6b3] placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
          />
        </div>

        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending || invitors.length === 0}
          className="w-full px-5 py-3 rounded-xl font-medium bg-[#d4af37] text-[#070b14] hover:bg-[#e4c56a] flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
        >
          {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {pending ? "Creating card..." : "Create invitation card"}
        </button>
      </form>

      <div>
        <p className="text-center text-[#f8efd8]/70 text-sm mb-3">Live preview</p>
        <InvitationCard sambodhan={sambodhan} inviteeName={inviteeName} />
      </div>
    </div>
  );
}
