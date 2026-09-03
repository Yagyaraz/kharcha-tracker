"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import html2canvas from "html2canvas-pro";
import { Download, Loader2 } from "lucide-react";
import { InvitationCard } from "@/components/InvitationCard";

export function InvitationCardDownload({
  sambodhan,
  inviteeName,
}: {
  sambodhan: string;
  inviteeName: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = async () => {
    const card = cardRef.current;
    if (!card) return;

    setError("");
    setPending(true);

    try {
      await document.fonts.ready;
      await Promise.all(
        Array.from(card.querySelectorAll("img")).map((image) =>
          image.decode().catch(() => undefined)
        )
      );

      const canvas = await html2canvas(card, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#070b14",
        logging: false,
      });

      const filename = `invitation-${inviteeName.replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "") || "card"}.png`;
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Could not create image.");

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Could not download the card. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <InvitationCard
        ref={cardRef}
        sambodhan={sambodhan}
        inviteeName={inviteeName}
        className="max-w-[560px]"
      />

      {error && (
        <p className="text-sm text-red-300 bg-red-950/40 border border-red-500/30 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleDownload}
          disabled={pending}
          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium bg-[#c9a227] text-[#3b0c12] hover:bg-[#d4af37] transition-colors disabled:opacity-70"
        >
          {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {pending ? "Preparing card..." : "Download card"}
        </button>
        <Link
          href="/invite"
          className="flex-1 inline-flex items-center justify-center px-5 py-3 rounded-xl font-medium border border-[#c9a227]/50 text-[#f8efd8] hover:bg-white/5 transition-colors"
        >
          Create another
        </Link>
      </div>
    </>
  );
}
