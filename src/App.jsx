import { useState } from 'react';
import { WorkoutProvider, useWorkout } from './context/WorkoutContext';
import { colors } from './styles/designTokens';
import TabBar from './components/TabBar';
import SplashScreen from './components/SplashScreen';
import Schedule from './pages/Schedule';
import Routines from './pages/Routines';
import CreateRoutine from './pages/CreateRoutine';
import Exercises from './pages/Exercises';
import NewExercise from './pages/NewExercise';
import Progress from './pages/Progress';
import Profile from './pages/Profile';
import ActiveWorkout from './pages/ActiveWorkout';
import ExerciseHistory from './pages/ExerciseHistory';
import { AuthProvider, useAuth } from './context/AuthContext';
import Auth from './pages/Auth';

function AppContent() {
    const { activeSession } = useWorkout();
    const { user, loading: authLoading } = useAuth();
    const [showSplash, setShowSplash] = useState(true);
    const [activeTab, setActiveTab] = useState('schedule');
    const [subPage, setSubPage] = useState(null);
    const [subPageData, setSubPageData] = useState(null);

    const handleNavigate = (page, data) => {
        setSubPage(page);
        setSubPageData(data);
    };

    const handleBack = () => {
        setSubPage(null);
        setSubPageData(null);
    };

    if (showSplash || authLoading) {
        return <SplashScreen isReady={!authLoading} onComplete={() => setShowSplash(false)} />;
    }

    if (!user) {
        return <Auth />;
    }

    // Sub-pages (full screen overlays)
    if (subPage === 'createRoutine') {
        return <CreateRoutine onBack={handleBack} editRoutine={subPageData?.routine} />;
    }

    if (subPage === 'newExercise') {
        return <NewExercise onBack={handleBack} />;
    }

    if (subPage === 'exerciseHistory') {
        return <ExerciseHistory onBack={handleBack} exercise={subPageData?.exercise} />;
    }

    if (subPage === 'activeWorkout') {
        return <ActiveWorkout onBack={handleBack} sessionId={subPageData?.sessionId} />;
    }

    const renderPage = () => {
        switch (activeTab) {
            case 'schedule':
                return <Schedule onNavigate={handleNavigate} />;
            case 'routines':
                return <Routines onNavigate={handleNavigate} />;
            case 'exercises':
                return <Exercises onNavigate={handleNavigate} />;
            case 'progress':
                return <Progress />;
            case 'profile':
                return <Profile />;
            default:
                return <Schedule onNavigate={handleNavigate} />;
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            position: 'relative',
            isolation: 'isolate',
        }}>
            {activeSession && (
                <div
                    onClick={() => handleNavigate('activeWorkout', { sessionId: activeSession.id })}
                    style={{
                        position: 'fixed',
                        bottom: 'calc(90px + env(safe-area-inset-bottom))',
                        left: '20px',
                        zIndex: 40,
                        background: colors.surfaceDark,
                        border: `1px solid ${colors.primaryBorder}`,
                        borderRadius: '999px',
                        padding: '8px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        boxShadow: 'none',
                        maxWidth: '220px',
                        animation: 'fadeInUp 0.3s ease-out',
                    }}
                >
                    <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: colors.primary,
                        animation: 'pulse-neon 2s infinite',
                        flexShrink: 0,
                    }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                        <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#fff',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '100px',
                        }}>
                            {activeSession.routineName}
                        </span>
                        <span style={{
                            fontSize: '11px',
                            fontWeight: 900,
                            color: colors.primary,
                            flexShrink: 0,
                        }}>
                            RESUME ▸
                        </span>
                    </div>
                </div>
            )}

            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', paddingBottom: 'calc(80px + env(safe-area-inset-bottom))' }}>
                {renderPage()}
            </div>
            <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <WorkoutProvider>
                <AppContent />
            </WorkoutProvider>
        </AuthProvider>
    );
}
