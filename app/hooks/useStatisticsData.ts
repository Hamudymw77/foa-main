import { useState, useEffect } from 'react';
import { Scorer, Defense } from '@/types';
import { DataService } from '../services/dataService';

export function useStatisticsData() {
  const [topScorers, setTopScorers] = useState<Scorer[]>([]);
  const [bestDefense, setBestDefense] = useState<Defense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [scorers, defense] = await Promise.all([
          DataService.getTopScorers(),
          DataService.getBestDefense()
        ]);
        setTopScorers(scorers);
        setBestDefense(defense);
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

  return { topScorers, bestDefense, isLoading };
}
