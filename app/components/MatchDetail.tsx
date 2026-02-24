"use client"
import { Match } from "@/types"
import { MatchStatistics } from "./MatchStatistics"
import { FormationView } from "./FormationView"
import { MatchEvents } from "./MatchEvents"
import { TeamLogo } from "./TeamLogo"

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
    <div className="glass rounded-xl shadow-lg p-4 md:p-6">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 flex-1 w-full">
          <div className="text-center flex-1 flex flex-col items-center">
            <TeamLogo
              teamName={selectedMatch.homeTeam}
              url={selectedMatch.homeLogo}
              className="w-12 h-12 md:w-20 md:h-20 mx-auto mb-2 drop-shadow-lg"
            />
            <h3 className="text-sm md:text-xl font-bold break-words w-full px-1">{selectedMatch.homeTeam}</h3>
          </div>
          <div className="text-center shrink-0 my-2 md:my-0">
            <div className="text-3xl md:text-5xl font-bold text-accent whitespace-nowrap drop-shadow-lg">
              {selectedMatch.status === 'upcoming' 
                ? <span className="text-2xl md:text-4xl text-secondary">VS</span> 
                : `${selectedMatch.homeScore} - ${selectedMatch.awayScore}`
              }
            </div>
            <div className="text-[10px] md:text-sm text-secondary mt-1 md:mt-2 uppercase tracking-wider font-bold">
              {selectedMatch.status === 'upcoming' ? 'UPCOMING' : 'FULL TIME'}
            </div>
          </div>
          <div className="text-center flex-1 flex flex-col items-center">
            <TeamLogo
              teamName={selectedMatch.awayTeam}
              url={selectedMatch.awayLogo}
              className="w-12 h-12 md:w-20 md:h-20 mx-auto mb-2 drop-shadow-lg"
            />
            <h3 className="text-sm md:text-xl font-bold break-words w-full px-1">{selectedMatch.awayTeam}</h3>
          </div>
        </div>
      </div>

      <div className="text-center text-secondary mb-6">
        <p className="text-sm font-medium">{selectedMatch.date}</p>
        <p className="text-sm">{selectedMatch.stadium}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-white/10 overflow-x-auto pb-2 md:pb-0 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {selectedMatch.status !== 'upcoming' && (
          <>
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-3 py-2 md:px-6 md:py-3 text-sm md:text-base font-semibold transition-all whitespace-nowrap ${
                activeTab === "overview"
                  ? "text-accent border-b-2 border-accent"
                  : "text-secondary hover:text-foreground hover:bg-white/5 rounded-t-lg"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("statistics")}
              className={`px-3 py-2 md:px-6 md:py-3 text-sm md:text-base font-semibold transition-all whitespace-nowrap ${
                activeTab === "statistics"
                  ? "text-accent border-b-2 border-accent"
                  : "text-secondary hover:text-foreground hover:bg-white/5 rounded-t-lg"
              }`}
            >
              Statistics
            </button>
          </>
        )}
        <button
          onClick={() => setActiveTab("formation")}
          className={`px-3 py-2 md:px-6 md:py-3 text-sm md:text-base font-semibold transition-all whitespace-nowrap ${
            activeTab === "formation"
              ? "text-accent border-b-2 border-accent"
              : "text-secondary hover:text-foreground hover:bg-white/5 rounded-t-lg"
          }`}
        >
          Formation
        </button>
        {selectedMatch.status !== 'upcoming' && (
          <button
            onClick={() => setActiveTab("events")}
            className={`px-3 py-2 md:px-6 md:py-3 text-sm md:text-base font-semibold transition-all whitespace-nowrap ${
              activeTab === "events"
                ? "text-accent border-b-2 border-accent"
                : "text-secondary hover:text-foreground hover:bg-white/5 rounded-t-lg"
            }`}
          >
            Match Events
          </button>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div>
            <h4 className="text-xl font-bold text-accent mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-accent rounded-full"></span>
              Goals
            </h4>
            {selectedMatch.goals && selectedMatch.goals.length > 0 ? (
              <div className="space-y-3">
                {selectedMatch.goals.map((goal, idx) => (
                  <div key={idx} className="glass-card flex items-center gap-4 p-4 rounded-xl transition-all duration-300 hover:scale-[1.01]">
                    <span className="text-2xl font-bold text-accent w-12 text-center">{goal.minute}&apos;</span>
                    <img
                      src={goal.team === "home" ? selectedMatch.homeLogo : selectedMatch.awayLogo}
                      alt=""
                      className="w-10 h-10 object-contain drop-shadow-sm"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-lg">{goal.scorer}</div>
                      <div className="text-sm text-secondary font-medium uppercase tracking-wide">
                        {goal.team === "home" ? selectedMatch.homeTeam : selectedMatch.awayTeam}
                      </div>
                    </div>
                    <span className="text-3xl font-bold text-accent/20">{goal.score}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-secondary py-12 bg-white/5 rounded-xl border border-white/10 border-dashed">
                <p>Goal details are not available for this match.</p>
              </div>
            )}
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
