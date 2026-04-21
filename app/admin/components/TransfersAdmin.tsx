"use client"

import { useState, useEffect } from "react"
import { ArrowRightLeft, Trash2, Plus, Save, RefreshCw, Archive, Undo2, X } from "lucide-react"
import { toast } from "sonner"
import { compressImageFile } from "../../lib/imageCompression"

type TeamLogoRow = {
    teamName: string
    url: string
    updatedAt?: string | null
}

interface TransfersAdminProps {
    password: string
}

export function TransfersAdmin({ password }: TransfersAdminProps) {
    const [name, setName] = useState('')
    const [from, setFrom] = useState('')
    const [to, setTo] = useState('')
    const [fee, setFee] = useState('')
    const [window, setWindow] = useState('summer_25')
    const [type, setType] = useState('permanent')
    
    // Autocomplete state
    const [players, setPlayers] = useState<any[]>([])
    const [filteredPlayers, setFilteredPlayers] = useState<any[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [selectedPhoto, setSelectedPhoto] = useState('')
    const [fromLogo, setFromLogo] = useState<string | null>(null)
    const [toLogo, setToLogo] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [teamLogos, setTeamLogos] = useState<TeamLogoRow[]>([])

    // List state
    const [transfers, setTransfers] = useState<{summer: any[], winter: any[], all?: any[]}>({ summer: [], winter: [] })
    const [deletedTransfers, setDeletedTransfers] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [viewMode, setViewMode] = useState<'active' | 'trash'>('active')

    const fetchTransfers = async () => {
        setIsLoading(true)
        try {
            // Fetch active
            const res = await fetch('/api/transfers')
            if (res.ok) {
                const data = await res.json()
                setTransfers(data)
            }

            // Fetch trash (all including deleted, then filter client side or backend if API supported it better)
            // Currently backend returns {all} which includes filtered visible. 
            // We need to request includeDeleted=true to find deleted ones.
            const resDeleted = await fetch('/api/transfers?includeDeleted=true')
            if (resDeleted.ok) {
                const data = await resDeleted.json()
                if (data.all) {
                    setDeletedTransfers(data.all.filter((t: any) => t.deleted))
                }
            }
        } catch (error) {
            console.warn(error)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchPlayers = async () => {
        try {
            const res = await fetch('/api/fpl/players')
            if (res.ok) {
                const data = await res.json()
                setPlayers(data)
            }
        } catch (error) {
            console.warn(error)
        }
    }

    const fetchTeamLogos = async () => {
        if (!password) return
        try {
            const res = await fetch('/api/admin/team-logos', { headers: { 'x-admin-password': password } })
            const data = await res.json()
            if (res.ok && Array.isArray(data.logos)) {
                setTeamLogos(data.logos)
            }
        } catch (error) {
            console.warn(error)
        }
    }

    useEffect(() => {
        fetchTransfers()
        fetchPlayers()
        fetchTeamLogos()
    }, [])

    const handleNameChange = (val: string) => {
        setName(val)
        if (val.length > 2) {
            const filtered = players.filter(p => 
                p.fullName.toLowerCase().includes(val.toLowerCase()) || 
                p.name.toLowerCase().includes(val.toLowerCase())
            ).slice(0, 5)
            setFilteredPlayers(filtered)
            setShowSuggestions(true)
        } else {
            setShowSuggestions(false)
        }
    }

    const selectPlayer = (p: any) => {
        setName(p.name)
        const photoUrl = `https://resources.premierleague.com/premierleague/photos/players/250x250/p${p.code}.png`
        setSelectedPhoto(photoUrl)
        setShowSuggestions(false)
        // If we knew the current team, we could set 'from' or 'to'
        // But for now just Name + Photo is huge help
    }

    const uploadAsset = async (kind: string, entityId: string, file: File) => {
        if (!password) throw new Error('Chybí admin heslo')
        setIsUploading(true)
        try {
            const compressed = await compressImageFile(file, { maxSizePx: 300, targetBytes: 50 * 1024, mimeType: 'image/webp' })
            const form = new FormData()
            form.append('file', compressed)
            form.append('kind', kind)
            form.append('entityId', entityId)
            form.append('password', password)

            const res = await fetch('/api/admin/upload-asset', { method: 'POST', body: form })
            const data = await res.json()
            if (!res.ok) throw new Error(data?.error || 'Upload failed')
            return data.url as string
        } finally {
            setIsUploading(false)
        }
    }

    const upsertTeamLogoRecord = async (teamName: string, url: string) => {
        const res = await fetch('/api/admin/team-logos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password, teamName, url })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error || 'Nepodařilo se uložit logo do DB')
    }

    const uploadAndRegisterTeamLogo = async (teamName: string, file: File) => {
        const url = await uploadAsset('team_logo', teamName, file)
        await upsertTeamLogoRecord(teamName, url)
        await fetchTeamLogos()
        return url
    }

    const handleUploadForNew = async (kind: string, entityId: string, file: File, setUrl: (u: string) => void) => {
        toast.promise(
            uploadAsset(kind, entityId, file).then((url) => {
                setUrl(url)
                return 'Nahráno'
            }),
            {
                loading: 'Nahrávám obrázek...',
                success: (msg) => `${msg}`,
                error: (err) => `Chyba: ${err.message}`
            }
        )
    }

    const updateTransferAssets = async (transferId: string, payload: { photo?: string | null; fromLogo?: string | null; toLogo?: string | null }) => {
        const res = await fetch('/api/transfers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'update', transfer: { id: transferId, ...payload } })
        })
        if (!res.ok) {
            const data = await res.json().catch(() => ({}))
            throw new Error(data?.error || 'Nepodařilo se uložit URL')
        }
    }

    const handleUploadForExisting = async (t: any, kind: string, entityId: string, file: File, field: 'photo' | 'fromLogo' | 'toLogo') => {
        toast.promise(
            uploadAsset(kind, entityId, file)
                .then(async (url) => {
                    await updateTransferAssets(t.id, { [field]: url } as any)
                    await fetchTransfers()
                    return 'Uloženo'
                }),
            {
                loading: 'Nahrávám a ukládám...',
                success: (msg) => `${msg}`,
                error: (err) => `Chyba: ${err.message}`
            }
        )
    }

    const handleSelectLogoForExisting = async (t: any, field: 'fromLogo' | 'toLogo', url: string | null) => {
        toast.promise(
            updateTransferAssets(t.id, { [field]: url } as any).then(async () => {
                await fetchTransfers()
                return 'Uloženo'
            }),
            {
                loading: 'Ukládám...',
                success: (msg) => `${msg}`,
                error: (err) => `Chyba: ${err.message}`
            }
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        try {
            const res = await fetch('/api/transfers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'add',
                    transfer: { 
                        player: name,
                        from, 
                        to, 
                        fee, 
                        window, 
                        type,
                        photo: selectedPhoto || null,
                        fromLogo,
                        toLogo
                    }
                })
            })

            if (res.ok) {
                toast.success('Přestup přidán!')
                setName('')
                setFrom('')
                setTo('')
                setFee('')
                setSelectedPhoto('')
                setFromLogo(null)
                setToLogo(null)
                fetchTransfers() // Refresh list
            } else {
                toast.error('Chyba při ukládání')
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleDelete = async (t: any) => {
        if (!confirm(`Opravdu přesunout přestup ${t.player} do koše?`)) return;

        try {
            const res = await fetch('/api/transfers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'delete',
                    transfer: { id: t.id, name: t.player, from: t.from, to: t.to } 
                })
            })

            if (res.ok) {
                toast.success('Přestup přesunut do koše!')
                fetchTransfers()
            } else {
                toast.error('Chyba při mazání')
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleRestore = async (t: any) => {
        try {
            const res = await fetch('/api/transfers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'restore',
                    transfer: { id: t.id } 
                })
            })

            if (res.ok) {
                toast.success('Přestup obnoven!')
                fetchTransfers()
            } else {
                toast.error('Chyba při obnovení')
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleHardDelete = async (t: any) => {
        if (!confirm(`Opravdu TRVALE smazat přestup ${t.player}? Tato akce je nevratná.`)) return;

        try {
            const res = await fetch('/api/transfers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'hard_delete',
                    transfer: { id: t.id } 
                })
            })

            if (res.ok) {
                toast.success('Přestup trvale smazán!')
                fetchTransfers()
            } else {
                toast.error('Chyba při mazání')
            }
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="space-y-8">
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/10 mt-8">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <ArrowRightLeft className="text-accent" /> Přidat Nový Přestup
                </h2>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="relative">
                        <label className="text-xs font-bold text-secondary uppercase mb-1 block">Jméno hráče (FPL Search)</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={e => handleNameChange(e.target.value)} 
                            className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm font-bold text-white focus:border-accent outline-none"
                            placeholder="Např. Kylian Mbappé"
                            required
                        />
                        {showSuggestions && (
                            <div className="absolute top-full left-0 w-full bg-slate-900 border border-white/10 rounded-lg mt-1 z-50 shadow-xl">
                                {filteredPlayers.map(p => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => selectPlayer(p)}
                                        className="w-full text-left p-2 hover:bg-white/10 text-sm text-white flex items-center justify-between"
                                    >
                                        <span>{p.fullName}</span>
                                        <span className="text-xs text-white/50">{p.team}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="text-xs font-bold text-secondary uppercase mb-1 block">Odkud (From)</label>
                        <input 
                            type="text" 
                            value={from} 
                            onChange={e => setFrom(e.target.value)} 
                            className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm font-bold text-white focus:border-accent outline-none"
                            placeholder="Např. Paris SG"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-secondary uppercase mb-1 block">Kam (To)</label>
                        <input 
                            type="text" 
                            value={to} 
                            onChange={e => setTo(e.target.value)} 
                            className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm font-bold text-white focus:border-accent outline-none"
                            placeholder="Např. Real Madrid"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-secondary uppercase mb-1 block">Částka / Typ</label>
                        <input 
                            type="text" 
                            value={fee} 
                            onChange={e => setFee(e.target.value)} 
                            className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm font-bold text-white focus:border-accent outline-none"
                            placeholder="Např. Free, £100m, Loan"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-secondary uppercase mb-1 block">Okno</label>
                        <select 
                            value={window} 
                            onChange={e => setWindow(e.target.value)} 
                            className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm font-bold text-white focus:border-accent outline-none"
                        >
                            <option value="summer_25">Léto 25/26 (Upcoming)</option>
                            <option value="winter_26">Zima 25/26 (January)</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button type="submit" className="w-full bg-accent text-slate-900 font-bold p-3 rounded-lg hover:bg-accent/90 transition-colors flex items-center justify-center gap-2">
                            <Plus className="w-4 h-4" /> Přidat Přestup
                        </button>
                    </div>

                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-black/30 border border-white/10 rounded-xl p-4">
                            <div className="text-xs font-bold text-secondary uppercase mb-2">Fotka hráče</div>
                            <input
                                type="file"
                                accept="image/*"
                                disabled={isUploading}
                                onChange={(e) => {
                                    const f = e.target.files?.[0]
                                    if (!f) return
                                    void handleUploadForNew('transfer_photo', `${window}-${name || 'player'}`, f, setSelectedPhoto)
                                    e.target.value = ''
                                }}
                                className="w-full text-xs text-secondary file:bg-white/10 file:text-white file:border-0 file:px-3 file:py-2 file:rounded-lg file:font-bold file:uppercase file:tracking-wider file:text-[10px] file:hover:bg-white/20 file:cursor-pointer"
                            />
                            {selectedPhoto && (
                                <div className="mt-3 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-black overflow-hidden border border-white/10">
                                        <img src={selectedPhoto} className="w-full h-full object-cover object-top" />
                                    </div>
                                    <div className="text-[10px] text-white/60 break-all">{selectedPhoto}</div>
                                </div>
                            )}
                        </div>

                        <div className="bg-black/30 border border-white/10 rounded-xl p-4">
                            <div className="text-xs font-bold text-secondary uppercase mb-2">Logo From</div>
                            <select
                                value={fromLogo || ''}
                                onChange={(e) => setFromLogo(e.target.value ? e.target.value : null)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-sm font-bold text-white focus:border-accent outline-none"
                            >
                                <option value="">(Vyber z knihovny)</option>
                                {teamLogos.map((l) => (
                                    <option key={l.teamName} value={l.url}>{l.teamName}</option>
                                ))}
                            </select>
                            <div className="mt-2">
                                <input
                                    type="file"
                                    accept="image/*"
                                    disabled={isUploading}
                                    onChange={(e) => {
                                        const f = e.target.files?.[0]
                                        if (!f) return
                                        toast.promise(
                                            uploadAndRegisterTeamLogo(from || 'from', f).then((url) => {
                                                setFromLogo(url)
                                                return 'Logo uloženo'
                                            }),
                                            {
                                                loading: 'Nahrávám logo...',
                                                success: (msg) => `${msg}`,
                                                error: (err) => `Chyba: ${err.message}`
                                            }
                                        )
                                        e.target.value = ''
                                    }}
                                    className="w-full text-xs text-secondary file:bg-white/10 file:text-white file:border-0 file:px-3 file:py-2 file:rounded-lg file:font-bold file:uppercase file:tracking-wider file:text-[10px] file:hover:bg-white/20 file:cursor-pointer"
                                />
                            </div>
                            {fromLogo && (
                                <div className="mt-3 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-black overflow-hidden border border-white/10">
                                        <img src={fromLogo} className="w-full h-full object-cover object-contain p-1" />
                                    </div>
                                    <div className="text-[10px] text-white/60 break-all">{fromLogo}</div>
                                </div>
                            )}
                        </div>

                        <div className="bg-black/30 border border-white/10 rounded-xl p-4">
                            <div className="text-xs font-bold text-secondary uppercase mb-2">Logo To</div>
                            <select
                                value={toLogo || ''}
                                onChange={(e) => setToLogo(e.target.value ? e.target.value : null)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-sm font-bold text-white focus:border-accent outline-none"
                            >
                                <option value="">(Vyber z knihovny)</option>
                                {teamLogos.map((l) => (
                                    <option key={l.teamName} value={l.url}>{l.teamName}</option>
                                ))}
                            </select>
                            <div className="mt-2">
                                <input
                                    type="file"
                                    accept="image/*"
                                    disabled={isUploading}
                                    onChange={(e) => {
                                        const f = e.target.files?.[0]
                                        if (!f) return
                                        toast.promise(
                                            uploadAndRegisterTeamLogo(to || 'to', f).then((url) => {
                                                setToLogo(url)
                                                return 'Logo uloženo'
                                            }),
                                            {
                                                loading: 'Nahrávám logo...',
                                                success: (msg) => `${msg}`,
                                                error: (err) => `Chyba: ${err.message}`
                                            }
                                        )
                                        e.target.value = ''
                                    }}
                                    className="w-full text-xs text-secondary file:bg-white/10 file:text-white file:border-0 file:px-3 file:py-2 file:rounded-lg file:font-bold file:uppercase file:tracking-wider file:text-[10px] file:hover:bg-white/20 file:cursor-pointer"
                                />
                            </div>
                            {toLogo && (
                                <div className="mt-3 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-black overflow-hidden border border-white/10">
                                        <img src={toLogo} className="w-full h-full object-cover object-contain p-1" />
                                    </div>
                                    <div className="text-[10px] text-white/60 break-all">{toLogo}</div>
                                </div>
                            )}
                        </div>
                    </div>
                </form>
            </div>

            {/* List of Transfers */}
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex gap-4">
                        <button 
                            onClick={() => setViewMode('active')}
                            className={`flex items-center gap-2 text-sm font-bold uppercase transition-colors ${viewMode === 'active' ? 'text-white' : 'text-secondary hover:text-white'}`}
                        >
                            <RefreshCw className="w-4 h-4" /> Aktivní ({transfers.summer.length + transfers.winter.length})
                        </button>
                        <button 
                            onClick={() => setViewMode('trash')}
                            className={`flex items-center gap-2 text-sm font-bold uppercase transition-colors ${viewMode === 'trash' ? 'text-red-400' : 'text-secondary hover:text-red-400'}`}
                        >
                            <Archive className="w-4 h-4" /> Koš ({deletedTransfers.length})
                        </button>
                    </div>
                    <button onClick={fetchTransfers} className="text-xs font-bold text-secondary hover:text-white uppercase">Obnovit</button>
                </div>

                {viewMode === 'active' ? (
                    <div className="space-y-8">
                        {/* Summer */}
                        <div>
                            <h3 className="text-sm font-bold text-accent uppercase mb-3 border-b border-white/10 pb-2">Léto 25/26 ({transfers.summer.length})</h3>
                            <div className="grid grid-cols-1 gap-2">
                                {transfers.summer.map((t) => (
                                    <div key={t.id} className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/5 hover:border-white/10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-black overflow-hidden">
                                                {t.photo && <img src={t.photo} className="w-full h-full object-cover object-top" referrerPolicy="no-referrer" />}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-white">{t.player}</div>
                                                <div className="text-xs text-white/50">{t.from} → {t.to} ({t.fee})</div>
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        disabled={isUploading}
                                                        onChange={(e) => {
                                                            const f = e.target.files?.[0]
                                                            if (!f) return
                                                            void handleUploadForExisting(t, 'transfer_photo', t.id, f, 'photo')
                                                            e.target.value = ''
                                                        }}
                                                        className="text-[10px] text-secondary file:bg-white/10 file:text-white file:border-0 file:px-2 file:py-1 file:rounded file:font-bold file:uppercase file:tracking-wider file:hover:bg-white/20 file:cursor-pointer"
                                                    />
                                                    <select
                                                        value={t.fromLogo || ''}
                                                        onChange={(e) => void handleSelectLogoForExisting(t, 'fromLogo', e.target.value ? e.target.value : null)}
                                                        className="bg-black/40 border border-white/10 rounded px-2 py-1 text-[10px] font-bold text-white"
                                                    >
                                                        <option value="">From logo</option>
                                                        {teamLogos.map((l) => (
                                                            <option key={l.teamName} value={l.url}>{l.teamName}</option>
                                                        ))}
                                                    </select>
                                                    <select
                                                        value={t.toLogo || ''}
                                                        onChange={(e) => void handleSelectLogoForExisting(t, 'toLogo', e.target.value ? e.target.value : null)}
                                                        className="bg-black/40 border border-white/10 rounded px-2 py-1 text-[10px] font-bold text-white"
                                                    >
                                                        <option value="">To logo</option>
                                                        {teamLogos.map((l) => (
                                                            <option key={l.teamName} value={l.url}>{l.teamName}</option>
                                                        ))}
                                                    </select>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        disabled={isUploading}
                                                        onChange={(e) => {
                                                            const f = e.target.files?.[0]
                                                            if (!f) return
                                                            toast.promise(
                                                                uploadAndRegisterTeamLogo(t.from || t.id, f).then(async (url) => {
                                                                    await updateTransferAssets(t.id, { fromLogo: url })
                                                                    await fetchTransfers()
                                                                    return 'Logo uloženo'
                                                                }),
                                                                {
                                                                    loading: 'Nahrávám logo...',
                                                                    success: (msg) => `${msg}`,
                                                                    error: (err) => `Chyba: ${err.message}`
                                                                }
                                                            )
                                                            e.target.value = ''
                                                        }}
                                                        className="text-[10px] text-secondary file:bg-white/10 file:text-white file:border-0 file:px-2 file:py-1 file:rounded file:font-bold file:uppercase file:tracking-wider file:hover:bg-white/20 file:cursor-pointer"
                                                    />
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        disabled={isUploading}
                                                        onChange={(e) => {
                                                            const f = e.target.files?.[0]
                                                            if (!f) return
                                                            toast.promise(
                                                                uploadAndRegisterTeamLogo(t.to || t.id, f).then(async (url) => {
                                                                    await updateTransferAssets(t.id, { toLogo: url })
                                                                    await fetchTransfers()
                                                                    return 'Logo uloženo'
                                                                }),
                                                                {
                                                                    loading: 'Nahrávám logo...',
                                                                    success: (msg) => `${msg}`,
                                                                    error: (err) => `Chyba: ${err.message}`
                                                                }
                                                            )
                                                            e.target.value = ''
                                                        }}
                                                        className="text-[10px] text-secondary file:bg-white/10 file:text-white file:border-0 file:px-2 file:py-1 file:rounded file:font-bold file:uppercase file:tracking-wider file:hover:bg-white/20 file:cursor-pointer"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleDelete(t)}
                                            className="p-2 hover:bg-red-500/20 text-white/30 hover:text-red-500 rounded-lg transition-colors"
                                            title="Přesunout do koše"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Winter */}
                        <div>
                            <h3 className="text-sm font-bold text-blue-400 uppercase mb-3 border-b border-white/10 pb-2">Zima 25/26 ({transfers.winter.length})</h3>
                            <div className="grid grid-cols-1 gap-2">
                                {transfers.winter.map((t) => (
                                    <div key={t.id} className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/5 hover:border-white/10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-black overflow-hidden">
                                                {t.photo && <img src={t.photo} className="w-full h-full object-cover object-top" referrerPolicy="no-referrer" />}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-white">{t.player}</div>
                                                <div className="text-xs text-white/50">{t.from} → {t.to} ({t.fee})</div>
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        disabled={isUploading}
                                                        onChange={(e) => {
                                                            const f = e.target.files?.[0]
                                                            if (!f) return
                                                            void handleUploadForExisting(t, 'transfer_photo', t.id, f, 'photo')
                                                            e.target.value = ''
                                                        }}
                                                        className="text-[10px] text-secondary file:bg-white/10 file:text-white file:border-0 file:px-2 file:py-1 file:rounded file:font-bold file:uppercase file:tracking-wider file:hover:bg-white/20 file:cursor-pointer"
                                                    />
                                                    <select
                                                        value={t.fromLogo || ''}
                                                        onChange={(e) => void handleSelectLogoForExisting(t, 'fromLogo', e.target.value ? e.target.value : null)}
                                                        className="bg-black/40 border border-white/10 rounded px-2 py-1 text-[10px] font-bold text-white"
                                                    >
                                                        <option value="">From logo</option>
                                                        {teamLogos.map((l) => (
                                                            <option key={l.teamName} value={l.url}>{l.teamName}</option>
                                                        ))}
                                                    </select>
                                                    <select
                                                        value={t.toLogo || ''}
                                                        onChange={(e) => void handleSelectLogoForExisting(t, 'toLogo', e.target.value ? e.target.value : null)}
                                                        className="bg-black/40 border border-white/10 rounded px-2 py-1 text-[10px] font-bold text-white"
                                                    >
                                                        <option value="">To logo</option>
                                                        {teamLogos.map((l) => (
                                                            <option key={l.teamName} value={l.url}>{l.teamName}</option>
                                                        ))}
                                                    </select>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        disabled={isUploading}
                                                        onChange={(e) => {
                                                            const f = e.target.files?.[0]
                                                            if (!f) return
                                                            toast.promise(
                                                                uploadAndRegisterTeamLogo(t.from || t.id, f).then(async (url) => {
                                                                    await updateTransferAssets(t.id, { fromLogo: url })
                                                                    await fetchTransfers()
                                                                    return 'Logo uloženo'
                                                                }),
                                                                {
                                                                    loading: 'Nahrávám logo...',
                                                                    success: (msg) => `${msg}`,
                                                                    error: (err) => `Chyba: ${err.message}`
                                                                }
                                                            )
                                                            e.target.value = ''
                                                        }}
                                                        className="text-[10px] text-secondary file:bg-white/10 file:text-white file:border-0 file:px-2 file:py-1 file:rounded file:font-bold file:uppercase file:tracking-wider file:hover:bg-white/20 file:cursor-pointer"
                                                    />
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        disabled={isUploading}
                                                        onChange={(e) => {
                                                            const f = e.target.files?.[0]
                                                            if (!f) return
                                                            toast.promise(
                                                                uploadAndRegisterTeamLogo(t.to || t.id, f).then(async (url) => {
                                                                    await updateTransferAssets(t.id, { toLogo: url })
                                                                    await fetchTransfers()
                                                                    return 'Logo uloženo'
                                                                }),
                                                                {
                                                                    loading: 'Nahrávám logo...',
                                                                    success: (msg) => `${msg}`,
                                                                    error: (err) => `Chyba: ${err.message}`
                                                                }
                                                            )
                                                            e.target.value = ''
                                                        }}
                                                        className="text-[10px] text-secondary file:bg-white/10 file:text-white file:border-0 file:px-2 file:py-1 file:rounded file:font-bold file:uppercase file:tracking-wider file:hover:bg-white/20 file:cursor-pointer"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleDelete(t)}
                                            className="p-2 hover:bg-red-500/20 text-white/30 hover:text-red-500 rounded-lg transition-colors"
                                            title="Přesunout do koše"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {deletedTransfers.length === 0 ? (
                            <div className="text-center py-12 text-white/30">Koš je prázdný</div>
                        ) : (
                            deletedTransfers.map((t) => (
                                <div key={t.id} className="flex items-center justify-between bg-red-500/5 p-3 rounded-lg border border-red-500/10 hover:border-red-500/20">
                                    <div className="flex items-center gap-3 opacity-50">
                                        <div className="w-8 h-8 rounded-full bg-black overflow-hidden">
                                            {t.photo && <img src={t.photo} className="w-full h-full object-cover object-top" referrerPolicy="no-referrer" />}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white">{t.player}</div>
                                            <div className="text-xs text-white/50">{t.from} → {t.to} ({t.fee})</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleRestore(t)}
                                            className="p-2 hover:bg-green-500/20 text-white/30 hover:text-green-500 rounded-lg transition-colors"
                                            title="Obnovit"
                                        >
                                            <Undo2 className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleHardDelete(t)}
                                            className="p-2 hover:bg-red-500/20 text-white/30 hover:text-red-500 rounded-lg transition-colors"
                                            title="Trvale smazat"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
