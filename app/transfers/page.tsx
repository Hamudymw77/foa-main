"use client"

import { useState, useEffect, useMemo } from "react"
import { Header } from "../components/Header"
import { Footer } from "../components/Footer"
import { BackToTop } from "../components/BackToTop"
import { ArrowRight, RefreshCw, User, Calendar, Shield, Activity, Target, ChevronDown, ChevronUp, Filter } from "lucide-react"
import { PlayerAvatar } from "../components/PlayerAvatar"
import { TeamBadge } from "../components/TeamBadge"

// Stat Box Component
const StatBox = ({ label, value, icon: Icon, color }: any) => (
    <div className={`flex flex-col items-center p-2 rounded-lg border border-white/5 ${color} bg-white/5`}>
        <div className="flex items-center gap-1.5 mb-1 text-white/60 text-[10px] uppercase font-bold tracking-wider">
            <Icon className="w-3 h-3" /> {label}
        </div>
        <div className="text-xl font-black text-white">{value}</div>
    </div>
)

const TransferCard = ({ t }: { t: any }) => {
    const [showStats, setShowStats] = useState(false);
    const [imgError, setImgError] = useState(false);
    
    if (!t) return null;

    const isAttacker = t.stats?.role === 'FWD' || t.stats?.role === 'MID';

    return (
        <div className="group relative bg-white/5 hover:bg-white/10 border border-white/5 hover:border-accent/50 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-accent/10">
            {/* Header / Main Info */}
            <div className="p-6 pb-4">
                {/* Background Effect */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/10 transition-colors" />

                {/* Player Photo */}
                <div className="relative flex justify-center mb-6 mt-2">
                    <div className="w-28 h-28 rounded-full bg-slate-900 border-4 border-white/10 group-hover:border-accent transition-colors overflow-hidden shadow-2xl relative z-10 flex items-center justify-center">
                        <PlayerAvatar 
                            name={t.player} 
                            photoUrl={t.photo} 
                            className="w-full h-full" 
                        />
                    </div>
                    <div className={`absolute -bottom-3 px-3 py-1 bg-slate-900 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors z-20 flex items-center gap-1 ${t.type === 'loan' ? 'text-blue-400 border-blue-400/30' : 'text-accent border-accent/30'}`}>
                        {t.type === 'loan' ? 'On Loan' : 'Transfer'}
                    </div>
                </div>

                {/* Player Name */}
                <div className="text-center mb-6 relative z-10">
                    <h3 className="text-xl font-black text-white group-hover:text-accent transition-colors truncate px-2">{t.player}</h3>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Confirmed Deal</p>
                </div>

                {/* Clubs Flow */}
                <div className="flex items-center justify-between relative z-10 bg-black/20 rounded-xl p-3 border border-white/5 mb-4">
                    <div className="flex flex-col items-center gap-2 w-[35%]">
                        <div className="w-10 h-10 flex items-center justify-center">
                            <TeamBadge name={t.from} className="w-full h-full" />
                        </div>
                        <span className="text-[9px] font-bold text-white/50 truncate w-full text-center leading-tight">{t.from}</span>
                    </div>

                    <div className="flex flex-col items-center justify-center w-[30%]">
                        <div className="text-[9px] font-bold text-accent mb-1 uppercase tracking-wider text-center">{t.fee}</div>
                        <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                    </div>

                    <div className="flex flex-col items-center gap-2 w-[35%]">
                        <div className="w-12 h-12 flex items-center justify-center">
                            <TeamBadge name={t.to} className="w-full h-full scale-110" />
                        </div>
                        <span className="text-[9px] font-bold text-white truncate w-full text-center leading-tight">{t.to}</span>
                    </div>
                </div>
            </div>

            {/* Stats Toggle Button */}
            {t.stats && (
                <>
                    <button 
                        onClick={() => setShowStats(!showStats)}
                        className="w-full py-2 bg-white/5 hover:bg-white/10 border-t border-white/5 text-[10px] font-bold uppercase tracking-widest text-secondary hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                        {showStats ? 'Hide Stats' : 'View Season Stats'}
                        {showStats ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    {/* Accordion Stats */}
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out bg-black/20 ${showStats ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="p-4 grid grid-cols-3 gap-2">
                            {isAttacker ? (
                                <>
                                    <StatBox label="Goals" value={t.stats.goals || 0} icon={Target} color="text-green-400" />
                                    <StatBox label="Assists" value={t.stats.assists || 0} icon={User} color="text-blue-400" />
                                    <StatBox label="Points" value={t.stats.points || 0} icon={Activity} color="text-yellow-400" />
                                </>
                            ) : (
                                <>
                                    <StatBox label="CBIT" value={t.stats.cbit || 0} icon={Shield} color="text-green-400" />
                                    <StatBox label="Points" value={t.stats.points || 0} icon={Target} color="text-purple-400" />
                                    <StatBox label="Clean Sheets" value={t.stats.clean_sheets || 0} icon={Shield} color="text-blue-400" />
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const LatestTransferItem = ({ t }: { t: any }) => {
    if (!t) return null;

    return (
        <div className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 p-3 rounded-xl flex items-center gap-3 transition-all cursor-default">
            <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden shrink-0 border border-white/10 flex items-center justify-center">
                <PlayerAvatar 
                    name={t.player} 
                    photoUrl={t.photo} 
                    className="w-full h-full scale-110 translate-y-1" 
                />
            </div>
            <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{t.player}</p>
                <p className="text-[10px] text-accent truncate">{t.fee}</p>
            </div>
        </div>
    );
};

const TEAMS = [
    "Arsenal", "Aston Villa", "Bournemouth", "Brentford", "Brighton", 
    "Burnley", "Chelsea", "Crystal Palace", "Everton", "Fulham", 
    "Leeds", "Liverpool", "Man City", "Man Utd", "Newcastle", 
    "Nottingham Forest", "Sunderland", "Tottenham", "West Ham", "Wolves"
];

export default function TransfersPage() {
  const [data, setData] = useState<{ summer: any[], winter: any[] }>({ summer: [], winter: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'summer' | 'winter'>('summer')
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTransfers() {
      try {
        const res = await fetch('/api/transfers')
        if (res.ok) {
            const json = await res.json()
            setData(json)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
    fetchTransfers()
  }, [])

  // Filter logic
  const filteredData = useMemo(() => {
      const currentList = activeTab === 'summer' ? data.summer : data.winter;
      
      // Remove Kevin De Bruyne completely
      const listWithoutKDB = currentList.filter(t => 
        !(t.player === 'Kevin De Bruyne' || (t.player.includes('De Bruyne') && t.player.includes('Kevin')))
      );
      
      if (!selectedTeam) return listWithoutKDB;
      
      return listWithoutKDB.filter(t => 
          (t.club && t.club === selectedTeam) || 
          (t.to === selectedTeam) || 
          (t.from === selectedTeam)
      );
  }, [data, activeTab, selectedTeam]);

  // Latest 5 Transfers (just from winter if available, else mixed)
  const latestTransfers = [...data.winter, ...data.summer].slice(0, 5);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <Header />
      
      <main className="container mx-auto max-w-7xl px-4 md:px-8 py-8 flex-1">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-accent to-yellow-600 rounded-2xl shadow-lg shadow-accent/20">
                    <RefreshCw className="w-8 h-8 text-slate-900" />
                </div>
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
                        Transfer <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-yellow-500">Market</span>
                    </h1>
                    <p className="text-secondary font-medium text-lg">Official Premier League Deals (25/26)</p>
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/10 backdrop-blur-md">
                <button 
                    onClick={() => { setActiveTab('summer'); setSelectedTeam(null); }}
                    className={`px-8 py-3 rounded-lg text-sm font-black uppercase tracking-wider transition-all duration-300 ${activeTab === 'summer' ? 'bg-accent text-slate-900 shadow-[0_0_20px_rgba(251,191,36,0.3)] scale-105' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                >
                    Summer 2025
                </button>
                <button 
                    onClick={() => { setActiveTab('winter'); setSelectedTeam(null); }}
                    className={`px-8 py-3 rounded-lg text-sm font-black uppercase tracking-wider transition-all duration-300 ${activeTab === 'winter' ? 'bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] scale-105' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                >
                    January 2026
                </button>
            </div>
        </div>

        {/* Team Filter Bar */}
        <div className="mb-10 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0">
            <div className="flex items-center gap-2 min-w-max">
                <button
                    onClick={() => setSelectedTeam(null)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-wider transition-all ${!selectedTeam ? 'bg-white text-slate-900 border-white' : 'bg-white/5 text-white/50 border-white/5 hover:bg-white/10 hover:text-white'}`}
                >
                    <Filter className="w-3 h-3" /> All Clubs
                </button>
                <div className="w-[1px] h-6 bg-white/10 mx-2" />
                {TEAMS.map(team => (
                    <button
                        key={team}
                        onClick={() => setSelectedTeam(team === selectedTeam ? null : team)}
                        className={`px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${selectedTeam === team ? 'bg-accent text-slate-900 border-accent' : 'bg-white/5 text-white/50 border-white/5 hover:bg-white/10 hover:text-white'}`}
                    >
                        {team}
                    </button>
                ))}
            </div>
        </div>

        {/* Latest Transfers Ticker */}
        {!isLoading && !selectedTeam && latestTransfers.length > 0 && (
             <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-red-400">Latest Deals</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {latestTransfers.map((t) => (
                        <LatestTransferItem key={t.id} t={t} />
                    ))}
                </div>
             </div>
        )}

        {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-[350px] bg-white/5 rounded-2xl animate-pulse" />
                ))}
            </div>
        ) : (
            <div className="min-h-[500px]">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                    <h2 className="text-3xl font-black text-white flex items-center gap-3">
                        <span className="text-white">
                            {activeTab === 'summer' ? 'Summer' : 'Winter'}
                        </span> Transfers
                    </h2>
                    <span className="text-white/40 text-sm font-bold uppercase tracking-wider">
                        {filteredData.length} Deals Found
                    </span>
                </div>

                {/* Grid */}
                {filteredData.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
                        {filteredData.map((t: any) => <TransferCard key={t.id} t={t} />)}
                    </div>
                ) : (
                    <div className="bg-white/5 rounded-2xl p-12 text-center border border-white/5 flex flex-col items-center justify-center min-h-[300px]">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                            <Filter className="w-8 h-8 text-white/20" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No transfers found</h3>
                        <p className="text-secondary">Try selecting a different team or window.</p>
                        <button 
                            onClick={() => setSelectedTeam(null)}
                            className="mt-6 text-accent text-sm font-bold uppercase tracking-wider hover:underline"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>
        )}
      </main>

      <Footer />
      <BackToTop />
    </div>
  )
}
