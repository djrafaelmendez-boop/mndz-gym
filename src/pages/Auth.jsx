import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { colors } from '../styles/designTokens';
import logo from '../assets/logo_transparent.png';

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const trimmedEmail = email.trim();
            const trimmedUsername = username.trim();
            const trimmedFirstName = firstName.trim();
            const trimmedLastName = lastName.trim();

            if (isLogin) {
                await login(trimmedEmail, password);
            } else {
                if (!trimmedFirstName || !trimmedLastName) {
                    throw new Error('First Name and Last Name are required');
                }
                await register(trimmedUsername, trimmedEmail, password, trimmedFirstName, trimmedLastName);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '16px 20px',
        background: colors.surfaceDark,
        border: `1px solid ${colors.borderDark}`,
        borderRadius: '12px',
        color: '#fff',
        fontSize: '16px',
        fontWeight: 500,
        fontFamily: 'Inter, sans-serif',
        outline: 'none',
        transition: 'all 0.2s',
    };

    return (
        <div style={{
            height: '100dvh',
            background: `linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)`,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
        }}>
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                paddingTop: 'calc(env(safe-area-inset-top) + 24px)',
                paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)',
                minHeight: 'min-content',
            }}>
                {/* Logo */}
                <div style={{
                    marginBottom: '48px',
                    textAlign: 'center',
                }}>
                    <img
                        src={logo}
                        alt="MNDZ"
                        style={{
                            width: '60vw',
                            maxWidth: '320px',
                            height: 'auto',
                            marginBottom: '24px',
                        }}
                    />
                    <p style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: colors.textSecondary,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                    }}>
                        GYM TRACKER
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{
                    width: '100%',
                    maxWidth: '380px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                }}>
                    {!isLogin && (
                        <>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <input
                                    type="text"
                                    placeholder="First Name"
                                    value={firstName}
                                    onChange={e => setFirstName(e.target.value)}
                                    style={inputStyle}
                                />
                                <input
                                    type="text"
                                    placeholder="Last Name"
                                    value={lastName}
                                    onChange={e => setLastName(e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                style={inputStyle}
                            />
                        </>
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        style={inputStyle}
                        autoCapitalize="none"
                        autoCorrect="off"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        style={inputStyle}
                    />

                    {error && (
                        <p style={{
                            color: colors.completedRed,
                            fontSize: '13px',
                            textAlign: 'center',
                            animation: 'fadeIn 0.2s ease-out',
                        }}>
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '16px',
                            background: colors.primary,
                            color: '#000',
                            border: 'none',
                            borderRadius: '999px',
                            fontSize: '14px',
                            fontWeight: 900,
                            fontStyle: 'italic',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            boxShadow: 'none',
                            opacity: loading ? 0.7 : 1,
                            marginTop: '8px',
                            transition: 'all 0.2s',
                        }}
                    >
                        {loading ? '...' : isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}
                    </button>

                    <button
                        type="button"
                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: colors.textSecondary,
                            fontSize: '13px',
                            cursor: 'pointer',
                            textAlign: 'center',
                            padding: '8px',
                        }}
                    >
                        {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                    </button>
                </form>
            </div>
        </div>
    );
}
