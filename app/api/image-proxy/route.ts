import { NextResponse } from "next/server";

function getAllowedHosts() {
  const hosts = new Set<string>(["resources.premierleague.com", "upload.wikimedia.org", "images.fotmob.com", "a.espncdn.com"]);
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
  const playerName = searchParams.get("playerName") || searchParams.get("name") || "";
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
    const referer =
      target.hostname.toLowerCase() === "images.fotmob.com"
        ? "https://www.fotmob.com/"
        : target.hostname.toLowerCase() === "a.espncdn.com"
          ? "https://www.espn.com/"
          : "https://www.premierleague.com/";

    const response = await fetch(target.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        Referer: referer,
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        Pragma: "no-cache"
      },
      redirect: "follow"
    });

    if (!response.ok) {
      if (playerName) {
        console.log("🚨 PLAYER PHOTO MISSING FOR:", playerName);
      }
      console.log("Image proxy upstream error:", response.status, target.toString());
      throw new Error("Upstream failed");
    }

    const blob = await response.blob();
    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type":
          blob.type ||
          response.headers.get("content-type") ||
          (target.pathname.toLowerCase().endsWith(".svg")
            ? "image/svg+xml"
            : target.pathname.toLowerCase().endsWith(".png")
              ? "image/png"
              : target.pathname.toLowerCase().endsWith(".jpg") || target.pathname.toLowerCase().endsWith(".jpeg")
                ? "image/jpeg"
                : "application/octet-stream"),
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800"
      }
    });
  } catch (e) {
    return NextResponse.json({ error: "Proxy failed" }, { status: 502 });
  }
}
