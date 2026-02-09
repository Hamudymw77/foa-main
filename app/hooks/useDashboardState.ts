import { useState } from 'react';

export function useDashboardState(initialMatchId: string = "match-1") {
  const [selectedMatchId, setSelectedMatchId] = useState(initialMatchId);
  const [activeTab, setActiveTab] = useState("overview");
  const [showStatistics, setShowStatistics] = useState(false);
  const [showTransfers, setShowTransfers] = useState(false);
  const [showPredicted, setShowPredicted] = useState(false);

  const handleSelectMatch = (id: string, isUpcoming: boolean) => {
    setSelectedMatchId(id);
    if (isUpcoming) {
      setActiveTab('formation');
      setShowPredicted(true);
    } else {
      setActiveTab('overview');
      setShowPredicted(false); // Reset predicted when switching to finished match
    }
  };

  return {
    selectedMatchId,
    setSelectedMatchId,
    activeTab,
    setActiveTab,
    showStatistics,
    setShowStatistics,
    showTransfers,
    setShowTransfers,
    showPredicted,
    setShowPredicted,
    handleSelectMatch
  };
}
