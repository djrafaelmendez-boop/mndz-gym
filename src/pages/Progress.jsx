import { useState, useEffect, useMemo } from 'react';
import { api } from '../api';
import { colors } from '../styles/designTokens';

const neonLime = '#DFFF00';
const surfaceDark = '#161616';
const borderColor = '#1F2937';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function Progress() {
    const [weightLogs, setWeightLogs] = useState([]);
    const [attendanceDates, setAttendanceDates] = useState(new Set());

    // Calendar state
    const now = new Date();
    const [calendarMode, setCalendarMode] = useState('month'); // 'month' | 'year'
    const [calMonth, setCalMonth] = useState(now.getMonth());
    const [calYear, setCalYear] = useState(now.getFullYear());
    const [weightSummaryYear, setWeightSummaryYear] = useState(now.getFullYear());
    const [weightMode, setWeightMode] = useState('lowest'); // 'lowest' | 'highest'

    const loadData = async () => {
        try {
            const w = await api.getWeightLogs();
            setWeightLogs(w);
        } catch (err) {
            console.error(err);
        }
    };

    const loadAttendance = async (year) => {
        try {
            const dates = await api.getAttendance(year);
            setAttendanceDates(new Set(dates));
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => { loadData(); }, []);
    useEffect(() => { loadAttendance(calYear); }, [calYear]);

    // Calendar helpers
    const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfWeek = (month, year) => new Date(year, month, 1).getDay();

    const calendarDays = useMemo(() => {
        const daysInMonth = getDaysInMonth(calMonth, calYear);
        const firstDay = getFirstDayOfWeek(calMonth, calYear);
        const days = [];
        // Empty slots before the 1st
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let d = 1; d <= daysInMonth; d++) days.push(d);
        return days;
    }, [calMonth, calYear]);

    const todayStr = now.toISOString().split('T')[0];

    const isWorkoutDay = (day) => {
        if (!day) return false;
        const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return attendanceDates.has(dateStr);
    };

    const isFutureDay = (day) => {
        if (!day) return false;
        const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return dateStr > todayStr;
    };

    const isToday = (day) => {
        if (!day) return false;
        const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return dateStr === todayStr;
    };

    const navigateMonth = (delta) => {
        let newMonth = calMonth + delta;
        let newYear = calYear;
        if (newMonth < 0) { newMonth = 11; newYear--; }
        if (newMonth > 11) { newMonth = 0; newYear++; }
        setCalMonth(newMonth);
        setCalYear(newYear);
    };

    const workoutCountThisMonth = useMemo(() => {
        let count = 0;
        const prefix = `${calYear}-${String(calMonth + 1).padStart(2, '0')}`;
        attendanceDates.forEach(d => { if (d.startsWith(prefix)) count++; });
        return count;
    }, [attendanceDates, calMonth, calYear]);

    // Weight summary: lowest or highest weight per month for the selected year
    const monthlyWeights = useMemo(() => {
        const result = new Array(12).fill(null);
        weightLogs.forEach(log => {
            if (!log.date) return;
            const [y, m] = log.date.split('-');
            if (parseInt(y) !== weightSummaryYear) return;
            const monthIdx = parseInt(m) - 1;
            if (weightMode === 'lowest') {
                if (result[monthIdx] === null || log.weight < result[monthIdx]) {
                    result[monthIdx] = log.weight;
                }
            } else {
                if (result[monthIdx] === null || log.weight > result[monthIdx]) {
                    result[monthIdx] = log.weight;
                }
            }
        });
        return result;
    }, [weightLogs, weightSummaryYear, weightMode]);



    // ── Shared card style
    const cardStyle = {
        background: surfaceDark,
        border: `1px solid ${borderColor}`,
        borderRadius: '16px',
        padding: '20px',
    };

    const sectionLabel = (text) => (
        <h3 style={{ fontSize: '11px', fontWeight: 700, color: '#888', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px' }}>
            {text}
        </h3>
    );

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(to bottom, #262626 0%, #0D0D0D 100px)',
                padding: '16px 20px',
                paddingTop: 'calc(env(safe-area-inset-top) + 24px)',
            }}>
                <h1 style={{
                    fontSize: '32px',
                    fontWeight: 900,
                    fontStyle: 'italic',
                    textTransform: 'uppercase',
                    letterSpacing: '-0.04em',
                    marginBottom: '4px',
                }}>
                    PROGRESS
                </h1>
                <p style={{ fontSize: '12px', color: '#888', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    TRACK YOUR JOURNEY
                </p>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflow: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '100px' }}>

                {/* ═══════════════════════════════════════════ */}
                {/* SECTION 1: WORKOUT ATTENDANCE CALENDAR     */}
                {/* ═══════════════════════════════════════════ */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        {sectionLabel('Workout Attendance')}
                        {/* Month / Year toggle */}
                        <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '3px' }}>
                            {['month', 'year'].map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => setCalendarMode(mode)}
                                    style={{
                                        padding: '5px 12px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        background: calendarMode === mode ? neonLime : 'transparent',
                                        color: calendarMode === mode ? '#000' : '#888',
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        textTransform: 'capitalize',
                                    }}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Month navigation */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <button onClick={() => navigateMonth(-1)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: '4px' }}>
                            <span className="material-icons-outlined" style={{ fontSize: '20px' }}>chevron_left</span>
                        </button>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>
                            {MONTH_NAMES[calMonth]} {calYear}
                        </span>
                        <button onClick={() => navigateMonth(1)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: '4px' }}>
                            <span className="material-icons-outlined" style={{ fontSize: '20px' }}>chevron_right</span>
                        </button>
                    </div>

                    {/* Year mode: month selector strip */}
                    {calendarMode === 'year' && (
                        <div style={{
                            display: 'flex',
                            gap: '6px',
                            overflowX: 'auto',
                            paddingBottom: '12px',
                            WebkitOverflowScrolling: 'touch',
                            scrollbarWidth: 'none',
                        }}>
                            {MONTH_SHORT.map((m, i) => (
                                <button
                                    key={m}
                                    onClick={() => { setCalMonth(i); setCalendarMode('month'); }}
                                    style={{
                                        flex: '0 0 auto',
                                        padding: '6px 12px',
                                        borderRadius: '8px',
                                        border: calMonth === i ? `1px solid ${neonLime}` : `1px solid ${borderColor}`,
                                        background: calMonth === i ? 'rgba(223,255,0,0.1)' : 'transparent',
                                        color: calMonth === i ? neonLime : '#888',
                                        fontSize: '12px',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                    }}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Day headers */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
                        {DAY_HEADERS.map((d, i) => (
                            <div key={i} style={{ textAlign: 'center', fontSize: '10px', fontWeight: 700, color: '#555', padding: '4px 0' }}>
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Calendar grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                        {calendarDays.map((day, i) => {
                            const worked = isWorkoutDay(day);
                            const future = isFutureDay(day);
                            const today = isToday(day);
                            return (
                                <div
                                    key={i}
                                    style={{
                                        aspectRatio: '1',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '8px',
                                        background: worked ? 'rgba(223,255,0,0.08)' : 'transparent',
                                        border: today ? `1px solid ${neonLime}` : '1px solid transparent',
                                        opacity: future ? 0.3 : 1,
                                        position: 'relative',
                                    }}
                                >
                                    {day && (
                                        <>
                                            <span style={{
                                                fontSize: '13px',
                                                fontWeight: worked ? 800 : 500,
                                                color: worked ? neonLime : '#aaa',
                                            }}>
                                                {day}
                                            </span>
                                            {worked && (
                                                <span style={{ fontSize: '10px', lineHeight: 1 }}>🔥</span>
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Stats row */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '14px', paddingTop: '14px', borderTop: `1px solid ${borderColor}` }}>
                        <div style={{ textAlign: 'center' }}>
                            <span style={{ fontSize: '22px', fontWeight: 900, color: '#fff', fontStyle: 'italic' }}>{workoutCountThisMonth}</span>
                            <p style={{ fontSize: '10px', color: '#888', fontWeight: 600, letterSpacing: '0.1em', marginTop: '2px' }}>WORKOUTS</p>
                        </div>
                    </div>

                    {workoutCountThisMonth === 0 && (
                        <p style={{ color: '#555', fontSize: '12px', textAlign: 'center', marginTop: '8px' }}>
                            Complete workouts to see your attendance
                        </p>
                    )}
                </div>

                {/* ═══════════════════════════════════════════ */}
                {/* SECTION 2: WEIGHT PROGRESS SUMMARY         */}
                {/* ═══════════════════════════════════════════ */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        {sectionLabel('Weight Progress')}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button onClick={() => setWeightSummaryYear(y => y - 1)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: '2px' }}>
                                <span className="material-icons-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
                            </button>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{weightSummaryYear}</span>
                            <button onClick={() => setWeightSummaryYear(y => y + 1)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: '2px' }}>
                                <span className="material-icons-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
                            </button>
                        </div>
                    </div>

                    {/* Lowest / Highest toggle */}
                    <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '3px', marginBottom: '14px', alignSelf: 'flex-start', width: 'fit-content' }}>
                        {['lowest', 'highest'].map(mode => (
                            <button
                                key={mode}
                                onClick={() => setWeightMode(mode)}
                                style={{
                                    padding: '5px 14px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: weightMode === mode ? neonLime : 'transparent',
                                    color: weightMode === mode ? '#000' : '#888',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    textTransform: 'capitalize',
                                }}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>

                    {/* 3x4 grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                        {MONTH_SHORT.map((m, i) => {
                            const val = monthlyWeights[i];
                            const hasData = val !== null;
                            return (
                                <div key={m} style={{
                                    background: hasData ? 'rgba(223,255,0,0.05)' : 'rgba(255,255,255,0.02)',
                                    border: `1px solid ${hasData ? 'rgba(223,255,0,0.15)' : borderColor}`,
                                    borderRadius: '10px',
                                    padding: '12px 8px',
                                    textAlign: 'center',
                                }}>
                                    <p style={{ fontSize: '10px', fontWeight: 700, color: '#888', letterSpacing: '0.05em', marginBottom: '4px' }}>{m}</p>
                                    <p style={{
                                        fontSize: hasData ? '17px' : '14px',
                                        fontWeight: 800,
                                        color: hasData ? '#fff' : '#444',
                                        fontStyle: hasData ? 'italic' : 'normal',
                                    }}>
                                        {hasData ? val : '—'}
                                    </p>
                                    {hasData && (
                                        <p style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>lbs</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {monthlyWeights.every(v => v === null) && (
                        <p style={{ color: '#555', fontSize: '12px', textAlign: 'center', marginTop: '12px' }}>
                            Log your weight to track monthly progress
                        </p>
                    )}
                </div>



            </div>
        </div>
    );
}
