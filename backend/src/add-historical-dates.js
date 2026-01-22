/**
 * Add historical date variation to test_rules_data
 * This script distributes existing records across the past year
 * to enable meaningful timeline visualization
 */
import db from './models/database.js';

console.log('Adding historical date variation to test_rules_data...');

// Get current date distribution
const currentStats = db.prepare(`
  SELECT COUNT(*) as total,
         COUNT(DISTINCT object_name) as unique_objects,
         MIN(created_at) as min_date,
         MAX(created_at) as max_date
  FROM test_rules_data
`).get();

console.log('Current stats:', currentStats);

// Get all unique object names
const objects = db.prepare(`
  SELECT DISTINCT object_name FROM test_rules_data WHERE object_name IS NOT NULL
`).all();

console.log(`Found ${objects.length} unique objects`);

// For each object, distribute its records across the past 365 days
// with some variation in fail/pass counts to simulate real trends
const updateStmt = db.prepare(`
  UPDATE test_rules_data
  SET created_at = datetime(?, 'unixepoch'),
      fail_count = MAX(0, fail_count + ?),
      pass_count = MAX(0, pass_count + ?)
  WHERE id = ?
`);

const selectByObject = db.prepare(`
  SELECT id, fail_count, pass_count FROM test_rules_data WHERE object_name = ?
`);

// Base date is today
const baseDate = new Date();
const msPerDay = 24 * 60 * 60 * 1000;

let updatedCount = 0;

db.transaction(() => {
  for (const obj of objects) {
    const records = selectByObject.all(obj.object_name);
    const recordCount = records.length;

    if (recordCount === 0) continue;

    // Distribute records across 365 days
    // More recent dates get more records (simulating data growth)
    records.forEach((record, index) => {
      // Calculate days ago (0-365), weighted towards recent
      const progressRatio = index / recordCount;
      const daysAgo = Math.floor(365 * (1 - progressRatio * progressRatio));

      // Add some randomness
      const randomDays = Math.floor(Math.random() * 30) - 15;
      const finalDaysAgo = Math.max(0, Math.min(365, daysAgo + randomDays));

      // Calculate the timestamp
      const recordDate = new Date(baseDate.getTime() - (finalDaysAgo * msPerDay));
      const unixTimestamp = Math.floor(recordDate.getTime() / 1000);

      // Add some variation to fail/pass counts based on time
      // Simulate improvement over time (fewer fails recently)
      const failAdjustment = Math.floor(Math.random() * 100) - 50;
      const passAdjustment = Math.floor(Math.random() * 50);

      updateStmt.run(unixTimestamp, failAdjustment, passAdjustment, record.id);
      updatedCount++;
    });
  }
})();

console.log(`Updated ${updatedCount} records with historical dates`);

// Verify the results
const newStats = db.prepare(`
  SELECT COUNT(*) as total,
         COUNT(DISTINCT DATE(created_at)) as unique_dates,
         MIN(created_at) as min_date,
         MAX(created_at) as max_date
  FROM test_rules_data
`).get();

console.log('New stats:', newStats);

// Sample some dates
const sampleDates = db.prepare(`
  SELECT DATE(created_at) as date, COUNT(*) as count
  FROM test_rules_data
  GROUP BY DATE(created_at)
  ORDER BY date DESC
  LIMIT 10
`).all();

console.log('Sample date distribution (last 10 days):');
console.table(sampleDates);

console.log('Done!');
