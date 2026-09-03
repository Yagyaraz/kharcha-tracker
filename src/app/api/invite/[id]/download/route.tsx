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

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1620;

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
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        display: "flex",
        position: "relative",
        backgroundColor: "#070b14",
        fontFamily,
        color: "white",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          display: "flex",
        }}
      >
        <img src={cafeLeftSrc} width={540} height={CARD_HEIGHT} style={{ objectFit: "cover" }} />
        <img src={cafeRightSrc} width={540} height={CARD_HEIGHT} style={{ objectFit: "cover" }} />
      </div>

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          display: "flex",
          backgroundColor: "rgba(7,11,20,0.72)",
          backgroundImage: "linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(7,11,20,0.88), #05070d)",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 22,
          left: 22,
          width: CARD_WIDTH - 44,
          height: CARD_HEIGHT - 44,
          display: "flex",
          border: "1.5px solid #d4af37",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 48,
          left: 56,
          width: CARD_WIDTH - 112,
          height: CARD_HEIGHT - 96,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "center",
            color: "#e4c56a",
            fontSize: 34,
            fontWeight: 700,
          }}
        >
          {`☾  ${INVITE_COPY.title}  ☾`}
        </div>
        <img src={logoSrc} width={240} height={240} style={{ objectFit: "contain", marginTop: 10 }} />
        <div
          style={{
            display: "flex",
            marginTop: 10,
            border: "1px solid #d4af37",
            borderRadius: 999,
            padding: "8px 24px",
            color: "#f0d78c",
            fontSize: 24,
            fontWeight: 700,
          }}
        >
          {salutation}
        </div>
        <TextBlock top={14} size={22} color="white">
          {body.paragraph1}
        </TextBlock>
        <TextBlock top={10} size={22} color="white">
          {body.paragraph2}
        </TextBlock>
        <TextBlock top={10} size={22} color="white" weight={700}>
          {INVITE_COPY.callToAction}
        </TextBlock>
        <div
          style={{
            display: "flex",
            marginTop: 16,
            width: "100%",
            border: "1px solid rgba(212,175,55,0.85)",
          }}
        >
          <InfoCol label={INVITE_COPY.dateLabel} value={INVITE_COPY.dateValue} />
          <InfoCol label={INVITE_COPY.timeLabel} value={INVITE_COPY.timeValue} />
          <InfoCol label={INVITE_COPY.placeLabel} value={INVITE_COPY.placeValue} last />
        </div>
        <TextBlock top={14} size={20} color="rgba(255,255,255,0.92)">
          {body.closing}
        </TextBlock>
        <div
          style={{
            display: "flex",
            marginTop: 10,
            color: "#e4c56a",
            fontSize: 26,
            fontWeight: 700,
          }}
        >
          {`🙏 ${INVITE_COPY.welcome} 🙏`}
        </div>
        <div style={{ display: "flex", marginTop: 12, color: "white", fontSize: 20 }}>
          {phones}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 6,
            color: "#7d9f55",
            fontSize: 20,
            fontWeight: 700,
          }}
        >
          {INVITE_COPY.family}
        </div>
      </div>
    </div>
  );
}

function TextBlock({
  children,
  top,
  size,
  color,
  weight,
}: {
  children: string;
  top: number;
  size: number;
  color: string;
  weight?: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        marginTop: top,
        justifyContent: "center",
        textAlign: "center",
        color,
        fontSize: size,
        fontWeight: weight ?? 400,
        lineHeight: 1.4,
      }}
    >
      {children}
    </div>
  );
}

function InfoCol({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "33.33%",
        padding: "12px 14px",
        borderRight: last ? "none" : "1px solid rgba(212,175,55,0.5)",
      }}
    >
      <div style={{ display: "flex", color: "#d4af37", fontSize: 18, fontWeight: 700 }}>{label}</div>
      <div style={{ display: "flex", marginTop: 6, color: "white", fontSize: 18, lineHeight: 1.3 }}>{value}</div>
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
