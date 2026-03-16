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
      className="w-full md:w-[800px] min-h-[450px] bg-slate-900 text-white relative overflow-hidden flex flex-col font-sans rounded-xl"
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
      <div className="relative z-10 flex-1 flex flex-col md:flex-row items-center justify-center px-6 md:px-12 gap-8 md:gap-12 py-8 md:py-0">
        
        {/* Home Team */}
        <div className="flex flex-col items-center w-full md:w-1/3 text-center order-1 md:order-1">
            <TeamLogo teamName={match.homeTeam} url={match.homeLogo} className="w-32 h-32 mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
            <h2 className="text-2xl font-black uppercase tracking-tight leading-none mb-4">{match.homeTeam}</h2>
            
            {/* Home Scorers */}
            <div className="text-sm space-y-1 text-white/70 w-full">
                {homeGoals.map((g, i) => (
                    <div key={i} className="flex justify-center items-center gap-2">
                        <span className="bg-slate-700 text-xs font-bold px-2 py-0.5 rounded text-white min-w-[2.5rem] text-center">{g.minute}'</span>
                        <span className="truncate">{g.player}</span>
                    </div>
                ))}
            </div>
        </div>

        {/* Scoreboard */}
        <div className="flex flex-col items-center justify-center order-2 md:order-2 my-4 md:my-0">
            <div className="text-5xl md:text-7xl font-black tabular-nums tracking-tighter bg-white/10 px-6 md:px-8 py-3 md:py-4 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-sm">
                {match.status === 'upcoming' ? 'VS' : `${match.homeScore ?? 0}:${match.awayScore ?? 0}`}
            </div>
            <div className="mt-4 px-4 py-1 bg-accent/20 text-accent rounded-full text-xs font-bold uppercase tracking-widest border border-accent/20">
                {match.status === 'finished' ? 'Full Time' : match.status}
            </div>
        </div>

        {/* Away Team */}
        <div className="flex flex-col items-center w-full md:w-1/3 text-center order-3 md:order-3">
            <TeamLogo teamName={match.awayTeam} url={match.awayLogo} className="w-32 h-32 mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
            <h2 className="text-2xl font-black uppercase tracking-tight leading-none mb-4">{match.awayTeam}</h2>

            {/* Away Scorers */}
            <div className="text-sm space-y-1 text-white/70 w-full">
                {awayGoals.map((g, i) => (
                    <div key={i} className="flex justify-center items-center gap-2">
                        <span className="truncate">{g.player}</span>
                        <span className="bg-slate-700 text-xs font-bold px-2 py-0.5 rounded text-white min-w-[2.5rem] text-center">{g.minute}'</span>
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
            {/* TASK 1: Show Venue instead of just Premier League/Stadium */}
            {/* If venue is available in match object (which it might not be fully in SummaryCard props depending on mapper), show it.
                Based on types, match might not have venue details directly exposed here.
                Let's check if we can get it or fallback to stadium prop.
                Actually, the user said "Replace 'Premier League' below scores" -> Wait, user said "below the scores, it says 'Premier League'".
                Looking at code: 
                <div className="flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-accent" />
                    <span className="font-black tracking-widest uppercase text-accent">Premier League</span>
                </div>
                This is in the HEADER.
                
                The user instruction: "On the match card, below the scores, it says 'Premier League'. The user wants to see the match venue/stadium location instead."
                
                In `MatchSummaryCard.tsx`:
                There is NO "Premier League" text below the scores in the current code I see.
                Wait, I see "Premier League" in the Header (lines 54).
                And I see `<span>{match.stadium}</span>` in the Footer (line 116).
                
                Maybe the user meant the "Premier League" in the header? Or maybe they mean `match.stadium` which currently defaults to 'Premier League' in the mapper?
                
                Let's look at mapper in `app/api/football/route.ts`:
                `stadium: 'Premier League',` (line 181)
                
                Ah! The `stadium` field is hardcoded to "Premier League" in the mapper!
                So `match.stadium` IS displaying "Premier League".
                
                Action: I need to update the MAPPER to fetch real venue, and then `MatchSummaryCard` will automatically show it in the footer where `{match.stadium}` is used.
                
                However, the user said "below the scores".
                In `MatchSummaryCard`, the footer is at the bottom.
                
                Let's look at `MatchCard.tsx` (not SummaryCard) just in case?
                The user said "match card component".
                I am reading `MatchSummaryCard.tsx`.
                
                Let's check `MatchCard.tsx` too if possible, but I don't see it in the file list I read.
                Wait, `MatchList.tsx` imports `MatchCard`.
                
                Let's assume the user means `MatchSummaryCard` for the "Venue" request if that's the big detailed one.
                
                BUT, `app/api/football/route.ts` hardcodes `stadium: 'Premier League'`.
                So fixing the mapper is the root cause fix for "Show Venue".
                
                For "TASK 2: Style Match Minute", that's in `MatchSummaryCard` lines 73 and 100:
                `<span className="font-bold text-accent">{g.minute}'</span>`
                
                I will modify `MatchSummaryCard` to style the minute.
            */}
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
