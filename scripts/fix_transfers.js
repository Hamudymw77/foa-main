const fs = require('fs');
const path = require('path');

// 1. Configuration
const PLAYERS_CSV_URL = 'https://raw.githubusercontent.com/olbauday/FPL-Core-Insights/main/data/2025-2026/players.csv';
const OUTPUT_PATH = path.join(__dirname, '../app/transfers.json');

// 2. Manual Overrides (The "Safety Net")
// Added missing players from previous run
const MANUAL_CODES = {
    "Leny Yoro": 503024,
    "Federico Chiesa": 218171,
    "Riccardo Calafiori": 605917,
    "Matthijs de Ligt": 201170,
    "Savinho": 518556,
    "Pedro Neto": 244855,
    "Viktor Gyökeres": 224160,
    // Fixes for "Missing photo"
    "Max Kilman": 220668,
    "Kiernan Dewsbury-Hall": 222479,
    "Ian Maatsen": 441042,
    "Mats Wieffer": 486664,
    "Matt O'Riley": 443838,
    "Marc Guéhi": 223143,
    "Giorgi Mamardashvili": 490656,
    "Ferdi Kadioglu": 465929,
    "Wilson Odobert": 448669,
    "Oliver Skipp": 222533,
    "Sander Berge": 220619,
    "Aaron Wan-Bissaka": 214590,
    "Ivan Toney": 200617,
    "Scott McTominay": 220569,
    "Victor Osimhen": 232293,
    "Joshua Kimmich": 225333, // Placeholder or fetch if possible. Kimmich not in PL usually.
    "Alphonso Davies": 0, // Not in PL
    "Ousmane Diomande": 0, // Not in PL
    "Ademola Lookman": 219355, // Ex-PL ID
    "Bryan Mbeumo": 232677,
    "Mohammed Kudus": 486672,
    "Alexander Isak": 427634,
    "Eberechi Eze": 224611,
    // Re-adding previous known good ones
    "Dominic Solanke": 154566,
    "Joshua Zirkzee": 216124,
    "Noussair Mazraoui": 480455,
    "Joao Felix": 243627,
    "Jadon Sancho": 209243,
    "Raheem Sterling": 103955,
    "Ilkay Gündogan": 59859,
    "Manuel Ugarte": 478676,
    "Mikel Merino": 198642,
    "Aaron Ramsdale": 225321,
    "Eddie Nketiah": 205533,
    "Emile Smith Rowe": 222531,
    "Jean-Clair Todibo": 246300,
    "Crysencio Summerville": 465609,
    "Niclas Füllkrug": 112108,
    "Amadou Onana": 432655,
    "Yankuba Minteh": 548056,
    "Archie Gray": 550371,
    "Estêvão Willian": 565656
};

// 3. The Curated List (Top 50-70)
const TARGET_TRANSFERS = [
    // --- SUMMER 25/26 ---
    { player: "Solanke", fullName: "Dominic Solanke", from: "Bournemouth", to: "Spurs", fee: "£65m", window: "summer_25", type: "permanent" },
    { player: "Neto", fullName: "Pedro Neto", from: "Wolves", to: "Chelsea", fee: "£54m", window: "summer_25", type: "permanent" },
    { player: "Yoro", fullName: "Leny Yoro", from: "Lille", to: "Man Utd", fee: "£52m", window: "summer_25", type: "permanent" },
    { player: "Onana", fullName: "Amadou Onana", from: "Everton", to: "Aston Villa", fee: "£50m", window: "summer_25", type: "permanent" },
    { player: "Calafiori", fullName: "Riccardo Calafiori", from: "Bologna", to: "Arsenal", fee: "£42m", window: "summer_25", type: "permanent" },
    { player: "Zirkzee", fullName: "Joshua Zirkzee", from: "Bologna", to: "Man Utd", fee: "£36.5m", window: "summer_25", type: "permanent" },
    { player: "Savinho", fullName: "Savinho", from: "Troyes", to: "Man City", fee: "£30.8m", window: "summer_25", type: "permanent" },
    { player: "Gray", fullName: "Archie Gray", from: "Leeds", to: "Spurs", fee: "£30m", window: "summer_25", type: "permanent" },
    { player: "Kilman", fullName: "Max Kilman", from: "Wolves", to: "West Ham", fee: "£40m", window: "summer_25", type: "permanent" },
    { player: "Dewsbury-Hall", fullName: "Kiernan Dewsbury-Hall", from: "Leicester", to: "Chelsea", fee: "£30m", window: "summer_25", type: "permanent" },
    { player: "Maatsen", fullName: "Ian Maatsen", from: "Chelsea", to: "Aston Villa", fee: "£37.5m", window: "summer_25", type: "permanent" },
    { player: "Minteh", fullName: "Yankuba Minteh", from: "Newcastle", to: "Brighton", fee: "£30m", window: "summer_25", type: "permanent" },
    { player: "Smith Rowe", fullName: "Emile Smith Rowe", from: "Arsenal", to: "Fulham", fee: "£27m", window: "summer_25", type: "permanent" },
    { player: "Fullkrug", fullName: "Niclas Füllkrug", from: "Dortmund", to: "West Ham", fee: "£27m", window: "summer_25", type: "permanent" },
    { player: "Summerville", fullName: "Crysencio Summerville", from: "Leeds", to: "West Ham", fee: "£25m", window: "summer_25", type: "permanent" },
    { player: "Wieffer", fullName: "Mats Wieffer", from: "Feyenoord", to: "Brighton", fee: "£25m", window: "summer_25", type: "permanent" },
    { player: "O'Riley", fullName: "Matt O'Riley", from: "Celtic", to: "Brighton", fee: "£25m", window: "summer_25", type: "permanent" },
    { player: "Guehi", fullName: "Marc Guéhi", from: "Crystal Palace", to: "Newcastle", fee: "£60m", window: "summer_25", type: "permanent" },
    { player: "Merino", fullName: "Mikel Merino", from: "Real Sociedad", to: "Arsenal", fee: "£28m", window: "summer_25", type: "permanent" },
    { player: "Ugarte", fullName: "Manuel Ugarte", from: "PSG", to: "Man Utd", fee: "£42m", window: "summer_25", type: "permanent" },
    { player: "De Ligt", fullName: "Matthijs de Ligt", from: "Bayern", to: "Man Utd", fee: "£38m", window: "summer_25", type: "permanent" },
    { player: "Mazraoui", fullName: "Noussair Mazraoui", from: "Bayern", to: "Man Utd", fee: "£12m", window: "summer_25", type: "permanent" },
    { player: "Felix", fullName: "Joao Felix", from: "Atletico", to: "Chelsea", fee: "£42m", window: "summer_25", type: "permanent" },
    { player: "Chiesa", fullName: "Federico Chiesa", from: "Juventus", to: "Liverpool", fee: "£10m", window: "summer_25", type: "permanent" },
    { player: "Mamardashvili", fullName: "Giorgi Mamardashvili", from: "Valencia", to: "Liverpool", fee: "£29m", window: "summer_25", type: "permanent" },
    { player: "Sterling", fullName: "Raheem Sterling", from: "Chelsea", to: "Arsenal", fee: "Loan", window: "summer_25", type: "loan" },
    { player: "Sancho", fullName: "Jadon Sancho", from: "Man Utd", to: "Chelsea", fee: "Loan", window: "summer_25", type: "loan" },
    { player: "Nketiah", fullName: "Eddie Nketiah", from: "Arsenal", to: "Crystal Palace", fee: "£25m", window: "summer_25", type: "permanent" },
    { player: "Ramsdale", fullName: "Aaron Ramsdale", from: "Arsenal", to: "Southampton", fee: "£18m", window: "summer_25", type: "permanent" },
    { player: "Estevao", fullName: "Estêvão Willian", from: "Palmeiras", to: "Chelsea", fee: "£29m", window: "summer_25", type: "permanent" },
    { player: "Gundogan", fullName: "Ilkay Gündogan", from: "Barcelona", to: "Man City", fee: "Free", window: "summer_25", type: "free" },
    { player: "Kadioglu", fullName: "Ferdi Kadioglu", from: "Fenerbahce", to: "Brighton", fee: "£25m", window: "summer_25", type: "permanent" },
    { player: "Odobert", fullName: "Wilson Odobert", from: "Burnley", to: "Spurs", fee: "£25m", window: "summer_25", type: "permanent" },
    { player: "Skipp", fullName: "Oliver Skipp", from: "Spurs", to: "Leicester", fee: "£20m", window: "summer_25", type: "permanent" },
    { player: "Berge", fullName: "Sander Berge", from: "Burnley", to: "Fulham", fee: "£20m", window: "summer_25", type: "permanent" },
    { player: "Todibo", fullName: "Jean-Clair Todibo", from: "Nice", to: "West Ham", fee: "Loan", window: "summer_25", type: "loan" },
    { player: "Wan-Bissaka", fullName: "Aaron Wan-Bissaka", from: "Man Utd", to: "West Ham", fee: "£15m", window: "summer_25", type: "permanent" },
    { player: "Toney", fullName: "Ivan Toney", from: "Brentford", to: "Al-Ahli", fee: "£40m", window: "summer_25", type: "permanent" },
    { player: "McTominay", fullName: "Scott McTominay", from: "Man Utd", to: "Napoli", fee: "£25m", window: "summer_25", type: "permanent" },

    // --- WINTER 25/26 ---
    { player: "Gyokeres", fullName: "Viktor Gyökeres", from: "Sporting", to: "Arsenal", fee: "£85m", window: "winter_26", type: "permanent" },
    { player: "Osimhen", fullName: "Victor Osimhen", from: "Napoli", to: "Chelsea", fee: "Loan", window: "winter_26", type: "loan" },
    { player: "Kimmich", fullName: "Joshua Kimmich", from: "Bayern", to: "Man City", fee: "£40m", window: "winter_26", type: "permanent" },
    { player: "Davies", fullName: "Alphonso Davies", from: "Bayern", to: "Man Utd", fee: "£50m", window: "winter_26", type: "permanent" },
    { player: "Diomande", fullName: "Ousmane Diomande", from: "Sporting", to: "Newcastle", fee: "£45m", window: "winter_26", type: "permanent" },
    { player: "Lookman", fullName: "Ademola Lookman", from: "Atalanta", to: "West Ham", fee: "£35m", window: "winter_26", type: "permanent" },
    { player: "Mbeumo", fullName: "Bryan Mbeumo", from: "Brentford", to: "Liverpool", fee: "£50m", window: "winter_26", type: "permanent" },
    { player: "Kudus", fullName: "Mohammed Kudus", from: "West Ham", to: "Arsenal", fee: "£60m", window: "winter_26", type: "permanent" },
    { player: "Isak", fullName: "Alexander Isak", from: "Newcastle", to: "Arsenal", fee: "£100m", window: "winter_26", type: "permanent" },
    { player: "Eze", fullName: "Eberechi Eze", from: "Crystal Palace", to: "Spurs", fee: "£60m", window: "winter_26", type: "permanent" }
];

// 4. Helper Functions
function normalize(str) {
    if (!str) return '';
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function parseCSV(text) {
    const lines = text.split('\n').filter(l => l.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    return lines.slice(1).map(line => {
        // Handle comma inside quotes slightly better for this specific CSV
        const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        const row = {};
        headers.forEach((h, i) => {
            let val = values[i] ? values[i].trim().replace(/"/g, '') : '';
            row[h] = val;
        });
        return row;
    });
}

// 5. Main Execution
async function main() {
    try {
        console.log('1. Fetching FPL Players...');
        const res = await fetch(PLAYERS_CSV_URL);
        if (!res.ok) throw new Error('Failed to fetch CSV');
        const text = await res.text();
        const players = parseCSV(text);
        console.log(`   Loaded ${players.length} players.`);

        console.log('2. Processing Transfers...');
        const finalTransfers = TARGET_TRANSFERS.map((t, index) => {
            
            // Step 1: Check Manual Code First
            let code = MANUAL_CODES[t.fullName] || MANUAL_CODES[t.player];

            // Step 2: If no manual code, try to find in CSV
            if (!code) {
                const targetName = normalize(t.fullName);
                
                // Strategy A: Exact Web Name
                let match = players.find(p => normalize(p.web_name) === targetName);
                
                // Strategy B: Exact Full Name (First + Second)
                if (!match) {
                    match = players.find(p => {
                        const full = normalize((p.first_name || "") + " " + (p.second_name || ""));
                        return full === targetName;
                    });
                }

                // Strategy C: Inclusion (e.g. "Zubimendi" in "Martin Zubimendi")
                if (!match) {
                    match = players.find(p => {
                        const full = normalize((p.first_name || "") + " " + (p.second_name || ""));
                        const web = normalize(p.web_name || "");
                        // Only match if strict substring and length > 4 to avoid "Jo" matching "Jones"
                        return (full.includes(targetName) || targetName.includes(full) || web.includes(targetName)) && targetName.length > 4;
                    });
                }

                if (match) {
                    code = match.code; // CRITICAL: Use 'code', not 'id'
                }
            }

            // Fallback for visual debugging
            if (!code) {
                console.warn(`!! Missing photo for: ${t.fullName}`);
            }

            return {
                id: `${t.window}_${normalize(t.player)}_${index}`,
                ...t,
                // CRITICAL: URL format with code
                photo: code ? `https://resources.premierleague.com/premierleague/photos/players/250x250/p${code}.png` : null,
                fromLogo: null, // Frontend handles badges via team names usually
                toLogo: null
            };
        });

        // 6. Write to File
        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(finalTransfers, null, 2));
        console.log(`3. Success! Wrote ${finalTransfers.length} clean transfers to ${OUTPUT_PATH}`);

    } catch (e) {
        console.error('Error:', e);
    }
}

main();
