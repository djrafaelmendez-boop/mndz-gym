import express from 'express';
import cors from 'cors';
import { initDatabase, dbRun, dbGet, dbAll, saveDatabase } from './database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'mndz_fallback_secret_39148';

// ─── Authentication Middleware ───
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
        req.userId = user.id;
        next();
    });
}

// ═══════════════════════════════════════════════
// AUTHENTICATION ROUTES
// ═══════════════════════════════════════════════

app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        // Check if user exists
        const existing = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
        if (existing) {
            return res.status(400).json({ error: 'Email is already taken.' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const result = await dbRun(
            'INSERT INTO users (username, email, passwordHash) VALUES (?, ?, ?)',
            [username, email, passwordHash]
        );

        const newUserId = result.lastInsertRowid;

        // Automatically migrate old "User 1" data if this is the very first registered user.
        // This is a convenience for the user's existing data since previously everything was under userId 1.
        const userCount = await dbGet('SELECT COUNT(*) as count FROM users');
        if (userCount.count === 1 && newUserId === 1) {
            // First user ever created gets all the existing orphan data (since it was previously mocked as user 1)
            console.log("First user registered! Existing routines/exercises will be owned by User 1.");
        }

        const token = jwt.sign({ id: newUserId, email }, JWT_SECRET, { expiresIn: '30d' });

        saveDatabase();
        res.status(201).json({ token, user: { id: newUserId, username, email } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);

        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password.' });
        }

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid email or password.' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
        res.json({ token, user: { id: user.id, username: user.username, email: user.email, profilePicture: user.profilePicture } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/me', authenticateToken, async (req, res) => {
    try {
        const user = await dbGet('SELECT id, username, email, profilePicture, createdAt FROM users WHERE id = ?', [req.userId]);
        if (!user) return res.status(404).json({ error: 'User not found.' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ═══════════════════════════════════════════════
// EXERCISES ROUTES
// ═══════════════════════════════════════════════

app.get('/api/exercises', authenticateToken, async (req, res) => {
    try {
        const { muscleGroup, search } = req.query;
        let query = 'SELECT * FROM exercises WHERE (isCustom = 0 OR userId = ?)';
        const params = [req.userId];

        if (muscleGroup && muscleGroup !== 'all') {
            if (muscleGroup.toLowerCase() === 'arms') {
                query += " AND muscleGroup IN ('arms', 'biceps', 'triceps')";
            } else {
                query += ' AND muscleGroup = ?';
                params.push(muscleGroup);
            }
        }
        if (search) {
            query += ' AND LOWER(name) LIKE LOWER(?)';
            params.push(`%${search}%`);
        }
        query += ' ORDER BY name ASC';
        const exercises = await dbAll(query, params);
        res.json(exercises);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/exercises', authenticateToken, async (req, res) => {
    try {
        const { name, muscleGroup, equipment, notes } = req.body;
        const result = await dbRun(
            'INSERT INTO exercises (name, muscleGroup, equipment, isCustom, userId, notes) VALUES (?, ?, ?, 1, ?, ?)',
            [name, muscleGroup, equipment || 'Bodyweight', req.userId, notes || '']
        );
        const exercise = await dbGet('SELECT * FROM exercises WHERE id = ?', [result.lastInsertRowid]);
        res.json(exercise);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/exercises/:id', authenticateToken, async (req, res) => {
    try {
        await dbRun('DELETE FROM exercises WHERE id = ? AND userId = ? AND isCustom = 1', [req.params.id, req.userId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ═══════════════════════════════════════════════
// ROUTINES ROUTES
// ═══════════════════════════════════════════════

app.get('/api/routines', authenticateToken, async (req, res) => {
    try {
        const routines = await dbAll('SELECT * FROM routines WHERE userId = ? ORDER BY createdAt DESC', [req.userId]);

        const result = await Promise.all(routines.map(async (routine) => {
            const exercises = await dbAll(`
                SELECT re.*, e.name as exerciseName, e.muscleGroup, e.equipment
                FROM routine_exercises re
                JOIN exercises e ON e.id = re.exerciseId
                WHERE re.routineId = ?
                ORDER BY re.sortOrder
            `, [routine.id]);

            const exercisesWithSets = await Promise.all(exercises.map(async (ex) => {
                const sets = await dbAll('SELECT * FROM planned_sets WHERE routineExerciseId = ? ORDER BY setNumber', [ex.id]);
                return { ...ex, sets };
            }));

            return { ...routine, exercises: exercisesWithSets };
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/routines', authenticateToken, async (req, res) => {
    try {
        const { name, primaryMuscles, difficulty, estimatedMinutes, exercises } = req.body;

        const result = await dbRun(
            'INSERT INTO routines (userId, name, primaryMuscles, difficulty, estimatedMinutes) VALUES (?, ?, ?, ?, ?)',
            [req.userId, name, primaryMuscles || '', difficulty || 'Intermediate', estimatedMinutes || 45]
        );
        const routineId = result.lastInsertRowid;

        if (exercises && exercises.length > 0) {
            for (let i = 0; i < exercises.length; i++) {
                const ex = exercises[i];
                const reResult = await dbRun(
                    'INSERT INTO routine_exercises (routineId, exerciseId, sortOrder) VALUES (?, ?, ?)',
                    [routineId, ex.exerciseId, i]
                );
                const reId = reResult.lastInsertRowid;
                if (ex.sets && ex.sets.length > 0) {
                    for (const set of ex.sets) {
                        await dbRun(
                            'INSERT INTO planned_sets (routineExerciseId, setNumber, plannedWeight, plannedReps, plannedRepsMax) VALUES (?, ?, ?, ?, ?)',
                            [reId, set.setNumber, set.plannedWeight || 0, set.plannedReps || 10, set.plannedRepsMax || null]
                        );
                    }
                }
            }
        }

        const routine = await dbGet('SELECT * FROM routines WHERE id = ?', [routineId]);
        res.json(routine);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/routines/:id', authenticateToken, async (req, res) => {
    try {
        const { name, primaryMuscles, difficulty, estimatedMinutes, exercises } = req.body;
        const routineId = parseInt(req.params.id);

        await dbRun(
            'UPDATE routines SET name = ?, primaryMuscles = ?, difficulty = ?, estimatedMinutes = ? WHERE id = ? AND userId = ?',
            [name, primaryMuscles || '', difficulty || 'Intermediate', estimatedMinutes || 45, routineId, req.userId]
        );

        // Delete old exercises and sets
        const oldExercises = await dbAll('SELECT id FROM routine_exercises WHERE routineId = ?', [routineId]);
        for (const oe of oldExercises) {
            await dbRun('DELETE FROM planned_sets WHERE routineExerciseId = ?', [oe.id]);
        }
        await dbRun('DELETE FROM routine_exercises WHERE routineId = ?', [routineId]);

        if (exercises && exercises.length > 0) {
            for (let i = 0; i < exercises.length; i++) {
                const ex = exercises[i];
                const reResult = await dbRun(
                    'INSERT INTO routine_exercises (routineId, exerciseId, sortOrder) VALUES (?, ?, ?)',
                    [routineId, ex.exerciseId, i]
                );
                const reId = reResult.lastInsertRowid;
                if (ex.sets && ex.sets.length > 0) {
                    for (const set of ex.sets) {
                        await dbRun(
                            'INSERT INTO planned_sets (routineExerciseId, setNumber, plannedWeight, plannedReps, plannedRepsMax) VALUES (?, ?, ?, ?, ?)',
                            [reId, set.setNumber, set.plannedWeight || 0, set.plannedReps || 10, set.plannedRepsMax || null]
                        );
                    }
                }
            }
        }

        saveDatabase();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/routines/:id', authenticateToken, async (req, res) => {
    try {
        const exercises = await dbAll('SELECT id FROM routine_exercises WHERE routineId = ?', [req.params.id]);
        for (const ex of exercises) {
            await dbRun('DELETE FROM planned_sets WHERE routineExerciseId = ?', [ex.id]);
        }
        await dbRun('DELETE FROM routine_exercises WHERE routineId = ?', [req.params.id]);
        await dbRun('DELETE FROM routines WHERE id = ? AND userId = ?', [req.params.id, req.userId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ═══════════════════════════════════════════════
// SCHEDULE ROUTES
// ═══════════════════════════════════════════════

app.get('/api/schedule', authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let query = `
            SELECT sr.*, r.name as routineName, r.primaryMuscles, r.difficulty, r.estimatedMinutes, ws.id as workoutSessionId
            FROM scheduled_routines sr
            JOIN routines r ON r.id = sr.routineId
            LEFT JOIN workout_sessions ws ON ws.scheduledRoutineId = sr.id
            WHERE sr.userId = ?
        `;
        const params = [req.userId];

        if (startDate && endDate) {
            query += ' AND sr.date BETWEEN ? AND ?';
            params.push(startDate, endDate);
        }
        query += ' ORDER BY sr.date, sr.id';

        const schedules = await dbAll(query, params);

        const result = await Promise.all(schedules.map(async (sr) => {
            const exercises = await dbAll(`
                SELECT re.id, e.name as exerciseName, e.muscleGroup
                FROM routine_exercises re
                JOIN exercises e ON e.id = re.exerciseId
                WHERE re.routineId = ?
                ORDER BY re.sortOrder
            `, [sr.routineId]);

            const exercisesWithSets = await Promise.all(exercises.map(async (ex) => {
                const setCountRow = await dbGet('SELECT COUNT(*) as c FROM planned_sets WHERE routineExerciseId = ?', [ex.id]);
                const firstSet = await dbGet('SELECT plannedReps FROM planned_sets WHERE routineExerciseId = ? ORDER BY setNumber LIMIT 1', [ex.id]);
                return { ...ex, setCount: setCountRow?.c || 0, reps: firstSet?.plannedReps || 0 };
            }));

            return { ...sr, exercises: exercisesWithSets };
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/schedule', authenticateToken, async (req, res) => {
    try {
        const { routineId, date } = req.body;
        const result = await dbRun(
            'INSERT INTO scheduled_routines (userId, routineId, date) VALUES (?, ?, ?)',
            [req.userId, routineId, date]
        );
        res.json({ id: result.lastInsertRowid });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/schedule/:id', authenticateToken, async (req, res) => {
    try {
        await dbRun('DELETE FROM scheduled_routines WHERE id = ? AND userId = ?', [req.params.id, req.userId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ═══════════════════════════════════════════════
// WORKOUT ROUTES
// ═══════════════════════════════════════════════

app.post('/api/workout/start', authenticateToken, async (req, res) => {
    try {
        const { scheduledRoutineId, routineId } = req.body;

        if (!routineId) {
            return res.status(400).json({ error: 'routineId is required' });
        }

        const result = await dbRun(
            'INSERT INTO workout_sessions (userId, scheduledRoutineId, routineId) VALUES (?, ?, ?)',
            [req.userId, scheduledRoutineId || null, routineId]
        );

        const sessionId = result.lastInsertRowid;
        console.log(`[workout/start] Created session ${sessionId} for routine ${routineId}`);

        if (!sessionId) {
            return res.status(500).json({ error: 'Failed to create workout session' });
        }

        if (scheduledRoutineId) {
            await dbRun('UPDATE scheduled_routines SET status = ? WHERE id = ?', ['in_progress', scheduledRoutineId]);
        }

        // Pre-populate set_logs from planned_sets
        const routineExercises = await dbAll('SELECT * FROM routine_exercises WHERE routineId = ? ORDER BY sortOrder', [routineId]);
        for (const re of routineExercises) {
            const plannedSets = await dbAll('SELECT * FROM planned_sets WHERE routineExerciseId = ? ORDER BY setNumber', [re.id]);
            for (const ps of plannedSets) {
                await dbRun(
                    'INSERT INTO set_logs (workoutSessionId, routineExerciseId, setNumber, weight, reps, completed) VALUES (?, ?, ?, ?, ?, 0)',
                    [sessionId, re.id, ps.setNumber, ps.plannedWeight, ps.plannedReps]
                );
            }
        }

        saveDatabase();
        res.json({ sessionId });
    } catch (err) {
        console.error('[workout/start] Error:', err);
        res.status(500).json({ error: err.message || 'Failed to start workout' });
    }
});

app.get('/api/workout/:id', authenticateToken, async (req, res) => {
    try {
        const session = await dbGet('SELECT * FROM workout_sessions WHERE id = ? AND userId = ?', [req.params.id, req.userId]);
        if (!session) return res.status(404).json({ error: 'Session not found' });

        const exercises = await dbAll(`
            SELECT re.*, e.name as exerciseName, e.muscleGroup, e.equipment
            FROM routine_exercises re
            JOIN exercises e ON e.id = re.exerciseId
            WHERE re.routineId = ?
            ORDER BY re.sortOrder
        `, [session.routineId]);

        const exercisesWithSets = await Promise.all(exercises.map(async (ex) => {
            const sets = await dbAll(
                'SELECT * FROM set_logs WHERE workoutSessionId = ? AND routineExerciseId = ? ORDER BY setNumber',
                [session.id, ex.id]
            );
            const allComplete = sets.length > 0 && sets.every(s => s.completed);
            return { ...ex, sets, allComplete };
        }));

        const routine = await dbGet('SELECT name FROM routines WHERE id = ?', [session.routineId]);
        res.json({ ...session, routineName: routine?.name, exercises: exercisesWithSets });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/workout/:id/log-set', authenticateToken, async (req, res) => {
    try {
        const { setLogId, weight, reps, completed } = req.body;
        await dbRun(
            'UPDATE set_logs SET weight = ?, reps = ?, completed = ?, completedAt = ? WHERE id = ? AND workoutSessionId = ?',
            [weight, reps, completed ? 1 : 0, completed ? new Date().toISOString() : null, setLogId, parseInt(req.params.id)]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/workout/:id/complete', authenticateToken, async (req, res) => {
    try {
        const session = await dbGet('SELECT * FROM workout_sessions WHERE id = ? AND userId = ?', [req.params.id, req.userId]);
        if (!session) return res.status(404).json({ error: 'Session not found' });

        const startTime = new Date(session.startedAt).getTime();
        const duration = Math.floor((Date.now() - startTime) / 1000);

        await dbRun(
            'UPDATE workout_sessions SET completedAt = datetime("now"), durationSeconds = ? WHERE id = ?',
            [duration, parseInt(req.params.id)]
        );

        if (session.scheduledRoutineId) {
            await dbRun('UPDATE scheduled_routines SET status = ? WHERE id = ?', ['completed', session.scheduledRoutineId]);
        }

        saveDatabase();
        res.json({ success: true, durationSeconds: duration });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ═══════════════════════════════════════════════
// EXERCISE HISTORY ROUTE
// ═══════════════════════════════════════════════

app.get('/api/exercises/:id/history', authenticateToken, async (req, res) => {
    try {
        const exerciseId = parseInt(req.params.id);
        const exercise = await dbGet('SELECT * FROM exercises WHERE id = ?', [exerciseId]);
        if (!exercise) return res.status(404).json({ error: 'Exercise not found' });

        const rows = await dbAll(`
            SELECT
                sl.weight,
                sl.reps,
                sl.setNumber,
                ws.startedAt,
                ws.id as sessionId
            FROM set_logs sl
            JOIN routine_exercises re ON re.id = sl.routineExerciseId
            JOIN workout_sessions ws ON ws.id = sl.workoutSessionId
            WHERE re.exerciseId = ?
              AND ws.userId = ?
              AND sl.completed = 1
              AND ws.completedAt IS NOT NULL
            ORDER BY ws.startedAt DESC, sl.setNumber ASC
        `, [exerciseId, req.userId]);

        const sessionsMap = new Map();
        for (const row of rows) {
            const dateStr = row.startedAt ? row.startedAt.split('T')[0] : 'Unknown';
            const key = `${row.sessionId}`;
            if (!sessionsMap.has(key)) {
                sessionsMap.set(key, { date: dateStr, startedAt: row.startedAt, sets: [] });
            }
            sessionsMap.get(key).sets.push({
                setNumber: row.setNumber,
                weight: row.weight,
                reps: row.reps,
            });
        }

        const sessions = Array.from(sessionsMap.values());

        res.json({
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            equipment: exercise.equipment,
            muscleGroup: exercise.muscleGroup,
            sessions,
        });
    } catch (err) {
        console.error('[exercise-history] Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ═══════════════════════════════════════════════
// PROGRESS ROUTES
// ═══════════════════════════════════════════════

app.get('/api/progress/weight', authenticateToken, async (req, res) => {
    try {
        const logs = await dbAll('SELECT * FROM body_weight_logs WHERE userId = ? ORDER BY date DESC', [req.userId]);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/progress/weight', authenticateToken, async (req, res) => {
    try {
        const { weight, date } = req.body;
        const existing = await dbGet('SELECT id FROM body_weight_logs WHERE userId = ? AND date = ?', [req.userId, date]);
        if (existing) {
            await dbRun('UPDATE body_weight_logs SET weight = ? WHERE id = ?', [weight, existing.id]);
        } else {
            await dbRun('INSERT INTO body_weight_logs (userId, weight, date) VALUES (?, ?, ?)', [req.userId, weight, date]);
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/progress/steps', authenticateToken, async (req, res) => {
    try {
        const logs = await dbAll('SELECT * FROM steps_logs WHERE userId = ? ORDER BY date DESC', [req.userId]);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/progress/steps', authenticateToken, async (req, res) => {
    try {
        const { steps, date } = req.body;
        const existing = await dbGet('SELECT id FROM steps_logs WHERE userId = ? AND date = ?', [req.userId, date]);
        if (existing) {
            await dbRun('UPDATE steps_logs SET steps = ? WHERE id = ?', [steps, existing.id]);
        } else {
            await dbRun('INSERT INTO steps_logs (userId, steps, date) VALUES (?, ?, ?)', [req.userId, steps, date]);
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ═══════════════════════════════════════════════
// PROFILE ROUTES (simplified — no auth)
// ═══════════════════════════════════════════════

app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        const workoutCount = await dbGet('SELECT COUNT(*) as c FROM workout_sessions WHERE userId = ? AND completedAt IS NOT NULL', [req.userId]);
        const latestWeight = await dbGet('SELECT weight FROM body_weight_logs WHERE userId = ? ORDER BY date DESC LIMIT 1', [req.userId]);

        const sessions = await dbAll(
            "SELECT DISTINCT date(startedAt) as d FROM workout_sessions WHERE userId = ? AND completedAt IS NOT NULL ORDER BY d DESC",
            [req.userId]
        );

        let streak = 0;
        const today = new Date();
        for (let i = 0; i < sessions.length; i++) {
            const expected = new Date(today);
            expected.setDate(expected.getDate() - i);
            const expStr = expected.toISOString().split('T')[0];
            if (sessions[i]?.d === expStr) {
                streak++;
            } else {
                break;
            }
        }

        res.json({
            username: 'MNDZ',
            workouts: workoutCount?.c || 0,
            streak,
            currentWeight: latestWeight?.weight || null,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ═══════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════

async function start() {
    await initDatabase();

    // Ensure default user exists (userId = 1)
    const existingUser = await dbGet('SELECT id FROM users WHERE id = 1');
    if (!existingUser) {
        await dbRun("INSERT INTO users (username, email, passwordHash) VALUES ('MNDZ', 'local@mndz.app', 'no-auth')");
        saveDatabase();
    }

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`MNDZ API running on http://0.0.0.0:${PORT}`);
    });
}

start();
