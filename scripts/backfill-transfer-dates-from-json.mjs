import fs from "fs/promises";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const root = process.cwd();
const envPath = path.join(root, ".env.local");
const transfersPath = path.join(root, "app", "transfers.json");

function parseEnv(content) {
  const out = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).trim();
    out[key] = value;
  }
  return out;
}

function normalizeValue(v) {
  if (v == null) return null;
  if (typeof v === "string" && v.trim() === "") return null;
  return v;
}

function matchKey(row) {
  return [row.player, row.from_team, row.to_team, row.fee]
    .map((x) => String(x ?? ""))
    .join("|");
}

function desiredDateFor(t) {
  const d = normalizeValue(t?.date);
  if (d) return String(d);
  const window = String(t?.window || "").trim();
  if (window === "winter_26") return "2026-01-15";
  return null;
}

async function main() {
  const envRaw = await fs.readFile(envPath, "utf8");
  const env = parseEnv(envRaw);
  const SUPABASE_URL = process.env.SUPABASE_URL || env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Chybí SUPABASE_URL nebo SUPABASE_SERVICE_ROLE_KEY.");
  }

  const sourceRaw = await fs.readFile(transfersPath, "utf8");
  const source = JSON.parse(sourceRaw);
  if (!Array.isArray(source)) throw new Error("app/transfers.json není pole.");

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const { data, error } = await supabase.from("transfers").select("id,player,from_team,to_team,fee,date");
  if (error) {
    console.error("Supabase Transfer Error:", error);
    throw new Error(error.message || "Select selhal.");
  }

  const byKey = new Map();
  for (const row of data || []) {
    byKey.set(matchKey(row), row);
  }

  const updates = [];
  for (const t of source) {
    const desired = desiredDateFor(t);
    if (!desired) continue;
    const key = [t?.player, t?.from, t?.to, t?.fee].map((x) => String(x ?? "")).join("|");
    const existing = byKey.get(key);
    if (!existing) continue;
    if (existing.date && String(existing.date).trim() !== "") continue;
    updates.push({ id: existing.id, date: desired });
  }

  console.log("Rows in DB:", (data || []).length);
  console.log("Date updates to apply:", updates.length);

  const chunkSize = 200;
  let done = 0;
  for (let i = 0; i < updates.length; i += chunkSize) {
    const chunk = updates.slice(i, i + chunkSize);
    const { error: upsertErr } = await supabase.from("transfers").upsert(chunk, { onConflict: "id" });
    if (upsertErr) {
      console.error("Supabase Transfer Error:", upsertErr);
      throw new Error(upsertErr.message || "Upsert selhal.");
    }
    done += chunk.length;
    console.log("Updated", done, "/", updates.length);
  }

  console.log("Backfill done.");
}

main().catch((e) => {
  console.error("Backfill failed:", e);
  process.exit(1);
});

