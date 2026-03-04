const FPL_BOOTSTRAP_URL = 'https://fantasy.premierleague.com/api/bootstrap-static/';

async function main() {
    try {
        const res = await fetch(FPL_BOOTSTRAP_URL, {
             headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const data = await res.json();
        const players = data.elements;
        
        console.log("Total players:", players.length);
        console.log("Sample player:", JSON.stringify(players[0], null, 2));
        
        // Check for Salah
        const salah = players.filter(p => p.web_name.includes("Salah"));
        console.log("Salah:", JSON.stringify(salah.map(p => ({web_name: p.web_name, first: p.first_name, second: p.second_name, code: p.code})), null, 2));

        const haaland = players.filter(p => p.web_name.toLowerCase().includes("haaland"));
        console.log("Haaland:", JSON.stringify(haaland.map(p => ({web_name: p.web_name})), null, 2));

        const saka = players.filter(p => p.web_name.toLowerCase().includes("saka"));
        console.log("Saka:", JSON.stringify(saka.map(p => ({web_name: p.web_name})), null, 2));

        const palmer = players.filter(p => p.web_name.toLowerCase().includes("palmer"));
        console.log("Palmer:", JSON.stringify(palmer.map(p => ({web_name: p.web_name})), null, 2));



    } catch (e) {
        console.error(e);
    }
}
main();