import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';
import DEFAULT_EXERCISES from './defaultExercises.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH || path.join(__dirname, 'mndz.db');

let sqliteDb;
let pgPool;
let isPostgres = false;

// Initialize Database Function
export async function initDatabase() {
  if (process.env.DATABASE_URL) {
    // --- PostgreSQL Mode (Cloud) ---
    console.log('🔌 Connecting to PostgreSQL...');
    isPostgres = true;
    pgPool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false } // Required for Render/Heroku
    });

    try {
      await pgPool.query('SELECT 1');
      console.log('✅ Connected to PostgreSQL');
      await initTablesPostgres();
    } catch (err) {
      console.error('❌ PostgreSQL Connection Failed:', err);
      process.exit(1);
    }
  } else {
    // --- SQLite Mode (Local) ---
    console.log('📂 Using Local SQLite Database');
    isPostgres = false;
    const SQL = await initSqlJs();

    if (fs.existsSync(dbPath)) {
      const buffer = fs.readFileSync(dbPath);
      sqliteDb = new SQL.Database(buffer);
    } else {
      sqliteDb = new SQL.Database();
    }
    await initTablesSqlite();

    // Migrations for existing DB
    // Use individual try-catch blocks so one existing column doesn't stop others
    try { sqliteDb.exec('ALTER TABLE users ADD COLUMN firstName TEXT DEFAULT NULL'); } catch (e) { }
    try { sqliteDb.exec('ALTER TABLE users ADD COLUMN lastName TEXT DEFAULT NULL'); } catch (e) { }
    try { sqliteDb.exec('ALTER TABLE users ADD COLUMN notificationsEnabled INTEGER DEFAULT 1'); } catch (e) { }
    try { sqliteDb.exec("ALTER TABLE users ADD COLUMN preferredUnits TEXT DEFAULT 'lbs'"); } catch (e) { }
    console.log('✅ Applied user table migrations');
    saveDatabase();
  }
}

// -----------------------------------------------------------------------------
// TABLE INITIALIZATION
// -----------------------------------------------------------------------------

async function initTablesSqlite() {
  const schema = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      passwordHash TEXT NOT NULL,
      profilePicture TEXT DEFAULT NULL,
      firstName TEXT DEFAULT NULL,
      lastName TEXT DEFAULT NULL,
      notificationsEnabled INTEGER DEFAULT 1,
      preferredUnits TEXT DEFAULT 'lbs',
      createdAt TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      muscleGroup TEXT NOT NULL,
      equipment TEXT DEFAULT 'Bodyweight',
      isCustom INTEGER DEFAULT 0,
      userId INTEGER DEFAULT NULL,
      notes TEXT DEFAULT '',
      createdAt TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS routines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      name TEXT NOT NULL,
      primaryMuscles TEXT DEFAULT '',
      difficulty TEXT DEFAULT 'Intermediate',
      estimatedMinutes INTEGER DEFAULT 45,
      createdAt TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS routine_exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      routineId INTEGER NOT NULL,
      exerciseId INTEGER NOT NULL,
      sortOrder INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS planned_sets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      routineExerciseId INTEGER NOT NULL,
      setNumber INTEGER NOT NULL,
      plannedWeight REAL DEFAULT 0,
      plannedReps INTEGER DEFAULT 10,
      plannedRepsMax INTEGER DEFAULT NULL
    );
    CREATE TABLE IF NOT EXISTS scheduled_routines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      routineId INTEGER NOT NULL,
      date TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      createdAt TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS workout_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      scheduledRoutineId INTEGER DEFAULT NULL,
      routineId INTEGER NOT NULL,
      startedAt TEXT DEFAULT (datetime('now')),
      completedAt TEXT DEFAULT NULL,
      durationSeconds INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS set_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workoutSessionId INTEGER NOT NULL,
      routineExerciseId INTEGER NOT NULL,
      setNumber INTEGER NOT NULL,
      weight REAL DEFAULT 0,
      reps INTEGER DEFAULT 0,
      completed INTEGER DEFAULT 0,
      completedAt TEXT DEFAULT NULL
    );
    CREATE TABLE IF NOT EXISTS body_weight_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      weight REAL NOT NULL,
      date TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS steps_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      steps INTEGER NOT NULL,
      date TEXT NOT NULL
    );
  `;
  sqliteDb.run(schema);
  await seedDefaultsSqlite();
}

async function initTablesPostgres() {
  // Postgres schema - slight differences in syntax (SERIAL instead of AUTOINCREMENT, etc)
  const schema = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      passwordHash TEXT NOT NULL,
      profilePicture TEXT DEFAULT NULL,
      "firstName" TEXT DEFAULT NULL,
      "lastName" TEXT DEFAULT NULL,
      "notificationsEnabled" INTEGER DEFAULT 1,
      "preferredUnits" TEXT DEFAULT 'lbs',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS exercises (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      muscleGroup TEXT NOT NULL,
      equipment TEXT DEFAULT 'Bodyweight',
      isCustom INTEGER DEFAULT 0,
      userId INTEGER DEFAULT NULL,
      notes TEXT DEFAULT '',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS routines (
      id SERIAL PRIMARY KEY,
      userId INTEGER NOT NULL,
      name TEXT NOT NULL,
      primaryMuscles TEXT DEFAULT '',
      difficulty TEXT DEFAULT 'Intermediate',
      estimatedMinutes INTEGER DEFAULT 45,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS routine_exercises (
      id SERIAL PRIMARY KEY,
      routineId INTEGER NOT NULL,
      exerciseId INTEGER NOT NULL,
      sortOrder INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS planned_sets (
      id SERIAL PRIMARY KEY,
      routineExerciseId INTEGER NOT NULL,
      setNumber INTEGER NOT NULL,
      plannedWeight REAL DEFAULT 0,
      plannedReps INTEGER DEFAULT 10,
      plannedRepsMax INTEGER DEFAULT NULL
    );
    CREATE TABLE IF NOT EXISTS scheduled_routines (
      id SERIAL PRIMARY KEY,
      userId INTEGER NOT NULL,
      routineId INTEGER NOT NULL,
      date TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS workout_sessions (
      id SERIAL PRIMARY KEY,
      userId INTEGER NOT NULL,
      scheduledRoutineId INTEGER DEFAULT NULL,
      routineId INTEGER NOT NULL,
      startedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      completedAt TIMESTAMP DEFAULT NULL,
      durationSeconds INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS set_logs (
      id SERIAL PRIMARY KEY,
      workoutSessionId INTEGER NOT NULL,
      routineExerciseId INTEGER NOT NULL,
      setNumber INTEGER NOT NULL,
      weight REAL DEFAULT 0,
      reps INTEGER DEFAULT 0,
      completed INTEGER DEFAULT 0,
      completedAt TIMESTAMP DEFAULT NULL
    );
    CREATE TABLE IF NOT EXISTS body_weight_logs (
      id SERIAL PRIMARY KEY,
      userId INTEGER NOT NULL,
      weight REAL NOT NULL,
      date TEXT NOT NULL
    );
     CREATE TABLE IF NOT EXISTS steps_logs (
      id SERIAL PRIMARY KEY,
      userId INTEGER NOT NULL,
      steps INTEGER NOT NULL,
      date TEXT NOT NULL
    );
  `;
  await pgPool.query(schema);

  try {
    await pgPool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS "firstName" TEXT DEFAULT NULL');
    await pgPool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS "lastName" TEXT DEFAULT NULL');
    await pgPool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS "notificationsEnabled" INTEGER DEFAULT 1');
    await pgPool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS \"preferredUnits\" TEXT DEFAULT 'lbs'");
    console.log('✅ Applied user table migrations (Postgres)');
  } catch (e) { }

  await seedDefaultsPostgres();
}

// -----------------------------------------------------------------------------
// SEEDING
// -----------------------------------------------------------------------------

// DEFAULT_EXERCISES is imported from ./defaultExercises.js
const DEFAULT_EXERCISE_COUNT = DEFAULT_EXERCISES.length;

async function seedDefaultsSqlite() {
  const result = sqliteDb.exec('SELECT COUNT(*) as c FROM exercises WHERE isCustom = 0 AND userId IS NULL');
  const count = result[0]?.values[0]?.[0] || 0;
  if (count !== DEFAULT_EXERCISE_COUNT) {
    // Remove old global defaults and re-seed with the full library
    sqliteDb.run('DELETE FROM exercises WHERE isCustom = 0 AND userId IS NULL');
    const stmt = sqliteDb.prepare('INSERT INTO exercises (name, muscleGroup, equipment, isCustom) VALUES (?, ?, ?, 0)');
    for (const [name, muscle, equip] of DEFAULT_EXERCISES) {
      stmt.run([name, muscle, equip]);
    }
    stmt.free();
    saveDatabase();
    console.log(`Seeded ${DEFAULT_EXERCISE_COUNT} default exercises`);
  }
}

async function seedDefaultsPostgres() {
  const res = await pgPool.query('SELECT COUNT(*) as c FROM exercises WHERE "isCustom" = 0 AND "userId" IS NULL');
  const count = parseInt(res.rows[0].c);
  if (count !== DEFAULT_EXERCISE_COUNT) {
    // Remove old global defaults and re-seed with the full library
    await pgPool.query('DELETE FROM exercises WHERE "isCustom" = 0 AND "userId" IS NULL');
    for (const [name, muscle, equip] of DEFAULT_EXERCISES) {
      await pgPool.query(
        'INSERT INTO exercises (name, "muscleGroup", equipment, "isCustom") VALUES ($1, $2, $3, 0)',
        [name, muscle, equip]
      );
    }
    console.log(`Seeded ${DEFAULT_EXERCISE_COUNT} default exercises (Postgres)`);
  }
}

export function saveDatabase() {
  if (isPostgres || !sqliteDb) return;
  const data = sqliteDb.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

// -----------------------------------------------------------------------------
// UNIFIED DATABASE API
// -----------------------------------------------------------------------------

// Wrapper for RUN (Insert, Update, Delete)
// Returns { lastInsertRowid }
export function dbRun(sql, params = []) {
  if (isPostgres) {
    // Postgres doesn't block, so we really should await this.
    // However, existing code might call dbRun synchronously in some logical flows 
    // (though in index.js they seem to mostly use it inside API handlers).
    // CRITICAL: We need to change the API architecture to Async if we want smooth PG integration.
    // But to respect the synchronous-looking wrapper signature, we have to return a Promise 
    // and hope the caller awaits it or doesn't depend on immediate result strictly.
    // WAIT: The existing code calls `dbRun` inside async routes but often without `await` 
    // or sometimes treats it as sync. 
    // ACTUALLY: `sql.js` `db.run` IS synchronous. `pg` is ASYNC.
    // This is a major refactor. We MUST make all db calls async in index.js for this to work with Postgres.
    // CHECK index.js: `const result = dbRun(...)`. `api.post(...)`.
    // We will start by returning a PROMISE here, and then we MUST update index.js to await these calls.

    // Convert ? to $1, $2 for Postgres
    let paramCount = 1;
    const pgSql = sql.replace(/\?/g, () => `$${paramCount++}`);

    // Handle RETURNING id for Insert
    const isInsert = /insert/i.test(sql);
    const finalSql = isInsert ? `${pgSql} RETURNING id` : pgSql;

    return pgPool.query(finalSql, params).then(res => {
      if (isInsert && res.rows.length > 0) {
        return { lastInsertRowid: res.rows[0].id };
      }
      return { lastInsertRowid: 0 };
    });
  } else {
    // SQLite Sync
    sqliteDb.run(sql, params);
    const lastInsertRowid = sqliteDb.exec('SELECT last_insert_rowid()')[0]?.values[0]?.[0];
    saveDatabase();
    // Return a promise-like object or value? 
    // To enable async migration, we return a resolved promise for SQLite too.
    return Promise.resolve({ lastInsertRowid });
  }
}

// Wrapper for GET (Select One)
export function dbGet(sql, params = []) {
  if (isPostgres) {
    let paramCount = 1;
    const pgSql = sql.replace(/\?/g, () => `$${paramCount++}`);
    return pgPool.query(pgSql, params).then(res => res.rows[0]);
  } else {
    const stmt = sqliteDb.prepare(sql);
    stmt.bind(params);
    let row = null;
    if (stmt.step()) {
      const cols = stmt.getColumnNames();
      const vals = stmt.get();
      row = {};
      cols.forEach((col, i) => { row[col] = vals[i]; });
    }
    stmt.free();
    return Promise.resolve(row);
  }
}

// Wrapper for ALL (Select Many)
export function dbAll(sql, params = []) {
  if (isPostgres) {
    let paramCount = 1;
    const pgSql = sql.replace(/\?/g, () => `$${paramCount++}`);
    return pgPool.query(pgSql, params).then(res => res.rows);
  } else {
    const stmt = sqliteDb.prepare(sql);
    stmt.bind(params);
    const rows = [];
    const cols = stmt.getColumnNames();
    while (stmt.step()) {
      const vals = stmt.get();
      const row = {};
      cols.forEach((col, i) => { row[col] = vals[i]; });
      rows.push(row);
    }
    stmt.free();
    return Promise.resolve(rows);
  }
}

export function getDb() {
  return isPostgres ? pgPool : sqliteDb;
}
