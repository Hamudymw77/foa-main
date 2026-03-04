"use client"
import { Match, DetailedStat } from "@/types"
import { useEffect, useState } from "react"

interface MatchStatisticsProps {
  selectedMatch: Match
}

export function MatchStatistics({ selectedMatch }: MatchStatisticsProps) {
  const [stats, setStats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If detailed stats are already provided via props (e.g. from static data), use them
    if (selectedMatch.detailedStats && selectedMatch.detailedStats.length > 0) {
        setStats(selectedMatch.detailedStats);
        setIsLoading(false);
        return;
    }

    // Otherwise fetch from our new internal proxy
    const fetchStats = async () => {
        setIsLoading(true);
        try {
            // Pass extra parameters to help the backend find the correct match ID in API-Football
            const params = new URLSearchParams({
                matchId: selectedMatch.id,
                date: selectedMatch.date.split('T')[0], // Extract YYYY-MM-DD
                homeTeam: selectedMatch.homeTeam,
                awayTeam: selectedMatch.awayTeam
            });

            const res = await fetch(`/api/match-stats?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                
                // Transform the new data format into the array format expected by the UI
                const transformedStats = [
                    {
                        label: "Držení míče",
                        home: data.possession?.home || 0,
                        away: data.possession?.away || 0,
                        homeDisplay: `${data.possession?.home || 0}%`,
                        awayDisplay: `${data.possession?.away || 0}%`,
                        homeColor: "bg-blue-500",
                        awayColor: "bg-red-500",
                        total: 100
                    },
                    {
                        label: "Střely na bránu",
                        home: data.shotsOnTarget?.home || 0,
                        away: data.shotsOnTarget?.away || 0,
                        homeDisplay: (data.shotsOnTarget?.home || 0).toString(),
                        awayDisplay: (data.shotsOnTarget?.away || 0).toString(),
                        homeColor: "bg-blue-500",
                        awayColor: "bg-red-500"
                    },
                    {
                        label: "Střely mimo",
                        home: data.shotsOffTarget?.home || 0,
                        away: data.shotsOffTarget?.away || 0,
                        homeDisplay: (data.shotsOffTarget?.home || 0).toString(),
                        awayDisplay: (data.shotsOffTarget?.away || 0).toString(),
                        homeColor: "bg-blue-500",
                        awayColor: "bg-red-500"
                    },
                    {
                        label: "Rohy",
                        home: data.corners?.home || 0,
                        away: data.corners?.away || 0,
                        homeDisplay: (data.corners?.home || 0).toString(),
                        awayDisplay: (data.corners?.away || 0).toString(),
                        homeColor: "bg-blue-500",
                        awayColor: "bg-red-500"
                    },
                    {
                        label: "Fauly",
                        home: data.fouls?.home || 0,
                        away: data.fouls?.away || 0,
                        homeDisplay: (data.fouls?.home || 0).toString(),
                        awayDisplay: (data.fouls?.away || 0).toString(),
                        homeColor: "bg-blue-500",
                        awayColor: "bg-red-500"
                    }
                ];
                
                setStats(transformedStats);
            }
        } catch (error) {
            console.error("Failed to load match stats", error);
        } finally {
            setIsLoading(false);
        }
    };

    fetchStats();
  }, [selectedMatch.id, selectedMatch.detailedStats]);

  if (isLoading) {
      return (
          <div className="space-y-4 animate-pulse">
              {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-8 bg-white/5 rounded-full w-full"></div>
              ))}
          </div>
      )
  }

  if (!stats || stats.length === 0) {
    return (
      <div className="text-center text-secondary py-8 bg-white/5 rounded-lg border border-white/10">
        <p>Detailed statistics are not available for this match.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {stats.map((stat: any, index: number) => {
        // Parse values to numbers to ensure safety
        const homeVal = typeof stat.home === 'number' ? stat.home : parseFloat(stat.home);
        const awayVal = typeof stat.away === 'number' ? stat.away : parseFloat(stat.away);
        
        // Calculate total for percentage width
        // If it's possession (total=100), otherwise sum of both
        const total = stat.label === 'Držení míče' ? 100 : (homeVal + awayVal);
        
        // Calculate widths (avoid division by zero)
        const homeWidth = total > 0 ? (homeVal / total) * 100 : 0;
        const awayWidth = total > 0 ? (awayVal / total) * 100 : 0;

        return (
          <div key={index} className="flex flex-col gap-1 mb-3">
             <div className="flex items-center gap-3 text-sm">
                {/* Home Value */}
                <span className="font-bold text-white w-8 text-right shrink-0">{stat.homeDisplay || homeVal}</span>
                
                {/* Home Bar (Fills from Left) */}
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden flex justify-start">
                    <div 
                        className={`h-full ${stat.homeColor || 'bg-blue-500'} transition-all duration-1000 ease-out`} 
                        style={{ width: `${homeWidth}%` }}
                    ></div>
                </div>

                {/* Label (Center) */}
                <span className="text-[10px] font-bold text-secondary uppercase tracking-wider w-24 text-center shrink-0">
                    {stat.label}
                </span>

                {/* Away Bar (Fills from Right) */}
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden flex justify-end">
                    <div 
                        className={`h-full ${stat.awayColor || 'bg-red-500'} transition-all duration-1000 ease-out`} 
                        style={{ width: `${awayWidth}%` }}
                    ></div>
                </div>

                {/* Away Value */}
                <span className="font-bold text-white w-8 text-left shrink-0">{stat.awayDisplay || awayVal}</span>
             </div>
          </div>
        );
      })}
      
      </div>
  )
}
