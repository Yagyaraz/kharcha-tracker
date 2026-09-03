import { type ReactNode, type Ref, forwardRef } from "react";
import clsx from "clsx";
import { Noto_Serif_Devanagari } from "next/font/google";
import { CalendarDays, Clock, MapPin, Phone } from "lucide-react";
import { INVITE_COPY, formatSalutation, getInviteBody, isPersonalInvite } from "@/lib/invite-copy";

const cardFont = Noto_Serif_Devanagari({
  subsets: ["devanagari", "latin"],
  weight: ["400", "600", "700"],
});

export const InvitationCard = forwardRef(function InvitationCard(
  {
    sambodhan,
    inviteeName,
    className,
  }: {
    sambodhan: string;
    inviteeName: string;
    className?: string;
  },
  ref: Ref<HTMLDivElement>
) {
  const salutation = formatSalutation(sambodhan, inviteeName);
  const phones = INVITE_COPY.cafePhones;
  const body = getInviteBody(isPersonalInvite(sambodhan, inviteeName));

  return (
    <div
      ref={ref}
      className={clsx(
        cardFont.className,
        "relative w-full max-w-[520px] mx-auto overflow-hidden shadow-2xl shadow-black/50 text-[12px] sm:text-[13px] md:text-[14px]",
        className
      )}
    >
      <div className="absolute inset-0 flex">
        <img src="/invite/cafe-left.jpg" alt="" className="w-1/2 h-full object-cover" />
        <img src="/invite/cafe-right.jpg" alt="" className="w-1/2 h-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-[#070b14]/88 to-[#05070d]" />

      <div className="absolute inset-[0.55em] border border-[#d4af37] pointer-events-none" />
      <div className="absolute inset-[0.85em] border border-[#d4af37]/35 pointer-events-none" />
      <CornerOrnament className="absolute top-[0.35em] left-[0.35em]" />
      <CornerOrnament className="absolute top-[0.35em] right-[0.35em] scale-x-[-1]" />
      <CornerOrnament className="absolute bottom-[0.35em] left-[0.35em] scale-y-[-1]" />
      <CornerOrnament className="absolute bottom-[0.35em] right-[0.35em] scale-[-1]" />

      <div className="relative flex flex-col items-center text-center px-[1.35em] pt-[1.05em] pb-[0.9em]">
        <p className="flex items-center justify-center gap-[0.45em] text-[#e4c56a] text-[1.35em] font-semibold leading-tight">
          <span aria-hidden>☾</span>
          <span>{INVITE_COPY.title}</span>
          <span aria-hidden>☾</span>
        </p>

        <img
          src="/invite/logo.jpg"
          alt="Moonlight चौतारी"
          className="mt-[0.35em] h-[8.4em] w-auto object-contain"
        />

        <p className="mt-[0.45em] px-[0.95em] py-[0.2em] rounded-full border border-[#d4af37] text-[#f0d78c] text-[1.05em] font-semibold">
          {salutation}
        </p>

        <p className="mt-[0.5em] text-white leading-[1.45]">
          {body.paragraph1}
        </p>
        <p className="mt-[0.4em] text-white leading-[1.45]">
          {body.paragraph2}
        </p>
        <p className="mt-[0.4em] text-white font-semibold leading-[1.4]">
          {INVITE_COPY.callToAction}
        </p>

        <div className="mt-[0.55em] w-full border border-[#d4af37]/80 grid grid-cols-3 divide-x divide-[#d4af37]/50 text-left">
          <DetailCell
            icon={<CalendarDays className="w-[1em] h-[1em] text-[#d4af37]" />}
            label={INVITE_COPY.dateLabel}
            value={INVITE_COPY.dateValue}
          />
          <DetailCell
            icon={<Clock className="w-[1em] h-[1em] text-[#d4af37]" />}
            label={INVITE_COPY.timeLabel}
            value={INVITE_COPY.timeValue}
          />
          <DetailCell
            icon={<MapPin className="w-[1em] h-[1em] text-[#d4af37]" />}
            label={INVITE_COPY.placeLabel}
            value={INVITE_COPY.placeValue}
          />
        </div>

        <p className="mt-[0.5em] text-white/90 leading-[1.4]">
          {body.closing}
        </p>
        <p className="mt-[0.3em] text-[#e4c56a] text-[1.12em] font-semibold">
          🙏 {INVITE_COPY.welcome} 🙏
        </p>

        <p className="mt-[0.4em] flex items-center justify-center gap-[0.35em] text-white leading-snug flex-wrap">
          <Phone className="w-[1em] h-[1em] text-[#d4af37] shrink-0" />
          <span>{phones}</span>
        </p>
        <p className="mt-[0.15em] text-[#7d9f55] font-semibold">{INVITE_COPY.family}</p>
      </div>
    </div>
  );
});

InvitationCard.displayName = "InvitationCard";

function DetailCell({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="px-[0.5em] py-[0.4em] min-w-0">
      <div className="flex items-center gap-[0.3em] text-[#d4af37] mb-[0.12em]">
        {icon}
        <span className="font-semibold">{label}</span>
      </div>
      <p className="text-white leading-snug">{value}</p>
    </div>
  );
}

function CornerOrnament({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={clsx("w-[1.8em] h-[1.8em] text-[#d4af37]", className)}>
      <path
        d="M6 42 C6 22 10 10 24 6 C18 14 16 22 18 30 C12 28 8 34 6 42 Z"
        fill="currentColor"
        opacity="0.85"
      />
      <path d="M8 8 H28 M8 8 V28" stroke="currentColor" strokeWidth="1.4" fill="none" />
    </svg>
  );
}
