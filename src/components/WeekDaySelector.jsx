import { colors } from '../styles/designTokens';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export default function WeekDaySelector({ selectedDate, onSelectDate, weekDates, dayStatuses = {} }) {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            paddingTop: '8px',
            paddingBottom: '16px',
            borderBottom: `1px solid ${colors.borderDark}`,
            paddingLeft: '8px',
            paddingRight: '8px',
        }}>
            {weekDates.map((date, i) => {
                const dayNum = date.getDate();
                const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
                const dateStr = date.toISOString().split('T')[0];
                const status = dayStatuses[dateStr]; // 'full', 'partial', 'missed', or undefined

                return (
                    <div
                        key={i}
                        onClick={() => onSelectDate(date)}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer',
                            opacity: isSelected ? 1 : 0.7,
                            transition: 'opacity 0.2s',
                        }}
                    >
                        <span style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            color: isSelected ? colors.primary : '#A1A1A1',
                            textShadow: 'none',
                            fontFamily: 'Inter, sans-serif',
                        }}>
                            {DAYS[i]}
                        </span>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: isSelected ? colors.primary : 'transparent',
                            boxShadow: 'none',
                            border: isSelected ? 'none' : '1px solid transparent', // Hover state handled by CSS if possible, or simple transparent
                            color: isSelected ? '#000' : '#fff',
                        }}>
                            <span style={{
                                fontSize: '14px',
                                fontWeight: 700,
                            }}>
                                {dayNum}
                            </span>
                        </div>
                        <div style={{ height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {status === 'full' ? (
                                <span className="material-symbols-outlined" style={{
                                    fontSize: '18px',
                                    color: '#DC143C', // Crimson Red
                                    textShadow: '0 0 8px rgba(220, 20, 60, 0.6)',
                                    fontVariationSettings: "'FILL' 1",
                                }}>local_fire_department</span>
                            ) : status === 'partial' ? (
                                <span className="material-symbols-outlined" style={{
                                    fontSize: '18px',
                                    color: '#FF9E00', // Neon Orange
                                    textShadow: '0 0 8px rgba(255, 158, 0, 0.6)',
                                    fontVariationSettings: "'FILL' 1",
                                }}>local_fire_department</span>
                            ) : status === 'missed' ? (
                                <span className="material-symbols-outlined" style={{
                                    fontSize: '18px',
                                    color: '#6B7280', // Grey
                                }}>block</span>
                            ) : null}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
