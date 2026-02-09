
const http = require('http');

function checkEndpoint(type) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: `/api/football?type=${type}`,
    method: 'GET',
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log(`Response for ${type}:`);
      console.log(`Status Code: ${res.statusCode}`);
      try {
        const json = JSON.parse(data);
        console.log(`Data length: ${Array.isArray(json) ? json.length : 'Not an array'}`);
        if (Array.isArray(json) && json.length > 0) {
            console.log('First item sample:', JSON.stringify(json[0]).substring(0, 100) + '...');
        } else {
            console.log('Full response:', data.substring(0, 200));
        }
      } catch (e) {
        console.log('Error parsing JSON:', e.message);
        console.log('Raw data:', data.substring(0, 200));
      }
      console.log('-------------------');
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.end();
}

checkEndpoint('matches');
checkEndpoint('standings');
