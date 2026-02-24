import { useState, useEffect } from 'react';
import { Match, TeamStanding } from '../types';

export function useFootballData() {
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | undefined>(undefined);

  useEffect(() => {
    async function fetchData() {
      try {
        const [standingsRes, matchesRes] = await Promise.all([
            fetch('/api/football?type=standings'),
            fetch('/api/football?type=matches&detail=1')
        ]);

        if (standingsRes.ok) {
            const data = await standingsRes.json();
            if (Array.isArray(data)) setStandings(data);
        }

        if (matchesRes.ok) {
            const allMatches = await matchesRes.json();
            if (Array.isArray(allMatches)) {
                // Filter matches based on status
                const upcoming = allMatches.filter((m: Match) => m.status === 'upcoming');
                const completed = allMatches.filter((m: Match) => m.status !== 'upcoming');
                completed.sort((a: Match, b: Match) => (b.timestamp ?? 0) - (a.timestamp ?? 0));
                upcoming.sort((a: Match, b: Match) => (a.timestamp ?? Number.POSITIVE_INFINITY) - (b.timestamp ?? Number.POSITIVE_INFINITY));
                setMatches(completed);
                setUpcomingMatches(upcoming);
                setLastUpdated(new Date());
            }
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
        setError(error as Error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();

    // Polling every 60 seconds to auto-update after matches
    const intervalId = setInterval(fetchData, 60000);

    return () => clearInterval(intervalId);
  }, []);

  return { standings, matches, upcomingMatches, isLoading, error, lastUpdated };
}
