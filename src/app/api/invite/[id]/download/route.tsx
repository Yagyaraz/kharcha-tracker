import { readFile } from "fs/promises";
import path from "path";
import { ImageResponse } from "next/og";
import { getInvitation } from "@/lib/invite";
import { INVITE_COPY, formatSalutation, getInviteBody } from "@/lib/invite-copy";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invitation = await getInvitation(id);
    if (!invitation) {
      return new Response("Invitation not found.", { status: 404 });
    }

    const [fonts, logo, cafeLeft, cafeRight] = await Promise.all([
      loadCardFonts(),
      loadPublicImage("invite/logo.jpg"),
      loadPublicImage("invite/cafe-left.jpg"),
      loadPublicImage("invite/cafe-right.jpg"),
    ]);

    const filename = `invitation-${invitation.invitee_name.replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "") || "card"}.png`;

    return new ImageResponse(
      (
        <InviteCardImage
          salutation={formatSalutation(invitation.sambodhan, invitation.invitee_name)}
          phones={INVITE_COPY.cafePhones}
          fontFamily={fonts.length ? "Noto Serif Devanagari" : "serif"}
          logoSrc={logo}
          cafeLeftSrc={cafeLeft}
          cafeRightSrc={cafeRight}
        />
      ),
      {
        width: 1080,
        height: 1620,
        fonts,
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      }
    );
  } catch (error) {
    console.error(error);
    return new Response("Could not generate invitation card.", { status: 500 });
  }
}

function InviteCardImage({
  salutation,
  phones,
  fontFamily,
  logoSrc,
  cafeLeftSrc,
  cafeRightSrc,
}: {
  salutation: string;
  phones: string;
  fontFamily: string;
  logoSrc: string;
  cafeLeftSrc: string;
  cafeRightSrc: string;
}) {
  const body = getInviteBody(true);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        backgroundColor: "#070b14",
        fontFamily,
        color: "white",
      }}
    >
      <img src={cafeLeftSrc} width={540} height={1620} style={{ objectFit: "cover" }} />
      <img src={cafeRightSrc} width={540} height={1620} style={{ objectFit: "cover" }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          backgroundImage: "linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(7,11,20,0.9), #05070d)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 22,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          border: "1.5px solid #d4af37",
          padding: "22px 36px 18px",
        }}
      >
        <div style={{ display: "flex", color: "#e4c56a", fontSize: 36, fontWeight: 700 }}>
          ☾            {INVITE_COPY.title}  ☾
        </div>
        <img src={logoSrc} width={280} height={280} style={{ objectFit: "contain", marginTop: 8 }} />
        <div
          style={{
            display: "flex",
            marginTop: 8,
            border: "1px solid #d4af37",
            borderRadius: 999,
            padding: "6px 22px",
            color: "#f0d78c",
            fontSize: 24,
            fontWeight: 700,
          }}
        >
          {salutation}
        </div>
        <div style={{ display: "flex", marginTop: 12, color: "white", fontSize: 22, lineHeight: 1.4, textAlign: "center" }}>
          {body.paragraph1}
        </div>
        <div style={{ display: "flex", marginTop: 10, color: "white", fontSize: 22, lineHeight: 1.4, textAlign: "center" }}>
          {body.paragraph2}
        </div>
        <div style={{ display: "flex", marginTop: 10, color: "white", fontSize: 22, fontWeight: 700, lineHeight: 1.35, textAlign: "center" }}>
          {INVITE_COPY.callToAction}
        </div>
        <div style={{ display: "flex", marginTop: 14, width: "100%", border: "1px solid rgba(212,175,55,0.85)" }}>
          <InfoCol label={INVITE_COPY.dateLabel} value={INVITE_COPY.dateValue} />
          <InfoCol label={INVITE_COPY.timeLabel} value={INVITE_COPY.timeValue} />
          <InfoCol label={INVITE_COPY.placeLabel} value={INVITE_COPY.placeValue} />
        </div>
        <div style={{ display: "flex", marginTop: 12, color: "rgba(255,255,255,0.92)", fontSize: 20, textAlign: "center" }}>
          {body.closing}
        </div>
        <div style={{ display: "flex", marginTop: 8, color: "#e4c56a", fontSize: 26, fontWeight: 700 }}>
          🙏 {INVITE_COPY.welcome} 🙏
        </div>
        <div style={{ display: "flex", marginTop: 10, color: "white", fontSize: 20 }}>
          {phones}
        </div>
        <div style={{ display: "flex", marginTop: 4, color: "#7d9f55", fontSize: 20, fontWeight: 700 }}>
          {INVITE_COPY.family}
        </div>
      </div>
    </div>
  );
}

function InfoCol({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        padding: "10px 12px",
        borderRight: "1px solid rgba(212,175,55,0.5)",
      }}
    >
      <div style={{ display: "flex", color: "#d4af37", fontSize: 18, fontWeight: 700 }}>{label}</div>
      <div style={{ display: "flex", marginTop: 4, color: "white", fontSize: 18, lineHeight: 1.3 }}>{value}</div>
    </div>
  );
}

async function loadPublicImage(relativePath: string) {
  const file = await readFile(path.join(process.cwd(), "public", relativePath));
  return `data:image/jpeg;base64,${file.toString("base64")}`;
}

async function loadCardFonts() {
  try {
    const [regular, bold] = await Promise.all([
      fetch("https://cdn.jsdelivr.net/fontsource/fonts/noto-serif-devanagari@5.2.5/devanagari-400-normal.woff", {
        cache: "force-cache",
      }),
      fetch("https://cdn.jsdelivr.net/fontsource/fonts/noto-serif-devanagari@5.2.5/devanagari-700-normal.woff", {
        cache: "force-cache",
      }),
    ]);
    if (!regular.ok || !bold.ok) return [];
    const [regularData, boldData] = await Promise.all([regular.arrayBuffer(), bold.arrayBuffer()]);
    return [
      { name: "Noto Serif Devanagari", data: regularData, weight: 400 as const, style: "normal" as const },
      { name: "Noto Serif Devanagari", data: boldData, weight: 700 as const, style: "normal" as const },
    ];
  } catch {
    return [];
  }
}
