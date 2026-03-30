import { useState, useEffect } from 'react';
import { api } from '../api';

// Colors — strict match to /root/variant_2 reference
const COLORS = {
    primary: '#DFFF00',
    primaryDim: '#b2cc00',
    bgDark: '#0D0D0D',
    surfaceDark: '#161616',
    textSecondary: '#A1A1A1',
    textMuted: '#6B7280',
    borderDark: '#1F2937', // gray-800
};

export default function Routines({ onNavigate }) {
    const [routines, setRoutines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');
    const [openMenu, setOpenMenu] = useState(null); // routine id with open menu
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const FILTERS = ['All', 'Chest', 'Back', 'Shoulders', 'Legs', 'Abs', 'Arms'];

    const loadRoutines = async () => {
        setLoading(true);
        try {
            const data = await api.getRoutines();
            setRoutines(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadRoutines(); }, []);

    const handleDelete = async (id) => {
        try {
            await api.deleteRoutine(id);
            loadRoutines();
        } catch (err) {
            console.error(err);
        }
    };

    // Filter routines by primary muscle group
    // "Arms" also matches biceps/triceps for backward compat
    const filteredRoutines = routines.filter(r => {
        let matchesFilter = true;
        if (activeFilter !== 'All') {
            const exercises = r.exercises || [];
            const primaryMusclesStr = r.primaryMuscles || (exercises.length > 0
                ? [...new Set(exercises.map(e => e.muscleGroup))].join(', ')
                : '');
            const muscles = primaryMusclesStr.toLowerCase();
            const f = activeFilter.toLowerCase();
            if (f === 'arms') {
                matchesFilter = muscles.includes('arms') || muscles.includes('biceps') || muscles.includes('triceps');
            } else {
                matchesFilter = muscles.includes(f);
            }
        }

        let matchesSearch = true;
        if (searchQuery.trim() !== '') {
            matchesSearch = r.name?.toLowerCase().includes(searchQuery.toLowerCase());
        }

        return matchesFilter && matchesSearch;
    });

    return (
        <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            background: `linear-gradient(to bottom, #1C1C1C 0%, #111111 30%, ${COLORS.bgDark} 100%)`,
            fontFamily: 'Inter, sans-serif',
            position: 'relative',
        }}>
            {/* Header — variant_2 strict */}
            <header style={{
                flexShrink: 0,
                padding: 'calc(env(safe-area-inset-top) + 48px) 24px 16px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                background: 'transparent',
                zIndex: 10,
            }}>
                <div>
                    <h1 style={{
                        fontSize: '42px',
                        fontWeight: 900,
                        fontFamily: 'Inter, sans-serif',
                        fontStyle: 'italic',
                        textTransform: 'uppercase',
                        letterSpacing: '-0.04em',
                        lineHeight: 1,
                        margin: 0,
                        paddingRight: '4px',
                        background: 'linear-gradient(to right, #ffffff, #888888)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        color: 'transparent',
                    }}>
                        Routines
                    </h1>
                    <p style={{
                        fontSize: '12px',
                        color: COLORS.textSecondary,
                        marginTop: '4px',
                        letterSpacing: '0.05em',
                        fontWeight: 500,
                    }}>
                        YOUR BLUEPRINT
                    </p>
                </div>
                <button 
                    onClick={() => {
                        setShowSearch(!showSearch);
                        if (showSearch) setSearchQuery('');
                    }}
                    style={{
                    padding: '8px',
                    borderRadius: '50%',
                    background: showSearch ? 'rgba(223,255,0,0.15)' : 'transparent',
                    border: showSearch ? '1px solid rgba(223,255,0,0.3)' : 'none',
                    cursor: 'pointer',
                    color: showSearch ? '#DFFF00' : '#9CA3AF',
                    transition: 'all 0.2s',
                    outline: 'none',
                }}>
                    <span className="material-symbols-outlined">
                        {showSearch ? 'close' : 'search'}
                    </span>
                </button>
            </header>

            {/* Main scrollable area */}
            <main style={{
                flex: 1,
                overflowY: 'auto',
                padding: '0 24px 120px 24px',
            }}
                onClick={() => setOpenMenu(null)} // close menus on outside click
            >
                {/* Search Bar */}
                {showSearch && (
                    <div style={{
                        paddingBottom: '16px',
                        position: 'sticky',
                        top: 0,
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
                                pointerEvents: 'none'
                            }}>search</span>
                            <input
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search routines..."
                                autoFocus
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
                )}

                {/* Category Chips */}
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    overflowX: 'auto',
                    padding: '8px 24px',
                    marginLeft: '-24px',
                    marginRight: '-24px',
                    marginBottom: '16px',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                }}>
                    {FILTERS.map(f => {
                        const isActive = activeFilter === f;
                        return (
                            <button
                                key={f}
                                onClick={() => setActiveFilter(f)}
                                style={{
                                    flexShrink: 0,
                                    padding: '6px 16px',
                                    borderRadius: '9999px',
                                    background: isActive ? COLORS.primary : COLORS.surfaceDark,
                                    border: isActive ? 'none' : `1px solid ${COLORS.borderDark}`,
                                    color: isActive ? '#000' : COLORS.textSecondary,
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    cursor: 'pointer',
                                    boxShadow: 'none',
                                    transition: 'all 0.2s',
                                }}
                            >
                                {f}
                            </button>
                        );
                    })}
                </div>

                {/* Routine Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {loading ? (
                        <p style={{ color: '#555', textAlign: 'center', marginTop: '32px' }}>Loading...</p>
                    ) : filteredRoutines.length === 0 ? (
                        <div style={{ textAlign: 'center', marginTop: '48px', color: '#555' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}>
                                assignment
                            </span>
                            <p style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>No Routines</p>
                            <p style={{ fontSize: '13px' }}>Tap + to create your first routine</p>
                        </div>
                    ) : (
                        filteredRoutines.map(routine => (
                            <RoutineCard
                                key={routine.id}
                                routine={routine}
                                isMenuOpen={openMenu === routine.id}
                                onMenuToggle={(e) => {
                                    e.stopPropagation();
                                    setOpenMenu(openMenu === routine.id ? null : routine.id);
                                }}
                                onEdit={() => {
                                    setOpenMenu(null);
                                    onNavigate('createRoutine', { routine });
                                }}
                                onDelete={() => {
                                    setOpenMenu(null);
                                    handleDelete(routine.id);
                                }}
                                onClick={() => onNavigate('createRoutine', { routine })}
                            />
                        ))
                    )}
                </div>
            </main>

            {/* Floating Action Button */}
            <button
                onClick={() => onNavigate('createRoutine')}
                style={{
                    position: 'fixed',
                    bottom: 'calc(90px + env(safe-area-inset-bottom))',
                    right: '24px',
                    width: '56px',
                    height: '56px',
                    borderRadius: '999px',
                    background: COLORS.primary,
                    border: 'none',
                    color: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: 'none',
                    zIndex: 30,
                    transition: 'transform 0.2s',
                    outline: 'none',
                }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
                <span className="material-symbols-outlined" style={{ fontSize: '32px', fontWeight: 'bold' }}>add</span>
            </button>
        </div>
    );
}

// --- Routine Card Component (matches variant_2 PNG exactly) ---
function RoutineCard({ routine, isMenuOpen, onMenuToggle, onEdit, onDelete, onClick }) {
    const exercises = routine.exercises || [];
    const muscleGroups = routine.primaryMuscles || (exercises.length > 0
        ? [...new Set(exercises.map(e => e.muscleGroup))].join(', ')
        : '');
    const difficulty = routine.difficulty || '';
    const isAdvanced = difficulty.toLowerCase() === 'advanced';

    return (
        // Gradient border wrapper
        <div
            onClick={onClick}
            style={{
                background: 'linear-gradient(135deg, rgba(223,255,0,0.5) 0%, rgba(223,255,0,0.1) 30%, rgba(223,255,0,0) 100%)',
                padding: '1px',
                borderRadius: '16px',
                cursor: 'pointer',
                position: 'relative',
            }}
        >
            <div style={{
                background: '#161616',
                borderRadius: '16px',
                padding: '20px',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Subtle glow orb */}
                <div style={{
                    position: 'absolute',
                    right: '-40px',
                    top: '-40px',
                    width: '160px',
                    height: '160px',
                    background: 'rgba(223,255,0,0.05)',
                    borderRadius: '50%',
                    filter: 'blur(48px)',
                    pointerEvents: 'none',
                }} />

                {/* Top Row: Title + ••• */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '4px',
                }}>
                    <div>
                        {/* Gradient text title */}
                        <h3 style={{
                            fontSize: '20px',
                            fontWeight: 900,
                            fontStyle: 'italic',
                            textTransform: 'uppercase',
                            letterSpacing: '-0.04em',
                            lineHeight: 1.1,
                            margin: 0,
                            paddingRight: '4px',
                            background: 'linear-gradient(to right, #ffffff, #DFFF00)',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            color: 'transparent',
                        }}>
                            {routine.name}
                        </h3>
                        <p style={{
                            fontSize: '12px',
                            fontWeight: 500,
                            color: '#A1A1A1',
                            marginTop: '4px',
                        }}>
                            {muscleGroups}
                        </p>
                    </div>

                    {/* ••• Menu */}
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={(e) => { e.stopPropagation(); onMenuToggle(e); }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#9CA3AF',
                                cursor: 'pointer',
                                padding: '4px',
                            }}
                        >
                            <span className="material-symbols-outlined">more_horiz</span>
                        </button>

                        {isMenuOpen && (
                            <div
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    position: 'absolute',
                                    right: 0,
                                    top: '32px',
                                    background: '#1e1e1e',
                                    border: '1px solid #333',
                                    borderRadius: '12px',
                                    padding: '4px',
                                    zIndex: 50,
                                    minWidth: '140px',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                                }}
                            >
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        background: 'none',
                                        border: 'none',
                                        color: '#fff',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                    }}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                                    Edit
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        background: 'none',
                                        border: 'none',
                                        color: '#FF4444',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                    }}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Difficulty badge */}
                {difficulty && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '16px',
                        marginTop: '8px',
                    }}>
                        <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            fontSize: '10px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            padding: '4px 12px',
                            borderRadius: '9999px',
                            ...(isAdvanced
                                ? {
                                    background: '#DFFF00',
                                    color: '#000',
                                    boxShadow: 'none',
                                }
                                : {
                                    background: '#1F2937',
                                    color: '#A1A1A1',
                                    border: '1px solid rgba(107,114,128,0.5)',
                                }),
                        }}>
                            {difficulty}
                        </span>
                    </div>
                )}

                {/* Exercise List */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {exercises.slice(0, 4).map((ex, i) => {
                        // Build "sets × reps" badge
                        const setCount = ex.sets?.length || ex.setCount || 0;
                        const reps = ex.sets?.[0]?.plannedReps || ex.reps || 0;
                        const repsLabel = reps === 0 ? 'FAIL' : reps;
                        const badgeText = `${setCount} × ${repsLabel}`;

                        return (
                            <div
                                key={i}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    fontSize: '14px',
                                    padding: '8px 0',
                                    borderBottom: i < exercises.length - 1 ? '1px solid rgba(31,41,55,0.5)' : 'none',
                                }}
                            >
                                <span style={{ fontWeight: 600, color: '#D1D5DB' }}>
                                    {ex.exerciseName}
                                    {ex.supersetGroupId && (
                                        <span style={{
                                            color: '#FF003C',
                                            fontSize: '8px',
                                            fontWeight: 900,
                                            marginLeft: '6px',
                                            padding: '2px 4px',
                                            background: 'rgba(255, 0, 60, 0.1)',
                                            borderRadius: '4px',
                                            verticalAlign: 'middle',
                                            textTransform: 'uppercase',
                                        }}>SUPERSET</span>
                                    )}
                                </span>
                                <span style={{
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    color: '#000',
                                    background: 'rgba(255,255,255,0.9)',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                                    whiteSpace: 'nowrap',
                                }}>
                                    {badgeText}
                                </span>
                            </div>
                        );
                    })}
                    {exercises.length > 4 && (
                        <p style={{ fontSize: '11px', color: '#555', marginTop: '4px' }}>
                            +{exercises.length - 4} more
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
