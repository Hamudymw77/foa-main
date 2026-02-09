"use client"
import { Match } from "@/types"
import { MatchStatistics } from "./MatchStatistics"
import { FormationView } from "./FormationView"
import { MatchEvents } from "./MatchEvents"

interface MatchDetailProps {
  selectedMatch: Match
  activeTab: string
  setActiveTab: (tab: string) => void
  showPredicted: boolean
  setShowPredicted: (show: boolean) => void
}

export function MatchDetail({ 
  selectedMatch, 
  activeTab, 
  setActiveTab, 
  showPredicted, 
  setShowPredicted 
}: MatchDetailProps) {
  return (
    <div className="bg-slate-800 rounded-xl shadow-xl p-4 md:p-6">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-600">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 flex-1 w-full">
          <div className="text-center flex-1 flex flex-col items-center">
            <img
              src={selectedMatch.homeLogo || "/placeholder.svg"}
              alt={selectedMatch.homeTeam}
              className="w-12 h-12 md:w-20 md:h-20 mx-auto mb-2 object-contain"
            />
            <h3 className="text-sm md:text-xl font-bold break-words w-full px-1">{selectedMatch.homeTeam}</h3>
          </div>
          <div className="text-center shrink-0 my-2 md:my-0">
            <div className="text-3xl md:text-5xl font-bold text-yellow-400 whitespace-nowrap">
              {selectedMatch.status === 'upcoming' 
                ? <span className="text-2xl md:text-4xl">VS</span> 
                : `${selectedMatch.homeScore} - ${selectedMatch.awayScore}`
              }
            </div>
            <div className="text-[10px] md:text-sm text-slate-400 mt-1 md:mt-2 uppercase tracking-wider">
              {selectedMatch.status === 'upcoming' ? 'UPCOMING' : 'FULL TIME'}
            </div>
          </div>
          <div className="text-center flex-1 flex flex-col items-center">
            <img
              src={selectedMatch.awayLogo || "/placeholder.svg"}
              alt={selectedMatch.awayTeam}
              className="w-12 h-12 md:w-20 md:h-20 mx-auto mb-2 object-contain"
            />
            <h3 className="text-sm md:text-xl font-bold break-words w-full px-1">{selectedMatch.awayTeam}</h3>
          </div>
        </div>
      </div>

      <div className="text-center text-slate-400 mb-6">
        <p className="text-sm">{selectedMatch.date}</p>
        <p className="text-sm">{selectedMatch.stadium}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-700 overflow-x-auto pb-2 md:pb-0">
        {selectedMatch.status !== 'upcoming' && (
          <>
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-3 py-2 md:px-6 md:py-3 text-sm md:text-base font-semibold transition-colors whitespace-nowrap ${
                activeTab === "overview"
                  ? "text-orange-400 border-b-2 border-orange-400"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("statistics")}
              className={`px-3 py-2 md:px-6 md:py-3 text-sm md:text-base font-semibold transition-colors whitespace-nowrap ${
                activeTab === "statistics"
                  ? "text-orange-400 border-b-2 border-orange-400"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Statistics
            </button>
          </>
        )}
        <button
          onClick={() => setActiveTab("formation")}
          className={`px-3 py-2 md:px-6 md:py-3 text-sm md:text-base font-semibold transition-colors whitespace-nowrap ${
            activeTab === "formation"
              ? "text-orange-400 border-b-2 border-orange-400"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Formation
        </button>
        {selectedMatch.status !== 'upcoming' && (
          <button
            onClick={() => setActiveTab("events")}
            className={`px-3 py-2 md:px-6 md:py-3 text-sm md:text-base font-semibold transition-colors whitespace-nowrap ${
              activeTab === "events"
                ? "text-orange-400 border-b-2 border-orange-400"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Match Events
          </button>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div>
          <h4 className="text-xl font-bold text-yellow-400 mb-4">Goals</h4>
            <div className="space-y-3">
              {selectedMatch.goals?.map((goal, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-slate-700/50 p-3 rounded-lg">
                  <span className="text-2xl font-bold text-orange-400 w-12">{goal.minute}&apos;</span>
                  <img
                    src={goal.team === "home" ? selectedMatch.homeLogo : selectedMatch.awayLogo}
                    alt=""
                    className="w-8 h-8"
                  />
                  <div className="flex-1">
                    <div className="font-semibold">{goal.scorer}</div>
                    <div className="text-sm text-slate-400">
                      {goal.team === "home" ? selectedMatch.homeTeam : selectedMatch.awayTeam}
                    </div>
                  </div>
                  <span className="text-xl font-bold text-yellow-400">{goal.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "statistics" && (
        <MatchStatistics selectedMatch={selectedMatch} />
      )}
      
      {activeTab === "formation" && (
        <FormationView 
          selectedMatch={selectedMatch} 
          showPredicted={showPredicted} 
          setShowPredicted={setShowPredicted} 
        />
      )}

      {activeTab === "events" && (
        <MatchEvents selectedMatch={selectedMatch} />
      )}
    </div>
  )
}
