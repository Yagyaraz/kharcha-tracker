import type { Metadata } from "next";
import { Noto_Serif_Devanagari } from "next/font/google";

const noto = Noto_Serif_Devanagari({
  subsets: ["devanagari", "latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Invitation | Kharcha Tracker",
  description: "Create and view invitation cards.",
};

export default function InviteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`${noto.className} min-h-screen bg-[#070b14] text-[#f8efd8]`}
      style={{ colorScheme: "light" }}
    >
      {children}
    </div>
  );
}
