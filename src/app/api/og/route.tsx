import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getPreviewTimes, getSharePreview } from "@/lib/share-preview";
import { routing } from "@/routing";

/* The light theme tokens from globals.css; the card can't read CSS variables. */
const PAPER = "#f7f1e6";
const INK = "#2b2019";
const INK_MUTED = "#6a5848";
const TOMATO = "#b83a24";

const font = readFile(join(process.cwd(), "src/assets/fonts/Fraunces-SemiBold.ttf"));
/** The app icon without its background square, so the pan sits straight on the paper. */
const mark = readFile(join(process.cwd(), "public/icon.svg"), "utf8").then((svg) => {
  const cropped = svg
    .replace(/<rect width="512" height="512"[^>]*\/>/, "")
    .replace('viewBox="0 0 512 512"', 'viewBox="96 96 320 320"');
  return `data:image/svg+xml;base64,${Buffer.from(cropped).toString("base64")}`;
});

/** Long names step down in size so they fit in three lines. */
function nameSize(name: string): number {
  if (name.length <= 28) return 104;
  if (name.length <= 55) return 84;
  return 68;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const requested = searchParams.get("locale");
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  const t = await getTranslations({ locale });
  const recipe = await getSharePreview(searchParams.get("id"));
  const heading = recipe?.name ?? t("sharePreviewFallback");
  const times = recipe ? await getPreviewTimes(recipe, locale) : [];

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "56px 80px 64px",
        backgroundColor: PAPER,
        borderBottom: `16px solid ${TOMATO}`,
        color: INK,
        fontFamily: "Fraunces",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 52 }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders plain img only */}
        <img src={await mark} width={112} height={112} alt="" />
        sofrito
      </div>
      <div
        style={{
          display: "block",
          lineClamp: 3,
          fontSize: nameSize(heading),
          lineHeight: 1.1,
          letterSpacing: "-0.015em",
          wordBreak: "break-word",
        }}
      >
        {heading}
      </div>
      <div style={{ display: "flex", gap: 24, fontSize: 40, color: INK_MUTED, minHeight: 52 }}>
        {times.join("  ·  ")}
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [{ name: "Fraunces", data: await font, weight: 600, style: "normal" }],
      headers: {
        // Shares expire, and a missing one may only be a passing store error: don't cache for long.
        "Cache-Control": recipe ? "public, max-age=3600, s-maxage=86400" : "public, max-age=60",
      },
    },
  );
}
