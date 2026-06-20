const { createClient } = require('@libsql/client');
(async () => {
  const client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
  const r = await client.execute("SELECT id, email, name, role, created_at FROM users ORDER BY id");
  console.log('Users in DB (' + r.rows.length + '):');
  for (const row of r.rows) {
    console.log(' -', row);
  }
  // Test the exact query used by findUserByEmail
  console.log('\nTest eq query for specific email:');
  for (const testEmail of ['bos@promptflow.local', 'test@x.com', 'foo@bar.com', 'nonexistent@test.com']) {
    const r2 = await client.execute({ sql: 'SELECT id, email FROM users WHERE email = ?', args: [testEmail] });
    console.log(' -', testEmail, '=>', r2.rows.length, 'rows', r2.rows);
  }
  await client.close();
})();
