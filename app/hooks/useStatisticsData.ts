import { useState, useEffect } from 'react';
import { Scorer, Defense, PlayerStat } from '@/types';
import { DataService } from '../services/dataService';

export function useStatisticsData() {
  const [topScorers, setTopScorers] = useState<Scorer[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStat[]>([]);
  const [bestDefense, setBestDefense] = useState<Defense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [stats, defense, scorers] = await Promise.all([
          DataService.getPlayersStats(),
          DataService.getBestDefense(),
          DataService.getTopScorers()
        ]);
        
        setPlayerStats(stats || []);
        setBestDefense(defense || []);
        
        // Use real stats if available, otherwise fallback to mock
        if (stats && stats.length > 0) {
            const mappedScorers: Scorer[] = stats
                .sort((a, b) => b.goals - a.goals || b.assists - a.assists)
                .slice(0, 10)
                .map(p => ({
                    id: p.id.toString(),
                    name: p.web_name,
                    team: p.team,
                    goals: p.goals,
                    assists: p.assists,
                    countryCode: '', 
                    matchesPlayed: Math.round(p.minutes / 90), 
                    minutesPlayed: p.minutes,
                    goalsPerMatch: p.minutes > 0 ? parseFloat((p.goals / (p.minutes / 90)).toFixed(2)) : 0
                }));
            setTopScorers(mappedScorers);
        } else {
            setTopScorers(scorers);
        }

      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
    
    // Auto-refresh every 15 minutes
    const interval = setInterval(loadData, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { topScorers, playerStats, bestDefense, isLoading };
}
