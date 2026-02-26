import { colors } from '../styles/designTokens';

const tabItems = [
    { key: 'schedule', icon: 'calendar_today' },
    { key: 'routines', icon: 'assignment' },
    { key: 'exercises', icon: 'fitness_center' },
    { key: 'progress', icon: 'show_chart' },
    { key: 'profile', icon: 'person' },
];

export default function TabBar({ activeTab, onTabChange }) {
    return (
        <nav style={{
            position: 'fixed',
            bottom: 'calc(12px + env(safe-area-inset-bottom))',
            left: '16px',
            right: '16px',
            zIndex: 50,
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(22, 22, 22, 0.75)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderRadius: '999px',
                padding: '8px 16px',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 1px rgba(255,255,255,0.05)',
            }}>
                {tabItems.map(tab => {
                    const isActive = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => onTabChange(tab.key)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                background: isActive
                                    ? 'rgba(223, 255, 0, 0.08)'
                                    : 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                padding: 0,
                            }}
                        >
                            <span
                                className="material-symbols-outlined"
                                style={{
                                    fontSize: '24px',
                                    color: isActive ? '#DFFF00' : '#666666',
                                    transition: 'color 0.2s ease',
                                }}
                            >
                                {tab.icon}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
