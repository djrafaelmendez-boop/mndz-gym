import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api';

const WorkoutContext = createContext(null);

const SESSION_KEY = 'mndz_active_session';

export function WorkoutProvider({ children }) {
    const [activeSession, setActiveSession] = useState(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    // Restore session from localStorage on mount / app resume
    const restoreSession = useCallback(async () => {
        const stored = localStorage.getItem(SESSION_KEY);
        if (stored) {
            try {
                const session = JSON.parse(stored);
                // Validate the session is still valid by checking with the server
                if (session?.id) {
                    try {
                        await api.getWorkout(session.id);
                        // Session exists on server, restore it
                        setActiveSession(session);
                        const startTime = new Date(session.startedAt).getTime();
                        const elapsed = Math.floor((Date.now() - startTime) / 1000);
                        setElapsedSeconds(elapsed);
                    } catch {
                        // Session no longer exists on server, clean up
                        console.warn('Stale workout session cleared');
                        localStorage.removeItem(SESSION_KEY);
                        setActiveSession(null);
                        setElapsedSeconds(0);
                    }
                } else {
                    // Invalid session data
                    localStorage.removeItem(SESSION_KEY);
                }
            } catch {
                localStorage.removeItem(SESSION_KEY);
            }
        }
    }, []);

    useEffect(() => {
        restoreSession();

        const handleVisibility = () => {
            if (document.visibilityState === 'visible') {
                restoreSession();
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, [restoreSession]);

    // Timer interval
    useEffect(() => {
        if (!activeSession) return;

        const tick = () => {
            const startTime = new Date(activeSession.startedAt).getTime();
            setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
        };

        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [activeSession]);

    const startSession = async ({ scheduledRoutineId, routineId, routineName }) => {
        // Clear any stale session first
        localStorage.removeItem(SESSION_KEY);
        setActiveSession(null);

        const res = await api.startWorkout({ scheduledRoutineId, routineId });

        if (!res?.sessionId) {
            throw new Error('Server did not return a session ID');
        }

        const session = {
            id: res.sessionId,
            routineId,
            routineName,
            scheduledRoutineId,
            startedAt: new Date().toISOString(),
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        setActiveSession(session);
        setElapsedSeconds(0);
        return session;
    };

    const completeSession = async (sessionId) => {
        const idToComplete = sessionId || activeSession?.id;
        if (!idToComplete) return;
        try {
            const res = await api.completeWorkout(idToComplete);
            return res;
        } finally {
            localStorage.removeItem(SESSION_KEY);
            setActiveSession(null);
            setElapsedSeconds(0);
        }
    };

    const clearSession = () => {
        localStorage.removeItem(SESSION_KEY);
        setActiveSession(null);
        setElapsedSeconds(0);
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    return (
        <WorkoutContext.Provider value={{
            activeSession,
            elapsedSeconds,
            formattedTime: formatTime(elapsedSeconds),
            startSession,
            completeSession,
            clearSession,
        }}>
            {children}
        </WorkoutContext.Provider>
    );
}

export function useWorkout() {
    return useContext(WorkoutContext);
}
