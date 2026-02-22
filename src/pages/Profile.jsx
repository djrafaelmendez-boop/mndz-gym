import { useState, useEffect } from 'react';
import { api } from '../api';
import { colors } from '../styles/designTokens';

export default function Profile() {
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        api.getProfile().then(setProfile).catch(console.error);
    }, []);

    const stats = [
        { label: 'WORKOUTS', value: profile?.workouts || 0, icon: 'fitness_center' },
        { label: 'STREAK', value: `${profile?.streak || 0}d`, icon: 'local_fire_department' },
        { label: 'WEIGHT', value: profile?.currentWeight ? `${profile.currentWeight} lbs` : '—', icon: 'monitor_weight' },
    ];

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(to bottom, #262626 0%, #0D0D0D 100px)',
                padding: '16px 20px',
                paddingTop: 'calc(env(safe-area-inset-top) + 24px)',
            }}>
                <h1 style={{
                    fontSize: '32px',
                    fontWeight: 900,
                    fontStyle: 'italic',
                    textTransform: 'uppercase',
                    letterSpacing: '-0.04em',
                }}>
                    PROFILE
                </h1>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflow: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Avatar + Name */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0' }}>
                    <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        border: `3px solid ${colors.primary}`,
                        boxShadow: `0 0 20px ${colors.primaryGlow}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: colors.surfaceDark,
                        marginBottom: '16px',
                    }}>
                        <span className="material-icons-outlined" style={{ fontSize: '48px', color: '#555' }}>person</span>
                    </div>
                    <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
                        {profile?.username || 'MNDZ'}
                    </h2>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: '12px' }}>
                    {stats.map(stat => (
                        <div key={stat.label} style={{
                            flex: 1,
                            background: colors.surfaceDark,
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '14px',
                            padding: '16px 12px',
                            textAlign: 'center',
                        }}>
                            <span className="material-symbols-outlined" style={{
                                fontSize: '22px',
                                color: colors.primary,
                                marginBottom: '8px',
                                display: 'block',
                            }}>
                                {stat.icon}
                            </span>
                            <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
                                {stat.value}
                            </div>
                            <div style={{ fontSize: '10px', fontWeight: 700, color: '#888', letterSpacing: '0.1em' }}>
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* App version */}
                <p style={{ fontSize: '11px', color: '#444', textAlign: 'center', padding: '8px 0' }}>
                    MNDZ Gym Tracker v1.0.0
                </p>
            </div>
        </div>
    );
}
