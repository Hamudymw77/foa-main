import { NextResponse } from "next/server";

function getAllowedHosts() {
  const hosts = new Set<string>(["resources.premierleague.com", "upload.wikimedia.org"]);
  const supabaseUrl = process.env.SUPABASE_URL || "";
  try {
    if (supabaseUrl) {
      hosts.add(new URL(supabaseUrl).hostname.toLowerCase());
    }
  } catch {}
  return hosts;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("url") || "";
  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  if (target.protocol !== "http:" && target.protocol !== "https:") {
    return NextResponse.json({ error: "Invalid protocol" }, { status: 400 });
  }

  const allowed = getAllowedHosts();
  if (!allowed.has(target.hostname.toLowerCase())) {
    return NextResponse.json({ error: "Host not allowed" }, { status: 400 });
  }

  try {
    const res = await fetch(target.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      redirect: "follow"
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Upstream error: ${res.status}` }, { status: 502 });
    }

    const contentType =
      res.headers.get("content-type") ||
      (target.pathname.toLowerCase().endsWith(".svg")
        ? "image/svg+xml"
        : target.pathname.toLowerCase().endsWith(".png")
          ? "image/png"
          : target.pathname.toLowerCase().endsWith(".jpg") || target.pathname.toLowerCase().endsWith(".jpeg")
            ? "image/jpeg"
            : "application/octet-stream");

    const body = await res.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800"
      }
    });
  } catch (e) {
    console.error("Image proxy error:", e);
    return NextResponse.json({ error: "Proxy failed" }, { status: 502 });
  }
}

