import { openDB, DBSchema } from 'idb';
import { Scorer, Defense, Transfer, PlayerStat } from '../types';

interface FootballDB extends DBSchema {
  scorers: {
    key: string;
    value: {
      data: any[];
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
  { id: '1', name: 'E. Haaland', team: 'Manchester City', goals: 22, assists: 7, countryCode: 'no', matchesPlayed: 27, minutesPlayed: 2350, goalsPerMatch: 0.81 },
  { id: '2', name: 'Igor Thiago', team: 'Brentford', goals: 17, assists: 1, countryCode: 'br', matchesPlayed: 27, minutesPlayed: 2100, goalsPerMatch: 0.63 },
  { id: '3', name: 'A. Semenyo', team: 'Manchester City', goals: 13, assists: 4, countryCode: 'gh', matchesPlayed: 26, minutesPlayed: 1980, goalsPerMatch: 0.50 },
  { id: '4', name: 'João Pedro', team: 'Chelsea', goals: 11, assists: 4, countryCode: 'br', matchesPlayed: 27, minutesPlayed: 2200, goalsPerMatch: 0.41 },
  { id: '5', name: 'H. Ekitiké', team: 'Liverpool', goals: 10, assists: 2, countryCode: 'fr', matchesPlayed: 24, minutesPlayed: 1850, goalsPerMatch: 0.42 },
  { id: '6', name: 'D. Calvert-Lewin', team: 'Leeds', goals: 10, assists: 1, countryCode: 'gb-eng', matchesPlayed: 24, minutesPlayed: 1920, goalsPerMatch: 0.42 },
  { id: '7', name: 'V. Gyökeres', team: 'Arsenal', goals: 10, assists: 0, countryCode: 'se', matchesPlayed: 26, minutesPlayed: 2150, goalsPerMatch: 0.38 },
  { id: '8', name: 'Bruno Guimarães', team: 'Newcastle', goals: 9, assists: 4, countryCode: 'br', matchesPlayed: 23, minutesPlayed: 2000, goalsPerMatch: 0.39 },
  { id: '9', name: 'B. Mbeumo', team: 'Man Utd', goals: 9, assists: 3, countryCode: 'cm', matchesPlayed: 22, minutesPlayed: 1800, goalsPerMatch: 0.41 },
];


// Validation and Deduplication Utils
function validateTransfer(t: Transfer): boolean {
  if (!t.player || !t.oldClub || !t.newClub) return false;
  // If fee is optional string, we can't strict check number < 0 easily without parsing
  // But type check is handled by TS now.
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
    { id: 't1', player: 'Brennan Johnson', position: 'Forward', age: 24, oldClub: 'Tottenham', newClub: 'Crystal Palace', fee: '35000000', feeEUR: '40250000', feeDisplay: '£35.0M', date: '2026-01-31', contractLength: '5 years', type: 'permanent', notes: 'Deadline day signing' },
    { id: 't2', player: 'Jørgen Strand Larsen', position: 'Forward', age: 25, oldClub: 'Wolves', newClub: 'Crystal Palace', fee: '48000000', feeEUR: '55200000', feeDisplay: '£48.0M', date: '2026-01-31', contractLength: '5 years', type: 'permanent', notes: 'Club record fee' },

    // Aston Villa (Confirmed)
    { id: 't3', player: 'Tammy Abraham', position: 'Forward', age: 28, oldClub: 'Besiktas', newClub: 'Aston Villa', fee: '18300000', feeEUR: '21000000', feeDisplay: '£18.3M', date: '2026-01-30', contractLength: '3.5 years', type: 'permanent', notes: 'Return to Premier League' },
    { id: 't4', player: 'Alysson', position: 'Forward', age: 20, oldClub: 'Gremio', newClub: 'Aston Villa', fee: '10000000', feeEUR: '11500000', feeDisplay: '£10.0M', date: '2026-01-05', contractLength: '5 years', type: 'permanent', notes: 'First Jan signing' },
    { id: 't5', player: 'Brian Madjo', position: 'Forward', age: 19, oldClub: 'Metz', newClub: 'Aston Villa', fee: '12000000', feeEUR: '13800000', feeDisplay: '£12.0M', date: '2026-01-15', contractLength: '5 years', type: 'permanent' },
    { id: 't6', player: 'Douglas Luiz', position: 'Midfielder', age: 27, oldClub: 'Juventus', newClub: 'Aston Villa', fee: '0', feeEUR: '0', feeDisplay: 'Loan', date: '2026-01-20', contractLength: '6 months', type: 'loan', notes: 'Loan with option to buy' },

    // West Ham (Confirmed)
    { id: 't7', player: 'Valentín Castellanos', position: 'Forward', age: 27, oldClub: 'Lazio', newClub: 'West Ham', fee: '15000000', feeEUR: '17250000', feeDisplay: '£15.0M', date: '2026-01-10', contractLength: '4.5 years', type: 'permanent', notes: 'Fee undisclosed (est.)' },
    { id: 't8', player: 'Adama Traoré', position: 'Winger', age: 30, oldClub: 'Fulham', newClub: 'West Ham', fee: '5000000', feeEUR: '5750000', feeDisplay: '£5.0M', date: '2026-01-25', contractLength: '2.5 years', type: 'permanent', notes: 'Fee undisclosed (est.)' },
    { id: 't9', player: 'Axel Disasi', position: 'Defender', age: 27, oldClub: 'Chelsea', newClub: 'West Ham', fee: '0', feeEUR: '0', feeDisplay: 'Loan', date: '2026-01-28', contractLength: '6 months', type: 'loan' },
    { id: 't10', player: 'Pablo Felipe', position: 'Defender', age: 22, oldClub: 'Gil Vicente', newClub: 'West Ham', fee: '8000000', feeEUR: '9200000', feeDisplay: '£8.0M', date: '2026-01-12', contractLength: '4.5 years', type: 'permanent' },

    // Brentford (Confirmed)
    { id: 't11', player: 'Kaye Furo', position: 'Forward', age: 18, oldClub: 'Club Brugge', newClub: 'Brentford', fee: '6000000', feeEUR: '6900000', feeDisplay: '£6.0M', date: '2026-01-08', contractLength: '5.5 years', type: 'permanent', notes: 'Belgium U21 international' },

    // Outbound (Confirmed)
    { id: 't12', player: 'Oleksandr Zinchenko', position: 'Defender', age: 29, oldClub: 'Arsenal', newClub: 'Ajax', fee: '12000000', feeEUR: '13800000', feeDisplay: '£12.0M', date: '2026-01-22', contractLength: '3 years', type: 'permanent' },
    { id: 't13', player: 'Antonio Cordero', position: 'Midfielder', age: 19, oldClub: 'Newcastle', newClub: 'Cadiz', fee: '0', feeEUR: '0', feeDisplay: 'Loan', date: '2026-01-03', contractLength: '6 months', type: 'loan' }
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
  async getPlayersStats(): Promise<PlayerStat[]> {
    try {
      const db = await getDB();
      const cached = await db.get('scorers', 'allPlayers');
      
      if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
        return cached.data;
      }

      const res = await fetch('/api/football?type=stats');
      if (!res.ok) {
        console.warn('Stats endpoint returned non-OK:', res.status, res.statusText);
        return [];
      }
      const data = await res.json();
      
      await db.put('scorers', { data, timestamp: Date.now() }, 'allPlayers');
      return data;
    } catch (error) {
      console.error('Error fetching player stats:', error);
      return []; 
    }
  },

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
