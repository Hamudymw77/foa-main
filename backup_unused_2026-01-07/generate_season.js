const fs = require('fs');
const path = require('path');

// Configuration
const CURRENT_DATE = new Date('2026-01-03T12:00:00');
const SEASON_START = new Date('2025-08-16T15:00:00');

// Teams for 2025/26 (Using 2024/25 roster for simplicity as we can't predict promotion/relegation)
const teams = [
  { id: 't1', name: 'Arsenal', strength: 90, logo: 'https://resources.premierleague.com/premierleague/badges/t3.svg', stadium: 'Emirates Stadium' },
  { id: 't2', name: 'Aston Villa', strength: 82, logo: 'https://resources.premierleague.com/premierleague/badges/t7.svg', stadium: 'Villa Park' },
  { id: 't3', name: 'Bournemouth', strength: 75, logo: 'https://resources.premierleague.com/premierleague/badges/t91.svg', stadium: 'Vitality Stadium' },
  { id: 't4', name: 'Brentford', strength: 74, logo: 'https://resources.premierleague.com/premierleague/badges/t94.svg', stadium: 'Gtech Community Stadium' },
  { id: 't5', name: 'Brighton', strength: 78, logo: 'https://resources.premierleague.com/premierleague/badges/t36.svg', stadium: 'Amex Stadium' },
  { id: 't6', name: 'Chelsea', strength: 85, logo: 'https://resources.premierleague.com/premierleague/badges/t8.svg', stadium: 'Stamford Bridge' },
  { id: 't7', name: 'Crystal Palace', strength: 76, logo: 'https://resources.premierleague.com/premierleague/badges/t31.svg', stadium: 'Selhurst Park' },
  { id: 't8', name: 'Everton', strength: 73, logo: 'https://resources.premierleague.com/premierleague/badges/t11.svg', stadium: 'Goodison Park' },
  { id: 't9', name: 'Fulham', strength: 75, logo: 'https://resources.premierleague.com/premierleague/badges/t54.svg', stadium: 'Craven Cottage' },
  { id: 't10', name: 'Ipswich', strength: 70, logo: 'https://resources.premierleague.com/premierleague/badges/t40.svg', stadium: 'Portman Road' },
  { id: 't11', name: 'Leicester', strength: 72, logo: 'https://resources.premierleague.com/premierleague/badges/t13.svg', stadium: 'King Power Stadium' },
  { id: 't12', name: 'Liverpool', strength: 92, logo: 'https://resources.premierleague.com/premierleague/badges/t14.svg', stadium: 'Anfield' },
  { id: 't13', name: 'Man City', strength: 95, logo: 'https://resources.premierleague.com/premierleague/badges/t43.svg', stadium: 'Etihad Stadium' },
  { id: 't14', name: 'Man Utd', strength: 84, logo: 'https://resources.premierleague.com/premierleague/badges/t1.svg', stadium: 'Old Trafford' },
  { id: 't15', name: 'Newcastle', strength: 83, logo: 'https://resources.premierleague.com/premierleague/badges/t4.svg', stadium: 'St. James\' Park' },
  { id: 't16', name: 'Nott\'m Forest', strength: 74, logo: 'https://resources.premierleague.com/premierleague/badges/t17.svg', stadium: 'City Ground' },
  { id: 't17', name: 'Southampton', strength: 71, logo: 'https://resources.premierleague.com/premierleague/badges/t20.svg', stadium: 'St Mary\'s Stadium' },
  { id: 't18', name: 'Tottenham', strength: 86, logo: 'https://resources.premierleague.com/premierleague/badges/t6.svg', stadium: 'Tottenham Hotspur Stadium' },
  { id: 't19', name: 'West Ham', strength: 77, logo: 'https://resources.premierleague.com/premierleague/badges/t21.svg', stadium: 'London Stadium' },
  { id: 't20', name: 'Wolves', strength: 74, logo: 'https://resources.premierleague.com/premierleague/badges/t39.svg', stadium: 'Molineux Stadium' }
];

// Helper to generate scores based on strength
function generateScore(home, away) {
  const homeAdvantage = 10;
  const diff = (home.strength + homeAdvantage) - away.strength;
  
  // Base lambda for Poisson distribution
  let homeLambda = 1.5 + (diff / 20);
  let awayLambda = 1.0 - (diff / 20);
  
  if (homeLambda < 0.2) homeLambda = 0.2;
  if (awayLambda < 0.2) awayLambda = 0.2;
  
  const poisson = (lambda) => {
    let L = Math.exp(-lambda);
    let k = 0;
    let p = 1;
    do {
      k++;
      p *= Math.random();
    } while (p > L);
    return k - 1;
  };
  
  return {
    home: poisson(homeLambda),
    away: poisson(awayLambda)
  };
}

// Generate round robin fixtures
function generateFixtures(teams) {
  const fixtures = [];
  const numberOfRounds = (teams.length - 1) * 2;
  const matchesPerRound = teams.length / 2;
  
  let roundTeams = [...teams];
  
  // Round robin algorithm
  for (let round = 0; round < numberOfRounds; round++) {
    const roundFixtures = [];
    
    for (let i = 0; i < matchesPerRound; i++) {
      const home = roundTeams[i];
      const away = roundTeams[teams.length - 1 - i];
      
      // Swap home/away for second half of season
      if (round >= numberOfRounds / 2) {
        roundFixtures.push({ home: away, away: home, round: round + 1 });
      } else {
        roundFixtures.push({ home, away, round: round + 1 });
      }
    }
    
    fixtures.push(roundFixtures);
    
    // Rotate teams array (keep first fixed)
    roundTeams = [roundTeams[0], ...roundTeams.slice(2), roundTeams[1]]; // Simple rotation often used
    // Actually standard circle method: fix index 0, rotate 1..N-1
    // Let's use a simpler verified rotation for even N
    // This is just a simulation, exact pairings don't need to be perfect PL schedule
    
    // Re-do rotation correctly
    const last = roundTeams.pop();
    roundTeams.splice(1, 0, last);
  }
  
  return fixtures;
}

// Generate Schedule
const rounds = [];
const teamIds = teams.map(t => t.id);
const totalRounds = 38;

// Create a schedule
// We will simply pair teams randomly for each round ensuring no duplicates per round
// A full league schedule generator is complex, so we will use a simplified randomized approach
// that ensures everyone plays everyone twice (home and away).

let allMatches = [];

// Generate all home-away pairs
for (let i = 0; i < teams.length; i++) {
  for (let j = 0; j < teams.length; j++) {
    if (i !== j) {
      allMatches.push({
        home: teams[i],
        away: teams[j],
        id: `match-${teams[i].id}-${teams[j].id}`
      });
    }
  }
}

// Shuffle matches
allMatches.sort(() => Math.random() - 0.5);

// Distribute into 38 rounds (10 matches per round)
const schedule = [];
const matchesPerRound = 10;

// This is a naive distribution which might fail to fit perfectly, 
// but for a mock data generator it's acceptable if we just fill rounds.
// Better approach: use the circle method for valid round-robin.
const numTeams = teams.length;
const roundFixtures = [];

// Circle method implementation
let circle = [...teams]; // Copy of teams
// Remove one team to handle rotation (if odd, but here even 20)
// For even N, fix one team and rotate the rest
const fixedTeam = circle.shift();

for (let r = 0; r < numTeams - 1; r++) {
  const round = [];
  // Fixed team plays against the last team in the rotating circle
  round.push({ home: fixedTeam, away: circle[circle.length - 1], round: r + 1 });
  
  // Others pair up
  for (let i = 0; i < (numTeams - 2) / 2; i++) {
    round.push({ home: circle[i], away: circle[circle.length - 2 - i], round: r + 1 });
  }
  
  roundFixtures.push(round);
  
  // Rotate circle: take last element and move to front
  circle.unshift(circle.pop());
}

// Second half of season (reverse fixtures)
const secondHalf = [];
for (let r = 0; r < numTeams - 1; r++) {
  const round = roundFixtures[r].map(m => ({ home: m.away, away: m.home, round: r + numTeams }));
  secondHalf.push(round);
}

const fullSeason = [...roundFixtures, ...secondHalf];

// Flatten and assign dates
let finalList = [];
let startDate = new Date(SEASON_START);

fullSeason.forEach((roundMatches, index) => {
  const roundNum = index + 1;
  // Calculate round date (approx 1 week intervals)
  // Add some randomness to time (Sat 15:00, Sun 14:00, etc)
  const roundDate = new Date(startDate);
  roundDate.setDate(startDate.getDate() + (index * 7));
  
  roundMatches.forEach(m => {
    const matchDate = new Date(roundDate);
    // Randomize day (Fri-Mon)
    const offset = Math.floor(Math.random() * 4) - 1; // -1 to 2
    matchDate.setDate(matchDate.getDate() + offset);
    
    // Set time
    const hours = [12, 15, 17, 20];
    matchDate.setHours(hours[Math.floor(Math.random() * hours.length)], [0, 30][Math.floor(Math.random() * 2)], 0);
    
    // Check if match is finished
    const isFinished = matchDate < CURRENT_DATE;
    
    let matchData = {
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
      const result = generateScore(m.home, m.away);
      matchData.homeScore = result.home;
      matchData.awayScore = result.away;
      
      // Generate some basic stats
      matchData.stats = {
        possession: [50 + Math.floor(Math.random() * 20) - 10, 50 - (Math.floor(Math.random() * 20) - 10)],
        shots: [result.home + Math.floor(Math.random() * 10), result.away + Math.floor(Math.random() * 10)],
        shotsOnTarget: [result.home + Math.floor(Math.random() * 3), result.away + Math.floor(Math.random() * 3)],
        corners: [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)],
        fouls: [Math.floor(Math.random() * 15), Math.floor(Math.random() * 15)],
        yellowCards: [Math.floor(Math.random() * 4), Math.floor(Math.random() * 4)],
        redCards: [0, 0]
      };
      
      // Generate goals
      matchData.goals = [];
      for (let g = 0; g < result.home; g++) matchData.goals.push({ minute: Math.floor(Math.random() * 90) + 1, team: 'home', scorer: 'Player Home', score: '1-0' });
      for (let g = 0; g < result.away; g++) matchData.goals.push({ minute: Math.floor(Math.random() * 90) + 1, team: 'away', scorer: 'Player Away', score: '0-1' });
      matchData.goals.sort((a, b) => a.minute - b.minute);
      
      // Detailed stats
      matchData.detailedStats = [
         { label: "Držení míče", home: matchData.stats.possession[0], away: matchData.stats.possession[1], homeDisplay: matchData.stats.possession[0] + "%", awayDisplay: matchData.stats.possession[1] + "%", color: "bg-blue-500", raw: false },
         { label: "Střely", home: matchData.stats.shots[0], away: matchData.stats.shots[1], homeDisplay: matchData.stats.shots[0].toString(), awayDisplay: matchData.stats.shots[1].toString(), color: "bg-green-500", raw: true, rawHome: matchData.stats.shots[0].toString(), rawAway: matchData.stats.shots[1].toString() }
      ];
      
    } else {
        // Upcoming
        matchData.homeFormation = "4-3-3";
        matchData.awayFormation = "4-4-2";
        matchData.predictedHomePlayers = { gk: ["GK Home"], def: ["Def 1", "Def 2", "Def 3", "Def 4"], mid: ["Mid 1", "Mid 2", "Mid 3"], fwd: ["Fwd 1", "Fwd 2", "Fwd 3"] };
        matchData.predictedAwayPlayers = { gk: ["GK Away"], def: ["Def A1", "Def A2", "Def A3", "Def A4"], mid: ["Mid A1", "Mid A2", "Mid A3", "Mid A4"], fwd: ["Fwd A1", "Fwd A2"] };
    }
    
    finalList.push(matchData);
  });
});

// Sort by date
finalList.sort((a, b) => a.timestamp - b.timestamp);

// Calculate Standings
const standings = {};
teams.forEach(t => {
  standings[t.name] = {
    pos: 0,
    team: t.name,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    gf: 0,
    ga: 0,
    gd: 0,
    points: 0,
    form: [],
    logo: t.logo
  };
});

finalList.filter(m => m.status === 'finished').forEach(m => {
  const home = standings[m.homeTeam];
  const away = standings[m.awayTeam];
  
  home.played++;
  away.played++;
  
  home.gf += m.homeScore;
  home.ga += m.awayScore;
  home.gd = home.gf - home.ga;
  
  away.gf += m.awayScore;
  away.ga += m.homeScore;
  away.gd = away.gf - away.ga;
  
  if (m.homeScore > m.awayScore) {
    home.won++;
    home.points += 3;
    home.form.push('W');
    away.lost++;
    away.form.push('L');
  } else if (m.homeScore < m.awayScore) {
    away.won++;
    away.points += 3;
    away.form.push('W');
    home.lost++;
    home.form.push('L');
  } else {
    home.drawn++;
    home.points += 1;
    home.form.push('D');
    away.drawn++;
    away.points += 1;
    away.form.push('D');
  }
});

// Convert standings to array and sort
const standingsArray = Object.values(standings).sort((a, b) => {
  if (b.points !== a.points) return b.points - a.points;
  if (b.gd !== a.gd) return b.gd - a.gd;
  return b.gf - a.gf;
});

// Add position and trim form
standingsArray.forEach((t, index) => {
  t.pos = index + 1;
  t.form = t.form.slice(-5).reverse(); // Last 5 matches
});

// Write files
const completed = finalList.filter(m => m.status === 'finished').reverse(); // Newest first
const upcoming = finalList.filter(m => m.status === 'upcoming');

fs.writeFileSync(path.join(__dirname, 'app', 'completed.json'), JSON.stringify(completed, null, 2));
fs.writeFileSync(path.join(__dirname, 'app', 'upcoming.json'), JSON.stringify(upcoming, null, 2));
fs.writeFileSync(path.join(__dirname, 'app', 'standings.json'), JSON.stringify(standingsArray, null, 2));

console.log(`Generated ${completed.length} completed matches`);
console.log(`Generated ${upcoming.length} upcoming matches`);
console.log(`Current Date used: ${CURRENT_DATE.toISOString()}`);
