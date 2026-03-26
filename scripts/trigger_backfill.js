async function main() {
  const res = await fetch('http://localhost:3000/api/admin/backfill-stats', { method: 'POST' });
  const text = await res.text();

  if (!res.ok) {
    throw new Error(`Backfill failed: ${res.status} ${res.statusText}\n${text}`);
  }

  try {
    const json = JSON.parse(text);
    console.log(JSON.stringify(json, null, 2));
  } catch {
    console.log(text);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
