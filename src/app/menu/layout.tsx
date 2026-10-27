import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Menu | Moonlight Chautari",
  description: "Moonlight Chautari cafe menu.",
};

export default function MenuLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#070706] text-[#f6ead0]">{children}</div>
  );
}
