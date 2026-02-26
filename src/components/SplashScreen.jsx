import { useState, useEffect } from 'react';
import logo from '../assets/logo_transparent.png';

export default function SplashScreen({ onComplete, isReady }) {
    const [visible, setVisible] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        if (!isReady) return;

        // Wait an extra 1s after ready to ensure smooth transition
        const timer = setTimeout(() => {
            setFadeOut(true);
            setTimeout(() => {
                setVisible(false);
                if (onComplete) onComplete();
            }, 500);
        }, 1000);

        return () => clearTimeout(timer);
    }, [isReady, onComplete]);

    if (!visible) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 99999,
                background: '#0A0A0A',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: fadeOut ? 0 : 1,
                transition: 'opacity 0.5s ease-in-out',
            }}
        >
            {/* Logo — large, crisp, centered */}
            <img
                src={logo}
                alt="MNDZ"
                style={{
                    width: '100%',
                    maxWidth: '900px',
                    height: 'auto',
                    objectFit: 'contain',
                    imageRendering: 'auto',
                    marginBottom: '20px',
                }}
            />

            {/* Quote */}
            <p
                style={{
                    color: 'rgba(255, 255, 255, 0.4)',
                    fontSize: '14px',
                    fontWeight: 500,
                    fontStyle: 'italic',
                    textAlign: 'center',
                    padding: '0 32px',
                    lineHeight: 1.5,
                    fontFamily: 'Inter, system-ui, sans-serif',
                    letterSpacing: '0.02em',
                }}
            >
                Grind now, shine later.
            </p>
        </div>
    );
}
