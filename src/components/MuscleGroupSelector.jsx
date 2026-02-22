import { muscleGroupColors } from '../styles/designTokens';

const groups = [
    { key: 'chest', label: 'CHEST', icon: 'exercise' },
    { key: 'back', label: 'BACK', icon: 'fitness_center' },
    { key: 'shoulders', label: 'SHOULDERS', icon: 'accessibility_new' },
    { key: 'legs', label: 'LEGS', icon: 'directions_run' },
    { key: 'abs', label: 'ABS', icon: 'sports_martial_arts' },
    { key: 'arms', label: 'ARMS', icon: 'fitness_center' },
];

export default function MuscleGroupSelector({ selected, onSelect }) {
    const selectedColor = selected ? muscleGroupColors[selected] : null;

    return (
        <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: selected
                ? `1px solid ${selectedColor?.border || 'rgba(223,255,0,0.4)'}`
                : '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '20px',
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
            }}>
                {selected ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="material-symbols-outlined" style={{
                            fontSize: '16px',
                            color: selectedColor?.color || '#DFFF00',
                        }}>check_circle</span>
                        <span style={{
                            fontSize: '12px',
                            fontWeight: 700,
                            color: selectedColor?.color || '#DFFF00',
                            letterSpacing: '0.05em',
                        }}>
                            MUSCLE GROUP SELECTED
                        </span>
                    </div>
                ) : (
                    <span style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#aaa',
                        letterSpacing: '0.05em',
                    }}>SELECT MUSCLE GROUP</span>
                )}
                {selected && (
                    <span style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#000',
                        background: selectedColor?.color || '#DFFF00',
                        padding: '3px 10px',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                    }}>
                        {selected}
                    </span>
                )}
            </div>

            {/* Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
            }}>
                {groups.map(g => {
                    const isSelected = selected === g.key;
                    const colorData = muscleGroupColors[g.key];
                    return (
                        <div
                            key={g.key}
                            onClick={() => onSelect(g.key)}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '6px',
                                cursor: 'pointer',
                                opacity: (!selected || isSelected) ? 1 : 0.4,
                                transition: 'opacity 0.2s',
                            }}
                        >
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '50%',
                                border: isSelected
                                    ? `2px solid ${colorData.color}`
                                    : '1px solid rgba(255,255,255,0.1)',
                                background: isSelected ? colorData.bg : 'rgba(255,255,255,0.04)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: isSelected ? `0 0 12px ${colorData.border}` : 'none',
                                transition: 'all 0.2s',
                            }}>
                                <span className="material-symbols-outlined" style={{
                                    fontSize: '24px',
                                    color: isSelected ? colorData.color : '#888',
                                }}>
                                    {g.icon}
                                </span>
                            </div>
                            <span style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                color: isSelected ? colorData.color : '#888',
                                letterSpacing: '0.05em',
                            }}>
                                {g.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
