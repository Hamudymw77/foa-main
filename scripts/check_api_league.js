const API_KEY = process.env.API_FOOTBALL_KEY || '';
const API_URL = 'https://v3.football.api-sports.io';

async function checkApiData() {
    console.log('Fetching league info for League 39 (Premier League)...');
    
    try {
        const response = await fetch(`${API_URL}/leagues?id=39`, {
            headers: {
                'x-apisports-key': API_KEY
            }
        });

        if (!response.ok) {
            console.error(`API request failed with status: ${response.status}`);
            return;
        }

        const data = await response.json();
        const seasons = data.response[0]?.seasons || [];

        console.log(`Available seasons for League 39:`);
        seasons.forEach(s => {
            console.log(`- Year: ${s.year}, Current: ${s.current}, Start: ${s.start}, End: ${s.end}`);
        });

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

checkApiData();
