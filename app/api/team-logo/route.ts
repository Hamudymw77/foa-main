import { NextResponse } from "next/server";
import { getTeamLogoUrl } from "../../lib/constants";

export const dynamic = "force-dynamic";

function normalizeKey(name: string) {
  return String(name || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]/g, "");
}

function normalizeName(name: string) {
  return String(name || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]/g, " ");
}

function pickBestBadge(team: any): string | null {
  const candidates = [
    team?.strTeamBadge,
    team?.strTeamLogo,
    team?.strTeamJersey,
    team?.strTeamFanart1
  ].filter(Boolean);
  const url = candidates[0] ? String(candidates[0]) : "";
  return url || null;
}

function isAllowedRedirect(url: string) {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    if (host === "www.thesportsdb.com" || host.endsWith(".thesportsdb.com")) return true;
    if (host === "media.api-sports.io") return true;
    if (host.endsWith(".api-sports.io") && host.startsWith("media")) return true;
    return false;
  } catch {
    return false;
  }
}

function isHttpUrl(value: string | null | undefined) {
  const v = String(value || "");
  return v.startsWith("http://") || v.startsWith("https://");
}

function getNeutralSvgResponse() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" rx="64" fill="rgba(255,255,255,0.08)"/><path d="M64 18c20 0 36 16 36 36 0 24-16 44-36 56-20-12-36-32-36-56 0-20 16-36 36-36Zm0 14c-12.15 0-22 9.85-22 22 0 15.2 9.88 29.74 22 38.12 12.12-8.38 22-22.92 22-38.12 0-12.15-9.85-22-22-22Z" fill="rgba(255,255,255,0.35)"/></svg>`;
  return new NextResponse(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

async function resolveViaApiFootball(teamName: string) {
  const key =
    process.env.API_FOOTBALL_KEY ||
    process.env.NEXT_PUBLIC_API_FOOTBALL_KEY ||
    process.env.API_SPORTS_KEY ||
    "";
  if (!key) return null;

  const url = `https://v3.football.api-sports.io/teams?search=${encodeURIComponent(teamName)}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "foa-main-team-logo/1.0",
      "x-apisports-key": key,
      "x-rapidapi-key": key
    },
    cache: "no-store"
  });
  if (!res.ok) return null;

  const data: any = await res.json();
  const list = Array.isArray(data?.response) ? data.response : [];
  if (list.length === 0) return null;

  const target = normalizeKey(teamName);
  const best =
    list.find((r: any) => normalizeKey(r?.team?.name) === target) ||
    list.find((r: any) => normalizeKey(r?.team?.name).includes(target) || target.includes(normalizeKey(r?.team?.name))) ||
    list[0];

  const logoUrl = best?.team?.logo ? String(best.team.logo) : "";
  if (!logoUrl) return null;
  if (!isAllowedRedirect(logoUrl)) return null;
  return logoUrl;
}

async function resolveViaTheSportsDb(teamName: string) {
  const normalizedTeamName = normalizeName(teamName).replace(/\s+/g, " ").trim();
  const candidates = [
    normalizedTeamName,
    teamName.trim(),
    normalizeKey(teamName)
  ].filter(Boolean);

  for (const q of candidates) {
    const urls = [
      `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(q)}.`,
      `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(q)}`
    ];

    for (const url of urls) {
      try {
        const res = await fetch(url, {
          headers: { "User-Agent": "foa-main-team-logo/1.0" },
          cache: "no-store"
        });
        if (!res.ok) continue;
        const data: any = await res.json();
        const teams = Array.isArray(data?.teams) ? data.teams : [];
        if (teams.length === 0) continue;

        const badge =
          teams[0]?.strBadge ||
          teams[0]?.strTeamBadge ||
          teams[0]?.strBadgeSvg ||
          teams[0]?.strTeamBadgeSvg ||
          teams[0]?.strLogo ||
          teams[0]?.strTeamLogo ||
          null;

        const badgeUrl = badge ? String(badge) : "";
        if (!badgeUrl) continue;
        if (!isHttpUrl(badgeUrl)) continue;
        if (!isAllowedRedirect(badgeUrl)) continue;
        return badgeUrl;
      } catch {}
    }
  }

  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name") || searchParams.get("team") || "";
  const trimmed = name.trim();
  if (!trimmed) {
    return NextResponse.json({ error: "Missing name" }, { status: 400 });
  }

  const normalized = normalizeName(trimmed);
  if (normalized.replace(/\s+/g, "") === "freeagent") {
    return NextResponse.json({ error: "No logo" }, { status: 404 });
  }

  const mapped = getTeamLogoUrl(trimmed) || null;
  if (mapped && isHttpUrl(mapped)) {
    return NextResponse.redirect(mapped, 307);
  }

  try {
    const apiFootballLogo = await resolveViaApiFootball(trimmed);
    if (apiFootballLogo) return NextResponse.redirect(apiFootballLogo, 307);
  } catch {}

  try {
    const sportsDbBadge = await resolveViaTheSportsDb(trimmed);
    if (sportsDbBadge) return NextResponse.redirect(sportsDbBadge, 307);
  } catch {}

  console.log("🚨 LOGO MISSING FOR:", trimmed);
  return getNeutralSvgResponse();
}
