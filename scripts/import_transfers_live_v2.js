const fs = require('fs');
const path = require('path');

// 1. Configuration
const INPUT_FILE = path.join(__dirname, '../transfeeers.txt');
const OUTPUT_FILE = path.join(__dirname, '../app/transfers.json');
const FPL_BOOTSTRAP_URL = 'https://fantasy.premierleague.com/api/bootstrap-static/';

// 3. Helper Functions
function normalizeName(name) {
    if (!name) return "";
    return name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .toLowerCase()
        .replace(/\s+/g, " ") // Collapse spaces
        .trim();
}

// 4. Main Execution
async function main() {
    try {
        console.log('1. Fetching FPL Live Data (Bootstrap-Static)...');
        const res = await fetch(FPL_BOOTSTRAP_URL, {
             headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        if (!res.ok) throw new Error(`Failed to fetch FPL data: ${res.status} ${res.statusText}`);
        const data = await res.json();
        const players = data.elements;
        console.log(`   Loaded ${players.length} players from LIVE FPL API.`);

        console.log('2. Reading Transfers File...');
        const fileContent = fs.readFileSync(INPUT_FILE, 'utf8');
        const lines = fileContent.split('\n').filter(l => l.trim());
        
        // Remove header if exists
        if (lines[0].startsWith('Player,From')) lines.shift();

        // Use a Map to deduplicate by Player Name
        const uniqueTransfers = new Map();
        const missingPlayers = [];

        lines.forEach((line) => {
            const parts = line.split(',').map(p => p.trim());
            
            if (parts.length < 5) return;

            const player = parts[0];
            const from = parts[1];
            const to = parts[2];
            const fee = parts[3];
            const windowRaw = parts[4]; 
            const club = parts[5] || to;

            // Skip empty lines or malformed
            if (!player || !from || !to) return;

            // Deduplication Key: Normalized Name
            const key = normalizeName(player);

            // If we already have this player, SKIP
            if (uniqueTransfers.has(key)) return;

            // Normalize Window
            let window = 'summer_25';
            if (windowRaw.toLowerCase().includes('january') || windowRaw.toLowerCase().includes('winter')) {
                window = 'winter_26';
            }

            // Determine Type
            let type = 'permanent';
            if (fee.toLowerCase().includes('loan')) type = 'loan';
            if (fee.toLowerCase().includes('free')) type = 'free';
            if (to.toLowerCase() === 'released' || fee.toLowerCase() === 'released') type = 'released';

            // Find Photo Code using LIVE FPL Data
            let code = null;

            const targetName = normalizeName(player);
            
            // Strategy A: Exact Web Name
            let match = players.find(p => normalizeName(p.web_name) === targetName);
            
            // Strategy B: Exact Full Name
            if (!match) {
                match = players.find(p => {
                    const full = normalizeName((p.first_name || "") + " " + (p.second_name || ""));
                    return full === targetName;
                });
            }

            // Strategy C: Exact Second Name
            if (!match) {
                match = players.find(p => normalizeName(p.second_name) === targetName);
            }

            // Strategy D: Fuzzy / Inclusion
            if (!match) {
                match = players.find(p => {
                    const full = normalizeName((p.first_name || "") + " " + (p.second_name || ""));
                    const web = normalizeName(p.web_name || "");
                    const second = normalizeName(p.second_name || "");
                    
                    // 1. Target contains Web Name (e.g. Target="Dominic Solanke", Web="Solanke")
                    // Must be > 3 chars to avoid matching short names like "Jo"
                    if (web.length > 3 && targetName.includes(web)) return true;

                    // 2. Target contains Second Name
                    if (second.length > 3 && targetName.includes(second)) return true;

                    // 3. Full Name contains Target (e.g. Target="Zirkzee", Full="Joshua Zirkzee")
                    if (targetName.length > 3 && full.includes(targetName)) return true;

                    return false;
                });
            }

            if (match) {
                code = match.code;
            } else {
                missingPlayers.push(player);
            }

            // Logic copied from app/api/football/route.ts
            // Uses 'premierleague25' path and '110x140' resolution with code
            const photoUrl = code 
                ? `https://resources.premierleague.com/premierleague25/photos/players/110x140/${code}.png`
                : null;

            uniqueTransfers.set(key, {
                id: `${window}_${normalizeName(player)}`,
                player: player,
                from: from,
                to: to,
                fee: fee,
                window: window,
                type: type,
                club: club,
                photo: photoUrl,
                fromLogo: null,
                toLogo: null
            });
        });

        const transfers = Array.from(uniqueTransfers.values());

        console.log(`3. Writing ${transfers.length} unique transfers...`);
        
        if (missingPlayers.length > 0) {
            console.log('\n⚠️  MISSING PLAYERS (No FPL Match Found):');
            console.log(JSON.stringify(missingPlayers, null, 2));
            console.log(`Total Missing: ${missingPlayers.length}\n`);
        }

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(transfers, null, 2));
        console.log('4. Done!');

    } catch (e) {
        console.error('Error:', e);
    }
}

main();
