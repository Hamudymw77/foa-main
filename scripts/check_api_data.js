const API_KEY = process.env.API_FOOTBALL_KEY || '';
const API_URL = 'https://v3.football.api-sports.io';

async function checkApiData() {
    console.log('Fetching next fixtures for League 39 (Premier League)...');
    
    try {
        const response = await fetch(`${API_URL}/fixtures?league=39&next=50`, {
            headers: {
                'x-apisports-key': API_KEY
            }
        });

        if (!response.ok) {
            console.error(`API request failed with status: ${response.status}`);
            return;
        }

        const data = await response.json();
        const fixtures = data.response || [];

        console.log(`Total fixtures found in response: ${fixtures.length}`);

        let burnleyCount = 0;
        let leedsCount = 0;
        let sunderlandCount = 0;

        fixtures.forEach(fixture => {
            const homeTeam = fixture.teams?.home?.name?.toLowerCase() || '';
            const awayTeam = fixture.teams?.away?.name?.toLowerCase() || '';

            if (homeTeam.includes('burnley') || awayTeam.includes('burnley')) {
                burnleyCount++;
            }
            if (homeTeam.includes('leeds') || awayTeam.includes('leeds')) {
                leedsCount++;
            }
            if (homeTeam.includes('sunderland') || awayTeam.includes('sunderland')) {
                sunderlandCount++;
            }
        });

        console.log('--- Match Counts for Promoted Teams ---');
        console.log(`Burnley: ${burnleyCount} matches`);
        console.log(`Leeds: ${leedsCount} matches`);
        console.log(`Sunderland: ${sunderlandCount} matches`);
        
        // Print all unique teams found in the response just to be sure
        const uniqueTeams = new Set();
        fixtures.forEach(f => {
            uniqueTeams.add(f.teams?.home?.name);
            uniqueTeams.add(f.teams?.away?.name);
        });
        
        console.log('\n--- Unique Teams in League 39 Season 2025 ---');
        console.log(Array.from(uniqueTeams).sort().join(', '));

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

checkApiData();
