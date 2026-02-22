import { useState, useEffect } from 'react';
import { api } from '../api';

const COLORS = {
    primary: '#DFFF00',
    bgDark: '#0D0D0D',
    surfaceDark: '#161616',
    textSecondary: '#A1A1A1',
    borderDark: '#1F2937',
};

export default function ExerciseHistory({ onBack, exercise }) {
    const [tab, setTab] = useState('all'); // 'all' | 'max'
    const [history, setHistory] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!exercise?.id) return;
        setLoading(true);
        api.getExerciseHistory(exercise.id)
            .then(data => setHistory(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [exercise?.id]);

    const isBodyweight = (history?.equipment || exercise?.equipment || '').toLowerCase() === 'bodyweight';
    const sessions = history?.sessions || [];

    // ── Compute global max for highlighting ──
    let globalMaxLbs = 0;
    let globalMaxReps = 0;

    for (const s of sessions) {
        for (const set of s.sets) {
            if (!isBodyweight && set.weight > globalMaxLbs) globalMaxLbs = set.weight;
            if (set.reps > globalMaxReps) globalMaxReps = set.reps;
        }
    }

    // ── MAX SETS tab: filter to only sessions containing the max value ──
    const maxSessions = (() => {
        if (isBodyweight) {
            // Show sessions that contain the max reps
            return sessions.filter(s => s.sets.some(set => set.reps === globalMaxReps));
        } else {
            // Show sessions that contain the max weight
            return sessions.filter(s => s.sets.some(set => set.weight === globalMaxLbs));
        }
    })();

    const displaySessions = tab === 'all' ? sessions : maxSessions;

    // Format date string from ISO → "MMM DD, YYYY"
    const formatDate = (dateStr) => {
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            }).toUpperCase();
        } catch {
            return dateStr;
        }
    };

    const exerciseName = (history?.exerciseName || exercise?.name || '').toUpperCase();

    return (
        <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            background: `linear-gradient(to bottom, #1C1C1C 0%, #111111 30%, ${COLORS.bgDark} 100%)`,
            fontFamily: 'Inter, sans-serif',
        }}>
            {/* ── Header ── */}
            <header style={{
                flexShrink: 0,
                padding: '48px 24px 16px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                background: 'transparent',
                zIndex: 10,
            }}>
                <button onClick={onBack} style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    marginLeft: '-8px',
                    borderRadius: '50%',
                }}>
                    <span className="material-symbols-outlined" style={{ color: '#9CA3AF', fontSize: '24px' }}>arrow_back</span>
                </button>
                <div>
                    <h1 style={{
                        fontSize: '22px',
                        fontWeight: 900,
                        fontStyle: 'italic',
                        textTransform: 'uppercase',
                        letterSpacing: '-0.04em',
                        color: '#fff',
                        lineHeight: 1.1,
                        margin: 0,
                    }}>
                        History: {exerciseName}
                    </h1>
                    <p style={{
                        fontSize: '12px',
                        color: COLORS.primary,
                        letterSpacing: '0.08em',
                        fontWeight: 700,
                        marginTop: '4px',
                    }}>
                        FULL PERFORMANCE LOG
                    </p>
                </div>
            </header>

            {/* ── Segmented Tab Bar ── */}
            <div style={{
                padding: '0 24px',
                marginBottom: '20px',
            }}>
                <div style={{
                    display: 'flex',
                    background: COLORS.surfaceDark,
                    borderRadius: '12px',
                    border: `1px solid ${COLORS.borderDark}`,
                    padding: '4px',
                }}>
                    {[
                        { key: 'all', label: 'ALL SETS' },
                        { key: 'max', label: 'MAX SETS' },
                    ].map(t => {
                        const isActive = tab === t.key;
                        return (
                            <button
                                key={t.key}
                                onClick={() => setTab(t.key)}
                                style={{
                                    flex: 1,
                                    padding: '10px 0',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: isActive ? COLORS.primary : 'transparent',
                                    color: isActive ? '#000' : '#9CA3AF',
                                    fontWeight: 900,
                                    fontStyle: 'italic',
                                    fontSize: '13px',
                                    letterSpacing: '0.04em',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                            >
                                {t.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Content ── */}
            <main style={{
                flex: 1,
                overflowY: 'auto',
                padding: '0 24px 40px 24px',
            }}>
                {loading ? (
                    <p style={{ color: '#555', textAlign: 'center', marginTop: '32px' }}>Loading history...</p>
                ) : displaySessions.length === 0 ? (
                    <div style={{ textAlign: 'center', marginTop: '48px', color: '#555' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>
                            history
                        </span>
                        <p style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: '#777' }}>
                            No History Yet
                        </p>
                        <p style={{ fontSize: '13px' }}>
                            Complete workouts with this exercise to see data here
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {displaySessions.map((session, sIdx) => {
                            // For the top card (first session), give it the lime border glow
                            const isTop = sIdx === 0;

                            return (
                                <SessionCard
                                    key={sIdx}
                                    session={session}
                                    isTop={isTop}
                                    isBodyweight={isBodyweight}
                                    globalMaxLbs={globalMaxLbs}
                                    globalMaxReps={globalMaxReps}
                                    formatDate={formatDate}
                                    tab={tab}
                                />
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Session Date Card
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function SessionCard({ session, isTop, isBodyweight, globalMaxLbs, globalMaxReps, formatDate, tab }) {
    // In the "all" tab, highlight the max values per this session
    // In the "max" tab, highlight the global max values
    const highlightLbs = (weight) => {
        if (isBodyweight) return false;
        if (tab === 'max') return weight === globalMaxLbs;
        // In ALL SETS, highlight the highest weight in THIS session
        const maxInSession = Math.max(...session.sets.map(s => s.weight || 0));
        return weight === maxInSession && weight > 0;
    };

    const highlightReps = (reps) => {
        if (!isBodyweight && tab === 'all') return false; // weighted ALL SETS: don't highlight reps
        if (tab === 'max') return reps === globalMaxReps;
        // In bodyweight ALL SETS → highlight highest reps in session
        const maxRepsInSession = Math.max(...session.sets.map(s => s.reps || 0));
        return reps === maxRepsInSession && reps > 0;
    };

    return (
        <div style={{
            background: isTop
                ? 'linear-gradient(135deg, rgba(223,255,0,0.15) 0%, rgba(223,255,0,0.03) 50%, transparent 100%)'
                : '#161616',
            border: isTop
                ? '1px solid rgba(223,255,0,0.4)'
                : '1px solid #1F2937',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: isTop ? '0 0 20px rgba(223,255,0,0.08)' : 'none',
        }}>
            {/* Date Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '20px',
            }}>
                <span className="material-symbols-outlined" style={{
                    fontSize: '20px',
                    color: '#6B7280',
                }}>calendar_today</span>
                <span style={{
                    fontSize: '15px',
                    fontWeight: 900,
                    fontStyle: 'italic',
                    color: '#fff',
                    letterSpacing: '0.02em',
                }}>
                    {formatDate(session.date)}
                </span>
            </div>

            {/* Column Headers */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '12px',
                paddingLeft: '4px',
            }}>
                <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#6B7280',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                }}>LBS</span>
                <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#6B7280',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                }}>REPS</span>
            </div>

            {/* Set Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {session.sets.map((set, i) => {
                    const lbsHighlight = highlightLbs(set.weight);
                    const repsHighlight = highlightReps(set.reps);

                    return (
                        <div key={i} style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '16px',
                            paddingLeft: '4px',
                            padding: '4px 4px',
                        }}>
                            <span style={{
                                fontSize: '18px',
                                fontWeight: 700,
                                color: isBodyweight
                                    ? '#6B7280'
                                    : (lbsHighlight ? '#DFFF00' : '#D1D5DB'),
                                fontFamily: 'Inter, sans-serif',
                            }}>
                                {isBodyweight || (!set.weight && set.weight !== 0) ? '—' : set.weight}
                            </span>
                            <span style={{
                                fontSize: '18px',
                                fontWeight: 700,
                                color: repsHighlight ? '#DFFF00' : '#D1D5DB',
                                fontFamily: 'Inter, sans-serif',
                            }}>
                                {set.reps}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
