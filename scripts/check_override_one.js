const fs = require('fs');
const path = require('path');

const matchId = process.argv[2];
if (!matchId) {
  console.error('Usage: node scripts/check_override_one.js <matchId>');
  process.exit(1);
}

const overridesPath = path.join(process.cwd(), 'app', 'admin_overrides.json');
const overrides = JSON.parse(fs.readFileSync(overridesPath, 'utf8'));

console.log(JSON.stringify(overrides[String(matchId)] ?? null, null, 2));
