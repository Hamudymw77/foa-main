const fs = require('fs');
const path = require('path');

// Configuration
const CURRENT_DATE = new Date('2026-01-03T12:00:00');
const SEASON_START = new Date('2025-08-15T15:00:00');

// Real Teams for 2025/26 (Based on search results: Leeds, Burnley, Sunderland promoted)
const teams = [
  { id: 't1', name: 'Arsenal', strength: 92, logo: 'https://resources.premierleague.com/premierleague/badges/t3.svg', stadium: 'Emirates Stadium' },
  { id: 't2', name: 'Aston Villa', strength: 84, logo: 'https://resources.premierleague.com/premierleague/badges/t7.svg', stadium: 'Villa Park' },
  { id: 't3', name: 'Bournemouth', strength: 76, logo: 'https://resources.premierleague.com/premierleague/badges/t91.svg', stadium: 'Vitality Stadium' },
  { id: 't4', name: 'Brentford', strength: 75, logo: 'https://resources.premierleague.com/premierleague/badges/t94.svg', stadium: 'Gtech Community Stadium' },
  { id: 't5', name: 'Brighton', strength: 79, logo: 'https://resources.premierleague.com/premierleague/badges/t36.svg', stadium: 'Amex Stadium' },
  { id: 't6', name: 'Burnley', strength: 73, logo: 'https://resources.premierleague.com/premierleague/badges/t90.svg', stadium: 'Turf Moor' }, // Promoted
  { id: 't7', name: 'Chelsea', strength: 86, logo: 'https://resources.premierleague.com/premierleague/badges/t8.svg', stadium: 'Stamford Bridge' },
  { id: 't8', name: 'Crystal Palace', strength: 77, logo: 'https://resources.premierleague.com/premierleague/badges/t31.svg', stadium: 'Selhurst Park' },
  { id: 't9', name: 'Everton', strength: 75, logo: 'https://resources.premierleague.com/premierleague/badges/t11.svg', stadium: 'Goodison Park' },
  { id: 't10', name: 'Fulham', strength: 76, logo: 'https://resources.premierleague.com/premierleague/badges/t54.svg', stadium: 'Craven Cottage' },
  { id: 't11', name: 'Leeds', strength: 74, logo: 'https://resources.premierleague.com/premierleague/badges/t2.svg', stadium: 'Elland Road' }, // Promoted
  { id: 't12', name: 'Liverpool', strength: 94, logo: 'https://resources.premierleague.com/premierleague/badges/t14.svg', stadium: 'Anfield' }, // Defending Champs
  { id: 't13', name: 'Man City', strength: 93, logo: 'https://resources.premierleague.com/premierleague/badges/t43.svg', stadium: 'Etihad Stadium' },
  { id: 't14', name: 'Man Utd', strength: 85, logo: 'https://resources.premierleague.com/premierleague/badges/t1.svg', stadium: 'Old Trafford' },
  { id: 't15', name: 'Newcastle', strength: 83, logo: 'https://resources.premierleague.com/premierleague/badges/t4.svg', stadium: 'St. James\' Park' },
  { id: 't16', name: 'Nott\'m Forest', strength: 75, logo: 'https://resources.premierleague.com/premierleague/badges/t17.svg', stadium: 'City Ground' },
  { id: 't17', name: 'Sunderland', strength: 72, logo: 'https://resources.premierleague.com/premierleague/badges/t56.svg', stadium: 'Stadium of Light' }, // Promoted
  { id: 't18', name: 'Tottenham', strength: 87, logo: 'https://resources.premierleague.com/premierleague/badges/t6.svg', stadium: 'Tottenham Hotspur Stadium' },
  { id: 't19', name: 'West Ham', strength: 78, logo: 'https://resources.premierleague.com/premierleague/badges/t21.svg', stadium: 'London Stadium' },
  { id: 't20', name: 'Wolves', strength: 71, logo: 'https://resources.premierleague.com/premierleague/badges/t39.svg', stadium: 'Molineux Stadium' } // Bottom of league
];

// Key Players for Scorers/Lineups
const teamPlayers = {
  'Arsenal': ['Saka', 'Odegaard', 'Martinelli', 'Rice', 'Havertz', 'Saliba', 'Gabriel', 'White', 'Raya', 'Jesus', 'Trossard'],
  'Aston Villa': ['Watkins', 'Bailey', 'McGinn', 'Tielemans', 'Luiz', 'Martinez', 'Konsa', 'Torres', 'Cash', 'Digne', 'Diaby'],
  'Bournemouth': ['Solanke', 'Semenyo', 'Kluivert', 'Cook', 'Christie', 'Senesi', 'Zabarnyi', 'Kerkez', 'Neto', 'Billing', 'Tavernier'],
  'Brentford': ['Toney', 'Mbeumo', 'Wissa', 'Jensen', 'Norgaard', 'Pinnock', 'Mee', 'Henry', 'Flekken', 'Janelt', 'Schade'],
  'Brighton': ['Pedro', 'Mitoma', 'Ferguson', 'Gross', 'Dunk', 'Van Hecke', 'Estupinan', 'Verbruggen', 'Gilmour', 'Enciso', 'March'],
  'Burnley': ['Foster', 'Amdouni', 'Odobert', 'Brownhill', 'Berge', 'O\'Shea', 'Ekdal', 'Trafford', 'Vitinho', 'Cullen', 'Ramsey'],
  'Chelsea': ['Palmer', 'Jackson', 'Nkunku', 'Fernandez', 'Caicedo', 'James', 'Chilwell', 'Colwill', 'Sanchez', 'Sterling', 'Mudryk'],
  'Crystal Palace': ['Eze', 'Olise', 'Mateta', 'Wharton', 'Andersen', 'Guehi', 'Mitchell', 'Munoz', 'Henderson', 'Doucoure', 'Lerma'],
  'Everton': ['Calvert-Lewin', 'Doucoure', 'McNeil', 'Branthwaite', 'Tarkowski', 'Pickford', 'Mykolenko', 'Garner', 'Onana', 'Harrison', 'Beto'],
  'Fulham': ['Muniz', 'Iwobi', 'Pereira', 'Palhinha', 'Robinson', 'Bassey', 'Castagne', 'Leno', 'Wilson', 'Adama', 'Lukic'],
  'Leeds': ['Gnonto', 'James', 'Piroe', 'Ampadu', 'Gray', 'Rodon', 'Struijk', 'Meslier', 'Firpo', 'Kamara', 'Summerville'],
  'Liverpool': ['Salah', 'Nunez', 'Diaz', 'Mac Allister', 'Szoboszlai', 'Van Dijk', 'Trent', 'Alisson', 'Robertson', 'Gakpo', 'Jota'],
  'Man City': ['Haaland', 'Foden', 'De Bruyne', 'Rodri', 'Silva', 'Dias', 'Walker', 'Ederson', 'Gvardiol', 'Doku', 'Alvarez'],
  'Man Utd': ['Fernandes', 'Hojlund', 'Rashford', 'Garnacho', 'Mainoo', 'Martinez', 'Dalot', 'Onana', 'Shaw', 'Mount', 'Casemiro'],
  'Newcastle': ['Isak', 'Gordon', 'Guimaraes', 'Joelinton', 'Botman', 'Schar', 'Trippier', 'Pope', 'Barnes', 'Tonali', 'Livramento'],
  'Nott\'m Forest': ['Gibbs-White', 'Awoniyi', 'Hudson-Odoi', 'Elanga', 'Murillo', 'Danilo', 'Sels', 'Yates', 'Williams', 'Aina', 'Dominguez'],
  'Sunderland': ['Clarke', 'Bellingham', 'Neil', 'Roberts', 'Hume', 'Ballard', 'O\'Nien', 'Patterson', 'Ekwah', 'Ba', 'Rusyn'],
  'Tottenham': ['Son', 'Maddison', 'Richarlison', 'Porro', 'Udogie', 'Romero', 'Van de Ven', 'Vicario', 'Sarr', 'Bissouma', 'Johnson'],
  'West Ham': ['Bowen', 'Kudus', 'Paqueta', 'Antonio', 'Ward-Prowse', 'Soucek', 'Emerson', 'Areola', 'Zouma', 'Mavropanos', 'Alvarez'],
  'Wolves': ['Cunha', 'Neto', 'Hwang', 'Lemina', 'Gomes', 'Kilman', 'Dawson', 'Sa', 'Semedo', 'Ait-Nouri', 'Sarabia']
};

// Real Results found in search (MW1, MW2, MW19)
const realResults = {
  // MW1
  'Liverpool-Bournemouth': { home: 4, away: 2, date: '2025-08-15T20:00:00' },
  'Aston Villa-Newcastle': { home: 0, away: 0, date: '2025-08-16T12:30:00' },
  'Brighton-Fulham': { home: 1, away: 1, date: '2025-08-16T15:00:00' },
  'Sunderland-West Ham': { home: 3, away: 0, date: '2025-08-16T15:00:00' },
  'Tottenham-Burnley': { home: 3, away: 0, date: '2025-08-16T15:00:00' },
  'Wolves-Man City': { home: 0, away: 4, date: '2025-08-16T17:30:00' },
  'Chelsea-Crystal Palace': { home: 0, away: 0, date: '2025-08-17T14:00:00' },
  'Nott\'m Forest-Brentford': { home: 3, away: 1, date: '2025-08-17T14:00:00' },
  'Man Utd-Arsenal': { home: 0, away: 1, date: '2025-08-17T16:30:00' },
  'Leeds-Everton': { home: 1, away: 0, date: '2025-08-18T20:00:00' },
  
  // MW2
  'West Ham-Chelsea': { home: 1, away: 5, date: '2025-08-22T20:00:00' },
  'Man City-Tottenham': { home: 0, away: 2, date: '2025-08-23T12:30:00' },
  'Bournemouth-Wolves': { home: 1, away: 0, date: '2025-08-23T15:00:00' },
  'Brentford-Aston Villa': { home: 1, away: 0, date: '2025-08-23T15:00:00' },
  'Burnley-Sunderland': { home: 2, away: 0, date: '2025-08-23T15:00:00' },
  'Arsenal-Leeds': { home: 5, away: 0, date: '2025-08-23T17:30:00' },
  'Crystal Palace-Nott\'m Forest': { home: 1, away: 1, date: '2025-08-24T14:00:00' },
  'Everton-Brighton': { home: 2, away: 0, date: '2025-08-24T14:00:00' },
  'Fulham-Man Utd': { home: 1, away: 1, date: '2025-08-24T16:30:00' },
  'Newcastle-Liverpool': { home: 2, away: 3, date: '2025-08-25T20:00:00' },

  // MW19 (Recent)
  'Burnley-Newcastle': { home: 1, away: 3, date: '2025-12-30T19:30:00' },
  'Chelsea-Bournemouth': { home: 2, away: 2, date: '2025-12-30T19:30:00' },
  'Nott\'m Forest-Everton': { home: 0, away: 2, date: '2025-12-30T19:30:00' },
  'West Ham-Brighton': { home: 2, away: 2, date: '2025-12-30T19:30:00' },
  'Arsenal-Aston Villa': { home: 4, away: 1, date: '2025-12-30T20:15:00' },
  'Man Utd-Wolves': { home: 1, away: 1, date: '2025-12-30T20:15:00' },
  'Crystal Palace-Fulham': { home: 1, away: 1, date: '2026-01-01T17:30:00' },
  'Liverpool-Leeds': { home: 0, away: 0, date: '2026-01-01T17:30:00' },
  'Brentford-Tottenham': { home: 0, away: 0, date: '2026-01-01T20:00:00' },
  'Sunderland-Man City': { home: 0, away: 0, date: '2026-01-01T20:00:00' },
};

// Upcoming MW20
const upcomingFixtures = [
  { home: 'Aston Villa', away: 'Nott\'m Forest', date: '2026-01-03T12:30:00' },
  { home: 'Brighton', away: 'Burnley', date: '2026-01-03T15:00:00' },
  { home: 'Wolves', away: 'West Ham', date: '2026-01-03T15:00:00' },
  { home: 'Bournemouth', away: 'Arsenal', date: '2026-01-03T17:30:00' },
  { home: 'Leeds', away: 'Man Utd', date: '2026-01-04T12:30:00' },
  { home: 'Everton', away: 'Brentford', date: '2026-01-04T15:00:00' },
  { home: 'Fulham', away: 'Liverpool', date: '2026-01-04T15:00:00' },
  { home: 'Newcastle', away: 'Crystal Palace', date: '2026-01-04T15:00:00' },
  { home: 'Tottenham', away: 'Sunderland', date: '2026-01-04T15:00:00' },
  { home: 'Man City', away: 'Chelsea', date: '2026-01-04T17:30:00' }
];

function getPlayer(teamName) {
  const players = teamPlayers[teamName] || ['Player 1', 'Player 2', 'Player 3'];
  return players[Math.floor(Math.random() * players.length)];
}

function generateScore(home, away) {
  const diff = (home.strength + 10) - away.strength;
  let homeLambda = 1.5 + (diff / 20);
  let awayLambda = 1.0 - (diff / 20);
  if (homeLambda < 0.2) homeLambda = 0.2;
  if (awayLambda < 0.2) awayLambda = 0.2;
  
  const poisson = (lambda) => {
    let L = Math.exp(-lambda);
    let k = 0;
    let p = 1;
    do { k++; p *= Math.random(); } while (p > L);
    return k - 1;
  };
  return { home: poisson(homeLambda), away: poisson(awayLambda) };
}

// Generate Schedule
// We will generate a full 38-round schedule
// Then overwrite with real results
// Then split

let allMatches = [];

// Helper to generate full round robin
function generateSchedule() {
  const schedule = [];
  const teamList = [...teams];
  const numTeams = teamList.length;
  const numRounds = (numTeams - 1) * 2;
  
  // Circle method
  let circle = [...teamList];
  const fixed = circle.shift();
  
  for (let r = 0; r < numTeams - 1; r++) {
    const roundMatches = [];
    roundMatches.push({ home: fixed, away: circle[circle.length - 1] });
    for (let i = 0; i < (numTeams - 2) / 2; i++) {
      roundMatches.push({ home: circle[i], away: circle[circle.length - 2 - i] });
    }
    schedule.push(roundMatches);
    circle.unshift(circle.pop());
  }
  
  // Second half (reverse)
  const secondHalf = [];
  for (let r = 0; r < numTeams - 1; r++) {
    const roundMatches = schedule[r].map(m => ({ home: m.away, away: m.home }));
    secondHalf.push(roundMatches);
  }
  
  return [...schedule, ...secondHalf];
}

const rawSchedule = generateSchedule();

// Process matches
const finalList = [];
let roundDate = new Date(SEASON_START);

rawSchedule.forEach((round, rIndex) => {
  const roundNum = rIndex + 1;
  
  // Increment date by week, but skip if we have specific dates in realResults
  if (rIndex > 0) roundDate.setDate(roundDate.getDate() + 7);
  
  round.forEach(m => {
    const key = `${m.home.name}-${m.away.name}`;
    const real = realResults[key];
    
    // Check if this match is in upcomingFixtures
    const upcomingReal = upcomingFixtures.find(u => u.home === m.home.name && u.away === m.away.name);
    
    let matchDate = new Date(roundDate);
    // Randomize time slightly
    matchDate.setHours(15, 0, 0);
    
    let homeScore, awayScore;
    let isFinished = true;
    
    if (real) {
      matchDate = new Date(real.date);
      homeScore = real.home;
      awayScore = real.away;
    } else if (upcomingReal) {
      matchDate = new Date(upcomingReal.date);
      isFinished = false;
    } else {
      // Generated
      const res = generateScore(m.home, m.away);
      homeScore = res.home;
      awayScore = res.away;
      
      // If date is after current, it's upcoming
      if (matchDate > CURRENT_DATE) isFinished = false;
    }
    
    // Override isFinished if we explicitly know it
    if (real) isFinished = true;
    if (upcomingReal) isFinished = false;
    
    // Ensure "real" matches are prioritized in terms of ID/display
    
    const matchData = {
      id: `m-${roundNum}-${m.home.id}-${m.away.id}`,
      homeTeam: m.home.name,
      awayTeam: m.away.name,
      homeLogo: m.home.logo,
      awayLogo: m.away.logo,
      stadium: m.home.stadium,
      date: matchDate.toLocaleString('en-GB', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
      timestamp: matchDate.getTime(),
      status: isFinished ? 'finished' : 'upcoming'
    };
    
    if (isFinished) {
      matchData.homeScore = homeScore;
      matchData.awayScore = awayScore;
      
      // Stats
      matchData.stats = {
        possession: [50, 50],
        shots: [10, 10],
        shotsOnTarget: [5, 5],
        corners: [5, 5],
        fouls: [10, 10],
        yellowCards: [Math.floor(Math.random() * 3), Math.floor(Math.random() * 3)],
        redCards: [0, 0]
      };
      
      // Goals
      matchData.goals = [];
      for (let g = 0; g < homeScore; g++) {
        matchData.goals.push({ minute: Math.floor(Math.random() * 90) + 1, team: 'home', scorer: getPlayer(m.home.name), score: '1-0' });
      }
      for (let g = 0; g < awayScore; g++) {
        matchData.goals.push({ minute: Math.floor(Math.random() * 90) + 1, team: 'away', scorer: getPlayer(m.away.name), score: '0-1' });
      }
      matchData.goals.sort((a, b) => a.minute - b.minute);
      
      // Events (Yellow cards, subs)
      matchData.events = [];
      matchData.goals.forEach(g => matchData.events.push({ type: 'goal', ...g }));
      
      // Add some cards
      for (let c = 0; c < matchData.stats.yellowCards[0]; c++) {
        matchData.events.push({ type: 'yellow_card', minute: Math.floor(Math.random() * 90), team: 'home', player: getPlayer(m.home.name) });
      }
      for (let c = 0; c < matchData.stats.yellowCards[1]; c++) {
        matchData.events.push({ type: 'yellow_card', minute: Math.floor(Math.random() * 90), team: 'away', player: getPlayer(m.away.name) });
      }
      matchData.events.sort((a, b) => a.minute - b.minute);
      
      // Detailed Stats
      matchData.detailedStats = [
         { label: "Držení míče", home: 50, away: 50, homeDisplay: "50%", awayDisplay: "50%", color: "bg-blue-500", raw: false },
         { label: "Střely", home: 10, away: 10, homeDisplay: "10", awayDisplay: "10", color: "bg-green-500", raw: true }
      ];

      // Lineups
      matchData.lineups = {
        home: {
          formation: "4-3-3",
          startingXI: teamPlayers[m.home.name]?.slice(0, 11).map(name => ({ name, number: Math.floor(Math.random()*99)+1 })) || [],
          substitutes: teamPlayers[m.home.name]?.slice(11).map(name => ({ name, number: Math.floor(Math.random()*99)+1 })) || []
        },
        away: {
          formation: "4-4-2",
          startingXI: teamPlayers[m.away.name]?.slice(0, 11).map(name => ({ name, number: Math.floor(Math.random()*99)+1 })) || [],
          substitutes: teamPlayers[m.away.name]?.slice(11).map(name => ({ name, number: Math.floor(Math.random()*99)+1 })) || []
        }
      };
      
    } else {
      // Upcoming
      matchData.predictedHomePlayers = { gk: [getPlayer(m.home.name)], def: [getPlayer(m.home.name), getPlayer(m.home.name), getPlayer(m.home.name), getPlayer(m.home.name)], mid: [getPlayer(m.home.name), getPlayer(m.home.name), getPlayer(m.home.name)], fwd: [getPlayer(m.home.name), getPlayer(m.home.name), getPlayer(m.home.name)] };
      matchData.predictedAwayPlayers = { gk: [getPlayer(m.away.name)], def: [getPlayer(m.away.name), getPlayer(m.away.name), getPlayer(m.away.name), getPlayer(m.away.name)], mid: [getPlayer(m.away.name), getPlayer(m.away.name), getPlayer(m.away.name)], fwd: [getPlayer(m.away.name), getPlayer(m.away.name), getPlayer(m.away.name)] };
    }
    
    finalList.push(matchData);
  });
});

// Sort
finalList.sort((a, b) => a.timestamp - b.timestamp);

// Calculate Standings
const standings = {};
teams.forEach(t => {
  standings[t.name] = {
    pos: 0, team: t.name, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0, form: [], logo: t.logo
  };
});

finalList.filter(m => m.status === 'finished').forEach(m => {
  const home = standings[m.homeTeam];
  const away = standings[m.awayTeam];
  if (!home || !away) return;
  
  home.played++; away.played++;
  home.gf += m.homeScore; home.ga += m.awayScore; home.gd = home.gf - home.ga;
  away.gf += m.awayScore; away.ga += m.homeScore; away.gd = away.gf - away.ga;
  
  if (m.homeScore > m.awayScore) {
    home.won++; home.points += 3; home.form.push('W');
    away.lost++; away.form.push('L');
  } else if (m.homeScore < m.awayScore) {
    away.won++; away.points += 3; away.form.push('W');
    home.lost++; home.form.push('L');
  } else {
    home.drawn++; home.points += 1; home.form.push('D');
    away.drawn++; away.points += 1; away.form.push('D');
  }
});

const standingsArray = Object.values(standings).sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
standingsArray.forEach((t, i) => { t.pos = i + 1; t.form = t.form.slice(-5).reverse(); });

// Write
const completed = finalList.filter(m => m.status === 'finished').reverse();
const upcoming = finalList.filter(m => m.status === 'upcoming');

fs.writeFileSync(path.join(__dirname, 'app', 'completed.json'), JSON.stringify(completed, null, 2));
fs.writeFileSync(path.join(__dirname, 'app', 'upcoming.json'), JSON.stringify(upcoming, null, 2));
fs.writeFileSync(path.join(__dirname, 'app', 'standings.json'), JSON.stringify(standingsArray, null, 2));

console.log(`Generated ${completed.length} completed matches`);
console.log(`Generated ${upcoming.length} upcoming matches`);
