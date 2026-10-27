const MENU_PDF = "/menu/Moonlight-Chautari-Menu.pdf";

export default function CafeMenuPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-4 py-8 md:py-12">
      <header className="text-center">
        <p className="text-sm tracking-[0.28em] text-[#e8d48a] uppercase">
          Moonlight Chautari
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[0.28em] text-[#f3e2a8]">
          MENU
        </h1>
        <p className="mt-2 text-[#d7c7a0]">Bhajangal, Kirtipur</p>
        <a
          href={MENU_PDF}
          download
          className="mt-5 inline-flex rounded-full border border-[#d4af37] px-5 py-2 text-sm text-[#f0d78c] hover:bg-[#d4af37]/10"
        >
          Download PDF
        </a>
      </header>

      <section className="flex flex-col gap-6">
        <img
          src="/menu/page-1.jpg"
          alt="Moonlight Chautari kitchen menu"
          className="w-full rounded-lg border border-[#d4af37]/40 shadow-2xl"
        />
        <img
          src="/menu/page-2.jpg"
          alt="Moonlight Chautari drinks menu"
          className="w-full rounded-lg border border-[#d4af37]/40 shadow-2xl"
        />
      </section>
    </main>
  );
}
