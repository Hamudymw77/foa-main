import { useState, useEffect } from 'react';

export function useDashboardState(initialMatchId: string = "match-1") {
  const [selectedMatchId, setSelectedMatchId] = useState(initialMatchId);
  const [showStatistics, setShowStatistics] = useState(false);

  const handleSelectMatch = (id: string, isUpcoming: boolean = false) => {
      setSelectedMatchId(id);
      // Optional: scroll to match detail if needed
  };

  return {
    selectedMatchId,
    setSelectedMatchId,
    showStatistics,
    setShowStatistics,
    handleSelectMatch
  };
}
