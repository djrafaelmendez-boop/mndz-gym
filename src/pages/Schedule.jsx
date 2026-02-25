import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../api';
import { colors } from '../styles/designTokens';
import { useWorkout } from '../context/WorkoutContext';
import WeekDaySelector from '../components/WeekDaySelector';

function getWeekDates(baseDate) {
    const d = new Date(baseDate);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Monday start
    const monday = new Date(d);
    monday.setDate(d.getDate() + diff);
    const dates = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        dates.push(date);
    }
    return dates;
}

function formatDateStr(d) {
    // Use local date, not UTC
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function Schedule({ onNavigate }) {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAssign, setShowAssign] = useState(false);
    const [routines, setRoutines] = useState([]);
    const [startLoading, setStartLoading] = useState(false);
    const [startError, setStartError] = useState(null);
    const { startSession } = useWorkout();

    const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);

    const loadSchedule = useCallback(async () => {
        setLoading(true);
        try {
            const start = formatDateStr(weekDates[0]);
            const end = formatDateStr(weekDates[6]);
            const data = await api.getSchedule(start, end);
            setSchedules(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [weekDates]);

    useEffect(() => { loadSchedule(); }, [loadSchedule]);

    const loadRoutines = useCallback(async () => {
        if (showAssign) {
            const data = await api.getRoutines();
            setRoutines(data);
        }
    }, [showAssign]);

    useEffect(() => { loadRoutines(); }, [loadRoutines]);

    const selectedDateStr = formatDateStr(selectedDate);
    const daySchedules = schedules.filter(s => s.date === selectedDateStr);


    // Compute day statuses for the week
    const dayStatuses = useMemo(() => {
        const statuses = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        weekDates.forEach(date => {
            const dStr = formatDateStr(date);
            const dayRoutines = schedules.filter(s => s.date === dStr);

            if (dayRoutines.length > 0) {
                const allCompleted = dayRoutines.every(s => s.status === 'completed');
                const someCompleted = dayRoutines.some(s => s.status === 'completed');

                if (allCompleted) {
                    statuses[dStr] = 'full';
                } else if (someCompleted) {
                    statuses[dStr] = 'partial';
                } else {
                    // Check if missed (in the past and not completed)
                    const dDate = new Date(date);
                    dDate.setHours(0, 0, 0, 0);
                    if (dDate < today) {
                        statuses[dStr] = 'missed';
                    }
                }
            }
        });
        return statuses;
    }, [schedules, weekDates]);

    const handleStartWorkout = async (sr) => {
        setStartLoading(true);
        setStartError(null);
        try {
            const session = await startSession({
                scheduledRoutineId: sr.id,
                routineId: sr.routineId,
                routineName: sr.routineName,
            });
            if (!session?.id) throw new Error('Failed to create session');
            onNavigate('activeWorkout', { sessionId: session.id });
        } catch (err) {
            console.error('Start workout error:', err);
            setStartError(err.message || 'Failed to start workout');
            setTimeout(() => setStartError(null), 4000);
        } finally {
            setStartLoading(false);
        }
    };

    const handleAssign = async (routineId) => {
        try {
            await api.addToSchedule({ routineId, date: selectedDateStr });
            setShowAssign(false);
            loadSchedule();
        } catch (err) {
            console.error(err);
        }
    };

    const [deleteRoutineId, setDeleteRoutineId] = useState(null);

    const handleDeleteClick = (id, e) => {
        e.stopPropagation();
        setDeleteRoutineId(id);
    };

    const confirmDelete = async () => {
        if (!deleteRoutineId) return;
        try {
            await api.removeFromSchedule(deleteRoutineId);
            loadSchedule();
        } catch (err) {
            console.error(err);
        } finally {
            setDeleteRoutineId(null);
        }
    };

    const cancelDelete = () => setDeleteRoutineId(null);

    return (
        <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            background: `linear-gradient(to bottom, #262626 0%, #0D0D0D 100px)`,
        }}>
            {/* Header */}
            <div style={{
                padding: '0 24px',
                paddingTop: 'calc(env(safe-area-inset-top) + 24px)',
                paddingBottom: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                position: 'sticky',
                top: 0,
                zIndex: 10,
                backdropFilter: 'blur(4px)',
            }}>
                <div>
                    <h1 style={{
                        fontSize: '30px',
                        fontWeight: 900,
                        fontStyle: 'italic',
                        textTransform: 'uppercase',
                        letterSpacing: '-0.04em',
                        color: '#fff',
                        lineHeight: 1,
                    }}>
                        Schedule
                    </h1>
                    <p style={{
                        fontSize: '12px',
                        color: colors.textSecondary,
                        marginTop: '4px',
                        letterSpacing: '0.05em',
                        fontWeight: 500,
                        textTransform: 'uppercase',
                    }}>
                        {(() => {
                            const today = new Date();
                            const todayWeek = getWeekDates(today);
                            const currentMonday = formatDateStr(weekDates[0]);
                            const todayMonday = formatDateStr(todayWeek[0]);
                            if (currentMonday === todayMonday) return 'THIS WEEK';
                            // Check next week
                            const nextWeekDate = new Date(today);
                            nextWeekDate.setDate(today.getDate() + 7);
                            const nextMonday = formatDateStr(getWeekDates(nextWeekDate)[0]);
                            if (currentMonday === nextMonday) return 'NEXT WEEK';
                            // Check last week
                            const lastWeekDate = new Date(today);
                            lastWeekDate.setDate(today.getDate() - 7);
                            const lastMonday = formatDateStr(getWeekDates(lastWeekDate)[0]);
                            if (currentMonday === lastMonday) return 'LAST WEEK';
                            // Otherwise show date range
                            const mo = weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                            const su = weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                            return `${mo} – ${su}`.toUpperCase();
                        })()}
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Return to today button — only show when not on current week */}
                    {(() => {
                        const today = new Date();
                        const todayMonday = formatDateStr(getWeekDates(today)[0]);
                        const currentMonday = formatDateStr(weekDates[0]);
                        if (currentMonday !== todayMonday) {
                            return (
                                <button
                                    onClick={() => setSelectedDate(new Date())}
                                    style={{
                                        background: 'rgba(223, 255, 0, 0.1)',
                                        border: '1px solid rgba(223, 255, 0, 0.3)',
                                        borderRadius: '999px',
                                        padding: '4px 10px',
                                        color: colors.primary,
                                        fontSize: '10px',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Today
                                </button>
                            );
                        }
                        return null;
                    })()}
                </div>
            </div>

            {/* Week Navigation + Selector */}
            <div style={{ padding: '0 16px' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                }}>
                    {/* Prev Week Arrow */}
                    <button
                        onClick={() => {
                            const prev = new Date(selectedDate);
                            prev.setDate(prev.getDate() - 7);
                            setSelectedDate(prev);
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#6B7280',
                            cursor: 'pointer',
                            padding: '8px 4px',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_left</span>
                    </button>

                    {/* Week Day Selector */}
                    <div style={{ flex: 1 }}>
                        <WeekDaySelector
                            selectedDate={selectedDate}
                            onSelectDate={setSelectedDate}
                            weekDates={weekDates}
                            dayStatuses={dayStatuses}
                        />
                    </div>

                    {/* Next Week Arrow */}
                    <button
                        onClick={() => {
                            const next = new Date(selectedDate);
                            next.setDate(next.getDate() + 7);
                            setSelectedDate(next);
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#6B7280',
                            cursor: 'pointer',
                            padding: '8px 4px',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_right</span>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
            }}>
                {/* Today's Workout Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px', flexWrap: 'wrap', rowGap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                        <h2 style={{
                            fontSize: '16px',
                            fontWeight: 800,
                            fontStyle: 'normal',
                            textTransform: 'uppercase',
                            letterSpacing: '0.02em',
                            color: '#fff',
                        }}>{(() => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const sel = new Date(selectedDate);
                            sel.setHours(0, 0, 0, 0);
                            if (sel.getTime() === today.getTime()) return "TODAY'S WORKOUT";
                            const tomorrow = new Date(today);
                            tomorrow.setDate(today.getDate() + 1);
                            if (sel.getTime() === tomorrow.getTime()) return "TOMORROW'S WORKOUT";
                            return selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase() + "'S WORKOUT";
                        })()}</h2>
                        {/* Quick Add Button */}
                        <button
                            onClick={() => setShowAssign(true)}
                            style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: colors.primary,
                                transition: 'all 0.2s',
                                flexShrink: 0,
                            }}
                        >
                            <span className="material-icons-outlined" style={{ fontSize: '18px' }}>add</span>
                        </button>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: colors.primary, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                        {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </span>
                </div>

                {showAssign ? (
                    <div style={{ background: colors.surfaceDark, borderRadius: '16px', padding: '16px', border: `1px solid ${colors.borderDark}` }}>
                        <h3 style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', color: '#aaa', marginBottom: '12px', textTransform: 'uppercase' }}>
                            Assign Routine
                        </h3>
                        {routines.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>No routines found.</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {routines.map(r => (
                                    <div key={r.id} onClick={() => handleAssign(r.id)} style={{
                                        padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'
                                    }}>
                                        <span style={{ fontWeight: 600, color: '#fff' }}>{r.name}</span>
                                        <span className="material-icons-outlined" style={{ color: colors.primary }}>add_circle</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button onClick={() => setShowAssign(false)} style={{ width: '100%', marginTop: '12px', padding: '12px', background: 'none', border: '1px solid #333', borderRadius: '8px', color: '#aaa' }}>Cancel</button>
                    </div>
                ) : daySchedules.length === 0 ? (
                    // Empty State
                    <div style={{
                        textAlign: 'center',
                        marginTop: '48px',
                        color: '#555',
                    }}>
                        <button onClick={() => setShowAssign(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span className="material-icons-outlined" style={{ fontSize: '48px', marginBottom: '16px', color: '#333' }}>
                                add_circle_outline
                            </span>
                            <p style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(102,102,102,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '12px' }}>TAP TO ASSIGN A ROUTINE</p>
                        </button>
                    </div>
                ) : (() => {
                    const isSingle = daySchedules.length === 1;
                    const hasCompleted = daySchedules.some(s => s.status === 'completed');

                    const renderCard = (sr, idx) => {
                        const isCompleted = sr.status === 'completed';
                        const exercises = sr.exercises || [];
                        const maxPreview = isSingle ? 4 : 3;

                        // Colors from schedule4/code.html
                        const neonLime = '#DFFF00';
                        const crimson = '#DC143C';
                        const crimsonLight = '#FF4D6D';
                        const surfaceDark = '#161616';
                        const bgDark = '#0D0D0D';

                        // Badge Styles
                        let badgeLabel, badgeStyle, badgeOuterStyle;
                        if (isCompleted) {
                            badgeLabel = 'COMPLETED';
                            // HTML Line 185: bg-gray-800 text-white border border-gray-600 px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider
                            badgeOuterStyle = { marginBottom: '16px' };
                            badgeStyle = {
                                display: 'inline-flex', // Fix overlap
                                background: '#1F2937', // bg-gray-800
                                color: '#fff',
                                border: '1px solid #4B5563', // border-gray-600
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '9px',
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                            };
                        } else if (hasCompleted && !isSingle) {
                            badgeLabel = 'UP NEXT';
                            // HTML Line 220: bg-primary/10 text-primary border border-primary/30 ... shadow-[0_0_10px_rgba(223,255,0,0.2)]
                            badgeOuterStyle = { marginBottom: '16px' };
                            badgeStyle = {
                                display: 'inline-flex', // Fix overlap
                                background: 'rgba(223, 255, 0, 0.1)',
                                color: neonLime,
                                border: '1px solid rgba(223, 255, 0, 0.3)',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '9px',
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                            };
                        } else {
                            badgeLabel = 'RECOMMENDED';
                            // Default styling or similar to Up Next but maybe dimmed
                            badgeOuterStyle = { marginBottom: '16px' };
                            badgeStyle = {
                                display: 'inline-flex', // Fix overlap
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: '#ccc',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '9px',
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                            };
                        }

                        // Routine name split
                        const words = sr.routineName?.split(' ') || ['Routine'];
                        const mid = Math.ceil(words.length / 2);
                        const firstLine = words.slice(0, mid).join(' ');
                        const secondLine = words.slice(mid).join(' ');

                        return (
                            <div key={`${sr.id}-${sr.workoutSessionId || 'pending'}-${idx}`} style={{
                                background: surfaceDark, // bg-surface-dark
                                border: isCompleted
                                    ? `1px solid rgba(220, 20, 60, 0.6)` // border-crimson/60
                                    : `1px solid rgba(223, 255, 0, 0.6)`, // border-primary/60
                                borderRadius: '16px', // rounded-2xl
                                padding: '16px', // p-4
                                // card-glow-crimson vs card-glow-active removed
                                boxShadow: 'none',
                                position: 'relative',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                minHeight: '320px', // h-[320px]
                            }}>
                                {/* Radial blur accent from HTML Lines 180 / 215 */}
                                <div style={{
                                    position: 'absolute',
                                    right: '-16px',
                                    top: '-16px',
                                    width: '128px',
                                    height: '128px',
                                    background: isCompleted
                                        ? 'rgba(220, 20, 60, 0.2)' // bg-crimson/20
                                        : 'rgba(223, 255, 0, 0.2)', // bg-primary/20
                                    borderRadius: '50%',
                                    filter: 'blur(24px)', // blur-2xl ~ 24px-40px
                                    pointerEvents: 'none',
                                }} />

                                {/* Close Button (Top Right) */}
                                <button
                                    onClick={(e) => handleDeleteClick(sr.id, e)}
                                    style={{
                                        position: 'absolute',
                                        top: '12px',
                                        right: '12px',
                                        zIndex: 30,
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        background: 'rgba(0,0,0,0.6)', // bg-black/60
                                        border: '1px solid rgba(255,255,255,0.1)', // border-white/10
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        color: '#fff',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <span className="material-icons-outlined" style={{ fontSize: '14px' }}>close</span>
                                </button>

                                {/* Badge */}
                                <div style={{ ...badgeOuterStyle, position: 'relative', zIndex: 10 }}>
                                    <div style={badgeStyle}>
                                        {badgeLabel}
                                    </div>
                                </div>

                                {/* Content */}
                                <div style={{ flex: 1, position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                                    {/* Title */}
                                    <h3 style={{
                                        fontSize: '24px', // text-2xl
                                        fontWeight: 900, // font-black
                                        fontStyle: 'italic',
                                        textTransform: 'uppercase',
                                        letterSpacing: '-0.05em', // tracking-tighter
                                        lineHeight: 1, // leading-none
                                        color: '#fff',
                                        marginBottom: '8px',
                                        textShadow: 'none',
                                    }}>
                                        {firstLine}
                                        {secondLine && <br />}
                                        {secondLine && (
                                            <span style={{
                                                background: isCompleted
                                                    ? `linear-gradient(to right, ${crimson}, ${crimsonLight})`
                                                    : neonLime, // Just text-primary for up next
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: isCompleted ? 'transparent' : neonLime,
                                                color: isCompleted ? 'transparent' : neonLime,
                                            }}>
                                                {secondLine}
                                            </span>
                                        )}
                                        {isCompleted && (
                                            <span className="material-symbols-outlined" style={{
                                                fontSize: '20px', // text-xl
                                                color: crimson, // text-crimson
                                                verticalAlign: 'middle',
                                                marginLeft: '4px',
                                                fontVariationSettings: "'FILL' 1",
                                            }}>local_fire_department</span>
                                        )}
                                    </h3>

                                    {/* Exercises */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', marginTop: 'auto', opacity: isCompleted ? 0.7 : 1 }}>
                                        {exercises.slice(0, maxPreview).map((ex, i) => (
                                            <div key={i} style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                fontSize: '12px', // text-xs
                                                color: '#9CA3AF', // text-gray-400
                                                borderBottom: i === 0 ? '1px solid rgba(31, 41, 55, 0.5)' : 'none', // border-gray-800/50
                                                paddingBottom: i === 0 ? '4px' : '0',
                                            }}>
                                                <span>{ex.exerciseName}</span>
                                                <span style={{
                                                    fontWeight: 700,
                                                    color: isCompleted ? '#fff' : neonLime,
                                                    textDecoration: isCompleted ? 'line-through' : 'none',
                                                    textDecorationColor: isCompleted ? 'rgba(220, 20, 60, 0.5)' : 'transparent', // decoration-crimson/50
                                                }}>
                                                    {ex.setCount || 3}x{ex.reps || 10}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Button */}
                                <div style={{ marginTop: 'auto' }}>
                                    {isCompleted ? (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (!sr.workoutSessionId) return alert('Session log not found.');
                                                onNavigate('activeWorkout', { sessionId: sr.workoutSessionId });
                                            }}
                                            style={{
                                                width: '100%',
                                                background: 'rgba(31, 41, 55, 0.8)', // bg-gray-800/80
                                                color: '#9CA3AF', // text-gray-400
                                                padding: '10px',
                                                borderRadius: '999px',
                                                fontSize: '12px',
                                                fontWeight: 700,
                                                fontStyle: 'italic',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em', // tracking-wider
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: '1px solid #374151', // border-gray-700
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                            }}
                                        >
                                            Edit Results
                                            <span className="material-icons-outlined" style={{ fontSize: '14px', marginLeft: '4px', fontWeight: 'bold' }}>edit</span>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleStartWorkout(sr)}
                                            disabled={startLoading}
                                            style={{
                                                width: '100%',
                                                background: neonLime,
                                                color: '#000',
                                                padding: '10px',
                                                borderRadius: '999px',
                                                fontSize: '12px',
                                                fontWeight: 900, // font-black
                                                fontStyle: 'italic',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: 'none',
                                                cursor: startLoading ? 'wait' : 'pointer',
                                                // btn-neon-glow removed
                                                boxShadow: 'none',
                                                transform: 'scale(1)',
                                                transition: 'transform 0.2s',
                                            }}
                                        >
                                            {startLoading ? 'LOADING...' : 'Start'}
                                            <span className="material-icons-outlined" style={{ fontSize: '14px', marginLeft: '4px', fontWeight: 'bold' }}>play_arrow</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    };

                    return (
                        <div style={{
                            display: isSingle ? 'flex' : 'grid',
                            gridTemplateColumns: isSingle ? undefined : '1fr 1fr',
                            flexDirection: isSingle ? 'column' : undefined,
                            gap: '12px',
                        }}>
                            {daySchedules.map((sr, idx) => renderCard(sr, idx))}
                        </div>
                    );
                })()}

                {/* Bottom padding to avoid nav overlap */}
                <div style={{ height: '80px' }} />
            </div>

            {/* Delete Confirmation Modal */}
            {deleteRoutineId && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 100,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '24px'
                }} onClick={cancelDelete}>
                    <div style={{
                        background: '#1a1a1a',
                        border: '1px solid #333',
                        borderRadius: '16px',
                        padding: '24px',
                        width: '100%',
                        maxWidth: '320px',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
                        textAlign: 'center'
                    }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Delete workout?</h3>
                        <p style={{ fontSize: '14px', color: '#aaa', marginBottom: '24px' }}>This will remove this workout from the day.</p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={cancelDelete} style={{
                                flex: 1, padding: '12px', borderRadius: '8px', background: 'transparent', border: '1px solid #333', color: '#fff', fontWeight: 600, cursor: 'pointer'
                            }}>Cancel</button>
                            <button onClick={confirmDelete} style={{
                                flex: 1, padding: '12px', borderRadius: '8px', background: '#FF3B3B', border: 'none', color: '#000', fontWeight: 700, cursor: 'pointer'
                            }}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
