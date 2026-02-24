
const https = require('https');

const url = 'https://fixturedownload.com/view/json/epl-2025';

console.log('Fetching:', url);

https.get(url, { headers: { 'accept': 'text/html' } }, (res) => {
  console.log('Status:', res.statusCode);
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Body length:', data.length);
    const match = data.match(/<textarea[^>]*>([\s\S]*?)<\/textarea>/i);
    if (match) {
        try {
            const jsonStr = match[1]
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/&apos;/g, "'")
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>');
            const json = JSON.parse(jsonStr);
            console.log('JSON items:', json.length);
            const finished = json.filter(m => m.HomeTeamScore !== null);
            console.log('Finished matches:', finished.length);
            if(finished.length > 0) {
                console.log('Last match:', finished[finished.length-1]);
            }
        } catch (e) {
            console.error('Parse error:', e.message);
        }
    } else {
        console.log('No textarea found. Preview of body:', data.substring(0, 500));
    }
  });
}).on('error', (e) => {
  console.error('Error:', e);
});
