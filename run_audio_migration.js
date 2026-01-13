const mysql = require('mysql2/promise');

async function runAudioMigration() {
  let connection;

  try {
    // Connect to database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'ireporter'
    });

    console.log('✅ Connected to database');

    // Add audio column to red_flags table if it doesn't exist
    await connection.execute('ALTER TABLE red_flags ADD COLUMN IF NOT EXISTS audio JSON');
    console.log('✅ Added audio column to red_flags table');

    // Add audio column to interventions table if it doesn't exist
    await connection.execute('ALTER TABLE interventions ADD COLUMN IF NOT EXISTS audio JSON');
    console.log('✅ Added audio column to interventions table');

    // Verify columns were added
    const [redFlagsDesc] = await connection.execute('DESCRIBE red_flags');
    const [interventionsDesc] = await connection.execute('DESCRIBE interventions');

    console.log('\n📋 Red flags table columns:');
    redFlagsDesc.forEach(col => console.log(`  - ${col.Field}`));

    console.log('\n📋 Interventions table columns:');
    interventionsDesc.forEach(col => console.log(`  - ${col.Field}`));

    console.log('\n🎉 Audio migration completed successfully!');

  } catch (err) {
    console.error('❌ Migration failed:', err);
    throw err;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the migration
runAudioMigration().catch(console.error);
