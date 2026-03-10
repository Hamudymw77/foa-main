"use client"

import { useState, useEffect, useRef } from "react"
import { Match, MatchEvent, MatchStatus } from "../types"
import { Header } from "../components/Header"
import { Footer } from "../components/Footer"
import { TeamLogo } from "../components/TeamLogo"
import { SkeletonLoader } from "../components/SkeletonLoader"
import { MatchSummaryCard } from "../components/MatchSummaryCard"
import html2canvas from "html2canvas"
import { toast, Toaster } from "sonner"
import { 
  Trophy, 
  RefreshCw, 
  Play, 
  CheckCircle, 
  Plus, 
  User, 
  Clock,
  Ban,
  History,
  Lock,
  Unlock,
  Trash2,
  Filter,
  Save,
  Image as ImageIcon,
  Download,
  X
} from "lucide-react"

import { TransfersAdmin } from "./components/TransfersAdmin"

export default function AdminPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [activeTab, setActiveTab] = useState<'matches' | 'transfers'>('matches')
  const [isLoading, setIsLoading] = useState(true)
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null)
  
  // Přihlášení
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  // Filtrování
  const [selectedGameweek, setSelectedGameweek] = useState<number | 'all'>('all')
  
  const handleGameweekChange = (newValue: number | 'all') => {
      setSelectedGameweek(newValue)
      setEditingMatchId(null) // Reset výběru zápasu při změně kola
  }

  const [availableGameweeks, setAvailableGameweeks] = useState<number[]>([])

  // Stavy formuláře
  const [eventType, setEventType] = useState<'goal' | 'substitution' | 'yellow' | 'red' | 'injury' | 'var'>('goal')
  const [player, setPlayer] = useState('')
  const [assist, setAssist] = useState('')
  const [playerIn, setPlayerIn] = useState('')
  const [playerOut, setPlayerOut] = useState('')
  const [minute, setMinute] = useState('')
  const [score, setScore] = useState('')
  const [team, setTeam] = useState<'home' | 'away'>('home')
  const [isPenalty, setIsPenalty] = useState(false)
  const [isOwnGoal, setIsOwnGoal] = useState(false)

  // Editace existujících dat
  const [currentEvents, setCurrentEvents] = useState<any[]>([])
  const [currentStats, setCurrentStats] = useState<any>(null)

  const [players, setPlayers] = useState<any[]>([])

  // Image Generation
  const [showSummaryModal, setShowSummaryModal] = useState(false)
  const [summaryMatch, setSummaryMatch] = useState<Match | null>(null)
  const summaryRef = useRef<HTMLDivElement>(null)

  const handleGenerateSummary = (match: Match) => {
      setSummaryMatch(match)
      setShowSummaryModal(true)
  }

  const downloadSummaryImage = async () => {
      if (!summaryRef.current) return
      
      try {
          const canvas = await html2canvas(summaryRef.current, {
              scale: 2, // Higher resolution
              useCORS: true, // Allow loading cross-origin images (TeamLogos)
              backgroundColor: null
          })
          
          const link = document.createElement('a')
          link.download = `match-summary-${summaryMatch?.homeTeam}-${summaryMatch?.awayTeam}.png`
          link.href = canvas.toDataURL('image/png')
          link.click()
          
          toast.success('Obrázek stažen!')
      } catch (err) {
          console.error(err)
          toast.error('Chyba při generování obrázku')
      }
  }

  useEffect(() => {
    // 1. Kontrola sessionStorage
    const storedPassword = sessionStorage.getItem('adminPassword')
    if (storedPassword) {
        setPassword(storedPassword)
        setIsAuthenticated(true)
    }

    async function fetchData() {
      try {
        const [matchesRes, playersRes] = await Promise.all([
            fetch('/api/football?type=matches'),
            fetch('/api/football?type=players')
        ])
        
        if (!matchesRes.ok) throw new Error('Nepodařilo se načíst zápasy')
        const matchesData = await matchesRes.json()
        setMatches(matchesData)

        if (playersRes.ok) {
            const playersData = await playersRes.json()
            setPlayers(playersData)
        }
        
        // Extract gameweeks
        const gameweeks = Array.from(new Set(matchesData.map((m: Match) => m.matchweek || 0))).sort((a: any, b: any) => a - b) as number[]
        setAvailableGameweeks(gameweeks)
        
        // Auto-select current/next gameweek if not selected
        if (selectedGameweek === 'all' && gameweeks.length > 0) {
            // Find first gameweek with upcoming matches or last one
            const activeGw = gameweeks.find(gw => matchesData.some((m: Match) => m.matchweek === gw && m.status !== 'finished')) || gameweeks[gameweeks.length - 1]
            setSelectedGameweek(activeGw)
        }

      } catch (error) {
        console.error(error)
        toast.error('Chyba při načítání dat')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length > 0) {
        setIsAuthenticated(true)
        sessionStorage.setItem('adminPassword', password)
        toast.success('Admin režim aktivován')
    }
  }

  const handleLogout = () => {
      setIsAuthenticated(false)
      setPassword('')
      sessionStorage.removeItem('adminPassword')
  }

  const [playerSearch, setPlayerSearch] = useState('')
  
  // Pomocná funkce pro získání hráčů týmu
  const getTeamPlayers = (teamName: string) => {
      // Zkusíme najít tým podle jména
      const normalizedTeamName = teamName.toLowerCase().replace(/[^a-z0-9]/g, '')
      
      const team = players.find((p: any) => 
          p.teamName.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedTeamName ||
          normalizedTeamName.includes(p.teamName.toLowerCase().replace(/[^a-z0-9]/g, '')) ||
          p.teamName.toLowerCase().replace(/[^a-z0-9]/g, '').includes(normalizedTeamName)
      )
      
      const teamPlayers = team ? team.players : []
      
      // Filtrování podle vyhledávání
      if (playerSearch) {
          return teamPlayers.filter((p: any) => p.name.toLowerCase().includes(playerSearch.toLowerCase()))
      }
      
      return teamPlayers
  }

  const [homeFormation, setHomeFormation] = useState('4-2-3-1')
  const [awayFormation, setAwayFormation] = useState('4-2-3-1')

  const FORMATION_OPTIONS = [
    '4-4-2', '4-4-1-1', '4-3-3', '4-2-3-1', '4-1-4-1', '4-1-2-3', '4-3-1-2', '4-2-2-2', '4-5-1',
    '3-5-2', '3-4-3', '3-4-2-1', '3-4-1-2', '3-5-1-1', '3-3-3-1', '3-2-4-1', '3-2-2-3',
    '5-4-1', '5-3-2', '5-2-3', '5-2-2-1'
  ]

  const [editingEventId, setEditingEventId] = useState<string | null>(null)

  const handleEditEvents = (match: Match) => {
    if (editingMatchId === match.id) {
        setEditingMatchId(null)
    } else {
        setEditingMatchId(match.id)
        setCurrentEvents(match.events ? [...match.events] : [])
        setCurrentStats(match.stats ? { ...match.stats } : null)
        // Resetujeme search při otevření nového zápasu
        setPlayerSearch('')
        
        // Načtení hráčů pro formace (voláme funkci, která teď používá prázdný search)
        // POZOR: getTeamPlayers závisí na 'playerSearch' state, který se updatuje asynchronně.
        // Pro prvotní načtení musíme zavolat logiku přímo nebo zajistit, že se použije prázdný string.
        // Zde jen nastavíme state, a 'availablePlayers' se přepočítají v renderu nebo useEffectu?
        // Ne, tady nastavujeme state 'availableHomePlayers'.
        // Takže musíme volat getTeamPlayers s vědomím, že 'playerSearch' je zatím starý.
        // Ale 'getTeamPlayers' čte 'playerSearch' ze scope.
        // Fix: getTeamPlayers by měla brát search jako argument, nebo ji tady nepoužijeme přímo pro init.
        // Ale jednodušší je prostě neresetovat search, nebo ho resetovat a pak volat logiku.
        
        // Lepší přístup: getTeamPlayers nebude filtrovat podle search.
        // Filtrování uděláme až při renderování seznamu nebo v useEffectu.
        // Ale 'togglePlayerInFormation' potřebuje plný seznam? Ne, jen ID.
        // Takže: Změníme logiku 'getTeamPlayers' zpět na "bez filtru" a filtr přidáme do renderu?
        // Ne, user chtěl "nad seznam hráčů textový input".
        // OK, v renderu budeme volat filtrování.
        // Tady načteme VŠECHNY hráče do availableHomePlayers.
        
        // Provizorní fix pro getTeamPlayers v tomto scope:
        // Musíme si vytvořit verzi bez závislosti na state, nebo upravit getTeamPlayers aby brala search arg.
        
        const hPlayers = getTeamPlayersInternal(match.homeTeam, '')
        const aPlayers = getTeamPlayersInternal(match.awayTeam, '')
        
        setHomeFormationPlayers(Array.isArray(match.homePlayers) ? match.homePlayers : [])
        setAwayFormationPlayers(Array.isArray(match.awayPlayers) ? match.awayPlayers : [])
        setAvailableHomePlayers(hPlayers)
        setAvailableAwayPlayers(aPlayers)
        
        // Načtení formací (stringů)
        setHomeFormation(match.homeFormation || '4-2-3-1')
        setAwayFormation(match.awayFormation || '4-2-3-1')

        resetForm()
    }
  }

  // Interní funkce pro získání hráčů bez závislosti na state
  const getTeamPlayersInternal = (teamName: string, search: string) => {
      const normalizedTeamName = teamName.toLowerCase().replace(/[^a-z0-9]/g, '')
      const team = players.find((p: any) => 
          p.teamName.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedTeamName ||
          normalizedTeamName.includes(p.teamName.toLowerCase().replace(/[^a-z0-9]/g, '')) ||
          p.teamName.toLowerCase().replace(/[^a-z0-9]/g, '').includes(normalizedTeamName)
      )
      const teamPlayers = team ? team.players : []
      if (search) {
          return teamPlayers.filter((p: any) => p.name.toLowerCase().includes(search.toLowerCase()))
      }
      return teamPlayers
  }

  // Formace state
  const [homeFormationPlayers, setHomeFormationPlayers] = useState<any[]>([])
  const [awayFormationPlayers, setAwayFormationPlayers] = useState<any[]>([])
  const [availableHomePlayers, setAvailableHomePlayers] = useState<any[]>([])
  const [availableAwayPlayers, setAvailableAwayPlayers] = useState<any[]>([])

  const togglePlayerInFormation = (player: any, teamSide: 'home' | 'away') => {
      if (teamSide === 'home') {
          const exists = homeFormationPlayers.find(p => p.id === player.id)
          if (exists) {
              setHomeFormationPlayers(prev => prev.filter(p => p.id !== player.id))
          } else {
              setHomeFormationPlayers((prev: any[]) => [...prev, { id: player.id, name: player.name, position: player.position, photo: player.photo }])
          }
      } else {
          const exists = awayFormationPlayers.find(p => p.id === player.id)
          if (exists) {
              setAwayFormationPlayers(prev => prev.filter(p => p.id !== player.id))
          } else {
              setAwayFormationPlayers((prev: any[]) => [...prev, { id: player.id, name: player.name, position: player.position, photo: player.photo }])
          }
      }
  }


  const [activeSlot, setActiveSlot] = useState<{ team: 'home' | 'away', index: number } | null>(null)
  const [showPlayerSearchModal, setShowPlayerSearchModal] = useState(false)
  const [playerSearchQuery, setPlayerSearchQuery] = useState('')

  // Helper to parse formation string into rows
  const getFormationRows = (formation: string) => {
      const parts = (formation || '4-4-2').split('-').map(Number)
      return [1, ...parts] // Add GK
  }

  const handleSlotClick = (team: 'home' | 'away', index: number) => {
      setActiveSlot({ team, index })
      setPlayerSearchQuery('')
      setShowPlayerSearchModal(true)
  }

  const handlePlayerSelect = (player: any) => {
      if (!activeSlot) return

      if (activeSlot.team === 'home') {
          const newPlayers = [...homeFormationPlayers]
          // Ensure array is big enough
          while (newPlayers.length <= activeSlot.index) newPlayers.push(null)
          newPlayers[activeSlot.index] = player
          setHomeFormationPlayers(newPlayers)
      } else {
          const newPlayers = [...awayFormationPlayers]
          while (newPlayers.length <= activeSlot.index) newPlayers.push(null)
          newPlayers[activeSlot.index] = player
          setAwayFormationPlayers(newPlayers)
      }
      
      setShowPlayerSearchModal(false)
      setActiveSlot(null)
  }

  const handleRemovePlayer = (e: React.MouseEvent, team: 'home' | 'away', index: number) => {
      e.stopPropagation()
      if (team === 'home') {
          const newPlayers = [...homeFormationPlayers]
          newPlayers[index] = null
          setHomeFormationPlayers(newPlayers)
      } else {
          const newPlayers = [...awayFormationPlayers]
          newPlayers[index] = null
          setAwayFormationPlayers(newPlayers)
      }
  }

  // Preview Modal
  const [previewPlayer, setPreviewPlayer] = useState<any>(null)
  
  const handleShowPreview = (e: React.MouseEvent, player: any) => {
      e.stopPropagation()
      setPreviewPlayer(player)
  }

  const resetForm = () => {
    setEventType('goal')
    setPlayer('')
    setAssist('')
    setPlayerIn('')
    setPlayerOut('')
    setMinute('')
    setScore('')
    setIsPenalty(false)
    setIsOwnGoal(false)
  }

  const updateMatchStatus = async (matchId: string, newStatus: MatchStatus) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            matchId, 
            status: newStatus,
            password: password 
        })
      })
      
      if (res.status === 401) {
          toast.error('Neplatné heslo! Přihlašte se znovu.')
          handleLogout()
          return
      }
      
      if (!res.ok) throw new Error('Chyba při změně stavu')
      
      setMatches(prev => prev.map(m => m.id === matchId ? { ...m, status: newStatus } : m))
      toast.success(`Zápas nastaven jako ${newStatus}`)
    } catch (error) {
      toast.error('Nepodařilo se změnit stav zápasu')
    }
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
      e.dataTransfer.setData('draggedIndex', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault(); // Nutné pro povolení dropu
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
      e.preventDefault();
      const draggedIndex = parseInt(e.dataTransfer.getData('draggedIndex'));
      if (draggedIndex === targetIndex) return;

      const newEvents = [...currentEvents];
      const draggedItem = newEvents.splice(draggedIndex, 1)[0];
      newEvents.splice(targetIndex, 0, draggedItem);

      setCurrentEvents(newEvents);
  };

  const handleDeleteEvent = (index: number) => {
      const updatedEvents = [...currentEvents]
      updatedEvents.splice(index, 1)
      setCurrentEvents(updatedEvents)
  }

  const handleSaveAll = async (e?: React.MouseEvent) => {
      // 1. Zastavení refreshe (Frontend)
      if (e) e.preventDefault();
      
      if (!editingMatchId) return

      // Formátování statistik na čísla
      const formattedStats = currentStats ? {
        possession: currentStats.possession.map(Number),
        shots: currentStats.shots.map(Number),
        shotsOnTarget: currentStats.shotsOnTarget.map(Number),
        corners: currentStats.corners.map(Number),
        fouls: currentStats.fouls.map(Number),
        // Zachování ostatních
        ...currentStats
      } : null;

      try {
        // 2. Spolehlivé odeslání hesla (Frontend -> Backend)
        // Heslo posíláme explicitně z state nebo sessionStorage
        const currentPassword = password || sessionStorage.getItem('adminPassword') || '';
        
        if (!currentPassword) {
            alert('Chybí heslo v paměti prohlížeče! Prosím přihlašte se znovu.');
            handleLogout();
            return;
        }
        
        console.log('Odesílám data na API...');

        const res = await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                matchId: editingMatchId, 
                events: currentEvents, // Posíláme celé pole
                stats: formattedStats,
                homePlayers: homeFormationPlayers, // Posíláme formace
                awayPlayers: awayFormationPlayers,
                homeFormation: homeFormation, // Posíláme systém
                awayFormation: awayFormation,
                password: currentPassword // Explicitní odeslání hesla
            })
        })
  
        // 4. Žádné zbrklé odhlašování na frontendu
        if (!res.ok) {
            const errorData = await res.json();
            if (res.status === 401) {
                alert('Chyba ověření: ' + (errorData.error || 'Neplatné heslo'));
                handleLogout();
            } else {
                alert('Chyba API: ' + (errorData.error || 'Neznámá chyba'));
            }
            return;
        }
        
        const updatedMatch = (await res.json()).overrides 
        
        // Musíme udělat refetch, abychom měli full match data
        const refreshRes = await fetch('/api/football?type=matches')
        if (refreshRes.ok) {
            const newData = await refreshRes.json()
            setMatches(newData)
        }
        
        toast.success('Úspěšně uloženo!')
        // Neodhlašujeme uživatele, jen resetujeme výběr
        setEditingMatchId(null)

      } catch (error) {
        console.error("Save error:", error);
        alert('Kritická chyba při ukládání: ' + error);
      }
  }

  const handleEditEventItem = (event: any) => {
      setEditingEventId(event.id)
      setEventType(event.type)
      setMinute(event.displayMinute ? event.displayMinute.replace("'", "") : event.minute.toString())
      setTeam(event.team)
      
      if (event.type === 'goal') {
          setPlayer(event.player || '')
          setAssist(event.assist || '')
          setScore(event.score || '')
          setIsPenalty(event.isPenalty || false)
          setIsOwnGoal(event.isOwnGoal || false)
      } else if (event.type === 'substitution') {
          setPlayerIn(event.playerIn || '')
          setPlayerOut(event.playerOut || '')
      } else {
          setPlayer(event.player || '')
      }
      
      toast.info('Upravujete událost...')
  }

  const parseMinute = (input: string) => {
       const match = input.trim().match(/^(\d+)(?:\+(\d+))?'?$/);
       if (!match) return null;
       
       const base = parseInt(match[1]);
       const extra = match[2] ? parseInt(match[2]) : 0;
       
       return {
           val: base + extra,
           display: match[2] ? `${base}+${extra}'` : undefined
       };
   }

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault()
    
    const parsedTime = parseMinute(minute);
    if (!parsedTime) {
        toast.error('Neplatný formát času! Použijte např. 45, 90, 90+2');
        return;
    }

    if (editingEventId) {
        // Editace existující
        const updatedEvents = currentEvents.map(ev => {
            if (ev.id === editingEventId) {
                const updated = { 
                    ...ev, 
                    type: eventType, 
                    minute: parsedTime.val,
                    displayMinute: parsedTime.display,
                    team 
                }
                if (eventType === 'goal') {
                    updated.player = player; updated.assist = assist; updated.score = score; updated.isPenalty = isPenalty; updated.isOwnGoal = isOwnGoal;
                } else if (eventType === 'substitution') {
                    updated.playerIn = playerIn; updated.playerOut = playerOut;
                } else {
                    updated.player = player;
                }
                return updated
            }
            return ev
        })
        setCurrentEvents(updatedEvents)
        setEditingEventId(null)
        toast.success('Událost aktualizována')
    } else {
        // Přidání nové
        const newEvent: any = {
          id: Date.now().toString(),
          type: eventType,
          minute: parsedTime.val,
          displayMinute: parsedTime.display,
          team,
        }
    
        if (eventType === 'goal') {
          newEvent.player = player
          newEvent.assist = assist
          newEvent.score = score
          newEvent.isPenalty = isPenalty
          newEvent.isOwnGoal = isOwnGoal
        } else if (eventType === 'substitution') {
          newEvent.playerIn = playerIn
          newEvent.playerOut = playerOut
        } else {
          newEvent.player = player
        }
    
        setCurrentEvents([...currentEvents, newEvent])
        toast.success('Událost přidána do seznamu')
    }
    
    resetForm()
  }

  const handleSyncFotMob = async () => {
      const match = matches.find(m => m.id === editingMatchId);
      if (!match) return;

      // Explicitly check for date as required by FotMob sync
      // Prefer kickoff_time (ISO) if available, otherwise date
      const rawDate = (match as any).kickoff_time || match.date;

      if (!rawDate) {
          alert('❌ Zápas neobsahuje datum (ani kickoff_time). Synchronizace není možná.');
          console.error('Data vybraného zápasu:', match);
          return;
      }

      toast.promise(
          fetch('/api/sync-fotmob', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                  homeTeam: match.homeTeam, 
                  awayTeam: match.awayTeam, 
                  date: rawDate 
              })
          }).then(async (res) => {
              const data = await res.json();
              
              if (!res.ok) {
                  const errorMsg = data.error || 'Neznámá chyba serveru';
                  alert('❌ Chyba FotMobu: ' + errorMsg);
                  console.error('Full Error Data:', data.debugData || data);
                  throw new Error(errorMsg);
              }

              if (data.events && data.events.length > 0) {
                  setCurrentEvents(prev => [...prev, ...data.events]);
                  return 'Události úspěšně staženy!';
              } else {
                  throw new Error('Žádné události nenalezeny');
              }
          }),
          {
              loading: 'Stahuji data z FotMob...',
              success: (msg) => `${msg}`,
              error: (err) => `Chyba: ${err.message}`
          }
      );
  }

  // Filter matches
  const filteredMatches = selectedGameweek === 'all' 
    ? matches 
    : matches.filter(m => m.matchweek === selectedGameweek)

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="p-8 flex-1 container mx-auto"><SkeletonLoader /></div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-white">
      <Header />
      <Toaster position="top-right" richColors />
      
      <main className="container mx-auto max-w-7xl px-4 md:px-8 py-8 flex-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-accent uppercase tracking-tighter italic">PL Admin Panel</h1>
            <p className="text-secondary text-sm font-medium">Správa živých výsledků a událostí Premier League</p>
          </div>
          
          {/* Login & Filter */}
          <div className="flex items-center gap-4">
             {isAuthenticated && (
                 <>
                    <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                        <button 
                            onClick={() => setActiveTab('matches')}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'matches' ? 'bg-accent text-slate-900' : 'text-secondary hover:text-white'}`}
                        >
                            Zápasy
                        </button>
                        <button 
                            onClick={() => setActiveTab('transfers')}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'transfers' ? 'bg-accent text-slate-900' : 'text-secondary hover:text-white'}`}
                        >
                            Přestupy
                        </button>
                    </div>

                 <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg border border-white/10">
                    <Filter className="w-4 h-4 text-secondary" />
                    <select 
                        value={selectedGameweek} 
                        onChange={(e) => handleGameweekChange(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                        className="bg-transparent text-sm outline-none font-bold cursor-pointer"
                    >
                        <option value="all" className="bg-slate-900">Všechna kola</option>
                        {availableGameweeks.map(gw => (
                            <option key={gw} value={gw} className="bg-slate-900">Kolo {gw}</option>
                        ))}
                    </select>
                 </div>
                 </>
             )}

             {!isAuthenticated ? (
                 <form onSubmit={handleLogin} className="flex gap-2">
                     <input 
                        type="password" 
                        placeholder="Admin heslo" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent w-32 md:w-48"
                     />
                     <button type="submit" className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors">
                        <Lock className="w-4 h-4" />
                     </button>
                 </form>
             ) : (
                 <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20">
                     <Unlock className="w-4 h-4 text-green-500" />
                     <button onClick={handleLogout} className="text-xs font-bold text-green-400 hover:text-white transition-colors">Odhlásit</button>
                 </div>
             )}
          </div>
        </div>
        
        {!isAuthenticated ? (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                <Lock className="w-16 h-16 mb-4 text-secondary" />
                <h2 className="text-2xl font-bold mb-2">Vyžadováno přihlášení</h2>
                <p className="text-secondary max-w-md">Pro úpravu zápasů zadejte administrátorské heslo v pravém horním rohu.</p>
            </div>
        ) : (
            <>
            {activeTab === 'matches' && (
            <div className="grid grid-cols-1 gap-6">
            {filteredMatches.length === 0 && (
                <div className="text-center py-10 text-secondary">Žádné zápasy pro vybrané kolo.</div>
            )}
            
            {filteredMatches.map((m) => (
                <div key={m.id} className={`glass rounded-2xl overflow-hidden border transition-all duration-500 ${editingMatchId === m.id ? 'border-accent shadow-[0_0_30px_rgba(251,191,36,0.1)]' : 'border-white/5'}`}>
                <div className="p-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    {/* Týmy a Skóre */}
                    <div className="flex items-center justify-center gap-6 flex-1">
                        <div className="text-center w-24">
                        <TeamLogo teamName={m.homeTeam} url={m.homeLogo} className="w-16 h-16 mb-2 mx-auto drop-shadow-2xl" />
                        <span className="text-xs font-black uppercase truncate block">{m.homeTeam}</span>
                        </div>
                        
                        <div className="flex flex-col items-center">
                        <div className="text-xs font-bold text-secondary mb-1">GW {m.matchweek}</div>
                        <div className="text-4xl font-black tabular-nums tracking-tight px-6 py-2 bg-white/5 rounded-xl border border-white/10">
                            {m.status === 'upcoming' ? 'VS' : `${m.homeScore ?? 0} : ${m.awayScore ?? 0}`}
                        </div>
                        <span className={`text-[10px] font-bold mt-2 px-2 py-0.5 rounded-full uppercase tracking-widest ${
                            m.status === 'live' ? 'bg-red-500 text-white animate-pulse' : 
                            m.status === 'finished' ? 'bg-white/20 text-white' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                            {m.status}
                        </span>
                        </div>

                        <div className="text-center w-24">
                        <TeamLogo teamName={m.awayTeam} url={m.awayLogo} className="w-16 h-16 mb-2 mx-auto drop-shadow-2xl" />
                        <span className="text-xs font-black uppercase truncate block">{m.awayTeam}</span>
                        </div>
                    </div>
                    
                    {/* Akce */}
                    <div className="flex flex-wrap md:flex-nowrap gap-2 w-full md:w-auto">
                        {m.status === 'upcoming' && (
                        <button 
                            onClick={() => updateMatchStatus(m.id, 'live')}
                            className="flex-1 md:flex-none bg-green-500 hover:bg-green-600 text-white p-3 rounded-xl transition-all flex items-center justify-center gap-2 font-bold text-sm"
                        >
                            <Play className="w-4 h-4" /> Zahájit
                        </button>
                        )}
                        {m.status === 'live' && (
                        <button 
                            onClick={() => updateMatchStatus(m.id, 'finished')}
                            className="flex-1 md:flex-none bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl transition-all flex items-center justify-center gap-2 font-bold text-sm border border-white/10"
                        >
                            <CheckCircle className="w-4 h-4" /> Ukončit
                        </button>
                        )}
                        <button 
                            onClick={() => handleGenerateSummary(m)}
                            className="flex-1 md:flex-none bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 p-3 rounded-xl transition-all flex items-center justify-center gap-2 font-bold text-sm border border-indigo-500/20"
                            title="Generovat obrázek"
                        >
                            <ImageIcon className="w-4 h-4" />
                        </button>
                        <button
                        onClick={() => handleEditEvents(m)}
                        className={`flex-1 md:flex-none font-bold py-3 px-8 rounded-xl transition-all text-sm uppercase tracking-wider ${
                            editingMatchId === m.id ? 'bg-white text-slate-900' : 'bg-accent text-slate-900 hover:bg-accent/80'
                        }`}
                        >
                        {editingMatchId === m.id ? 'Zavřít' : 'Upravit'}
                        </button>
                    </div>
                    </div>

                    {/* Editor Panel */}
                    {editingMatchId === m.id && (
                    <div className="mt-8 pt-8 border-t border-white/10 animate-in fade-in slide-in-from-top-4 duration-500 bg-white/5 p-6 rounded-2xl">
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Levá část: Seznam událostí */}
                            <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                                <h3 className="text-sm font-bold text-secondary uppercase tracking-widest mb-4 flex items-center justify-between">
                                    <span className="flex items-center gap-2"><History className="w-4 h-4" /> Existující události</span>
                                    <button 
                                        onClick={handleSyncFotMob}
                                        className="text-[10px] bg-accent/10 hover:bg-accent/20 text-accent px-2 py-1 rounded border border-accent/20 transition-colors flex items-center gap-1"
                                        title="Automaticky stáhnout góly a karty"
                                    >
                                        🪄 Auto-Sync
                                    </button>
                                </h3>
                                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {currentEvents.length === 0 ? (
                                        <p className="text-sm text-white/30 italic">Žádné události.</p>
                                    ) : (
                                        currentEvents.map((ev, idx) => (
                                            <div 
                                                key={idx} 
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, idx)}
                                                onDragOver={handleDragOver}
                                                onDrop={(e) => handleDrop(e, idx)}
                                                className="bg-white/5 p-2 rounded-lg flex items-center gap-3 group hover:bg-white/10 transition-colors cursor-move"
                                            >
                                                <div className="text-white/20 group-hover:text-white/50 text-xs px-1 cursor-grab active:cursor-grabbing">
                                                    ⣿
                                                </div>

                                                <span className="font-mono font-bold text-accent w-10 text-center text-sm">{ev.displayMinute || ev.minute + "'"}</span>
                                                
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-bold flex items-center gap-2 truncate">
                                                        {ev.type === 'goal' && '⚽'}
                                                        {ev.type === 'yellow' && '🟨'}
                                                        {ev.type === 'red' && '🟥'}
                                                        {ev.type === 'substitution' && '🔄'}
                                                        
                                                        {ev.type === 'substitution' ? (
                                                            <span className="truncate">
                                                                {ev.playerIn || ev.player} 
                                                                {ev.playerOut && <span className="text-white/50 font-normal text-xs ml-1">(vystřídal: {ev.playerOut})</span>}
                                                            </span>
                                                        ) : (
                                                            <span className="truncate">{ev.player || 'Neznámý'}</span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-white/50 truncate">{ev.team === 'home' ? m.homeTeam : m.awayTeam}</div>
                                                </div>

                                                <div className="flex items-center gap-1 shrink-0">
                                                    <button 
                                                        onClick={() => handleEditEventItem(ev)}
                                                        className="p-2 text-white/30 hover:text-accent transition-colors"
                                                        title="Upravit"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteEvent(idx)}
                                                        className="p-2 text-white/30 hover:text-red-500 transition-colors"
                                                        title="Smazat událost"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Pravá část: Přidat novou */}
                            <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                                <h3 className="text-sm font-bold text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Plus className="w-4 h-4" /> {editingEventId ? 'Upravit událost' : 'Přidat novou událost'}
                                </h3>
                                <form onSubmit={handleAddEvent} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] uppercase font-bold text-secondary mb-1 block">Typ</label>
                                            <select value={eventType} onChange={e => setEventType(e.target.value as any)} className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-sm outline-none">
                                                <option value="goal">⚽ Gól</option>
                                                <option value="substitution">🔄 Střídání</option>
                                                <option value="yellow">🟨 Žlutá karta</option>
                                                <option value="red">🟥 Červená karta</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase font-bold text-secondary mb-1 block">Tým</label>
                                            <select value={team} onChange={e => setTeam(e.target.value as any)} className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-sm outline-none">
                                                <option value="home">{matches.find(m => m.id === editingMatchId)?.homeTeam}</option>
                                                <option value="away">{matches.find(m => m.id === editingMatchId)?.awayTeam}</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] uppercase font-bold text-secondary mb-1 block">Minuta</label>
                                            <input 
                                                type="text" 
                                                value={minute} 
                                                onChange={e => setMinute(e.target.value)} 
                                                className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-sm outline-none focus:border-accent font-mono" 
                                                placeholder="90+2" 
                                                required 
                                            />
                                        </div>
                                        {eventType === 'goal' && (
                                            <div>
                                                <label className="text-[10px] uppercase font-bold text-secondary mb-1 block">Skóre</label>
                                                <input type="text" value={score} onChange={e => setScore(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-sm outline-none" placeholder="1-0" />
                                            </div>
                                        )}
                                    </div>

                                    {eventType !== 'substitution' ? (
                                        <div>
                                            <label className="text-[10px] uppercase font-bold text-secondary mb-1 block">Hráč</label>
                                            <select 
                                                value={player} 
                                                onChange={e => setPlayer(e.target.value)} 
                                                className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-sm outline-none"
                                            >
                                                <option value="">Vyber hráče</option>
                                                {(team === 'home' ? availableHomePlayers : availableAwayPlayers).map((p: any) => (
                                                    <option key={p.id} value={p.name}>{p.name} ({p.position})</option>
                                                ))}
                                                <option value="Neznámý">Jiný...</option>
                                            </select>
                                            {/* Fallback input if needed */}
                                            {!availableHomePlayers.length && !availableAwayPlayers.length && (
                                                <input type="text" value={player} onChange={e => setPlayer(e.target.value)} className="w-full mt-2 bg-slate-950 border border-white/10 rounded-lg p-2 text-sm outline-none" placeholder="Nebo napiš jméno" />
                                            )}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] uppercase font-bold text-secondary mb-1 block">Hráč OUT</label>
                                                <select 
                                                    value={playerOut} 
                                                    onChange={e => setPlayerOut(e.target.value)} 
                                                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-sm outline-none"
                                                >
                                                    <option value="">Vyber hráče</option>
                                                    {(team === 'home' ? availableHomePlayers : availableAwayPlayers).map((p: any) => (
                                                        <option key={p.id} value={p.name}>{p.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] uppercase font-bold text-secondary mb-1 block">Hráč IN</label>
                                                <select 
                                                    value={playerIn} 
                                                    onChange={e => setPlayerIn(e.target.value)} 
                                                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-sm outline-none"
                                                >
                                                    <option value="">Vyber hráče</option>
                                                    {(team === 'home' ? availableHomePlayers : availableAwayPlayers).map((p: any) => (
                                                        <option key={p.id} value={p.name}>{p.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    <button type="submit" className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded-lg transition-colors text-sm">
                                        {editingEventId ? '💾 Uložit změny' : '+ Přidat do seznamu'}
                                    </button>
                                    {editingEventId && (
                                        <button 
                                            type="button" 
                                            onClick={() => { setEditingEventId(null); resetForm(); }}
                                            className="w-full text-secondary hover:text-white text-xs py-1"
                                        >
                                            Zrušit úpravy
                                        </button>
                                    )}
                                </form>
                            </div>
                        </div>
                        
                        {/* Formace - Visual Editor */}
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-white/10 pt-8">
                            {/* DOMÁCÍ */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-secondary uppercase tracking-widest">DOMÁCÍ ({homeFormation})</h3>
                                    <select 
                                        value={homeFormation} 
                                        onChange={(e) => setHomeFormation(e.target.value)}
                                        className="bg-slate-900 border border-white/10 rounded px-2 py-1 text-xs font-bold"
                                    >
                                        {FORMATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                                
                                <div className="relative bg-green-900/80 rounded-lg border border-white/10 overflow-hidden shadow-inner aspect-[2/3] md:aspect-[3/4]">
                                    {/* Pitch Markings */}
                                    <div className="absolute inset-4 border-2 border-white/20 rounded-sm pointer-events-none"></div>
                                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-16 border-2 border-t-0 border-white/20 pointer-events-none"></div>
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-16 border-2 border-b-0 border-white/20 pointer-events-none"></div>
                                    <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-white/20 pointer-events-none"></div>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white/20 rounded-full pointer-events-none"></div>

                                    {/* Players Grid */}
                                    <div className="absolute inset-0 flex flex-col justify-between py-8 px-4">
                                        {getFormationRows(homeFormation).map((count, rowIdx) => (
                                            <div key={rowIdx} className="flex justify-around items-center h-full">
                                                {Array.from({ length: count }).map((_, colIdx) => {
                                                    const prevCount = getFormationRows(homeFormation).slice(0, rowIdx).reduce((a, b) => a + b, 0)
                                                    const globalIndex = prevCount + colIdx
                                                    const player = homeFormationPlayers[globalIndex]
                                                    
                                                    return (
                                                        <div 
                                                            key={globalIndex}
                                                            onClick={() => handleSlotClick('home', globalIndex)}
                                                            className={`
                                                                relative w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center 
                                                                cursor-pointer transition-all duration-300 group z-10
                                                                ${player ? 'bg-slate-900 border-2 border-accent shadow-lg scale-105' : 'bg-white/10 border-2 border-white/20 hover:bg-white/20 hover:scale-110'}
                                                            `}
                                                        >
                                                            {player ? (
                                                                <>
                                                                    {player.photo ? (
                                                                        <img src={player.photo} className="w-full h-full object-cover rounded-full" />
                                                                    ) : (
                                                                        <span className="text-xs font-bold">{player.number || '?'}</span>
                                                                    )}
                                                                    
                                                                    <div 
                                                                        className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-md z-20 hover:bg-accent hover:text-black transition-colors"
                                                                        onClick={(e) => handleShowPreview(e, player)}
                                                                    >
                                                                        {player.name.split(' ').pop()}
                                                                    </div>

                                                                    <button 
                                                                        onClick={(e) => handleRemovePlayer(e, 'home', globalIndex)}
                                                                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white flex items-center justify-center text-xs shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-30 hover:bg-red-600"
                                                                    >
                                                                        ×
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <Plus className="w-5 h-5 text-white/30" />
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* HOSTÉ */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-secondary uppercase tracking-widest">HOSTÉ ({awayFormation})</h3>
                                    <select 
                                        value={awayFormation} 
                                        onChange={(e) => setAwayFormation(e.target.value)}
                                        className="bg-slate-900 border border-white/10 rounded px-2 py-1 text-xs font-bold"
                                    >
                                        {FORMATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                                
                                <div className="relative bg-slate-800/80 rounded-lg border border-white/10 overflow-hidden shadow-inner aspect-[2/3] md:aspect-[3/4]">
                                    {/* Pitch Markings */}
                                    <div className="absolute inset-4 border-2 border-white/10 rounded-sm pointer-events-none"></div>
                                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-16 border-2 border-t-0 border-white/10 pointer-events-none"></div>
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-16 border-2 border-b-0 border-white/10 pointer-events-none"></div>
                                    <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-white/10 pointer-events-none"></div>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white/10 rounded-full pointer-events-none"></div>

                                    {/* Players Grid */}
                                    <div className="absolute inset-0 flex flex-col justify-between py-8 px-4">
                                        {getFormationRows(awayFormation).map((count, rowIdx) => (
                                            <div key={rowIdx} className="flex justify-around items-center h-full">
                                                {Array.from({ length: count }).map((_, colIdx) => {
                                                    const prevCount = getFormationRows(awayFormation).slice(0, rowIdx).reduce((a, b) => a + b, 0)
                                                    const globalIndex = prevCount + colIdx
                                                    const player = awayFormationPlayers[globalIndex]
                                                    
                                                    return (
                                                        <div 
                                                            key={globalIndex}
                                                            onClick={() => handleSlotClick('away', globalIndex)}
                                                            className={`
                                                                relative w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center 
                                                                cursor-pointer transition-all duration-300 group z-10
                                                                ${player ? 'bg-slate-900 border-2 border-blue-500 shadow-lg scale-105' : 'bg-white/10 border-2 border-white/20 hover:bg-white/20 hover:scale-110'}
                                                            `}
                                                        >
                                                            {player ? (
                                                                <>
                                                                    {player.photo ? (
                                                                        <img src={player.photo} className="w-full h-full object-cover rounded-full" />
                                                                    ) : (
                                                                        <span className="text-xs font-bold">{player.number || '?'}</span>
                                                                    )}
                                                                    
                                                                    <div 
                                                                        className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-md z-20 hover:bg-blue-500 hover:text-white transition-colors"
                                                                        onClick={(e) => handleShowPreview(e, player)}
                                                                    >
                                                                        {player.name.split(' ').pop()}
                                                                    </div>

                                                                    <button 
                                                                        onClick={(e) => handleRemovePlayer(e, 'away', globalIndex)}
                                                                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white flex items-center justify-center text-xs shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-30 hover:bg-red-600"
                                                                    >
                                                                        ×
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <Plus className="w-5 h-5 text-white/30" />
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search Modal */}
                        {showPlayerSearchModal && activeSlot && (
                            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowPlayerSearchModal(false)}>
                                <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full flex flex-col gap-4 relative shadow-2xl" onClick={e => e.stopPropagation()}>
                                    <button onClick={() => setShowPlayerSearchModal(false)} className="absolute top-4 right-4 text-white/50 hover:text-white"><X className="w-5 h-5" /></button>
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <User className="w-5 h-5 text-accent" />
                                        Vybrat hráče ({activeSlot.team === 'home' ? 'Domácí' : 'Hosté'} - Pozice {activeSlot.index + 1})
                                    </h3>
                                    
                                    <input 
                                        type="text" 
                                        autoFocus
                                        placeholder="Hledat hráče (např. Salah)..."
                                        value={playerSearchQuery}
                                        onChange={(e) => setPlayerSearchQuery(e.target.value)}
                                        className="bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-sm outline-none focus:border-accent w-full font-bold"
                                    />
                                    
                                    <div className="flex-1 max-h-[300px] overflow-y-auto custom-scrollbar border border-white/5 rounded-lg bg-black/20">
                                        {(activeSlot.team === 'home' ? availableHomePlayers : availableAwayPlayers)
                                            .filter(p => !playerSearchQuery || p.name.toLowerCase().includes(playerSearchQuery.toLowerCase()))
                                            .map(p => (
                                                <div 
                                                    key={p.id}
                                                    onClick={() => handlePlayerSelect(p)}
                                                    className="flex items-center gap-3 p-3 hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-0 group transition-colors"
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden border border-white/10 group-hover:border-accent/50 transition-colors">
                                                        {p.photo ? <img src={p.photo} className="w-full h-full object-cover" /> : <User className="w-5 h-5 m-2.5 text-white/50" />}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-sm text-white group-hover:text-accent transition-colors">{p.name}</div>
                                                        <div className="text-xs text-white/50">{p.position} • #{p.number || '-'}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        {((activeSlot.team === 'home' ? availableHomePlayers : availableAwayPlayers)
                                            .filter(p => !playerSearchQuery || p.name.toLowerCase().includes(playerSearchQuery.toLowerCase())).length === 0) && (
                                                <div className="p-8 text-center text-white/30 text-sm">Žádný hráč nenalezen.</div>
                                            )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Player Preview Modal */}
                        {previewPlayer && (
                            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in zoom-in-95 duration-200" onClick={() => setPreviewPlayer(null)}>
                                <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full flex flex-col items-center gap-6 relative shadow-[0_0_100px_rgba(0,0,0,0.5)]" onClick={e => e.stopPropagation()}>
                                    <button onClick={() => setPreviewPlayer(null)} className="absolute top-4 right-4 text-white/50 hover:text-white"><X className="w-6 h-6" /></button>
                                    
                                    <div className="w-40 h-40 rounded-full bg-gradient-to-br from-slate-800 to-black border-4 border-accent shadow-[0_0_50px_rgba(251,191,36,0.2)] overflow-hidden relative">
                                        {previewPlayer.photo ? (
                                            <img src={previewPlayer.photo} className="w-full h-full object-cover scale-110" />
                                        ) : (
                                            <User className="w-20 h-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/20" />
                                        )}
                                    </div>
                                    
                                    <div className="text-center">
                                        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">{previewPlayer.name}</h2>
                                        <div className="text-accent font-mono text-2xl font-bold mb-6">#{previewPlayer.number || '?'}</div>
                                        
                                        <div className="flex flex-wrap gap-2 justify-center">
                                            <span className="bg-white/10 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-white/5">{previewPlayer.position}</span>
                                            <span className="bg-white/10 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-white/5">{previewPlayer.teamName || 'Tým'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Uložit vše */}
                        <div className="mt-8 flex justify-end pt-4 border-t border-white/10">
                            <button 
                                onClick={(e) => handleSaveAll(e)}
                                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg transition-all shadow-lg flex items-center gap-2"
                            >
                                <Save className="w-5 h-5" /> ULOŽIT VŠECHNY ZMĚNY
                            </button>
                        </div>

                    </div>
                    )}
                </div>
                </div>
            ))}
            </div>
            )}
            </>
        )}

        {activeTab === 'transfers' && isAuthenticated && <TransfersAdmin />}

        {/* Modal for Image Generation */}
        {showSummaryModal && summaryMatch && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-5xl w-full flex flex-col gap-6 relative">
                    <button 
                        onClick={() => setShowSummaryModal(false)}
                        className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-accent" />
                        Generovat shrnutí zápasu
                    </h2>
                    
                    <div className="flex-1 bg-black/50 rounded-xl p-8 overflow-auto flex items-center justify-center border border-white/5">
                        {/* The actual card to capture */}
                        <div className="scale-75 md:scale-100 origin-center">
                            <MatchSummaryCard ref={summaryRef} match={summaryMatch} />
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-4">
                        <button 
                            onClick={() => setShowSummaryModal(false)}
                            className="px-6 py-2 rounded-lg font-bold text-sm bg-white/5 hover:bg-white/10 text-white transition-colors"
                        >
                            Zavřít
                        </button>
                        <button 
                            onClick={downloadSummaryImage}
                            className="px-6 py-2 rounded-lg font-bold text-sm bg-accent text-slate-900 hover:bg-accent/90 transition-colors flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Stáhnout PNG
                        </button>
                    </div>
                </div>
            </div>
        )}

      </main>
      <Footer />
    </div>
  )
}
