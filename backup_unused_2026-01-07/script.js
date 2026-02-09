// s.js - Kód pro dynamické zobrazení dat Premier League

// --- MOCK DATA PREMIER LEAGUE (KOLO 14 - FT, KOLO 15 - SCHEDULED) ---

const matches = [
  // UKONČENÉ VÝSLEDKY (Kolo 14 - DLE OBRÁZKU)
  {
    round: 14,
    date: "03.12.",
    time: "21:15",
    homeTeam: "Leeds",
    awayTeam: "Chelsea",
    homeScore: 3,
    awayScore: 1,
    status: "FT",
  },
  {
    round: 14,
    date: "03.12.",
    time: "21:15",
    homeTeam: "Liverpool",
    awayTeam: "Sunderland",
    homeScore: 1,
    awayScore: 1,
    status: "FT",
  },
  {
    round: 14,
    date: "03.12.",
    time: "20:30",
    homeTeam: "Arsenal",
    awayTeam: "Brentford",
    homeScore: 2,
    awayScore: 0,
    status: "FT",
  },
  {
    round: 14,
    date: "03.12.",
    time: "20:30",
    homeTeam: "Brighton",
    awayTeam: "Aston Villa",
    homeScore: 3,
    awayScore: 4,
    status: "FT",
  },
  {
    round: 14,
    date: "03.12.",
    time: "20:30",
    homeTeam: "Burnley",
    awayTeam: "Crystal Palace",
    homeScore: 0,
    awayScore: 1,
    status: "FT",
  },
  {
    round: 14,
    date: "03.12.",
    time: "20:30",
    homeTeam: "Wolves",
    awayTeam: "Nottingham",
    homeScore: 0,
    awayScore: 1,
    status: "FT",
  },
  {
    round: 14,
    date: "02.12.",
    time: "21:15",
    homeTeam: "Newcastle",
    awayTeam: "Tottenham",
    homeScore: 2,
    awayScore: 2,
    status: "FT",
  },
  {
    round: 14,
    date: "02.12.",
    time: "20:30",
    homeTeam: "Bournemouth",
    awayTeam: "Everton",
    homeScore: 0,
    awayScore: 1,
    status: "FT",
  },
  {
    round: 14,
    date: "02.12.",
    time: "20:30",
    homeTeam: "Fulham",
    awayTeam: "Manchester City",
    homeScore: 4,
    awayScore: 5,
    status: "FT",
  },

  // NADCHÁZEJÍCÍ ZÁPASY (Kolo 15 - DLE OBRÁZKU)
  {
    round: 15,
    date: "06.12.",
    time: "13:30",
    homeTeam: "Aston Villa",
    awayTeam: "Arsenal",
    homeScore: null,
    awayScore: null,
    status: "SCHEDULED",
  },
  {
    round: 15,
    date: "06.12.",
    time: "16:00",
    homeTeam: "Bournemouth",
    awayTeam: "Chelsea",
    homeScore: null,
    awayScore: null,
    status: "SCHEDULED",
  },
  {
    round: 15,
    date: "06.12.",
    time: "16:00",
    homeTeam: "Everton",
    awayTeam: "Nottingham",
    homeScore: null,
    awayScore: null,
    status: "SCHEDULED",
  },
  {
    round: 15,
    date: "06.12.",
    time: "16:00",
    homeTeam: "Manchester City",
    awayTeam: "Sunderland",
    homeScore: null,
    awayScore: null,
    status: "SCHEDULED",
  },
  {
    round: 15,
    date: "06.12.",
    time: "16:00",
    homeTeam: "Newcastle",
    awayTeam: "Burnley",
    homeScore: null,
    awayScore: null,
    status: "SCHEDULED",
  },
  {
    round: 15,
    date: "06.12.",
    time: "16:00",
    homeTeam: "Tottenham",
    awayTeam: "Brentford",
    homeScore: null,
    awayScore: null,
    status: "SCHEDULED",
  },
  {
    round: 15,
    date: "06.12.",
    time: "18:30",
    homeTeam: "Leeds",
    awayTeam: "Liverpool",
    homeScore: null,


    awayScore: null,
    status: "SCHEDULED",
  },
  {
    round: 15,
    date: "07.12.",
    time: "15:00",
    homeTeam: "Brighton",
    awayTeam: "West Ham",
    homeScore: null,
    awayScore: null,
    status: "SCHEDULED",
  },
  {
    round: 15,
    date: "07.12.",
    time: "17:30",
    homeTeam: "Fulham",
    awayTeam: "Crystal Palace",
    homeScore: null,
    awayScore: null,
    status: "SCHEDULED",
  },
  {
    round: 15,
    date: "08.12.",
    time: "21:00",
    homeTeam: "Wolves",
    awayTeam: "Manchester Utd",
    homeScore: null,
    awayScore: null,
    status: "SCHEDULED",
  },
]

// Mock data pro tabulku po kole 14 (PŘESNĚ DLE DODANÉHO OBRÁZKU)
const standingsData = [
  {
    position: 1,
    team: "Arsenal",
    played: 14,
    wins: 10,
    draws: 3,
    losses: 1,
    goalsFor: 27,
    goalsAgainst: 7,
    goalDifference: 20,
    points: 33,
    form: "R V R V V",
  },
  {
    position: 2,
    team: "Manchester City",
    played: 14,
    wins: 9,
    draws: 1,
    losses: 4,
    goalsFor: 32,
    goalsAgainst: 16,
    goalDifference: 16,
    points: 28,
    form: "V V P V V",
  },
  {
    position: 3,
    team: "Aston Villa",
    played: 14,
    wins: 8,
    draws: 3,
    losses: 3,
    goalsFor: 20,
    goalsAgainst: 14,
    goalDifference: 6,
    points: 27,
    form: "V V V P P",
  },
  {
    position: 4,
    team: "Chelsea",
    played: 14,
    wins: 7,
    draws: 3,
    losses: 4,
    goalsFor: 25,
    goalsAgainst: 15,
    goalDifference: 10,
    points: 24,
    form: "R P R V V",
  },
  {
    position: 5,
    team: "Crystal Palace",
    played: 14,
    wins: 6,
    draws: 5,
    losses: 3,
    goalsFor: 18,
    goalsAgainst: 11,
    goalDifference: 7,
    points: 23,
    form: "V R R V V",
  },
  {
    position: 6,
    team: "Sunderland",
    played: 14,
    wins: 6,
    draws: 5,
    losses: 3,
    goalsFor: 18,
    goalsAgainst: 14,
    goalDifference: 4,
    points: 23,
    form: "R V P R R",
  },
  {
    position: 7,
    team: "Brighton",
    played: 14,
    wins: 6,
    draws: 4,
    losses: 4,
    goalsFor: 24,
    goalsAgainst: 20,
    goalDifference: 4,
    points: 22,
    form: "V P V R V",
  },
  {
    position: 8,
    team: "Liverpool",
    played: 14,
    wins: 6,
    draws: 3,
    losses: 5,
    goalsFor: 21,
    goalsAgainst: 22,
    goalDifference: -1,
    points: 21,
    form: "R V P R P",
  },
  {
    position: 9,
    team: "Manchester Utd",
    played: 13,
    wins: 6,
    draws: 3,
    losses: 4,
    goalsFor: 21,
    goalsAgainst: 20,
    goalDifference: 1,
    points: 21,
    form: "V P R R V",
  },
  {
    position: 10,
    team: "Everton",
    played: 14,
    wins: 6,
    draws: 3,
    losses: 5,
    goalsFor: 15,
    goalsAgainst: 17,
    goalDifference: -2,
    points: 21,
    form: "V P V R R",
  },
  {
    position: 11,
    team: "Tottenham",
    played: 14,
    wins: 5,
    draws: 4,
    losses: 5,
    goalsFor: 23,
    goalsAgainst: 18,
    goalDifference: 5,
    points: 19,
    form: "R P V P P",
  },
  {
    position: 12,
    team: "Newcastle",
    played: 14,
    wins: 5,
    draws: 4,
    losses: 5,
    goalsFor: 19,
    goalsAgainst: 18,
    goalDifference: 1,
    points: 19,
    form: "R V P V P",
  },
  {
    position: 13,
    team: "Brentford",
    played: 14,
    wins: 6,
    draws: 1,
    losses: 7,
    goalsFor: 21,
    goalsAgainst: 22,
    goalDifference: -1,
    points: 19,
    form: "P V P P P",
  },
  {
    position: 14,
    team: "Bournemouth",
    played: 14,
    wins: 5,
    draws: 4,
    losses: 5,
    goalsFor: 21,
    goalsAgainst: 24,
    goalDifference: -3,
    points: 19,
    form: "P P V V V",
  },
  {
    position: 15,
    team: "Fulham",
    played: 14,
    wins: 5,
    draws: 2,
    losses: 7,
    goalsFor: 19,
    goalsAgainst: 22,
    goalDifference: -3,
    points: 17,
    form: "V P V P V",
  },
  {
    position: 16,
    team: "Nottingham",
    played: 14,
    wins: 4,
    draws: 3,
    losses: 7,
    goalsFor: 14,
    goalsAgainst: 22,
    goalDifference: -8,
    points: 15,
    form: "V P V V R",
  },
  {
    position: 17,
    team: "Leeds",
    played: 14,
    wins: 4,
    draws: 2,
    losses: 8,
    goalsFor: 16,
    goalsAgainst: 26,
    goalDifference: -10,
    points: 14,
    form: "P R P P P",
  },
  {
    position: 18,
    team: "West Ham",
    played: 13,
    wins: 3,
    draws: 2,
    losses: 8,
    goalsFor: 15,
    goalsAgainst: 27,
    goalDifference: -12,
    points: 11,
    form: "R P V V P",
  },
  {
    position: 19,
    team: "Burnley",
    played: 14,
    wins: 3,
    draws: 1,
    losses: 10,
    goalsFor: 15,
    goalsAgainst: 28,
    goalDifference: -13,
    points: 10,
    form: "P P P P P",
  },
  {
    position: 20,
    team: "Wolves",
    played: 14,
    wins: 0,
    draws: 2,
    losses: 12,
    goalsFor: 7,
    goalsAgainst: 29,
    goalDifference: -22,
    points: 2,
    form: "P P P P P",
  },
]

// Mock data for top scorers and best defense
const topScorersData = [
  { player: "Erling Haaland", team: "Manchester City", goals: 15, assisits: 3 },
  { player: "Igor Thiago", team: "Brentford", goals: 11, assisits: 0 },
  { player: "Jean-Philippe Mateta", team: "Crystal Palace", goals: 7, assisits: 0 },
  { player: "Welbeck", team: "Brighton", goals: 7, assisits: 0 },
  { player: "Semenyo", team: "Bournemouth", goals: 6, assisits: 3 },
  { player: "Phil Foden", team: "Manchester City", goals: 6, assisits: 2 },
]

const bestDefenseData = [
  { team: "Arsenal", goalsAgainst: 7, cleanSheets: 8, matches: 14 },
  { team: "Crystal Palace", goalsAgainst: 11, cleanSheets: 6, matches: 14 },
  { team: "Sunderland", goalsAgainst: 14, cleanSheets: 5, matches: 14 },
  { team: "Chelsea", goalsAgainst: 15, cleanSheets: 5, matches: 14 },
  { team: "Manchester City", goalsAgainst: 16, cleanSheets: 4, matches: 14 },
]

/**
 * Generuje unikátní ID pro HTML kotvu z názvů týmů.
 * Převádí na malá písmena a odstraňuje mezery/speciální znaky.
 * @param {string} homeTeam
 * @param {string} awayTeam
 * @returns {string}
 */
function generateMatchId(homeTeam, awayTeam) {
  // Odstraníme mezery a převedeme na malá písmena pro jednoduchou kotvu
  const idHome = homeTeam.toLowerCase().replace(/\s/g, "")
  const idAway = awayTeam.toLowerCase().replace(/\s/g, "")
  return `match-${idHome}-${idAway}`
}

/**
 * Zformátuje informace o zápase do HTML řetězce
 * @param {object} match - Objekt zápasu
 * @returns {string} HTML řetězec
 */
function formatMatchInfo(match) {
  const isFinished = match.status === "FT"
  const statusText = isFinished
    ? `<span class="text-base font-mono font-bold text-slate-300">${match.homeScore} : ${match.awayScore}</span>`
    : `<span class="text-sm font-semibold text-orange-400">${match.time}</span>`

  const homeTeamClass = isFinished && match.homeScore > match.awayScore ? "font-bold text-green-400" : "text-slate-300"
  const awayTeamClass = isFinished && match.awayScore > match.homeScore ? "font-bold text-green-400" : "text-slate-300"

  const matchContent = `
        <div class="flex justify-between items-center py-2 border-b border-slate-700 last:border-b-0 px-1 ${match.status === "SCHEDULED" ? "cursor-pointer hover:bg-slate-700/80 rounded-md" : "hover:bg-slate-700/50 rounded-md"}">
            <span class="text-xs text-slate-400 w-1/5">${match.date}</span>
            <span class="text-right w-1/3 truncate ${homeTeamClass}">${match.homeTeam}</span>
            <span class="mx-2 w-1/5 text-center">${statusText}</span>
            <span class="text-left w-1/3 truncate ${awayTeamClass}">${match.awayTeam}</span>
        </div>
    `

  if (match.status === "SCHEDULED") {
    // Generujeme kotvu pro kliknutí na naplánovaný zápas
    const matchId = generateMatchId(match.homeTeam, match.awayTeam)
    // Obalíme obsah anchor tagem
    return `<a href="#${matchId}" class="block no-underline text-inherit">${matchContent}</a>`
  }

  return matchContent // Pro ukončené zápasy vracíme jen div
}

function displayResults() {
  const resultsContainer = document.getElementById("results-container")
  if (!resultsContainer) return
  // Zobrazuje výsledky seřazené od nejnovějších
  const finishedMatches = matches.filter((match) => match.status === "FT").reverse()
  let resultsHTML =
    finishedMatches.length > 0
      ? ""
      : '<div class="text-slate-400 text-center py-4 text-sm">Žádné nedávné výsledky k zobrazení.</div>'
  finishedMatches.forEach((match) => {
    resultsHTML += formatMatchInfo(match)
  })
  resultsContainer.innerHTML = resultsHTML
}

function displaySchedule() {
  const scheduleContainer = document.getElementById("schedule-container")
  if (!scheduleContainer) return
  // Zobrazuje naplánované zápasy
  const scheduledMatches = matches.filter((match) => match.status === "SCHEDULED")
  let scheduleHTML =
    scheduledMatches.length > 0
      ? ""
      : '<div class="text-slate-400 text-center py-4 text-sm">Aktuálně nejsou naplánovány žádné zápasy.</div>'
  scheduledMatches.forEach((match) => {
    scheduleHTML += formatMatchInfo(match)
  })
  scheduleContainer.innerHTML = scheduleHTML
}

function displayStandings() {
  const standingsTableBody = document.getElementById("standings-table-body")
  if (!standingsTableBody) return

  let standingsHTML = ""

  standingsData.forEach((team) => {
    // Pravidla pro barvy řádků (zóna pohárů a sestupu)
    const isCL = team.position <= 4 ? "bg-emerald-700/50" : ""
    const isEL = team.position === 5 ? "bg-sky-700/50" : ""
    const isRel = team.position >= 18 ? "bg-red-700/50" : ""
    const rowClass = isCL || isEL || isRel || "bg-slate-800/50"

    // Formátování sloupce "Forma"
    const formHtml = team.form
      .split(" ")
      .map((f) => {
        let color = "text-white"
        // V = Vítězství, P = Prohra, R/A = Remíza
        if (f === "V") color = "bg-green-600"
        else if (f === "P") color = "bg-red-600"
        else if (f === "R" || f === "A") color = "bg-yellow-600" // 'A' je z Arsenal tabulky
        return `<span class="inline-block w-4 h-4 text-xs leading-4 text-center rounded-sm font-bold mx-[1px] ${color}">${f}</span>`
      })
      .join("")

    standingsHTML += `
            <tr class="hover:bg-slate-700/80 text-sm ${rowClass}">
                <td class="px-3 py-2 font-bold">${team.position}</td>
                <td class="px-3 py-2 text-left font-semibold">${team.team}</td>
                <td class="px-3 py-2">${team.played}</td>
                <td class="px-3 py-2">${team.wins}</td>
                <td class="px-3 py-2">${team.draws}</td>
                <td class="px-3 py-2">${team.losses}</td>
                <td class="px-3 py-2">${team.goalsFor}</td>
                <td class="px-3 py-2">${team.goalsAgainst}</td>
                <td class="px-3 py-2 font-mono">${team.goalDifference > 0 ? "+" : ""}${team.goalDifference}</td>
                <td class="px-3 py-2 font-extrabold text-lg text-yellow-300">${team.points}</td>
                <td class="px-3 py-2 whitespace-nowrap">${formHtml}</td>
            </tr>
        `
  })
  standingsTableBody.innerHTML = standingsHTML
}

function toggleStatistics() {
  const statsContent = document.getElementById("statistics-content")
  if (statsContent.classList.contains("hidden")) {
    statsContent.classList.remove("hidden")
    displayTopScorers()
    displayBestDefense()
    // Scroll to statistics
    statsContent.scrollIntoView({ behavior: "smooth", block: "nearest" })
  } else {
    statsContent.classList.add("hidden")
  }
}

function displayTopScorers() {
  const container = document.getElementById("top-scorers-list")
  if (!container) return

  let html = ""
  topScorersData.forEach((scorer, index) => {
    const medalColor =
      index === 0
        ? "text-yellow-400"
        : index === 1
          ? "text-gray-300"
          : index === 2
            ? "text-orange-600"
            : "text-slate-400"
    const medal = index < 3 ? "🏅" : `${index + 1}.`

    html += `
            <div class="flex items-center justify-between p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition">
                <div class="flex items-center gap-3">
                    <span class="text-2xl ${medalColor}">${medal}</span>
                    <div>
                        <div class="font-bold">${scorer.player}</div>
                        <div class="text-sm text-slate-400">${scorer.team}</div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-2xl font-bold text-green-400">${scorer.goals}</div>
                    <div class="text-xs text-slate-400">${scorer.matches} matches</div>
                </div>
            </div>
        `
  })
  container.innerHTML = html
}

function displayBestDefense() {
  const container = document.getElementById("best-defense-list")
  if (!container) return

  let html = ""
  bestDefenseData.forEach((defense, index) => {
    const medalColor =
      index === 0
        ? "text-yellow-400"
        : index === 1
          ? "text-gray-300"
          : index === 2
            ? "text-orange-600"
            : "text-slate-400"
    const medal = index < 3 ? "🛡️" : `${index + 1}.`

    html += `
            <div class="flex items-center justify-between p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition">
                <div class="flex items-center gap-3">
                    <span class="text-2xl ${medalColor}">${medal}</span>
                    <div>
                        <div class="font-bold">${defense.team}</div>
                        <div class="text-sm text-slate-400">${defense.cleanSheets} clean sheets</div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-2xl font-bold text-blue-400">${defense.goalsAgainst}</div>
                    <div class="text-xs text-slate-400">goals against</div>
                </div>
            </div>
        `
  })
  container.innerHTML = html
}

/**
 * Inicializace po načtení DOM
 */
document.addEventListener("DOMContentLoaded", () => {
  // Zobrazí výsledky, rozpis a tabulku
  displayResults()
  displayStandings()
  displaySchedule()

  // NOVÁ LOGIKA: Prochází VŠECHNY sekce s detaily zápasu a inicializuje jejich záložky.
  const detailContainers = document.querySelectorAll(".soccer-match-details")

  detailContainers.forEach((detailContainer) => {
    const tabContents = detailContainer.querySelectorAll(".match-content .tab-content")
    const tabs = detailContainer.querySelectorAll(".match-tabs .tab")

    tabs.forEach((tab) => {
      tab.addEventListener("click", (e) => {
        const tabName = e.target.getAttribute("data-tab")

        // Odstraní 'active' třídu ze všech záložek v AKTUÁLNÍM kontejneru
        tabs.forEach((t) => t.classList.remove("active"))
        e.target.classList.add("active")

        // Skryje VŠECHNY obsahy záložek v AKTUÁLNÍM kontejneru
        tabContents.forEach((content) => {
          content.classList.add("hidden")
          content.classList.remove("block")
        })

        // Zobrazí POUZE aktivní obsah záložky (pomocí unikátního ID)
        const activeContent = detailContainer.querySelector(`#${tabName}`)
        if (activeContent) {
          activeContent.classList.remove("hidden")
          activeContent.classList.add("block")
        }
      })
    })

    // Nastavení počiatočního stavu pro KAŽDÝ kontejner (první záložka aktivní)
    const firstTab = detailContainer.querySelector(".match-tabs .tab")

    // Získání data-tab atributu z první záložky (který odpovídá ID obsahu)
    const firstContentId = firstTab ? firstTab.getAttribute("data-tab") : null
    const firstContent = firstContentId ? detailContainer.querySelector(`#${firstContentId}`) : null

    if (firstTab) {
      firstTab.classList.add("active")
    }
    if (firstContent) {
      firstContent.classList.remove("hidden")
      firstContent.classList.add("block")
    }
  })

  // Toggle statistics button
  const toggleStatsButton = document.getElementById("toggle-stats-button")
  if (toggleStatsButton) {
    toggleStatsButton.addEventListener("click", toggleStatistics)
  }
})
