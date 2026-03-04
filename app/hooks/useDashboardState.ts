import { useState, useEffect } from 'react';

export function useDashboardState(matchId: string) {
  const [selectedMatchId, setSelectedMatchId] = useState(matchId);
  const [activeTab, setActiveTab] = useState("statistics"); // Default to statistics for finished matches

  // If we wanted to set default based on match status we would need the match object here,
  // but for now we'll default to 'statistics' which is safe.
  // The component can override this if the match is upcoming.
  
  return {
    selectedMatchId,
    setSelectedMatchId,
    activeTab,
    setActiveTab
  };
}
