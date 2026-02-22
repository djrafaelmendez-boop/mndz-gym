const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function apiFetch(path, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Add timeout to prevent infinite hangs
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
        const res = await fetch(`${API_BASE}${path}`, {
            ...options,
            headers,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Request failed' }));
            throw new Error(err.error || `Request failed (${res.status})`);
        }

        return res.json();
    } catch (err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
            throw new Error('Request timed out. Check your connection.');
        }
        throw err;
    }
}

export const api = {
    // Exercises
    getExercises: (params = {}) => {
        const q = new URLSearchParams(params).toString();
        return apiFetch(`/exercises?${q}`);
    },
    createExercise: (data) => apiFetch('/exercises', { method: 'POST', body: JSON.stringify(data) }),
    deleteExercise: (id) => apiFetch(`/exercises/${id}`, { method: 'DELETE' }),
    getExerciseHistory: (id) => apiFetch(`/exercises/${id}/history`),

    // Routines
    getRoutines: () => apiFetch('/routines'),
    createRoutine: (data) => apiFetch('/routines', { method: 'POST', body: JSON.stringify(data) }),
    updateRoutine: (id, data) => apiFetch(`/routines/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteRoutine: (id) => apiFetch(`/routines/${id}`, { method: 'DELETE' }),

    // Schedule
    getSchedule: (startDate, endDate) =>
        apiFetch(`/schedule?startDate=${startDate}&endDate=${endDate}`),
    addToSchedule: (data) => apiFetch('/schedule', { method: 'POST', body: JSON.stringify(data) }),
    removeFromSchedule: (id) => apiFetch(`/schedule/${id}`, { method: 'DELETE' }),

    // Workout
    startWorkout: (data) => apiFetch('/workout/start', { method: 'POST', body: JSON.stringify(data) }),
    getWorkout: (id) => apiFetch(`/workout/${id}`),
    logSet: (sessionId, data) => apiFetch(`/workout/${sessionId}/log-set`, { method: 'PUT', body: JSON.stringify(data) }),
    completeWorkout: (id) => apiFetch(`/workout/${id}/complete`, { method: 'PUT' }),

    // Progress
    getWeightLogs: () => apiFetch('/progress/weight'),
    addWeightLog: (data) => apiFetch('/progress/weight', { method: 'POST', body: JSON.stringify(data) }),
    getStepsLogs: () => apiFetch('/progress/steps'),
    addStepsLog: (data) => apiFetch('/progress/steps', { method: 'POST', body: JSON.stringify(data) }),

    // Profile
    getProfile: () => apiFetch('/profile'),
};
