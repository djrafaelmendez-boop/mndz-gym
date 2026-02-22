import chestIcon from '../assets/chest_new.png';
import legsIcon from '../assets/legs_new.png';
import armsIcon from '../assets/arms_new.png';
import shouldersIcon from '../assets/shoulders_new.png';
import absIcon from '../assets/abs_new.png';
import backIcon from '../assets/back_new.png';

const muscleGroupIconMap = {
    chest: chestIcon,
    back: backIcon,
    legs: legsIcon,
    shoulders: shouldersIcon,
    abs: absIcon,
    arms: armsIcon,
    triceps: armsIcon,
    biceps: armsIcon,
};

/* x6 reference: colored tag pill backgrounds */
const tagColors = {
    chest: { bg: 'rgba(30, 58, 138, 0.3)', color: '#60A5FA' },  // blue-900/30, blue-400
    back: { bg: 'rgba(88, 28, 135, 0.3)', color: '#C084FC' },  // purple-900/30, purple-400
    shoulders: { bg: 'rgba(127, 29, 29, 0.3)', color: '#F87171' },  // red-900/30, red-400
    legs: { bg: 'rgba(124, 45, 18, 0.3)', color: '#FB923C' },  // orange-900/30, orange-400
    abs: { bg: 'rgba(20, 83, 45, 0.3)', color: '#4ADE80' },  // green-900/30, green-400
    arms: { bg: 'rgba(19, 78, 74, 0.3)', color: '#2DD4BF' },  // teal-900/30, teal-400
    // Legacy aliases
    triceps: { bg: 'rgba(19, 78, 74, 0.3)', color: '#2DD4BF' },  // teal-900/30, teal-400
    biceps: { bg: 'rgba(19, 78, 74, 0.3)', color: '#2DD4BF' },  // teal-900/30, teal-400
};

export default function ExerciseRow({ exercise, onClick, selected, showCheck }) {
    const mg = exercise.muscleGroup?.toLowerCase() || 'chest';
    const icon = muscleGroupIconMap[mg] || 'fitness_center';
    const tag = tagColors[mg] || tagColors.chest;

    /* Format the tag label – arms / biceps / triceps all show as ARMS */
    const tagLabel = (mg === 'triceps' || mg === 'biceps' || mg === 'arms') ? 'ARMS' : mg.toUpperCase();

    const isImageSource = icon.includes('/') || icon.includes('data:') || icon.includes('static');

    return (
        <div
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#161616',
                borderRadius: '12px',
                padding: '12px',
                paddingRight: '16px',
                border: '1px solid #1F2937',
                cursor: onClick ? 'pointer' : 'default',
                transition: 'border-color 0.2s',
                boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(223,255,0,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1F2937'; }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}>
                {/* Icon container */}
                <div style={{
                    height: '56px',
                    width: '56px',
                    borderRadius: '8px',
                    background: '#1F2937',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    {isImageSource ? (
                        <img
                            src={icon}
                            alt=""
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                        />
                    ) : (
                        <span className="material-symbols-outlined" style={{
                            fontSize: '24px',
                            color: '#9CA3AF',
                        }}>
                            {icon}
                        </span>
                    )}
                    {/* Subtle gradient overlay like x6 */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top right, rgba(0,0,0,0.2), transparent)',
                    }} />
                </div>

                {/* Labels */}
                <div style={{ minWidth: 0 }}>
                    <h3 style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#fff',
                        margin: 0,
                        marginBottom: '4px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}>
                        {exercise.name}
                    </h3>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}>
                        {/* Tag pill */}
                        <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: tag.bg,
                            fontSize: '10px',
                            fontWeight: 700,
                            color: tag.color,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                        }}>
                            {tagLabel}
                        </span>

                        {/* Dot separator */}
                        {exercise.equipment && (
                            <>
                                <span style={{
                                    width: '4px',
                                    height: '4px',
                                    borderRadius: '50%',
                                    background: '#374151',
                                    flexShrink: 0,
                                }} />
                                <span style={{
                                    fontSize: '12px',
                                    color: '#A1A1A1',
                                    fontWeight: 500,
                                }}>
                                    {exercise.equipment}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Right side */}
            {showCheck ? (
                <span className="material-symbols-outlined" style={{
                    fontSize: '22px',
                    color: selected ? '#DFFF00' : '#333',
                }}>
                    {selected ? 'check_circle' : 'radio_button_unchecked'}
                </span>
            ) : (
                <span className="material-symbols-outlined" style={{
                    fontSize: '20px',
                    color: '#9CA3AF',
                }}>chevron_right</span>
            )}
        </div>
    );
}
