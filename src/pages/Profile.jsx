import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { colors } from '../styles/designTokens';

const neonLime = '#DFFF00';
const surfaceDark = '#161616';
const borderColor = '#1F2937'; // gray-800
const textSecondary = '#A1A1A1';

export default function Profile() {
    const [profile, setProfile] = useState(null);
    const { logout, user } = useAuth();

    useEffect(() => {
        api.getProfile().then(setProfile).catch(console.error);
    }, []);

    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);

    const displayName = (profile?.firstName || profile?.lastName)
        ? `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim()
        : 'MNDZ';

    const initials = displayName
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result;
            try {
                await api.updateAvatar(base64);
                setProfile(prev => ({ ...prev, profilePicture: base64 }));
            } catch (err) {
                console.error('Failed to update avatar:', err);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleToggleNotifications = async () => {
        const newVal = !profile?.notificationsEnabled;
        setProfile(prev => ({ ...prev, notificationsEnabled: newVal }));
        try {
            await api.updateNotifications(newVal);
        } catch (err) {
            console.error('Failed to update notifications:', err);
            setProfile(prev => ({ ...prev, notificationsEnabled: !newVal }));
        }
    };

    const handleToggleUnits = async () => {
        const current = profile?.preferredUnits || 'lbs';
        const newUnits = current === 'lbs' ? 'kg' : 'lbs';
        setProfile(prev => ({ ...prev, preferredUnits: newUnits }));
        try {
            await api.updateUnits(newUnits);
        } catch (err) {
            console.error('Failed to update units:', err);
            setProfile(prev => ({ ...prev, preferredUnits: current }));
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordLoading(true);
        try {
            await api.updatePassword(currentPassword, newPassword);
            setShowPasswordForm(false);
            setCurrentPassword('');
            setNewPassword('');
            alert('Password updated successfully!');
        } catch (err) {
            setPasswordError(err.message);
        } finally {
            setPasswordLoading(false);
        }
    };

    const unitLabel = (profile?.preferredUnits || 'lbs').toUpperCase();
    const stats = [
        { label: 'WORKOUTS', value: profile?.workouts || 0 },
        { label: 'STREAK', value: profile?.streak || 0 },
        { label: unitLabel, value: profile?.currentWeight || '—' },
    ];

    // -- Shared row style for menu items
    const menuRowStyle = (hasBorder = true) => ({
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: hasBorder ? `1px solid ${borderColor}` : 'none',
        cursor: 'pointer',
        transition: 'background 0.2s',
    });

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(to bottom, #262626 0%, #0D0D0D 45%)',
                padding: '16px 24px',
                paddingTop: 'calc(env(safe-area-inset-top) + 16px)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
            }}>
                <div>
                    <h1 style={{
                        fontSize: '30px',
                        fontWeight: 900,
                        fontStyle: 'italic',
                        textTransform: 'uppercase',
                        letterSpacing: '-0.04em',
                        color: '#fff',
                        lineHeight: 1,
                    }}>
                        Profile
                    </h1>
                    <p style={{
                        fontSize: '12px',
                        color: textSecondary,
                        marginTop: '4px',
                        letterSpacing: '0.05em',
                        fontWeight: 500,
                        textTransform: 'uppercase',
                    }}>
                        MEMBER SETTINGS
                    </p>
                </div>
                <button style={{
                    background: 'none',
                    border: 'none',
                    padding: '8px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    color: '#9CA3AF',
                }}>
                    <span className="material-icons-outlined" style={{ fontSize: '24px' }}>qr_code_scanner</span>
                </button>
            </div>

            {/* Scrollable Content */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '0 24px 100px 24px',
            }}>
                {/* Avatar + Name */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '16px', paddingBottom: '24px' }}>
                    {/* Avatar circle */}
                    <div style={{ position: 'relative' }}>
                        <div style={{
                            width: '112px',
                            height: '112px',
                            borderRadius: '50%',
                            border: `2px solid ${neonLime}`,
                            background: profile?.profilePicture ? `url(${profile.profilePicture}) center/cover` : surfaceDark,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            {!profile?.profilePicture && (
                                <span style={{
                                    fontSize: '36px',
                                    fontWeight: 900,
                                    color: '#fff',
                                    letterSpacing: '-0.05em',
                                    fontStyle: 'italic',
                                }}>
                                    {initials}
                                </span>
                            )}
                        </div>
                        {/* Edit button */}
                        <div style={{
                            position: 'absolute',
                            bottom: '0',
                            right: '0',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: neonLime,
                            border: `4px solid #0D0D0D`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#000',
                            padding: 0,
                            overflow: 'hidden'
                        }}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                                style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                            />
                            <span className="material-icons-outlined" style={{ fontSize: '14px', fontWeight: 'bold' }}>edit</span>
                        </div>
                    </div>

                    {/* Name */}
                    <h2 style={{
                        fontSize: '24px',
                        fontWeight: 900,
                        color: '#fff',
                        textTransform: 'uppercase',
                        letterSpacing: '-0.02em',
                        marginTop: '16px',
                    }}>
                        {displayName}
                    </h2>

                    {/* Badge row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: neonLime,
                            letterSpacing: '0.05em',
                            border: `1px solid rgba(223, 255, 0, 0.3)`,
                            background: 'rgba(223, 255, 0, 0.1)',
                            padding: '2px 8px',
                            borderRadius: '4px',
                        }}>
                            PRO MEMBER
                        </span>
                        <span style={{ fontSize: '12px', color: textSecondary }}>Since 2023</span>
                    </div>
                </div>

                {/* Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '32px' }}>
                    {stats.map(stat => (
                        <div key={stat.label} style={{
                            background: surfaceDark,
                            borderRadius: '12px',
                            padding: '16px',
                            border: `1px solid ${borderColor}`,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <span style={{
                                fontSize: '24px',
                                fontWeight: 900,
                                color: '#fff',
                                fontStyle: 'italic',
                            }}>
                                {stat.value}
                            </span>
                            <span style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                color: textSecondary,
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                marginTop: '4px',
                            }}>
                                {stat.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Account Info Section */}
                <div style={{ marginBottom: '24px' }}>
                    <h3 style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: textSecondary,
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                        marginBottom: '12px',
                        paddingLeft: '4px',
                    }}>
                        Account Info
                    </h3>
                    <div style={{
                        background: surfaceDark,
                        borderRadius: '16px',
                        border: `1px solid ${borderColor}`,
                        overflow: 'hidden',
                    }}>
                        <div style={menuRowStyle(false)} onClick={() => setShowPasswordForm(!showPasswordForm)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <span className="material-icons-outlined" style={{ fontSize: '22px', color: neonLime }}>lock</span>
                                <span style={{ fontSize: '14px', fontWeight: 700, color: '#E5E7EB' }}>Change Password</span>
                            </div>
                            <span className="material-icons-outlined" style={{ fontSize: '18px', color: '#4B5563', transition: 'transform 0.2s', transform: showPasswordForm ? 'rotate(90deg)' : 'none' }}>chevron_right</span>
                        </div>
                        {showPasswordForm && (
                            <form onSubmit={handleChangePassword} style={{ padding: '16px', borderTop: `1px solid ${borderColor}`, background: '#111' }}>
                                <input
                                    type="password"
                                    placeholder="Current Password"
                                    required
                                    value={currentPassword}
                                    onChange={e => setCurrentPassword(e.target.value)}
                                    style={{ width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '8px', background: surfaceDark, border: `1px solid ${borderColor}`, color: '#fff', outline: 'none' }}
                                />
                                <input
                                    type="password"
                                    placeholder="New Password"
                                    required
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    style={{ width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '8px', background: surfaceDark, border: `1px solid ${borderColor}`, color: '#fff', outline: 'none' }}
                                />
                                {passwordError && <p style={{ color: colors.completedRed, fontSize: '12px', marginBottom: '12px' }}>{passwordError}</p>}
                                <button type="submit" disabled={passwordLoading} style={{ width: '100%', padding: '12px', background: neonLime, color: '#000', fontWeight: 'bold', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
                                    {passwordLoading ? 'UPDATING...' : 'UPDATE PASSWORD'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Preferences Section */}
                <div style={{ marginBottom: '24px' }}>
                    <h3 style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: textSecondary,
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                        marginBottom: '12px',
                        paddingLeft: '4px',
                    }}>
                        Preferences
                    </h3>
                    <div style={{
                        background: surfaceDark,
                        borderRadius: '16px',
                        border: `1px solid ${borderColor}`,
                        overflow: 'hidden',
                    }}>
                        {/* Notifications */}
                        <div style={menuRowStyle(true)} onClick={handleToggleNotifications}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <span className="material-icons-outlined" style={{ fontSize: '22px', color: neonLime }}>notifications</span>
                                <span style={{ fontSize: '14px', fontWeight: 700, color: '#E5E7EB' }}>Notifications</span>
                            </div>
                            {/* Toggle */}
                            <div style={{
                                width: '40px',
                                height: '24px',
                                background: profile?.notificationsEnabled ? neonLime : '#374151',
                                borderRadius: '999px',
                                position: 'relative',
                                cursor: 'pointer',
                                transition: 'background 0.2s',
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    right: profile?.notificationsEnabled ? '4px' : 'calc(100% - 20px)',
                                    top: '4px',
                                    width: '16px',
                                    height: '16px',
                                    background: profile?.notificationsEnabled ? '#000' : '#E5E7EB',
                                    borderRadius: '50%',
                                    transition: 'all 0.2s',
                                }} />
                            </div>
                        </div>
                        {/* Units */}
                        <div style={menuRowStyle(false)} onClick={handleToggleUnits}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <span className="material-icons-outlined" style={{ fontSize: '22px', color: neonLime }}>fitness_center</span>
                                <span style={{ fontSize: '14px', fontWeight: 700, color: '#E5E7EB' }}>Units</span>
                            </div>
                            <span style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                color: '#000',
                                background: neonLime,
                                padding: '4px 10px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                letterSpacing: '0.05em',
                            }}>
                                {(profile?.preferredUnits || 'lbs').toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Log Out Button */}
                <button
                    onClick={logout}
                    style={{
                        width: '100%',
                        padding: '16px',
                        borderRadius: '12px',
                        border: '1px solid rgba(153, 27, 27, 0.3)',
                        background: 'rgba(127, 29, 29, 0.2)',
                        color: '#EF4444',
                        fontSize: '14px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.2s',
                    }}
                >
                    <span className="material-icons-outlined" style={{ fontSize: '20px' }}>logout</span>
                    Log Out
                </button>

                {/* Version */}
                <p style={{
                    textAlign: 'center',
                    fontSize: '10px',
                    color: '#374151',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    padding: '16px 0 32px 0',
                }}>
                    Version 2.4.0 (Build 302)
                </p>
            </div>
        </div>
    );
}
