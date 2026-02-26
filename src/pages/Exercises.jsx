import { useState, useEffect } from 'react';
import { api } from '../api';
import { muscleGroups, colors } from '../styles/designTokens';
import ExerciseRow from '../components/ExerciseRow';

export default function Exercises({ onNavigate }) {
    const [exercises, setExercises] = useState([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    const loadExercises = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filter !== 'all') params.muscleGroup = filter;
            if (search) params.search = search;
            const data = await api.getExercises(params);
            setExercises(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadExercises(); }, [filter, search]);

    const filters = ['all', ...muscleGroups];

    return (
        <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'Inter, sans-serif',
        }}>
            {/* ── Top gradient overlay ── */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '256px',
                background: `linear-gradient(to bottom, ${colors.bgGradientTop} 0%, ${colors.bgDark} 40%, ${colors.bgDark} 100%)`,
                opacity: 0.9,
                pointerEvents: 'none',
                zIndex: 0,
            }} />

            {/* ── Header ── */}
            <header style={{
                flexShrink: 0,
                padding: '0 24px',
                paddingTop: 'calc(env(safe-area-inset-top) + 48px)',
                paddingBottom: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                background: 'transparent',
                zIndex: 20,
                position: 'relative',
            }}>
                <div>
                    <h1 style={{
                        fontSize: '30px',
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
                    }}>
                        Exercises
                    </h1>
                    <p style={{
                        fontSize: '12px',
                        color: '#A1A1A1',
                        marginTop: '4px',
                        letterSpacing: '0.05em',
                        fontWeight: 500,
                    }}>
                        MOVEMENT DATABASE
                    </p>
                </div>
                <button
                    style={{
                        padding: '8px',
                        borderRadius: '50%',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                    }}
                >
                    <span className="material-symbols-outlined" style={{
                        fontSize: '24px',
                        color: '#9CA3AF',
                    }}>filter_list</span>
                </button>
            </header>

            {/* ── Scrollable content ── */}
            <main style={{
                flex: 1,
                overflowY: 'auto',
                paddingBottom: '96px',
                position: 'relative',
                zIndex: 10,
            }}>
                {/* ── Search bar (sticky) ── */}
                <div style={{
                    padding: '8px 24px',
                    marginBottom: '24px',
                    position: 'sticky',
                    top: 0,
                    background: 'rgba(13, 13, 13, 0.95)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    zIndex: 10,
                }}>
                    <div style={{ position: 'relative' }}>
                        <span className="material-symbols-outlined" style={{
                            position: 'absolute',
                            left: '16px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#9CA3AF',
                            fontSize: '22px',
                        }}>search</span>
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search exercises..."
                            style={{
                                width: '100%',
                                background: '#161616',
                                border: '1px solid #1F2937',
                                color: '#fff',
                                borderRadius: '12px',
                                padding: '12px 16px 12px 48px',
                                fontSize: '16px',
                                fontWeight: 500,
                                fontFamily: 'Inter, sans-serif',
                                outline: 'none',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>
                </div>

                {/* ── Category chips ── */}
                <div style={{ marginBottom: '24px' }}>
                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        overflowX: 'auto',
                        padding: '4px 24px',
                        msOverflowStyle: 'none',
                        scrollbarWidth: 'none',
                    }}>
                        {filters.map(f => {
                            const isActive = filter === f;
                            return (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    style={{
                                        flexShrink: 0,
                                        padding: '8px 20px',
                                        borderRadius: '999px',
                                        background: isActive ? '#DFFF00' : '#161616',
                                        color: isActive ? '#000' : '#9CA3AF',
                                        fontSize: '12px',
                                        fontWeight: 700,
                                        letterSpacing: '0.04em',
                                        textTransform: 'capitalize',
                                        cursor: 'pointer',
                                        border: isActive ? '1px solid #DFFF00' : '1px solid #1F2937',
                                        boxShadow: 'none',
                                        whiteSpace: 'nowrap',
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    {f === 'all' ? 'All' : f}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── RECENT + View A-Z ── */}
                <div style={{
                    padding: '0 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0 4px 8px 4px',
                    }}>
                        <h2 style={{
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#A1A1A1',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            margin: 0,
                        }}>
                            Recent
                        </h2>
                        <span style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#DFFF00',
                            cursor: 'pointer',
                        }}>
                            View A-Z
                        </span>
                    </div>

                    {/* ── Hint text ── */}
                    <div style={{ padding: '0 4px', marginBottom: '8px' }}>
                        <p style={{
                            fontSize: '10px',
                            color: 'rgba(161, 161, 161, 0.7)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.12em',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            margin: 0,
                        }}>
                            <span className="material-symbols-outlined" style={{
                                fontSize: '12px',
                            }}>touch_app</span>
                            Tap an exercise row to view Strength History
                        </p>
                    </div>

                    {/* ── Exercise list ── */}
                    {loading ? (
                        <p style={{ color: '#555', textAlign: 'center', marginTop: '32px' }}>Loading...</p>
                    ) : exercises.length === 0 ? (
                        <p style={{ color: '#555', textAlign: 'center', marginTop: '32px' }}>No exercises found</p>
                    ) : (
                        exercises.map(ex => (
                            <ExerciseRow
                                key={ex.id}
                                exercise={ex}
                                onClick={() => onNavigate('exerciseHistory', { exercise: ex })}
                            />
                        ))
                    )}
                </div>
            </main>
            {/* ── Floating Add Button (from A6 reference) ── */}
            <div style={{
                position: 'fixed',
                bottom: 'calc(90px + env(safe-area-inset-bottom))',
                right: '24px',
                zIndex: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <button
                    onClick={() => onNavigate('newExercise')}
                    style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '999px',
                        background: '#DFFF00',
                        color: '#000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: 'none',
                        transition: 'all 0.2s',
                        outline: 'none',
                    }}
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <span className="material-symbols-outlined" style={{
                        fontSize: '32px',
                        fontWeight: 'bold',
                    }}>add</span>
                </button>
            </div>
        </div>
    );
}
