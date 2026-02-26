import { useState, useEffect, useMemo } from 'react';
import { api } from '../api';
import { useWorkout } from '../context/WorkoutContext';

// Colors from GYM2/workout/progress_-_dark_neon_variant_1/code.html (Strict Match)
const COLORS = {
    lime: '#DFFF00',       // Primary / Neon Lime
    red: '#FF3131',        // Neon Red (from variant_1)
    bgDark: '#0D0D0D',     // Background Dark
    surface: '#161616',    // Surface Dark
    textGray: '#A1A1A1',
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Exercise Info Panel (Media + How To)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function ExerciseInfoPanel({ exercise }) {
    const [expanded, setExpanded] = useState(false);
    const imageUrl = exercise?.imageUrl || null;
    const videoUrl = exercise?.videoUrl || null;
    const instructions = exercise?.instructions || '';
    const hasContent = imageUrl || videoUrl || instructions;

    if (!hasContent) {
        // Show a minimal toggle even without content
        return null;
    }

    return (
        <div style={{ marginBottom: '20px' }}>
            {/* Toggle Button */}
            <button
                onClick={() => setExpanded(prev => !prev)}
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: COLORS.surface,
                    border: '1px solid #1F2937',
                    borderRadius: expanded ? '12px 12px 0 0' : '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="material-symbols-outlined" style={{
                        fontSize: '18px',
                        color: COLORS.lime,
                    }}>info</span>
                    <span style={{
                        fontSize: '12px',
                        fontWeight: 800,
                        fontStyle: 'italic',
                        color: '#D1D5DB',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                    }}>Exercise Info</span>
                </div>
                <span className="material-symbols-outlined" style={{
                    fontSize: '20px',
                    color: '#6B7280',
                    transition: 'transform 0.2s',
                    transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                }}>expand_more</span>
            </button>

            {/* Expandable Content */}
            {expanded && (
                <div style={{
                    background: COLORS.surface,
                    border: '1px solid #1F2937',
                    borderTop: 'none',
                    borderRadius: '0 0 12px 12px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                }}>
                    {/* Media Section */}
                    <div style={{ position: 'relative' }}>
                        <div style={{
                            width: '100%',
                            aspectRatio: '16 / 9',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            background: '#1A1A1A',
                            border: '1px solid #262626',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt="Exercise"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}>
                                    <span className="material-symbols-outlined" style={{
                                        fontSize: '40px',
                                        color: '#2A2A2A',
                                    }}>fitness_center</span>
                                    <span style={{
                                        fontSize: '10px',
                                        fontWeight: 600,
                                        color: '#3A3A3A',
                                        letterSpacing: '0.08em',
                                        textTransform: 'uppercase',
                                    }}>Exercise Photo</span>
                                </div>
                            )}
                        </div>

                        {/* Video Button */}
                        {videoUrl && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(videoUrl, '_blank');
                                }}
                                style={{
                                    position: 'absolute',
                                    bottom: '8px',
                                    right: '8px',
                                    width: '38px',
                                    height: '38px',
                                    borderRadius: '10px',
                                    background: 'rgba(223,255,0,0.9)',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                                }}
                            >
                                <span className="material-symbols-outlined" style={{
                                    fontSize: '20px', color: '#000',
                                }}>play_arrow</span>
                            </button>
                        )}
                    </div>

                    {/* How To Section */}
                    {instructions && (
                        <div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '10px',
                            }}>
                                <span className="material-symbols-outlined" style={{
                                    fontSize: '16px',
                                    color: COLORS.lime,
                                }}>menu_book</span>
                                <span style={{
                                    fontSize: '11px',
                                    fontWeight: 900,
                                    fontStyle: 'italic',
                                    color: '#fff',
                                    letterSpacing: '0.06em',
                                    textTransform: 'uppercase',
                                }}>How To</span>
                            </div>
                            <p style={{
                                fontSize: '12px',
                                color: '#D1D5DB',
                                lineHeight: 1.6,
                                margin: 0,
                                whiteSpace: 'pre-line',
                            }}>
                                {instructions}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function ActiveWorkout({ onBack, sessionId }) {
    const { activeSession, formattedTime, completeSession } = useWorkout();
    const effectiveSessionId = sessionId || activeSession?.id;

    const [workout, setWorkout] = useState(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('overview'); // 'overview' | 'detail'
    const [selectedExerciseId, setSelectedExerciseId] = useState(null);

    // Initial Load
    useEffect(() => {
        if (!effectiveSessionId) return;
        loadWorkout();
    }, [effectiveSessionId]);

    const loadWorkout = async () => {
        try {
            setLoading(true);
            const data = await api.getWorkout(effectiveSessionId);
            if (data) setWorkout(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // --- Actions ---

    const handleSetLocalUpdate = (exerciseId, setLogId, update) => {
        setWorkout(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                exercises: prev.exercises.map(ex => {
                    if (ex.id !== exerciseId) return ex;
                    const newSets = ex.sets.map(s => s.id === setLogId ? { ...s, ...update } : s);
                    return { ...ex, sets: newSets, allComplete: newSets.every(s => s.completed) };
                })
            };
        });
    };

    const handleSetUpdate = async (exerciseId, setLogId, update) => {
        handleSetLocalUpdate(exerciseId, setLogId, update);

        // We use a functional setState just to grab the latest state for the API call
        setWorkout(prev => {
            if (!prev) return prev;
            const targetEx = prev.exercises.find(e => e.id === exerciseId);
            const targetSet = targetEx?.sets.find(s => s.id === setLogId);
            if (targetSet) {
                const payload = {
                    setLogId,
                    weight: targetSet.weight !== undefined && targetSet.weight !== '' ? targetSet.weight : (targetSet.plannedWeight || 0),
                    reps: targetSet.reps !== undefined && targetSet.reps !== '' ? targetSet.reps : (targetSet.plannedReps || 0),
                    completed: targetSet.completed
                };
                api.logSet(effectiveSessionId, payload).catch(console.error);
            }
            return prev;
        });
    };

    const handleCompleteExercise = async (exerciseId) => {
        setWorkout(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                exercises: prev.exercises.map(ex =>
                    ex.id === exerciseId ? { ...ex, allComplete: true } : ex
                )
            };
        });
        setViewMode('overview');
        setSelectedExerciseId(null);
    };

    const handleFinishSession = async () => {
        const msg = allWorkoutsDone
            ? 'Finish this workout session?'
            : `You still have ${totalCount - completedCount} exercise(s) incomplete. Finish anyway?`;
        if (window.confirm(msg)) {
            await completeSession(effectiveSessionId);
            onBack();
        }
    };

    const handleExerciseClick = (exId) => {
        setSelectedExerciseId(exId);
        setViewMode('detail');
    };

    // --- Derived State ---
    const completedCount = workout?.exercises?.filter(e => e.allComplete).length || 0;
    const totalCount = workout?.exercises?.length || 0;
    const allWorkoutsDone = totalCount > 0 && completedCount === totalCount;

    const currentExercise = workout?.exercises?.find(e => e.id === selectedExerciseId);
    const currentExerciseIndex = workout?.exercises?.findIndex(e => e.id === selectedExerciseId) + 1 || 0;


    if (loading && !workout) {
        return <div style={{ background: COLORS.bgDark, height: '100%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Workout...</div>;
    }

    if (!workout) {
        return <div style={{ background: COLORS.bgDark, height: '100%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Workout not found.</div>;
    }

    // --- RENDERERS ---

    // 1. Overview Screen (Strict Match GYM2/workout/progress_-_dark_neon_variant_1)
    if (viewMode === 'overview') {
        return (
            <div style={{
                background: COLORS.bgDark,
                minHeight: '100%',
                display: 'flex',
                flexDirection: 'column',
                fontFamily: 'Inter, sans-serif',
                paddingBottom: 'safe-area-inset-bottom',
            }}>
                {/* Header (Strict Match) */}
                <header style={{
                    padding: 'calc(env(safe-area-inset-top) + 16px) 24px 16px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'sticky',
                    top: 0,
                    zIndex: 20,
                    background: `linear-gradient(to bottom, #262626 0%, ${COLORS.bgDark} 100px)`, // Reference: bg-gradient-header
                    backdropFilter: 'blur(4px)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button onClick={onBack} style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            background: COLORS.surface, border: '1px solid #1F2937', // border-gray-800
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', // text-gray-400
                            cursor: 'pointer', transition: 'background 0.2s'
                        }}>
                            <span className="material-icons-outlined">arrow_back</span>
                        </button>
                        <div>
                            <h1 style={{
                                fontSize: '20px', fontWeight: 900, fontStyle: 'italic',
                                textTransform: 'uppercase', color: '#fff', lineHeight: 1, letterSpacing: '-0.05em'
                            }}>
                                {workout.routineName}
                            </h1>
                            <p style={{
                                fontSize: '10px', fontWeight: 700, color: COLORS.red,
                                textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px',
                                textShadow: `0 0 10px ${COLORS.red}99` // neon-text-red
                            }}>SESSION ACTIVE</p>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '30px', fontWeight: 900, fontFamily: 'monospace', color: '#fff', lineHeight: 1, letterSpacing: '-0.05em' }}>
                            {formattedTime}
                        </div>
                        <div style={{ fontSize: '10px', color: '#6B7280', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '2px' }}>ELAPSED</div>
                    </div>
                </header>

                <main style={{ flex: 1, overflowY: 'auto', padding: '0 24px 120px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px', paddingTop: '8px' }}>
                        <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Exercises</h2>
                        <span style={{
                            fontSize: '12px',
                            fontWeight: 900,
                            color: COLORS.lime,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            textShadow: `0 0 10px ${COLORS.lime}99`,
                        }}>
                            {completedCount}/{totalCount} Completed
                        </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {workout.exercises.map((ex, i) => {
                            const isCompleted = ex.allComplete;

                            // Define Theme based on State
                            // Completed -> RED
                            // Active/Not Completed -> LIME
                            const themeColor = isCompleted ? COLORS.red : COLORS.lime;
                            const glowShadow = isCompleted
                                ? 'none'
                                : 'none';

                            // Calculation logic
                            const setLen = ex.sets.length;
                            const maxWeight = ex.sets.reduce((max, s) => Math.max(max, s.weight || 0), 0);
                            const displayWeight = maxWeight > 0 ? `Max: ${maxWeight} lbs` : 'Bodyweight';

                            return (
                                <div key={ex.id}
                                    onClick={() => handleExerciseClick(ex.id)}
                                    style={{
                                        background: COLORS.surface,
                                        border: `1px solid ${themeColor}80`, // 50% opacity
                                        borderRadius: '16px',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        boxShadow: glowShadow,
                                        transition: 'all 0.2s',
                                        cursor: 'pointer',
                                    }}>

                                    {/* Sidebar Accent Line (Inside) */}
                                    <div style={{
                                        position: 'absolute', right: 0, top: 0, bottom: 0, width: '4px',
                                        background: themeColor,
                                        boxShadow: 'none'
                                    }} />

                                    {/* Top Row: Title & Button */}
                                    <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                <h3 style={{
                                                    fontSize: '18px', fontWeight: 900, fontStyle: 'italic',
                                                    textTransform: 'uppercase', color: '#fff', letterSpacing: '-0.02em', margin: 0
                                                }}>
                                                    {ex.exerciseName}
                                                </h3>
                                                {isCompleted && (
                                                    <span className="material-icons-outlined" style={{ color: COLORS.red, fontSize: '16px' }}>check_circle</span>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#9CA3AF', fontWeight: 500 }}>
                                                <span>{setLen} Sets</span>
                                                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#4B5563' }} />
                                                <span>{displayWeight}</span>
                                            </div>
                                        </div>

                                        {/* Button: Edit Results (Red) or Start Exercise (Lime) */}
                                        <button
                                            style={{
                                                padding: '8px 16px', borderRadius: '8px',
                                                background: `${themeColor}1A`, // 10% opacity
                                                border: `1px solid ${themeColor}4D`, // 30% opacity
                                                color: themeColor, fontSize: '10px', fontWeight: 800,
                                                textTransform: 'uppercase', letterSpacing: '0.05em',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                pointerEvents: 'none' // Click applies to card
                                            }}
                                        >
                                            {isCompleted ? 'Edit Results' : 'Start Exercise'}
                                        </button>
                                    </div>

                                    {/* Set Summary Row (Bottom) */}
                                    <div style={{
                                        background: 'rgba(0,0,0,0.3)', padding: '12px 20px',
                                        borderTop: '1px solid rgba(255,255,255,0.05)',
                                        display: 'flex', gap: '16px'
                                    }}>
                                        {ex.sets.slice(0, 4).map((s, idx) => (
                                            <div key={s.id} style={{ textAlign: 'center', opacity: idx >= 3 ? 0.5 : 1 }}>
                                                <span style={{ display: 'block', fontSize: '10px', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase' }}>
                                                    Set {s.setNumber}
                                                </span>
                                                <span style={{ display: 'block', fontSize: '14px', fontWeight: 800, color: '#fff' }}>
                                                    {isCompleted ? (
                                                        <>
                                                            {s.reps || 0} <span style={{ fontSize: '10px', color: '#6B7280', fontWeight: 400 }}>x {s.weight || 0}</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            -- <span style={{ fontSize: '10px', color: '#6B7280', fontWeight: 400 }}>lbs</span>
                                                        </>
                                                    )}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </main>

                {/* Bottom CTA */}
                <div style={{
                    position: 'fixed', bottom: 0, left: 0, right: 0,
                    padding: '24px', paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)',
                    background: `linear-gradient(to top, ${COLORS.bgDark} 10%, rgba(13,13,13,0.95) 50%, transparent 100%)`,
                    zIndex: 50
                }}>
                    <button
                        onClick={handleFinishSession}
                        style={{
                            width: '100%',
                            background: allWorkoutsDone ? COLORS.red : COLORS.lime,
                            color: allWorkoutsDone ? '#fff' : '#000', // Lime usually has black text
                            padding: '16px', borderRadius: '12px',
                            fontSize: '14px', fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase',
                            letterSpacing: '0.05em', cursor: 'pointer',
                            boxShadow: 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            border: 'none', transition: 'all 0.2s',
                        }}
                    >
                        {allWorkoutsDone ? (
                            <>
                                <span className="material-icons-outlined">flag</span>
                                Finish Workout Session
                            </>
                        ) : (
                            <>
                                <span className="material-icons-outlined" style={{ fontWeight: 'bold' }}>play_arrow</span>
                                Continue Session
                            </>
                        )}
                    </button>
                    {allWorkoutsDone && (
                        <div style={{ textAlign: 'center', color: '#6B7280', fontSize: '12px', fontWeight: 500, fontStyle: 'italic', marginTop: '12px' }}>
                            All exercises completed. Great job!
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // 2. Detail Screen (Strict Reference: GYM2/current) - Preserved
    if (viewMode === 'detail' && currentExercise) {
        // Enforce all sets done to complete exercise
        const allSetsCompleted = currentExercise.sets.every(s => s.completed);

        return (
            <div style={{
                background: COLORS.bgDark,
                minHeight: '100%',
                display: 'flex',
                flexDirection: 'column',
                fontFamily: 'Inter, sans-serif',
                overflow: 'hidden'
            }}>
                {/* Header (Variant 2 Strict) */}
                <header style={{
                    padding: 'calc(env(safe-area-inset-top) + 16px) 24px 16px 24px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    position: 'sticky', top: 0, zIndex: 20,
                    background: `linear-gradient(to bottom, #262626 0%, ${COLORS.bgDark} 100%)`
                }}>
                    <button onClick={() => setViewMode('overview')} style={{
                        background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0
                    }}>
                        <span className="material-icons-outlined">arrow_back</span>
                    </button>
                    <h1 style={{
                        flex: 1, textAlign: 'center', fontSize: '18px', fontWeight: 900,
                        fontStyle: 'italic', textTransform: 'uppercase', color: '#fff',
                        letterSpacing: '-0.02em'
                    }}>Current Workout</h1>
                    <button style={{ background: 'none', border: 'none', color: '#fff', padding: 0 }}>
                        <span className="material-icons-outlined">more_vert</span>
                    </button>
                </header>

                <main style={{ flex: 1, overflowY: 'auto', padding: '0 24px 120px 24px' }}>
                    {/* Title Section DO NOT SHOW CAMERA ICON */}
                    <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <span style={{
                                display: 'block', fontSize: '10px', fontWeight: 800, color: COLORS.lime,
                                letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px',
                                textShadow: `0 0 10px ${COLORS.lime}66`
                            }}>
                                Exercise {currentExerciseIndex} of {totalCount}
                            </span>
                            <h2 style={{
                                fontSize: '28px', fontWeight: 900, fontStyle: 'italic',
                                textTransform: 'uppercase', color: '#fff', lineHeight: 0.9,
                                letterSpacing: '-0.04em'
                            }}>
                                {currentExercise.exerciseName}
                            </h2>
                        </div>
                        {/* Camera Icon Removed per user request */}
                    </div>

                    {/* ── Exercise Info (Media + How To) ── */}
                    <ExerciseInfoPanel exercise={currentExercise} />

                    {/* Sets List Strict */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {currentExercise.sets.map((set, i) => {
                            const isDone = Boolean(set.completed);
                            const firstIncompleteIndex = currentExercise.sets.findIndex(s => !s.completed);
                            // If all completed, index is -1.
                            // Active is simply the specific set at the incomplete index.
                            const isActive = !isDone && (i === firstIncompleteIndex);

                            const CRIMSON = '#FF003C';

                            // Define Styles
                            let styles = {
                                bg: COLORS.surface,
                                border: '1px solid #1F2937',
                                shadow: 'none',
                                opacity: 1,
                                labelColor: '#6B7280',
                                numColor: '#9CA3AF',
                                inputColor: '#9CA3AF'
                            };

                            if (isDone) {
                                // COMPLETE
                                styles.border = `1px solid rgba(255, 0, 60, 0.6)`;
                                styles.shadow = 'none';
                                styles.bg = `linear-gradient(135deg, rgba(255,0,60,0.1) 0%, rgba(20,20,20,0) 100%)`;
                                styles.labelColor = CRIMSON;
                                styles.numColor = CRIMSON;
                                styles.inputColor = '#fff';
                            } else if (isActive) {
                                // ACTIVE
                                styles.border = `1px solid ${COLORS.lime}`;
                                styles.shadow = 'none';
                                styles.labelColor = COLORS.lime;
                                styles.numColor = '#fff';
                                styles.inputColor = '#fff';
                            } else {
                                // UPCOMING
                                styles.opacity = 0.5;
                            }

                            // Value Handling: Use current weight/reps if exist (even if empty string), else use planned ONLY if undefined/null.
                            const weightValue = (set.weight !== undefined && set.weight !== null) ? String(set.weight) : String(set.plannedWeight || '');
                            const repsValue = (set.reps !== undefined && set.reps !== null) ? String(set.reps) : String(set.plannedReps || '');

                            return (
                                <div key={set.id} style={{
                                    background: isDone ? styles.bg : COLORS.surface,
                                    border: styles.border,
                                    borderRadius: '16px',
                                    padding: '16px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    boxShadow: styles.shadow,
                                    opacity: styles.opacity,
                                    transition: 'all 0.3s ease',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                                }}>
                                    {isActive && (
                                        <div style={{
                                            position: 'absolute', left: '-4px', top: '50%', transform: 'translateY(-50%)',
                                            width: '8px', height: '32px', background: COLORS.lime,
                                            borderRadius: '0 999px 999px 0',
                                            boxShadow: 'none'
                                        }} />
                                    )}

                                    <div style={{ display: 'flex', alignItems: 'center', flex: 1, paddingRight: '16px' }}>
                                        {/* Set Number */}
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '40px', marginRight: '16px' }}>
                                            <span style={{ fontSize: '10px', fontWeight: 900, fontStyle: 'italic', letterSpacing: '0.05em', color: styles.labelColor }}>SET</span>
                                            <span style={{ fontSize: '20px', fontWeight: 900, fontStyle: 'italic', color: styles.numColor }}>{set.setNumber}</span>
                                        </div>

                                        {/* Divider */}
                                        <div style={{ width: '1px', height: '32px', background: isDone ? 'rgba(255,0,60,0.3)' : '#374151', marginRight: '24px' }}></div>

                                        {/* Inputs Area - Using gap and alignment */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                            {/* LBS */}
                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                                <input
                                                    type="text"
                                                    inputMode="decimal"
                                                    value={weightValue}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                                            handleSetLocalUpdate(currentExercise.id, set.id, { weight: val });
                                                        }
                                                    }}
                                                    onBlur={(e) => {
                                                        const parsed = e.target.value === '' ? 0 : Math.max(0, parseFloat(e.target.value) || 0);
                                                        handleSetUpdate(currentExercise.id, set.id, { weight: parsed });
                                                    }}
                                                    disabled={isDone}
                                                    style={{
                                                        background: 'transparent', border: 'none', width: '60px',
                                                        fontSize: '24px', fontWeight: 900, fontStyle: 'italic',
                                                        color: styles.inputColor,
                                                        textAlign: 'right', padding: '8px 0',
                                                        textShadow: isDone ? `0 0 5px rgba(0,0,0,0.5)` : 'none',
                                                        outline: 'none', WebkitAppearance: 'none',
                                                    }}
                                                />
                                                <span style={{ fontSize: '10px', fontWeight: 700, color: styles.labelColor, textTransform: 'uppercase' }}>LBS</span>
                                            </div>

                                            {/* REPS */}
                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={repsValue}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val === '' || /^\d+$/.test(val)) {
                                                            handleSetLocalUpdate(currentExercise.id, set.id, { reps: val });
                                                        }
                                                    }}
                                                    onBlur={(e) => {
                                                        const parsed = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value) || 0);
                                                        handleSetUpdate(currentExercise.id, set.id, { reps: parsed });
                                                    }}
                                                    disabled={isDone}
                                                    style={{
                                                        background: 'transparent', border: 'none', width: '50px',
                                                        fontSize: '24px', fontWeight: 900, fontStyle: 'italic',
                                                        color: styles.inputColor,
                                                        textAlign: 'right', padding: '8px 0',
                                                        textShadow: isDone ? `0 0 5px rgba(0,0,0,0.5)` : 'none',
                                                        outline: 'none', WebkitAppearance: 'none',
                                                    }}
                                                />
                                                <span style={{ fontSize: '10px', fontWeight: 700, color: styles.labelColor, textTransform: 'uppercase' }}>REPS</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Area */}
                                    <div style={{ zIndex: 10, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                                        {isDone ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleSetUpdate(currentExercise.id, set.id, { completed: false }); }}
                                                    style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: '4px' }}
                                                >
                                                    <span className="material-icons-outlined" style={{ fontSize: '16px' }}>undo</span>
                                                </button>
                                                <div style={{
                                                    background: 'rgba(255, 0, 60, 0.2)',
                                                    border: `1px solid ${CRIMSON}`,
                                                    color: CRIMSON,
                                                    borderRadius: '8px',
                                                    padding: '6px 12px',
                                                    display: 'flex', alignItems: 'center', gap: '4px'
                                                }}>
                                                    <span className="material-icons-outlined" style={{ fontSize: '18px' }}>check</span>
                                                    <span style={{ fontSize: '10px', fontWeight: 900, fontStyle: 'italic', letterSpacing: '0.05em' }}>DONE</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Mark as complete. Logic calculates next active.
                                                    handleSetUpdate(currentExercise.id, set.id, {
                                                        completed: true,
                                                        // Parse to clean numbers before saving
                                                        weight: (weightValue === '' || weightValue === undefined) ? (set.plannedWeight || 0) : (parseFloat(weightValue) || 0),
                                                        reps: (repsValue === '' || repsValue === undefined) ? (set.plannedReps || 0) : (parseInt(repsValue) || 0)
                                                    });
                                                }}
                                                disabled={!isActive} // Only active set can be completed
                                                style={{
                                                    width: '40px', height: '40px', borderRadius: '8px',
                                                    border: isActive ? `2px solid rgba(223, 255, 0, 0.3)` : `2px solid #374151`,
                                                    background: 'transparent',
                                                    color: isActive ? COLORS.lime : '#4B5563',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    cursor: isActive ? 'pointer' : 'not-allowed',
                                                    transition: 'all 0.2s',
                                                    opacity: isActive ? 1 : 0.5
                                                }}
                                            >
                                                <span className="material-icons-outlined" style={{ fontWeight: 'bold' }}>check</span>
                                            </button>
                                        )}
                                    </div>

                                    {isDone && (
                                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255, 0, 60, 0.05)', pointerEvents: 'none' }} />
                                    )}
                                </div>
                            );
                        })}

                        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '16px', paddingBottom: '32px' }}>
                            <button style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                color: '#666', background: 'none', border: 'none',
                                fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
                                cursor: 'pointer'
                            }}>
                                <span className="material-icons-outlined" style={{ fontSize: '18px' }}>add</span>
                                Add Set
                            </button>
                        </div>
                    </div>
                </main>

                <div style={{
                    position: 'fixed', bottom: 0, left: 0, right: 0,
                    padding: '24px', paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)',
                    background: COLORS.bgDark, borderTop: '1px solid #222'
                }}>
                    <button
                        onClick={() => handleCompleteExercise(currentExercise.id)}
                        style={{
                            width: '100%',
                            background: COLORS.lime,
                            color: '#000',
                            padding: '16px', borderRadius: '999px',
                            fontSize: '14px', fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            cursor: 'pointer',
                            boxShadow: 'none',
                            border: 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}
                    >
                        Complete Exercise
                    </button>
                </div>
            </div>
        );
    }

    return null;
}
