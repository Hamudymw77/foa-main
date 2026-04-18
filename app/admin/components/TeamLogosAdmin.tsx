"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { compressImageFile } from "../../lib/imageCompression"

type TeamLogoRow = {
  teamName: string
  url: string
  updatedAt?: string | null
}

interface TeamLogosAdminProps {
  password: string
}

export function TeamLogosAdmin({ password }: TeamLogosAdminProps) {
  const [teamName, setTeamName] = useState("")
  const [logos, setLogos] = useState<TeamLogoRow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [q, setQ] = useState("")

  const filtered = useMemo(() => {
    if (!q) return logos
    const needle = q.toLowerCase()
    return logos.filter((l) => (l.teamName || "").toLowerCase().includes(needle))
  }, [logos, q])

  const fetchLogos = async () => {
    if (!password) return
    setIsLoading(true)
    try {
      const res = await fetch("/api/admin/team-logos", {
        headers: { "x-admin-password": password }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to load logos")
      setLogos(Array.isArray(data.logos) ? data.logos : [])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void fetchLogos()
  }, [password])

  const uploadAndSave = async (file: File) => {
    if (!password) throw new Error("Chybí admin heslo")
    if (!teamName.trim()) throw new Error("Chybí název týmu")

    const compressed = await compressImageFile(file, { maxSizePx: 300, targetBytes: 50 * 1024, mimeType: "image/webp" })
    const form = new FormData()
    form.append("file", compressed)
    form.append("kind", "team_logo")
    form.append("entityId", teamName.trim())
    form.append("password", password)

    const uploadRes = await fetch("/api/admin/upload-asset", { method: "POST", body: form })
    const uploadData = await uploadRes.json()
    if (!uploadRes.ok) throw new Error(uploadData?.error || "Upload failed")

    const url = uploadData.url as string
    const saveRes = await fetch("/api/admin/team-logos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, teamName: teamName.trim(), url })
    })
    const saveData = await saveRes.json()
    if (!saveRes.ok) throw new Error(saveData?.error || "DB save failed")

    return url
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/10">
        <h2 className="text-xl font-bold text-white mb-4">Knihovna log</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-secondary uppercase mb-1 block">Název týmu</label>
            <input
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm font-bold text-white focus:border-accent outline-none"
              placeholder="Např. Arsenal"
            />
          </div>
          <div className="flex items-end">
            <input
              type="file"
              accept="image/*"
              disabled={!password}
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (!f) return
                toast.promise(
                  uploadAndSave(f).then(async () => {
                    setTeamName("")
                    await fetchLogos()
                    return "Logo uloženo"
                  }),
                  {
                    loading: "Nahrávám logo...",
                    success: (msg) => `${msg}`,
                    error: (err) => `Chyba: ${err.message}`
                  }
                )
                e.target.value = ""
              }}
              className="w-full text-xs text-secondary file:bg-accent file:text-slate-900 file:border-0 file:px-4 file:py-3 file:rounded-lg file:font-bold file:uppercase file:tracking-wider file:text-[10px] file:hover:bg-accent/90 file:cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="text-sm font-bold text-secondary uppercase tracking-widest">Uložená loga</div>
          <div className="flex items-center gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none text-white font-bold w-64"
              placeholder="Hledat tým..."
            />
            <button
              onClick={() => void fetchLogos()}
              className="text-xs font-bold text-secondary hover:text-white uppercase"
            >
              Obnovit
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-secondary text-sm">Načítám...</div>
        ) : filtered.length === 0 ? (
          <div className="text-secondary text-sm">Žádná loga</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((l) => (
              <div key={l.teamName} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="w-10 h-10 rounded-full bg-black/40 border border-white/10 overflow-hidden flex items-center justify-center">
                  <img src={l.url} className="w-full h-full object-contain p-1" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white truncate">{l.teamName}</div>
                  <div className="text-[10px] text-white/40 truncate">{l.url}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

