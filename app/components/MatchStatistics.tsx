"use client"
import { Match, DetailedStat } from "@/types"

interface MatchStatisticsProps {
  selectedMatch: Match
}

export function MatchStatistics({ selectedMatch }: MatchStatisticsProps) {
  return (
    <div className="space-y-4">
      {selectedMatch.detailedStats?.map((stat: DetailedStat, index: number) => {
        const homeValue = stat.home;
        const awayValue = stat.away;
        const totalForWidth = stat.total && stat.total > 0 ? stat.total : (homeValue + awayValue);
        
        // Speciální zacházení pro procenta, kde se pro bar (progress bar) používají procenta, ne absolutní hodnoty
        const homeWidth = stat.label.includes('Držení míče') 
            ? homeValue 
            : (homeValue / totalForWidth) * 100;

        return (
          <div key={index} className="flex justify-between items-center">
            <span className={`w-16 text-right font-bold ${stat.label.includes('xG') ? 'text-lg' : 'text-xl'}`}>{stat.homeDisplay}</span>
            <span className="flex-1 mx-4">
                <div className="text-center text-sm text-slate-400 mb-1 font-semibold">{stat.label}</div>
                <div className="bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                        className={`${stat.color} h-full`}
                        style={{ width: `${homeWidth}%` }}
                    />
                </div>
                {/* Raw data (přesné počty přihrávek) */}
                {stat.raw && (
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>{stat.rawHome}</span>
                        <span>{stat.rawAway}</span>
                    </div>
                )}
            </span>
            <span className={`w-16 font-bold ${stat.label.includes('xG') ? 'text-lg' : 'text-xl'}`}>{stat.awayDisplay}</span>
          </div>
        );
      })}
    </div>
  )
}
