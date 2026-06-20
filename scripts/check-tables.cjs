const { createClient } = require('@libsql/client');
(async () => {
  const client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
  const r = await client.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
  console.log('Tables:');
  console.log(r.rows.map(x => ' - ' + x.name).join('\n'));
  const r2 = await client.execute("SELECT name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%' ORDER BY name");
  console.log('\nIndexes:');
  console.log(r2.rows.map(x => ' - ' + x.name).join('\n'));
  await client.close();
})();
