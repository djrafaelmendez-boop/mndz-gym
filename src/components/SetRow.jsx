import { useState } from 'react';
import { colors } from '../styles/designTokens';

export default function SetRow({ set, onUpdate, readOnly = false }) {
    const [weight, setWeight] = useState(set.weight || 0);
    const [reps, setReps] = useState(set.reps || 0);

    const isCompleted = set.completed;

    const handleToggle = () => {
        if (readOnly) return;
        const newCompleted = !isCompleted;
        onUpdate({
            setLogId: set.id,
            weight: parseFloat(weight) || 0,
            reps: parseInt(reps) || 0,
            completed: newCompleted,
        });
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 0',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            opacity: isCompleted ? 0.7 : 1,
        }}>
            {/* Set number */}
            <span style={{
                fontSize: '14px',
                fontWeight: 800,
                color: isCompleted ? colors.completedRed : colors.primary,
                width: '30px',
                textAlign: 'center',
            }}>
                {set.setNumber}
            </span>

            {/* Weight input */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '8px',
                padding: '8px 12px',
                border: isCompleted
                    ? `1px solid ${colors.completedRedBorder}`
                    : '1px solid rgba(255,255,255,0.15)',
            }}>
                <input
                    type="number"
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                    disabled={readOnly || isCompleted}
                    style={{
                        width: '100%',
                        background: 'none',
                        border: 'none',
                        color: '#fff',
                        fontSize: '16px',
                        fontWeight: 700,
                        textAlign: 'center',
                        fontFamily: 'Inter, sans-serif',
                    }}
                />
                <span style={{ fontSize: '11px', color: '#999', fontWeight: 600 }}>lbs</span>
            </div>

            {/* × */}
            <span style={{ color: '#888', fontWeight: 700, fontSize: '14px' }}>×</span>

            {/* Reps input */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '8px',
                padding: '8px 12px',
                border: isCompleted
                    ? `1px solid ${colors.completedRedBorder}`
                    : '1px solid rgba(255,255,255,0.15)',
            }}>
                <input
                    type="number"
                    value={reps}
                    onChange={e => setReps(e.target.value)}
                    disabled={readOnly || isCompleted}
                    style={{
                        width: '100%',
                        background: 'none',
                        border: 'none',
                        color: '#fff',
                        fontSize: '16px',
                        fontWeight: 700,
                        textAlign: 'center',
                        fontFamily: 'Inter, sans-serif',
                    }}
                />
                <span style={{ fontSize: '11px', color: '#999', fontWeight: 600 }}>reps</span>
            </div>

            {/* Checkmark */}
            <button
                onClick={handleToggle}
                disabled={readOnly}
                style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    border: isCompleted
                        ? `1.5px solid ${colors.completedRed}`
                        : '1.5px solid rgba(255,255,255,0.15)',
                    background: isCompleted ? colors.completedRedDim : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: readOnly ? 'default' : 'pointer',
                    flexShrink: 0,
                    transition: 'all 0.2s',
                    boxShadow: isCompleted ? `0 0 8px ${colors.completedRedGlow}` : 'none',
                }}
            >
                <span className="material-icons-outlined" style={{
                    fontSize: '20px',
                    color: isCompleted ? colors.completedRed : '#444',
                }}>
                    check
                </span>
            </button>
        </div>
    );
}
