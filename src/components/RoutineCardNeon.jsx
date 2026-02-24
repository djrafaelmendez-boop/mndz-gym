import { colors } from '../styles/designTokens';

export default function RoutineCardNeon({ routine, status = 'ready', onStart, onEditResults }) {
    const isCompleted = status === 'completed';

    const borderColor = isCompleted ? colors.completedRedBorder : colors.primaryBorder;
    const glowColor = isCompleted ? colors.completedRedGlow : colors.primaryGlow;
    const accentColor = isCompleted ? colors.completedRed : colors.primary;

    return (
        <div style={{
            background: colors.surfaceDark,
            border: `1px solid ${borderColor}`,
            borderRadius: '16px',
            padding: '24px',
            boxShadow: 'none',
            minWidth: '280px',
            maxWidth: '100%',
            flex: '1 1 280px',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Glow orb */}
            <div style={{
                position: 'absolute',
                right: '-32px',
                top: '-32px',
                width: '120px',
                height: '120px',
                background: isCompleted ? 'rgba(255,59,59,0.06)' : 'rgba(223,255,0,0.06)',
                borderRadius: '50%',
                filter: 'blur(40px)',
                pointerEvents: 'none',
            }} />

            {/* Status badge */}
            {isCompleted && (
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    background: 'rgba(255,59,59,0.15)',
                    color: colors.completedRed,
                    padding: '4px 12px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    marginBottom: '12px',
                    alignSelf: 'flex-start',
                }}>
                    COMPLETED
                </div>
            )}

            {isCompleted && (
                <span className="material-symbols-outlined" style={{
                    fontSize: '16px',
                    color: colors.completedRed,
                    marginBottom: '4px',
                }}>local_fire_department</span>
            )}

            {/* Routine name */}
            <h3 style={{
                fontSize: '24px',
                fontWeight: 900,
                fontStyle: 'italic',
                textTransform: 'uppercase',
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                color: '#fff',
                marginBottom: '12px',
            }}>
                {routine.routineName || routine.name}
            </h3>

            {/* Tags */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {routine.difficulty && (
                    <span style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        background: 'rgba(255,255,255,0.06)',
                        color: '#aaa',
                        padding: '4px 8px',
                        borderRadius: '4px',
                    }}>
                        {routine.difficulty}
                    </span>
                )}
                {routine.estimatedMinutes && (
                    <span style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        background: 'rgba(255,255,255,0.06)',
                        color: '#aaa',
                        padding: '4px 8px',
                        borderRadius: '4px',
                    }}>
                        {routine.estimatedMinutes}m
                    </span>
                )}
            </div>

            {/* Exercise preview */}
            {routine.exercises && routine.exercises.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                    {routine.exercises.slice(0, 3).map((ex, i) => (
                        <div key={i} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '14px',
                            color: '#999',
                            padding: '4px 0',
                            borderBottom: i < routine.exercises.length - 1 ? `1px solid ${colors.borderDark}` : 'none',
                        }}>
                            <span>{ex.exerciseName}</span>
                            <span style={{
                                color: isCompleted ? colors.completedRed : '#fff',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                            }}>
                                {ex.setCount}×{ex.reps}
                                {isCompleted && (
                                    <span className="material-icons-outlined" style={{ fontSize: '14px', color: colors.completedRed }}>check</span>
                                )}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Action button */}
            {isCompleted ? (
                <button
                    onClick={onEditResults}
                    style={{
                        background: 'transparent',
                        border: `1px solid rgba(255,255,255,0.2)`,
                        color: '#fff',
                        padding: '12px 20px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 800,
                        fontStyle: 'italic',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        marginTop: 'auto',
                    }}
                >
                    EDIT RESULTS
                    <span className="material-icons-outlined" style={{ fontSize: '16px' }}>edit</span>
                </button>
            ) : (
                <button
                    onClick={onStart}
                    style={{
                        background: colors.primary,
                        border: 'none',
                        color: '#000',
                        padding: '14px 24px',
                        borderRadius: '999px',
                        fontSize: '14px',
                        fontWeight: 900,
                        fontStyle: 'italic',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: 'none',
                        marginTop: 'auto',
                    }}
                >
                    START
                    <span className="material-icons-outlined" style={{ fontSize: '18px' }}>play_arrow</span>
                </button>
            )}
        </div>
    );
}
