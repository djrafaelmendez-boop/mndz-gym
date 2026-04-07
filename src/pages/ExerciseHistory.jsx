import { useState, useEffect, useRef } from 'react';
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
    const [isEditing, setIsEditing] = useState(false);

    const fetchHistory = () => {
        if (!exercise?.id) return;
        setLoading(true);
        api.getExerciseHistory(exercise.id)
            .then(data => setHistory(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchHistory();
    }, [exercise?.id]);

    const isBodyweight = (history?.equipment || exercise?.equipment || '').toLowerCase() === 'bodyweight';
    const sessions = history?.sessions || [];
    const exerciseName = (history?.exerciseName || exercise?.name || '').toUpperCase();
    const instructions = history?.instructions || exercise?.instructions || '';
    const imageUrl = history?.imageUrl || exercise?.imageUrl || null;
    const videoUrl = history?.videoUrl || exercise?.videoUrl || null;
    const muscleGroup = (history?.muscleGroup || exercise?.muscleGroup || '').toUpperCase();
    const equipment = history?.equipment || exercise?.equipment || '';
    const exerciseId = history?.exerciseId || exercise?.id;

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
                    <h1 
                        onClick={async () => {
                            if (!isEditing) return;
                            const newVal = window.prompt("Edit Exercise Name:", exerciseName);
                            if (newVal && newVal.trim() && newVal.trim().toLowerCase() !== exerciseName.toLowerCase()) {
                                try {
                                    await api.updateExercise(exerciseId, { name: newVal.trim() });
                                    fetchHistory();
                                } catch (e) {
                                    console.error(e);
                                }
                            }
                        }}
                        style={{
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
                        cursor: isEditing ? 'pointer' : 'default',
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
                
                {/* ── Edit Button ── */}
                {mainTab === 'details' && (
                    <button 
                        onClick={() => setIsEditing(!isEditing)}
                        style={{
                            background: isEditing ? COLORS.primary : 'transparent',
                            border: isEditing ? 'none' : '1px solid #374151',
                            color: isEditing ? '#000' : '#D1D5DB',
                            padding: '6px 16px',
                            borderRadius: '99px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                        }}
                    >
                        {isEditing ? 'DONE' : 'EDIT'}
                    </button>
                )}
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
                        exerciseId={exerciseId}
                        onUpdate={fetchHistory}
                        isEditing={isEditing}
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
function DetailsContent({ imageUrl, videoUrl, instructions, exerciseName, muscleGroup, equipment, exerciseId, onUpdate, isEditing }) {
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [editingInstructions, setEditingInstructions] = useState(false);
    const [instructionsDraft, setInstructionsDraft] = useState(instructions);
    const fileInputRef = useRef(null);

    useEffect(() => {
        setInstructionsDraft(instructions);
    }, [instructions]);

    useEffect(() => {
        if (!isEditing) {
            setEditingInstructions(false);
        }
    }, [isEditing]);

    const handleSaveInstructions = async () => {
        try {
            await api.updateExercise(exerciseId, { instructions: instructionsDraft });
            setEditingInstructions(false);
            onUpdate();
        } catch (err) {
            console.error(err);
        }
    };


    const handlePhotoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                await api.updateExercise(exerciseId, { imageUrl: reader.result });
                onUpdate();
            } catch (err) {
                console.error(err);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleRemovePhoto = async () => {
        try {
            await api.updateExercise(exerciseId, { imageUrl: null });
            onUpdate();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* ── Media Section ── */}
            <div style={{ position: 'relative' }}>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handlePhotoUpload}
                />
                <div
                    onClick={() => isEditing && fileInputRef.current?.click()}
                    style={{
                        width: '100%',
                        aspectRatio: '16 / 10',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        background: '#1A1A1A',
                        border: '1px solid #1F2937',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: isEditing ? 'pointer' : 'default',
                    }}
                >
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

                {/* Remove Photo button */}
                {imageUrl && isEditing && (
                    <button
                        onClick={(e) => { e.stopPropagation(); handleRemovePhoto(); }}
                        style={{
                            position: 'absolute',
                            top: '12px',
                            left: '12px',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'rgba(0,0,0,0.7)',
                            border: 'none',
                            color: '#fff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                    </button>
                )}

                {/* Video icon button */}
                <button
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        if (isEditing) {
                            setShowVideoModal(true);
                        } else if (videoUrl) {
                            window.open(videoUrl, '_blank');
                        }
                    }}
                    style={{
                        position: 'absolute',
                        bottom: '12px',
                        right: '12px',
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: videoUrl ? 'rgba(223,255,0,0.9)' : 'rgba(40,40,40,0.7)',
                        border: 'none',
                        cursor: (isEditing || videoUrl) ? 'pointer' : 'default',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: videoUrl ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
                        transition: 'all 0.2s',
                    }}
                >
                    <span className="material-symbols-outlined" style={{
                        fontSize: '22px',
                        color: videoUrl ? '#000' : '#555',
                    }}>play_arrow</span>
                </button>
            </div>

            {/* ── How To Section ── */}
            <div
                onClick={() => { if (isEditing && !editingInstructions) setEditingInstructions(true); }}
                style={{
                    background: '#161616',
                    borderRadius: '16px',
                    border: '1px solid #1F2937',
                    padding: '20px',
                    cursor: (isEditing && !editingInstructions) ? 'pointer' : 'default',
                }}
            >
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
                        flex: 1,
                    }}>How To</h2>
                    {!editingInstructions && isEditing && (
                        <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#555' }}>edit</span>
                    )}
                </div>

                {editingInstructions ? (
                    <div>
                        <textarea
                            value={instructionsDraft}
                            onChange={e => setInstructionsDraft(e.target.value)}
                            autoFocus
                            rows={4}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: '#0D0D0D',
                                border: '1px solid #374151',
                                borderRadius: '8px',
                                color: '#D1D5DB',
                                fontSize: '13px',
                                fontFamily: 'Inter, sans-serif',
                                lineHeight: 1.7,
                                resize: 'vertical',
                                outline: 'none',
                                boxSizing: 'border-box',
                            }}
                        />
                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={(e) => { e.stopPropagation(); setEditingInstructions(false); setInstructionsDraft(instructions); }}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    border: '1px solid #374151',
                                    background: 'transparent',
                                    color: '#9CA3AF',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                }}
                            >Cancel</button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleSaveInstructions(); }}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: COLORS.primary,
                                    color: '#000',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                }}
                            >Save</button>
                        </div>
                    </div>
                ) : instructions ? (
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
                    <div 
                        onClick={async () => {
                            if (!isEditing) return;
                            const newVal = window.prompt("Edit Muscle Group:", muscleGroup);
                            if (newVal && newVal.trim() && newVal.trim().toLowerCase() !== muscleGroup.toLowerCase()) {
                                try {
                                    await api.updateExercise(exerciseId, { muscleGroup: newVal.trim() });
                                    onUpdate();
                                } catch (e) { console.error(e) }
                            }
                        }}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '10px',
                            background: 'rgba(223,255,0,0.08)',
                            border: '1px solid rgba(223,255,0,0.2)',
                            cursor: isEditing ? 'pointer' : 'default',
                        }}
                    >
                        <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#DFFF00',
                            letterSpacing: '0.06em',
                        }}>{muscleGroup}</span>
                    </div>
                )}
                {equipment && (
                    <div 
                        onClick={async () => {
                            if (!isEditing) return;
                            const newVal = window.prompt("Edit Equipment:", equipment);
                            if (newVal && newVal.trim() && newVal.trim().toLowerCase() !== equipment.toLowerCase()) {
                                try {
                                    await api.updateExercise(exerciseId, { equipment: newVal.trim() });
                                    onUpdate();
                                } catch (e) { console.error(e) }
                            }
                        }}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '10px',
                            background: 'rgba(161,161,161,0.08)',
                            border: '1px solid rgba(161,161,161,0.15)',
                            cursor: isEditing ? 'pointer' : 'default',
                        }}
                    >
                        <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#A1A1A1',
                            letterSpacing: '0.06em',
                        }}>{equipment}</span>
                    </div>
                )}
            </div>

            {/* ══ Video Link Modal ══ */}
            {showVideoModal && (
                <VideoLinkModal
                    currentUrl={videoUrl}
                    exerciseId={exerciseId}
                    onClose={() => setShowVideoModal(false)}
                    onSave={onUpdate}
                />
            )}
        </div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VIDEO LINK MODAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function VideoLinkModal({ currentUrl, exerciseId, onClose, onSave }) {
    const [url, setUrl] = useState(currentUrl || '');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.updateExercise(exerciseId, { videoUrl: url || null });
            onSave();
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleRemove = async () => {
        setSaving(true);
        try {
            await api.updateExercise(exerciseId, { videoUrl: null });
            onSave();
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100,
                padding: '24px',
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    width: '100%',
                    maxWidth: '400px',
                    background: '#1A1A1A',
                    borderRadius: '16px',
                    border: '1px solid #1F2937',
                    padding: '24px',
                }}
            >
                <h3 style={{
                    fontSize: '16px',
                    fontWeight: 900,
                    fontStyle: 'italic',
                    textTransform: 'uppercase',
                    color: '#fff',
                    marginTop: 0,
                    marginBottom: '16px',
                }}>Add Video Link</h3>

                <input
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    autoFocus
                    style={{
                        width: '100%',
                        padding: '14px 16px',
                        background: '#0D0D0D',
                        border: '1px solid #374151',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: 600,
                        fontFamily: 'Inter, sans-serif',
                        outline: 'none',
                        boxSizing: 'border-box',
                    }}
                />

                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    {currentUrl && (
                        <button
                            onClick={handleRemove}
                            disabled={saving}
                            style={{
                                padding: '10px 16px',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,68,68,0.3)',
                                background: 'transparent',
                                color: '#FF4444',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                            }}
                        >Remove</button>
                    )}
                    <div style={{ flex: 1 }} />
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 16px',
                            borderRadius: '8px',
                            border: '1px solid #374151',
                            background: 'transparent',
                            color: '#9CA3AF',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                        }}
                    >Cancel</button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                            padding: '10px 16px',
                            borderRadius: '8px',
                            border: 'none',
                            background: COLORS.primary,
                            color: '#000',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                        }}
                    >{saving ? 'Saving...' : 'Save'}</button>
                </div>
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
