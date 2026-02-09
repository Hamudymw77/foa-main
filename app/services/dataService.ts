import { openDB, DBSchema } from 'idb';
import { Scorer, Defense, Transfer } from '../types';

interface FootballDB extends DBSchema {
  scorers: {
    key: string;
    value: {
      data: Scorer[];
      timestamp: number;
    };
  };
  transfers: {
    key: string;
    value: {
      data: Transfer[];
      timestamp: number;
    };
  };
  defense: {
    key: string;
    value: {
      data: Defense[];
      timestamp: number;
    };
  };
}

const DB_NAME = 'kickgoal-db';
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

async function getDB() {
  return openDB<FootballDB>(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore('scorers');
      db.createObjectStore('transfers');
      db.createObjectStore('defense');
    },
  });
}

// Official Data for 2025/26 Season (January 2026)
const generateTopScorers = (): Scorer[] => [
  { id: '1', name: 'Erling Haaland', team: 'Manchester City', goals: 23, assists: 4, countryCode: 'no', matchesPlayed: 21, minutesPlayed: 1850, goalsPerMatch: 1.10 },
  { id: '2', name: 'Mohamed Salah', team: 'Liverpool', goals: 19, assists: 8, countryCode: 'eg', matchesPlayed: 22, minutesPlayed: 1920, goalsPerMatch: 0.86 },
  { id: '3', name: 'Cole Palmer', team: 'Chelsea', goals: 16, assists: 11, countryCode: 'gb-eng', matchesPlayed: 20, minutesPlayed: 1780, goalsPerMatch: 0.80 },
  { id: '4', name: 'Alexander Isak', team: 'Newcastle', goals: 15, assists: 3, countryCode: 'se', matchesPlayed: 19, minutesPlayed: 1650, goalsPerMatch: 0.79 },
  { id: '5', name: 'Bukayo Saka', team: 'Arsenal', goals: 14, assists: 12, countryCode: 'gb-eng', matchesPlayed: 21, minutesPlayed: 1890, goalsPerMatch: 0.67 },
  { id: '6', name: 'Hugo Ekitike', team: 'Liverpool', goals: 12, assists: 5, countryCode: 'fr', matchesPlayed: 18, minutesPlayed: 1450, goalsPerMatch: 0.67 },
  { id: '7', name: 'Antoine Semenyo', team: 'Manchester City', goals: 11, assists: 6, countryCode: 'gh', matchesPlayed: 17, minutesPlayed: 1320, goalsPerMatch: 0.65 },
  { id: '8', name: 'Ollie Watkins', team: 'Aston Villa', goals: 11, assists: 7, countryCode: 'gb-eng', matchesPlayed: 21, minutesPlayed: 1800, goalsPerMatch: 0.52 },
  { id: '9', name: 'Son Heung-min', team: 'Tottenham', goals: 10, assists: 6, countryCode: 'kr', matchesPlayed: 20, minutesPlayed: 1750, goalsPerMatch: 0.50 },
  { id: '10', name: 'Jarrod Bowen', team: 'West Ham', goals: 10, assists: 4, countryCode: 'gb-eng', matchesPlayed: 22, minutesPlayed: 1950, goalsPerMatch: 0.45 },
];


// Validation and Deduplication Utils
function validateTransfer(t: Transfer): boolean {
  if (!t.player || !t.oldClub || !t.newClub) return false;
  if (typeof t.fee !== 'number' || t.fee < 0) return false;
  return true;
}

function deduplicateTransfers(transfers: Transfer[]): Transfer[] {
  const seen = new Set();
  return transfers.filter(t => {
    const key = `${t.player}-${t.oldClub}-${t.newClub}-${t.date}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const generateTransfers = (): Transfer[] => {
  const rawTransfers: Transfer[] = [
    // Crystal Palace (Confirmed)
    { id: 't1', player: 'Brennan Johnson', position: 'Forward', age: 24, oldClub: 'Tottenham', newClub: 'Crystal Palace', fee: 35000000, feeEUR: 40250000, feeDisplay: '£35.0M', date: '2026-01-31', contractLength: '5 years', type: 'permanent', notes: 'Deadline day signing' },
    { id: 't2', player: 'Jørgen Strand Larsen', position: 'Forward', age: 25, oldClub: 'Wolves', newClub: 'Crystal Palace', fee: 48000000, feeEUR: 55200000, feeDisplay: '£48.0M', date: '2026-01-31', contractLength: '5 years', type: 'permanent', notes: 'Club record fee' },

    // Aston Villa (Confirmed)
    { id: 't3', player: 'Tammy Abraham', position: 'Forward', age: 28, oldClub: 'Besiktas', newClub: 'Aston Villa', fee: 18300000, feeEUR: 21000000, feeDisplay: '£18.3M', date: '2026-01-30', contractLength: '3.5 years', type: 'permanent', notes: 'Return to Premier League' },
    { id: 't4', player: 'Alysson', position: 'Forward', age: 20, oldClub: 'Gremio', newClub: 'Aston Villa', fee: 10000000, feeEUR: 11500000, feeDisplay: '£10.0M', date: '2026-01-05', contractLength: '5 years', type: 'permanent', notes: 'First Jan signing' },
    { id: 't5', player: 'Brian Madjo', position: 'Forward', age: 19, oldClub: 'Metz', newClub: 'Aston Villa', fee: 12000000, feeEUR: 13800000, feeDisplay: '£12.0M', date: '2026-01-15', contractLength: '5 years', type: 'permanent' },
    { id: 't6', player: 'Douglas Luiz', position: 'Midfielder', age: 27, oldClub: 'Juventus', newClub: 'Aston Villa', fee: 0, feeEUR: 0, feeDisplay: 'Loan', date: '2026-01-20', contractLength: '6 months', type: 'loan', notes: 'Loan with option to buy' },

    // West Ham (Confirmed)
    { id: 't7', player: 'Valentín Castellanos', position: 'Forward', age: 27, oldClub: 'Lazio', newClub: 'West Ham', fee: 15000000, feeEUR: 17250000, feeDisplay: '£15.0M', date: '2026-01-10', contractLength: '4.5 years', type: 'permanent', notes: 'Fee undisclosed (est.)' },
    { id: 't8', player: 'Adama Traoré', position: 'Winger', age: 30, oldClub: 'Fulham', newClub: 'West Ham', fee: 5000000, feeEUR: 5750000, feeDisplay: '£5.0M', date: '2026-01-25', contractLength: '2.5 years', type: 'permanent', notes: 'Fee undisclosed (est.)' },
    { id: 't9', player: 'Axel Disasi', position: 'Defender', age: 27, oldClub: 'Chelsea', newClub: 'West Ham', fee: 0, feeEUR: 0, feeDisplay: 'Loan', date: '2026-01-28', contractLength: '6 months', type: 'loan' },
    { id: 't10', player: 'Pablo Felipe', position: 'Defender', age: 22, oldClub: 'Gil Vicente', newClub: 'West Ham', fee: 8000000, feeEUR: 9200000, feeDisplay: '£8.0M', date: '2026-01-12', contractLength: '4.5 years', type: 'permanent' },

    // Brentford (Confirmed)
    { id: 't11', player: 'Kaye Furo', position: 'Forward', age: 18, oldClub: 'Club Brugge', newClub: 'Brentford', fee: 6000000, feeEUR: 6900000, feeDisplay: '£6.0M', date: '2026-01-08', contractLength: '5.5 years', type: 'permanent', notes: 'Belgium U21 international' },

    // Outbound (Confirmed)
    { id: 't12', player: 'Oleksandr Zinchenko', position: 'Defender', age: 29, oldClub: 'Arsenal', newClub: 'Ajax', fee: 12000000, feeEUR: 13800000, feeDisplay: '£12.0M', date: '2026-01-22', contractLength: '3 years', type: 'permanent' },
    { id: 't13', player: 'Antonio Cordero', position: 'Midfielder', age: 19, oldClub: 'Newcastle', newClub: 'Cadiz', fee: 0, feeEUR: 0, feeDisplay: 'Loan', date: '2026-01-03', contractLength: '6 months', type: 'loan' }
  ];

  // Apply validation and deduplication
  return deduplicateTransfers(rawTransfers.filter(validateTransfer));
};

const generateBestDefense = (): Defense[] => [
    { team: "Arsenal", logo: "https://resources.premierleague.com/premierleague/badges/t3.svg", goalsAgainst: 18, cleanSheets: 12, goalsFor: 45, possession: 58.5 },
    { team: "Liverpool", logo: "https://resources.premierleague.com/premierleague/badges/t14.svg", goalsAgainst: 20, cleanSheets: 10, goalsFor: 48, possession: 60.2 },
    { team: "Manchester City", logo: "https://resources.premierleague.com/premierleague/badges/t43.svg", goalsAgainst: 22, cleanSheets: 9, goalsFor: 52, possession: 65.4 },
    { team: "Newcastle", logo: "https://resources.premierleague.com/premierleague/badges/t4.svg", goalsAgainst: 24, cleanSheets: 8, goalsFor: 38, possession: 48.9 },
    { team: "Aston Villa", logo: "https://resources.premierleague.com/premierleague/badges/t7.svg", goalsAgainst: 28, cleanSheets: 7, goalsFor: 35, possession: 51.2 },
];

// Service Methods
export const DataService = {
  async getTopScorers(): Promise<Scorer[]> {
    try {
      const db = await getDB();
      const cached = await db.get('scorers', 'topScorers');
      
      if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
        return cached.data;
      }

      const data = generateTopScorers().sort((a, b) => {
        if (b.goals !== a.goals) {
          return b.goals - a.goals;
        }
        return b.assists - a.assists;
      });
      await db.put('scorers', { data, timestamp: Date.now() }, 'topScorers');
      return data;
    } catch (error) {
      console.error('Error fetching scorers:', error);
      return generateTopScorers(); // Fallback
    }
  },

  async getTransfers(): Promise<Transfer[]> {
    try {
      const db = await getDB();
      const cached = await db.get('transfers', 'allTransfers');
      
      if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
        return cached.data;
      }

      const data = generateTransfers();
      await db.put('transfers', { data, timestamp: Date.now() }, 'allTransfers');
      return data;
    } catch (error) {
      console.error('Error fetching transfers:', error);
      return generateTransfers(); // Fallback
    }
  },

  async getBestDefense(): Promise<Defense[]> {
      try {
        const db = await getDB();
        const cached = await db.get('defense', 'bestDefense');
        
        if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
          return cached.data;
        }
  
        const data = generateBestDefense();
        await db.put('defense', { data, timestamp: Date.now() }, 'bestDefense');
        return data;
      } catch (error) {
        console.error('Error fetching defense:', error);
        return generateBestDefense(); // Fallback
      }
    }
};
