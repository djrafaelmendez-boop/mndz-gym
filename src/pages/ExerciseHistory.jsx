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
    const [mainTab, setMainTab] = useState('details'); // 'details' | 'history'
    const [historyTab, setHistoryTab] = useState('all'); // 'all' | 'max'
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
    const exerciseName = (history?.exerciseName || exercise?.name || '').toUpperCase();
    const instructions = history?.instructions || exercise?.instructions || '';
    const imageUrl = history?.imageUrl || exercise?.imageUrl || null;
    const videoUrl = history?.videoUrl || exercise?.videoUrl || null;
    const muscleGroup = (history?.muscleGroup || exercise?.muscleGroup || '').toUpperCase();
    const equipment = history?.equipment || exercise?.equipment || '';

    // ── Compute global max for highlighting ──
    let globalMaxLbs = 0;
    let globalMaxReps = 0;
    for (const s of sessions) {
        for (const set of s.sets) {
            if (!isBodyweight && set.weight > globalMaxLbs) globalMaxLbs = set.weight;
            if (set.reps > globalMaxReps) globalMaxReps = set.reps;
        }
    }

    // ── MAX SETS tab ──
    const maxSessions = (() => {
        if (isBodyweight) {
            return sessions.filter(s => s.sets.some(set => set.reps === globalMaxReps));
        } else {
            return sessions.filter(s => s.sets.some(set => set.weight === globalMaxLbs));
        }
    })();

    const displaySessions = historyTab === 'all' ? sessions : maxSessions;

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
                padding: 'calc(env(safe-area-inset-top) + 16px) 24px 12px 24px',
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
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h1 style={{
                        fontSize: '20px',
                        fontWeight: 900,
                        fontStyle: 'italic',
                        textTransform: 'uppercase',
                        letterSpacing: '-0.04em',
                        lineHeight: 1.1,
                        margin: 0,
                        paddingRight: '4px',
                        background: 'linear-gradient(to right, #ffffff, #888888)',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        color: 'transparent',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}>
                        {exerciseName}
                    </h1>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginTop: '4px',
                    }}>
                        <span style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            color: COLORS.primary,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                        }}>
                            {muscleGroup}
                        </span>
                        {equipment && (
                            <>
                                <span style={{
                                    width: '3px', height: '3px',
                                    borderRadius: '50%', background: '#374151',
                                }} />
                                <span style={{
                                    fontSize: '10px',
                                    fontWeight: 600,
                                    color: '#9CA3AF',
                                    letterSpacing: '0.04em',
                                }}>
                                    {equipment}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* ── Main Tab Bar (Details / History) ── */}
            <div style={{ padding: '0 24px', marginBottom: '16px' }}>
                <div style={{
                    display: 'flex',
                    background: COLORS.surfaceDark,
                    borderRadius: '12px',
                    border: `1px solid ${COLORS.borderDark}`,
                    padding: '4px',
                }}>
                    {[
                        { key: 'details', label: 'DETAILS' },
                        { key: 'history', label: 'HISTORY' },
                    ].map(t => {
                        const isActive = mainTab === t.key;
                        return (
                            <button
                                key={t.key}
                                onClick={() => setMainTab(t.key)}
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

            {/* ── Content Area ── */}
            <main style={{
                flex: 1,
                overflowY: 'auto',
                padding: '0 24px 40px 24px',
            }}>
                {loading ? (
                    <p style={{ color: '#555', textAlign: 'center', marginTop: '32px' }}>Loading...</p>
                ) : mainTab === 'details' ? (
                    <DetailsContent
                        imageUrl={imageUrl}
                        videoUrl={videoUrl}
                        instructions={instructions}
                        exerciseName={exerciseName}
                        muscleGroup={muscleGroup}
                        equipment={equipment}
                    />
                ) : (
                    <HistoryContent
                        sessions={sessions}
                        displaySessions={displaySessions}
                        historyTab={historyTab}
                        setHistoryTab={setHistoryTab}
                        isBodyweight={isBodyweight}
                        globalMaxLbs={globalMaxLbs}
                        globalMaxReps={globalMaxReps}
                        formatDate={formatDate}
                    />
                )}
            </main>
        </div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DETAILS TAB CONTENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function DetailsContent({ imageUrl, videoUrl, instructions, exerciseName, muscleGroup, equipment }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* ── Media Section ── */}
            <div style={{ position: 'relative' }}>
                <div style={{
                    width: '100%',
                    aspectRatio: '16 / 10',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    background: '#1A1A1A',
                    border: '1px solid #1F2937',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={exerciseName}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                        />
                    ) : (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '12px',
                        }}>
                            <span className="material-symbols-outlined" style={{
                                fontSize: '56px',
                                color: '#2A2A2A',
                            }}>fitness_center</span>
                            <span style={{
                                fontSize: '11px',
                                fontWeight: 600,
                                color: '#3A3A3A',
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                            }}>Exercise Photo</span>
                        </div>
                    )}
                </div>

                {/* Video icon button */}
                {videoUrl ? (
                    <button
                        onClick={() => window.open(videoUrl, '_blank')}
                        style={{
                            position: 'absolute',
                            bottom: '12px',
                            right: '12px',
                            width: '44px',
                            height: '44px',
                            borderRadius: '12px',
                            background: 'rgba(223,255,0,0.9)',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            transition: 'all 0.2s',
                        }}
                    >
                        <span className="material-symbols-outlined" style={{
                            fontSize: '22px',
                            color: '#000',
                        }}>play_arrow</span>
                    </button>
                ) : (
                    <div style={{
                        position: 'absolute',
                        bottom: '12px',
                        right: '12px',
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: 'rgba(40,40,40,0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <span className="material-symbols-outlined" style={{
                            fontSize: '22px',
                            color: '#555',
                        }}>play_arrow</span>
                    </div>
                )}
            </div>

            {/* ── How To Section ── */}
            <div style={{
                background: '#161616',
                borderRadius: '16px',
                border: '1px solid #1F2937',
                padding: '20px',
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '16px',
                }}>
                    <span className="material-symbols-outlined" style={{
                        fontSize: '20px',
                        color: '#DFFF00',
                    }}>menu_book</span>
                    <h2 style={{
                        fontSize: '14px',
                        fontWeight: 900,
                        fontStyle: 'italic',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: '#fff',
                        margin: 0,
                    }}>How To</h2>
                </div>

                {instructions ? (
                    <div style={{
                        fontSize: '13px',
                        color: '#D1D5DB',
                        lineHeight: 1.7,
                        whiteSpace: 'pre-line',
                    }}>
                        {instructions}
                    </div>
                ) : (
                    <p style={{
                        fontSize: '13px',
                        color: '#555',
                        fontStyle: 'italic',
                        margin: 0,
                    }}>
                        No instructions available yet for this exercise.
                    </p>
                )}
            </div>

            {/* ── Exercise Info Pills ── */}
            <div style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
            }}>
                {muscleGroup && (
                    <div style={{
                        padding: '8px 16px',
                        borderRadius: '10px',
                        background: 'rgba(223,255,0,0.08)',
                        border: '1px solid rgba(223,255,0,0.2)',
                    }}>
                        <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#DFFF00',
                            letterSpacing: '0.06em',
                        }}>{muscleGroup}</span>
                    </div>
                )}
                {equipment && (
                    <div style={{
                        padding: '8px 16px',
                        borderRadius: '10px',
                        background: 'rgba(161,161,161,0.08)',
                        border: '1px solid rgba(161,161,161,0.15)',
                    }}>
                        <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#A1A1A1',
                            letterSpacing: '0.06em',
                        }}>{equipment}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HISTORY TAB CONTENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function HistoryContent({ displaySessions, historyTab, setHistoryTab, isBodyweight, globalMaxLbs, globalMaxReps, formatDate }) {
    return (
        <div>
            {/* Sub-tabs: ALL SETS / MAX SETS */}
            <div style={{ marginBottom: '20px' }}>
                <div style={{
                    display: 'flex',
                    background: '#161616',
                    borderRadius: '10px',
                    border: '1px solid #1F2937',
                    padding: '3px',
                }}>
                    {[
                        { key: 'all', label: 'ALL SETS' },
                        { key: 'max', label: 'MAX SETS' },
                    ].map(t => {
                        const isActive = historyTab === t.key;
                        return (
                            <button
                                key={t.key}
                                onClick={() => setHistoryTab(t.key)}
                                style={{
                                    flex: 1,
                                    padding: '8px 0',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: isActive ? '#2A2A2A' : 'transparent',
                                    color: isActive ? '#fff' : '#6B7280',
                                    fontWeight: 800,
                                    fontSize: '11px',
                                    letterSpacing: '0.06em',
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

            {displaySessions.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '48px', color: '#555' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>
                        history
                    </span>
                    <p style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: '#777' }}>
                        No History Yet
                    </p>
                    <p style={{ fontSize: '13px' }}>
                        Log this exercise in a workout to see progress here.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {displaySessions.map((session, sIdx) => (
                        <SessionCard
                            key={sIdx}
                            session={session}
                            isTop={sIdx === 0}
                            isBodyweight={isBodyweight}
                            globalMaxLbs={globalMaxLbs}
                            globalMaxReps={globalMaxReps}
                            formatDate={formatDate}
                            tab={historyTab}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Session Date Card
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function SessionCard({ session, isTop, isBodyweight, globalMaxLbs, globalMaxReps, formatDate, tab }) {
    const highlightLbs = (weight) => {
        if (isBodyweight) return false;
        if (tab === 'max') return weight === globalMaxLbs;
        const maxInSession = Math.max(...session.sets.map(s => s.weight || 0));
        return weight === maxInSession && weight > 0;
    };

    const highlightReps = (reps) => {
        if (!isBodyweight && tab === 'all') return false;
        if (tab === 'max') return reps === globalMaxReps;
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
            boxShadow: 'none',
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
