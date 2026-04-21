export const TEAM_LOGOS: Record<string, string> = {
  'Arsenal': 'https://resources.premierleague.com/premierleague/badges/t3.svg',
  'Aston Villa': 'https://resources.premierleague.com/premierleague/badges/t7.svg',
  'Bournemouth': 'https://resources.premierleague.com/premierleague/badges/t91.svg',
  'Brentford': 'https://resources.premierleague.com/premierleague/badges/t94.svg',
  'Brighton': 'https://resources.premierleague.com/premierleague/badges/t36.svg',
  'Brighton & Hove Albion': 'https://resources.premierleague.com/premierleague/badges/t36.svg',
  'Burnley': 'https://resources.premierleague.com/premierleague/badges/t90.svg',
  'Chelsea': 'https://resources.premierleague.com/premierleague/badges/t8.svg',
  'Crystal Palace': 'https://resources.premierleague.com/premierleague/badges/t31.svg',
  'Everton': 'https://resources.premierleague.com/premierleague/badges/t11.svg',
  'Fulham': 'https://resources.premierleague.com/premierleague/badges/t54.svg',
  'Leeds': 'https://resources.premierleague.com/premierleague/badges/t2.svg',
  'Leeds United': 'https://resources.premierleague.com/premierleague/badges/t2.svg',
  'Liverpool': 'https://resources.premierleague.com/premierleague/badges/t14.svg',
  'Man City': 'https://resources.premierleague.com/premierleague/badges/t43.svg',
  'Manchester City': 'https://resources.premierleague.com/premierleague/badges/t43.svg',
  'Man Utd': 'https://resources.premierleague.com/premierleague/badges/t1.svg',
  'Manchester United': 'https://resources.premierleague.com/premierleague/badges/t1.svg',
  'Newcastle': 'https://resources.premierleague.com/premierleague/badges/t4.svg',
  'Newcastle United': 'https://resources.premierleague.com/premierleague/badges/t4.svg',
  "Nott'm Forest": 'https://resources.premierleague.com/premierleague/badges/t17.svg',
  'Nottingham Forest': 'https://resources.premierleague.com/premierleague/badges/t17.svg',
  'Spurs': 'https://resources.premierleague.com/premierleague/badges/t6.svg',
  'Tottenham': 'https://resources.premierleague.com/premierleague/badges/t6.svg',
  'Tottenham Hotspur': 'https://resources.premierleague.com/premierleague/badges/t6.svg',
  'Sunderland': 'https://resources.premierleague.com/premierleague/badges/t56.svg',
  'West Ham': 'https://resources.premierleague.com/premierleague/badges/t21.svg',
  'West Ham United': 'https://resources.premierleague.com/premierleague/badges/t21.svg',
  'Wolves': 'https://resources.premierleague.com/premierleague/badges/t39.svg',
  'Wolverhampton': 'https://resources.premierleague.com/premierleague/badges/t39.svg',
  'Wolverhampton Wanderers': 'https://resources.premierleague.com/premierleague/badges/t39.svg'
};

function normalizeTeamKey(name: string) {
  let v = String(name || "").toLowerCase().trim();
  v = v
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]/g, "");
  if (v.endsWith("afc")) v = v.slice(0, -3);
  if (v.endsWith("fc")) v = v.slice(0, -2);
  if (v.endsWith("cf")) v = v.slice(0, -2);
  return v;
}

const TEAM_NAME_ALIASES: Record<string, string> = {
  manunited: "Manchester United",
  manchesterutd: "Manchester United",
  manutd: "Manchester United",
  manchesterunited: "Manchester United",
  manchestercity: "Manchester City",
  mancity: "Manchester City",
  spurs: "Tottenham Hotspur",
  tottenham: "Tottenham Hotspur",
  tottenhamhotspur: "Tottenham Hotspur",
  brightonandhovealbion: "Brighton & Hove Albion",
  brightonhovealbion: "Brighton & Hove Albion",
  westham: "West Ham United",
  westhamunited: "West Ham United",
  newcastle: "Newcastle United",
  newcastleunited: "Newcastle United",
  nottmforest: "Nottingham Forest",
  nottinghamforest: "Nottingham Forest",
  nottsforest: "Nottingham Forest",
  leedsutd: "Leeds United",
  leedsunited: "Leeds United",
  wolves: "Wolverhampton Wanderers",
  wolverhampton: "Wolverhampton Wanderers",
  wolverhamptonwanderers: "Wolverhampton Wanderers",
  crystalpalace: "Crystal Palace",
  crystalpalacefc: "Crystal Palace",
  liverpool: "Liverpool",
  liverpoolfc: "Liverpool",
  chelsea: "Chelsea",
  chelseafc: "Chelsea"
};

const TEAM_LOGO_BY_NORMALIZED: Record<string, string> = Object.keys(TEAM_LOGOS).reduce(
  (acc, k) => {
    acc[normalizeTeamKey(k)] = TEAM_LOGOS[k];
    return acc;
  },
  {} as Record<string, string>
);

export function isPremierLeagueBadgeUrl(url: string | null | undefined) {
  const v = String(url || "").toLowerCase();
  return v.includes("resources.premierleague.com") && (v.includes("/badges/t") || v.includes("/badges/100/t"));
}

export function extractPremierLeagueBadgeId(url: string | null | undefined) {
  const v = String(url || "");
  const m = v.match(/\/t(\d+)\.(svg|png)/i);
  return m ? m[1] : null;
}

export function getTeamLogoUrl(teamName: string | null | undefined) {
  if (!teamName) return undefined;
  const trimmed = String(teamName).trim();
  if (TEAM_LOGOS[trimmed]) return TEAM_LOGOS[trimmed];

  const normalized = normalizeTeamKey(trimmed);
  if (!normalized) return undefined;

  const aliasedName = TEAM_NAME_ALIASES[normalized];
  if (aliasedName && TEAM_LOGOS[aliasedName]) return TEAM_LOGOS[aliasedName];

  return TEAM_LOGO_BY_NORMALIZED[normalized];
}

export function resolveTeamLogoUrl(teamName: string | null | undefined, providedUrl?: string | null) {
  const canonical = getTeamLogoUrl(teamName);
  const provided = providedUrl ? String(providedUrl) : undefined;

  if (canonical) {
    const expected = extractPremierLeagueBadgeId(canonical);
    const actual = extractPremierLeagueBadgeId(provided);
    if (expected && actual && expected !== actual) return canonical;
    return provided || canonical;
  }

  if (provided) {
    if (teamName && isPremierLeagueBadgeUrl(provided)) return undefined;
    return provided;
  }

  return undefined;
}
