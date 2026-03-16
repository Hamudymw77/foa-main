"use client"

import { useState, useEffect } from "react"
import { ArrowRightLeft, Trash2, Plus, Save, RefreshCw, Archive, Undo2, X } from "lucide-react"
import { toast } from "sonner"

export function TransfersAdmin() {
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
            console.error(error)
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
            console.error(error)
        }
    }

    useEffect(() => {
        fetchTransfers()
        fetchPlayers()
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        try {
            const res = await fetch('/api/transfers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'add',
                    transfer: { 
                        name, 
                        from, 
                        to, 
                        fee, 
                        window, 
                        type,
                        photo: selectedPhoto // Include photo if selected
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
                                                {t.photo && <img src={t.photo} className="w-full h-full object-cover object-top" />}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-white">{t.player}</div>
                                                <div className="text-xs text-white/50">{t.from} → {t.to} ({t.fee})</div>
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
                                                {t.photo && <img src={t.photo} className="w-full h-full object-cover object-top" />}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-white">{t.player}</div>
                                                <div className="text-xs text-white/50">{t.from} → {t.to} ({t.fee})</div>
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
                                            {t.photo && <img src={t.photo} className="w-full h-full object-cover object-top" />}
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
