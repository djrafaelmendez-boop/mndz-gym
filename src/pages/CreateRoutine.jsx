import { useState, useEffect, useMemo } from 'react';
import { api } from '../api';
import { muscleGroups } from '../styles/designTokens';
import ExerciseRow from '../components/ExerciseRow';

// Colors — strict from references
const COLORS = {
    primary: '#DFFF00',
    primaryDim: '#b2cc00',
    bgDark: '#0D0D0D',
    surfaceDark: '#161616',
    textSecondary: '#A1A1A1',
    borderDark: '#1F2937',
};

const MUSCLE_GROUPS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Abs'];

export default function CreateRoutine({ onBack, editRoutine }) {
    const [name, setName] = useState(editRoutine?.name || '');
    const [difficulty, setDifficulty] = useState(editRoutine?.difficulty || 'Intermediate');
    const [estimatedMinutes, setEstimatedMinutes] = useState(editRoutine?.estimatedMinutes || 45);
    const [primaryMuscles, setPrimaryMuscles] = useState([]);
    const [exercises, setExercises] = useState([]);
    const [allExercises, setAllExercises] = useState([]);
    const [showPicker, setShowPicker] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [pickerSearch, setPickerSearch] = useState('');
    const [pickerFilter, setPickerFilter] = useState('all');

    useEffect(() => {
        if (editRoutine?.exercises) {
            setExercises(editRoutine.exercises.map(ex => ({
                exerciseId: ex.exerciseId,
                exerciseName: ex.exerciseName,
                muscleGroup: ex.muscleGroup,
                equipment: ex.equipment,
                prevWeight: ex.prevWeight || 0,
                sets: ex.sets?.map(s => ({
                    setNumber: s.setNumber,
                    plannedWeight: s.plannedWeight,
                    plannedReps: s.plannedReps,
                })) || [{ setNumber: 1, plannedWeight: 0, plannedReps: 10 }],
            })));
        }
        // Parse primary muscles from existing routine
        if (editRoutine?.primaryMuscles) {
            setPrimaryMuscles(editRoutine.primaryMuscles.split(',').map(s => s.trim()));
        }
    }, [editRoutine]);

    const loadExercises = async () => {
        const data = await api.getExercises();
        setAllExercises(data);
    };

    useEffect(() => {
        if (showPicker) {
            loadExercises();
            setPickerSearch('');
            setPickerFilter('all');
        }
    }, [showPicker]);

    // Filtered exercises for picker
    const filteredPickerExercises = useMemo(() => {
        let list = allExercises;
        if (pickerFilter !== 'all') {
            list = list.filter(ex => {
                const mg = (ex.muscleGroup || '').toLowerCase();
                const f = pickerFilter.toLowerCase();
                if (f === 'arms') return mg === 'arms' || mg === 'biceps' || mg === 'triceps';
                return mg === f;
            });
        }
        if (pickerSearch.trim()) {
            const q = pickerSearch.trim().toLowerCase();
            list = list.filter(ex => (ex.name || '').toLowerCase().includes(q));
        }
        return list;
    }, [allExercises, pickerFilter, pickerSearch]);

    const pickerFilters = ['all', ...muscleGroups];

    const addExercise = (ex) => {
        if (exercises.find(e => e.exerciseId === ex.id)) return;
        setExercises([...exercises, {
            exerciseId: ex.id,
            exerciseName: ex.name,
            muscleGroup: ex.muscleGroup,
            equipment: ex.equipment,
            prevWeight: ex.prevWeight || 0,
            sets: [
                { setNumber: 1, plannedWeight: 0, plannedReps: 10 },
                { setNumber: 2, plannedWeight: 0, plannedReps: 10 },
                { setNumber: 3, plannedWeight: 0, plannedReps: 10 },
            ],
        }]);
        setShowPicker(false);
    };

    const removeExercise = (index) => {
        setExercises(exercises.filter((_, i) => i !== index));
    };

    const updateSet = (exIndex, setIndex, field, value) => {
        const updated = [...exercises];
        updated[exIndex].sets[setIndex] = {
            ...updated[exIndex].sets[setIndex],
            [field]: value === '' ? '' : parseFloat(value) || 0,
        };
        setExercises(updated);
    };

    const addSet = (exIndex) => {
        const updated = [...exercises];
        const sets = updated[exIndex].sets;
        sets.push({
            setNumber: sets.length + 1,
            plannedWeight: sets[sets.length - 1]?.plannedWeight || 0,
            plannedReps: sets[sets.length - 1]?.plannedReps || 10,
        });
        setExercises(updated);
    };

    const removeSet = (exIndex, setIndex) => {
        const updated = [...exercises];
        updated[exIndex].sets.splice(setIndex, 1);
        updated[exIndex].sets.forEach((s, i) => { s.setNumber = i + 1; });
        setExercises(updated);
    };

    const toggleMuscle = (muscle) => {
        setPrimaryMuscles(prev =>
            prev.includes(muscle)
                ? prev.filter(m => m !== muscle)
                : [...prev, muscle]
        );
    };

    const handleSave = async () => {
        if (!name.trim()) {
            alert('Please enter a routine name.');
            return;
        }
        if (exercises.length === 0) {
            alert('Please add at least one exercise to your routine.');
            return;
        }
        setSaving(true);
        try {
            const data = {
                name,
                difficulty,
                estimatedMinutes: parseInt(estimatedMinutes),
                primaryMuscles: primaryMuscles.length > 0
                    ? primaryMuscles.join(', ')
                    : [...new Set(exercises.map(e => e.muscleGroup))].join(', '),
                exercises,
            };
            if (editRoutine?.id) {
                await api.updateRoutine(editRoutine.id, data);
            } else {
                await api.createRoutine(data);
            }
            onBack();
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    // ── Exercise Picker Screen ──
    if (showPicker) {
        return (
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                background: `linear-gradient(to bottom, #1C1C1C 0%, #111111 30%, ${COLORS.bgDark} 100%)`,
                fontFamily: 'Inter, sans-serif',
            }}>
                {/* Header */}
                <div style={{
                    padding: 'calc(env(safe-area-inset-top) + 16px) 24px 16px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    background: 'transparent',
                }}>
                    <button onClick={() => setShowPicker(false)} style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '8px',
                        marginLeft: '-8px',
                        borderRadius: '50%',
                    }}>
                        <span className="material-symbols-outlined" style={{ color: '#9CA3AF' }}>arrow_back</span>
                    </button>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: 900,
                        fontStyle: 'italic',
                        textTransform: 'uppercase',
                        letterSpacing: '-0.03em',
                        color: '#fff',
                    }}>
                        Add Exercise
                    </h2>
                </div>

                {/* Search Bar */}
                <div style={{
                    padding: '0 24px',
                    marginBottom: '12px',
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
                            value={pickerSearch}
                            onChange={e => setPickerSearch(e.target.value)}
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

                {/* Muscle Group Filter Chips */}
                <div style={{ marginBottom: '12px' }}>
                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        overflowX: 'auto',
                        padding: '4px 24px',
                        msOverflowStyle: 'none',
                        scrollbarWidth: 'none',
                    }}>
                        {pickerFilters.map(f => {
                            const isActive = pickerFilter === f;
                            return (
                                <button
                                    key={f}
                                    onClick={() => setPickerFilter(f)}
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

                {/* Exercise List */}
                <div style={{ flex: 1, overflow: 'auto', paddingBottom: '24px' }}>
                    {filteredPickerExercises.length === 0 ? (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '48px 24px',
                            gap: '12px',
                        }}>
                            <span className="material-symbols-outlined" style={{
                                fontSize: '48px',
                                color: '#374151',
                            }}>search_off</span>
                            <p style={{
                                color: '#555',
                                fontSize: '14px',
                                fontWeight: 600,
                                textAlign: 'center',
                            }}>No exercises found</p>
                            <p style={{
                                color: '#444',
                                fontSize: '12px',
                                textAlign: 'center',
                            }}>Try a different search or filter</p>
                        </div>
                    ) : (
                        filteredPickerExercises.map(ex => (
                            <ExerciseRow
                                key={ex.id}
                                exercise={ex}
                                onClick={() => addExercise(ex)}
                                selected={exercises.some(e => e.exerciseId === ex.id)}
                                showCheck
                            />
                        ))
                    )}
                </div>
            </div>
        );
    }

    // ── EDIT MODE (variant_1) ──
    if (editRoutine) {
        return (
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                background: `linear-gradient(to bottom, #1C1C1C 0%, #111111 30%, ${COLORS.bgDark} 100%)`,
                fontFamily: 'Inter, sans-serif',
            }}>
                {/* Header */}
                <header style={{
                    flexShrink: 0,
                    padding: 'calc(env(safe-area-inset-top) + 16px) 24px 16px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
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
                        <span className="material-symbols-outlined" style={{ color: '#9CA3AF' }}>arrow_back</span>
                    </button>
                    <h1 style={{
                        fontSize: '20px',
                        fontWeight: 900,
                        fontStyle: 'italic',
                        textTransform: 'uppercase',
                        letterSpacing: '-0.04em',
                        color: '#fff',
                    }}>
                        Edit Routine
                    </h1>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: COLORS.primary,
                            fontWeight: 700,
                            fontSize: '14px',
                            cursor: 'pointer',
                            letterSpacing: '0.05em',
                        }}
                    >
                        {saving ? 'SAVING...' : 'SAVE'}
                    </button>
                </header>

                {/* Scrollable content */}
                <main style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '0 16px 40px 16px',
                }}>
                    {/* Routine Name */}
                    <div style={{ padding: '0 8px', marginBottom: '24px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '11px',
                            fontWeight: 700,
                            color: COLORS.textSecondary,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            marginBottom: '8px',
                        }}>
                            Routine Name
                        </label>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            style={{
                                width: '100%',
                                background: COLORS.surfaceDark,
                                border: `1px solid ${COLORS.borderDark}`,
                                borderRadius: '12px',
                                padding: '12px 16px',
                                fontSize: '18px',
                                fontWeight: 700,
                                color: '#fff',
                                outline: 'none',
                                fontFamily: 'Inter, sans-serif',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>

                    {/* Exercise Blocks */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {exercises.map((ex, exIndex) => (
                            <EditExerciseBlock
                                key={exIndex}
                                exercise={ex}
                                exIndex={exIndex}
                                onUpdateSet={updateSet}
                                onAddSet={addSet}
                                onRemoveSet={removeSet}
                                onRemoveExercise={removeExercise}
                            />
                        ))}
                    </div>

                    {/* Add Exercise (dashed) */}
                    <button
                        onClick={() => setShowPicker(true)}
                        style={{
                            width: '100%',
                            padding: '16px',
                            border: '2px dashed #374151',
                            borderRadius: '16px',
                            background: 'transparent',
                            color: COLORS.textSecondary,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            marginTop: '24px',
                            fontSize: '13px',
                        }}
                    >
                        <span className="material-symbols-outlined">add_circle</span>
                        Add Exercise
                    </button>
                </main>
            </div>
        );
    }

    // ── CREATE MODE (variant_3) ──
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
            {/* Header */}
            <header style={{
                flexShrink: 0,
                padding: 'calc(env(safe-area-inset-top) + 16px) 24px 16px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'transparent',
                zIndex: 10,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={onBack} style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '8px',
                        marginLeft: '-8px',
                        borderRadius: '50%',
                    }}>
                        <span className="material-symbols-outlined" style={{ color: '#9CA3AF' }}>arrow_back</span>
                    </button>
                    <div>
                        <h1 style={{
                            fontSize: '24px',
                            fontWeight: 900,
                            fontStyle: 'italic',
                            textTransform: 'uppercase',
                            letterSpacing: '-0.04em',
                            color: '#fff',
                            lineHeight: 1,
                            margin: 0,
                        }}>
                            New Routine
                        </h1>
                        <p style={{
                            fontSize: '12px',
                            color: COLORS.textSecondary,
                            letterSpacing: '0.05em',
                            fontWeight: 500,
                            marginTop: '2px',
                        }}>
                            DESIGN YOUR BLUEPRINT
                        </p>
                    </div>
                </div>
                <button
                    onClick={onBack}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: COLORS.textSecondary,
                        fontWeight: 700,
                        fontSize: '14px',
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                    }}
                >
                    Cancel
                </button>
            </header>

            {/* Scrollable content */}
            <main style={{
                flex: 1,
                overflowY: 'auto',
                padding: '0 24px 140px 24px',
            }}>
                {/* Routine Name */}
                <div style={{ marginBottom: '32px' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: COLORS.textSecondary,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        marginBottom: '8px',
                        marginLeft: '4px',
                    }}>
                        Routine Name
                    </label>
                    <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Heavy Push Day"
                        style={{
                            width: '100%',
                            background: COLORS.surfaceDark,
                            border: '1px solid transparent',
                            borderRadius: '12px',
                            padding: '16px',
                            fontSize: '18px',
                            fontWeight: 700,
                            color: '#fff',
                            outline: 'none',
                            fontFamily: 'Inter, sans-serif',
                            boxSizing: 'border-box',
                        }}
                    />
                </div>

                {/* Primary Muscles */}
                <div style={{ marginBottom: '32px' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: COLORS.textSecondary,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        marginBottom: '12px',
                        marginLeft: '4px',
                    }}>
                        Primary Muscles
                    </label>
                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        overflowX: 'auto',
                        marginLeft: '-24px',
                        marginRight: '-24px',
                        paddingLeft: '24px',
                        paddingRight: '24px',
                        paddingBottom: '8px',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                    }}>
                        {MUSCLE_GROUPS.map(m => {
                            const isActive = primaryMuscles.includes(m);
                            return (
                                <button
                                    key={m}
                                    onClick={() => toggleMuscle(m)}
                                    style={{
                                        flexShrink: 0,
                                        padding: '10px 20px',
                                        borderRadius: '9999px',
                                        background: isActive ? COLORS.primary : COLORS.surfaceDark,
                                        border: isActive ? `1px solid ${COLORS.primary}` : `1px solid ${COLORS.borderDark}`,
                                        color: isActive ? '#000' : '#9CA3AF',
                                        fontSize: '14px',
                                        fontWeight: isActive ? 900 : 700,
                                        fontStyle: isActive ? 'italic' : 'normal',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        cursor: 'pointer',
                                        boxShadow: 'none',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {m}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Add Exercises (dashed) */}
                <div style={{ marginBottom: '32px' }}>
                    <button
                        onClick={() => setShowPicker(true)}
                        style={{
                            width: '100%',
                            padding: '20px',
                            borderRadius: '16px',
                            border: '2px dashed #374151',
                            background: 'rgba(22,22,22,0.3)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            color: '#9CA3AF',
                            transition: 'all 0.2s',
                        }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>add_circle</span>
                        <span style={{
                            fontSize: '14px',
                            fontWeight: 900,
                            fontStyle: 'italic',
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                        }}>
                            Add Exercises From Catalogue
                        </span>
                    </button>
                </div>

                {/* Routine Preview */}
                {exercises.length > 0 && (
                    <div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-end',
                            padding: '0 4px',
                            marginBottom: '16px',
                        }}>
                            <label style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                color: COLORS.textSecondary,
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                            }}>
                                Routine Preview
                            </label>
                            <span style={{
                                fontSize: '10px',
                                color: '#6B7280',
                                fontFamily: 'monospace',
                            }}>
                                {exercises.length} EXERCISES
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {exercises.map((ex, i) => (
                                editingIndex === i ? (
                                    <div key={i}>
                                        <EditExerciseBlock
                                            exercise={ex}
                                            exIndex={i}
                                            onUpdateSet={updateSet}
                                            onAddSet={addSet}
                                            onRemoveSet={removeSet}
                                            onRemoveExercise={removeExercise}
                                        />
                                        <button
                                            onClick={() => setEditingIndex(null)}
                                            style={{
                                                width: '100%',
                                                marginTop: '8px',
                                                background: 'rgba(223, 255, 0, 0.1)',
                                                border: '1px solid rgba(223, 255, 0, 0.3)',
                                                borderRadius: '8px',
                                                padding: '10px',
                                                color: '#DFFF00',
                                                fontSize: '12px',
                                                fontWeight: 700,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            Done Editing
                                        </button>
                                    </div>
                                ) : (
                                    <PreviewCard
                                        key={i}
                                        exercise={ex}
                                        onRemove={() => removeExercise(i)}
                                        onEdit={() => setEditingIndex(i)}
                                    />
                                )
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Fixed bottom CTA */}
            <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '24px',
                background: `linear-gradient(to top, ${COLORS.bgDark} 60%, transparent 100%)`,
                zIndex: 40,
                paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
            }}>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                        width: '100%',
                        padding: '16px',
                        borderRadius: '9999px',
                        background: COLORS.primary,
                        border: 'none',
                        color: '#000',
                        fontWeight: 900,
                        fontStyle: 'italic',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        fontSize: '18px',
                        cursor: saving ? 'not-allowed' : 'pointer',
                        boxShadow: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.2s',
                    }}
                >
                    <span className="material-symbols-outlined">check_circle</span>
                    {saving ? 'Creating...' : 'Create Routine'}
                </button>
            </div>
        </div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EDIT MODE: Exercise Block (variant_1)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function EditExerciseBlock({ exercise, exIndex, onUpdateSet, onAddSet, onRemoveSet, onRemoveExercise }) {
    return (
        <div style={{
            background: '#161616',
            border: '1px solid #1F2937',
            borderRadius: '16px',
            padding: '20px',
        }}>
            {/* Exercise Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '24px',
            }}>
                <div>
                    <h3 style={{
                        fontSize: '18px',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        margin: 0,
                    }}>
                        {exercise.exerciseName}
                        <span className="material-symbols-outlined" style={{
                            fontSize: '16px',
                            color: '#DFFF00',
                        }}>edit</span>
                    </h3>
                    <p style={{
                        fontSize: '12px',
                        fontWeight: 500,
                        color: '#A1A1A1',
                        marginTop: '4px',
                    }}>
                        {exercise.muscleGroup || 'General'}
                    </p>
                </div>
                <button
                    onClick={() => onRemoveExercise(exIndex)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#9CA3AF',
                        cursor: 'pointer',
                        padding: '4px',
                    }}
                >
                    <span className="material-symbols-outlined">delete</span>
                </button>
            </div>

            {/* Column Headers */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 4fr 4fr 2fr',
                gap: '12px',
                marginBottom: '12px',
                padding: '0 4px',
            }}>
                <span style={colHeaderStyle}>Set</span>
                <span style={{ ...colHeaderStyle, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span>Weight (lbs)</span>
                    <span style={{ fontSize: '8px', color: '#6B7280', marginTop: '2px', fontStyle: 'italic', letterSpacing: '0.05em' }}>
                        PREV: {exercise.prevWeight || '--'}
                    </span>
                </span>
                <span style={colHeaderStyle}>Reps</span>
                <span style={colHeaderStyle}></span>
            </div>

            {/* Set Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {exercise.sets.map((set, setIndex) => (
                    <div key={setIndex} style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 4fr 4fr 2fr',
                        gap: '12px',
                        alignItems: 'center',
                    }}>
                        {/* Set # */}
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <span style={{
                                width: '24px',
                                height: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '50%',
                                background: '#1F2937',
                                fontSize: '12px',
                                fontWeight: 700,
                                color: '#9CA3AF',
                            }}>
                                {set.setNumber}
                            </span>
                        </div>

                        {/* Weight */}
                        <input
                            type="number"
                            value={set.plannedWeight}
                            onChange={e => onUpdateSet(exIndex, setIndex, 'plannedWeight', e.target.value)}
                            style={setInputStyle}
                        />

                        {/* Reps */}
                        <input
                            type="number"
                            value={set.plannedReps}
                            onChange={e => onUpdateSet(exIndex, setIndex, 'plannedReps', e.target.value)}
                            style={setInputStyle}
                        />

                        {/* Remove */}
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <button
                                onClick={() => onRemoveSet(exIndex, setIndex)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#6B7280',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>remove_circle_outline</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* + Add Set */}
            <div style={{
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1px solid rgba(31,41,55,0.5)',
                display: 'flex',
                justifyContent: 'center',
            }}>
                <button
                    onClick={() => onAddSet(exIndex)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#DFFF00',
                        fontSize: '12px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        borderRadius: '9999px',
                    }}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add</span>
                    Add Set
                </button>
            </div>
        </div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CREATE MODE: Preview Card (variant_3)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function PreviewCard({ exercise, onRemove, onEdit }) {
    const tags = [exercise.muscleGroup, exercise.equipment].filter(Boolean);
    const setCount = exercise.sets?.length || 0;
    const reps = exercise.sets?.[0]?.plannedReps || 0;
    const weight = exercise.sets?.[0]?.plannedWeight;

    return (
        <div style={{
            background: '#161616',
            border: '1px solid #1F2937',
            borderRadius: '12px',
            padding: '16px',
        }}>
            {/* Title + X */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '8px',
            }}>
                <h3 style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#fff',
                    margin: 0,
                }}>
                    {exercise.exerciseName}
                </h3>
                <button
                    onClick={onRemove}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#6B7280',
                        cursor: 'pointer',
                        padding: '2px',
                    }}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                </button>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    {tags.map((tag, i) => (
                        <span key={i} style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            background: '#1F2937',
                            color: '#D1D5DB',
                            padding: '2px 6px',
                            borderRadius: '4px',
                        }}>
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Stats bar */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#0D0D0D',
                borderRadius: '8px',
                padding: '12px',
                border: '1px solid #1F2937',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={statLabelStyle}>Sets</div>
                        <div style={{ ...statValueStyle, color: '#DFFF00' }}>{setCount}</div>
                    </div>
                    <div style={{ width: '1px', height: '24px', background: '#1F2937' }} />
                    <div style={{ textAlign: 'center' }}>
                        <div style={statLabelStyle}>Weight</div>
                        <div style={{ ...statValueStyle, opacity: weight ? 1 : 0.5 }}>
                            {weight || '-'}
                        </div>
                    </div>
                    <div style={{ width: '1px', height: '24px', background: '#1F2937' }} />
                    <div style={{ textAlign: 'center' }}>
                        <div style={statLabelStyle}>Reps</div>
                        <div style={statValueStyle}>{reps}</div>
                    </div>
                </div>
                <button
                    onClick={onEdit}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#DFFF00',
                        cursor: 'pointer',
                        padding: '4px',
                    }}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                </button>
            </div>
        </div>
    );
}

// ── Shared Styles ──
const colHeaderStyle = {
    fontSize: '10px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#A1A1A1',
    textAlign: 'center',
};

const setInputStyle = {
    width: '100%',
    background: 'transparent',
    border: '1px solid #374151',
    borderRadius: '8px',
    padding: '8px 8px',
    textAlign: 'center',
    fontWeight: 700,
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'Inter, sans-serif',
    boxSizing: 'border-box',
};

const statLabelStyle = {
    fontSize: '10px',
    color: '#6B7280',
    fontWeight: 700,
    textTransform: 'uppercase',
    marginBottom: '2px',
};

const statValueStyle = {
    fontSize: '14px',
    fontFamily: 'monospace',
    color: '#fff',
    fontWeight: 700,
};
