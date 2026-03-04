import React, { forwardRef } from 'react';
import { Match, MatchEvent } from '../types';
import { TeamLogo } from './TeamLogo';
import { Trophy, Calendar, MapPin } from 'lucide-react';

interface MatchSummaryCardProps {
  match: Match;
}

export const MatchSummaryCard = forwardRef<HTMLDivElement, MatchSummaryCardProps>(({ match }, ref) => {
  // Filter goal events
  const goals = match.events?.filter(e => e.type === 'goal') || [];
  
  // Group goals by team
  const homeGoals = goals.filter(g => g.team === 'home');
  const awayGoals = goals.filter(g => g.team === 'away');

  // Format date
  const formatDate = (dateStr: string) => {
    try {
        return new Date(dateStr).toLocaleDateString('cs-CZ', {
            weekday: 'long',
            day: 'numeric', 
            month: 'long', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return dateStr;
    }
  };

  return (
    <div 
      ref={ref}
      className="w-[800px] h-[450px] bg-slate-900 text-white relative overflow-hidden flex flex-col font-sans"
      style={{
        backgroundImage: 'radial-gradient(circle at center, #1e293b 0%, #020617 100%)'
      }}
    >
      {/* Background Pattern / Decor */}
      <div className="absolute inset-0 opacity-20" 
           style={{
               backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
               backgroundSize: '20px 20px'
           }}
      />
      
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-accent" />
            <span className="font-black tracking-widest uppercase text-accent">Premier League</span>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-white/70">
            <span className="uppercase">Matchweek {match.matchweek}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-12 gap-12">
        
        {/* Home Team */}
        <div className="flex flex-col items-center w-1/3 text-center">
            <TeamLogo teamName={match.homeTeam} url={match.homeLogo} className="w-32 h-32 mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
            <h2 className="text-2xl font-black uppercase tracking-tight leading-none mb-4">{match.homeTeam}</h2>
            
            {/* Home Scorers */}
            <div className="text-sm space-y-1 text-white/70 w-full">
                {homeGoals.map((g, i) => (
                    <div key={i} className="flex justify-center items-center gap-2">
                        <span className="font-bold text-accent">{g.minute}'</span>
                        <span className="truncate">{g.player}</span>
                    </div>
                ))}
            </div>
        </div>

        {/* Scoreboard */}
        <div className="flex flex-col items-center justify-center">
            <div className="text-7xl font-black tabular-nums tracking-tighter bg-white/10 px-8 py-4 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-sm">
                {match.status === 'upcoming' ? 'VS' : `${match.homeScore ?? 0}:${match.awayScore ?? 0}`}
            </div>
            <div className="mt-4 px-4 py-1 bg-accent/20 text-accent rounded-full text-xs font-bold uppercase tracking-widest border border-accent/20">
                {match.status === 'finished' ? 'Full Time' : match.status}
            </div>
        </div>

        {/* Away Team */}
        <div className="flex flex-col items-center w-1/3 text-center">
            <TeamLogo teamName={match.awayTeam} url={match.awayLogo} className="w-32 h-32 mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
            <h2 className="text-2xl font-black uppercase tracking-tight leading-none mb-4">{match.awayTeam}</h2>

            {/* Away Scorers */}
            <div className="text-sm space-y-1 text-white/70 w-full">
                {awayGoals.map((g, i) => (
                    <div key={i} className="flex justify-center items-center gap-2">
                        <span className="truncate">{g.player}</span>
                        <span className="font-bold text-accent">{g.minute}'</span>
                    </div>
                ))}
            </div>
        </div>

      </div>

      {/* Footer */}
      <div className="relative z-10 px-8 py-4 bg-black/20 flex items-center justify-between text-xs font-medium text-white/50 border-t border-white/5">
        <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(match.date)}</span>
        </div>
        <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{match.stadium}</span>
        </div>
      </div>
      
      {/* Watermark/Brand */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 opacity-5 pointer-events-none">
        <span className="text-6xl font-black uppercase tracking-widest">PL Live</span>
      </div>
    </div>
  );
});

MatchSummaryCard.displayName = 'MatchSummaryCard';
