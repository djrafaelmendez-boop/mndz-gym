// MNDZ Gym App — Design Tokens
// Extracted from mockup HTML/CSS

export const colors = {
    // Core
    primary: '#DFFF00',        // Neon Lime
    primaryDim: 'rgba(223, 255, 0, 0.1)',
    primaryBorder: 'rgba(223, 255, 0, 0.4)',
    primaryGlow: 'rgba(223, 255, 0, 0.3)',

    // Backgrounds
    bgDark: '#0D0D0D',
    bgGradientTop: '#1a1a1a',
    bgGradientBottom: '#0a0a0a',
    surfaceDark: '#161616',
    surfaceLight: '#1e1e1e',

    // Text
    textPrimary: '#FFFFFF',
    textSecondary: '#A1A1A1',
    textMuted: '#6B7280',

    // Completed / Red state
    completedRed: '#FF3B3B',
    completedRedDim: 'rgba(255, 59, 59, 0.15)',
    completedRedBorder: 'rgba(255, 59, 59, 0.5)',
    completedRedGlow: 'rgba(255, 59, 59, 0.4)',

    // Borders
    borderDark: '#2a2a2a',
    borderSubtle: 'rgba(255,255,255,0.06)',

    // Utility
    streakOrange: '#FF9E00',
    white: '#FFFFFF',
    black: '#000000',
};

// Muscle group color mapping — consistent across the entire app
export const muscleGroupColors = {
    chest: { color: '#00E5FF', bg: 'rgba(0, 229, 255, 0.15)', border: 'rgba(0, 229, 255, 0.4)' },
    back: { color: '#BB86FC', bg: 'rgba(187, 134, 252, 0.15)', border: 'rgba(187, 134, 252, 0.4)' },
    shoulders: { color: '#FF2D78', bg: 'rgba(255, 45, 120, 0.15)', border: 'rgba(255, 45, 120, 0.4)' },
    legs: { color: '#FF6D00', bg: 'rgba(255, 109, 0, 0.15)', border: 'rgba(255, 109, 0, 0.4)' },
    abs: { color: '#DFFF00', bg: 'rgba(223, 255, 0, 0.15)', border: 'rgba(223, 255, 0, 0.4)' },
    arms: { color: '#00E676', bg: 'rgba(0, 230, 118, 0.15)', border: 'rgba(0, 230, 118, 0.4)' },
    // Legacy aliases (existing DB data may still use these)
    triceps: { color: '#00E676', bg: 'rgba(0, 230, 118, 0.15)', border: 'rgba(0, 230, 118, 0.4)' },
    biceps: { color: '#00E676', bg: 'rgba(0, 230, 118, 0.15)', border: 'rgba(0, 230, 118, 0.4)' },
};

// Material icon names for each muscle group
export const muscleGroupIcons = {
    chest: 'cardio_load',
    back: 'fitness_center',
    shoulders: 'accessibility_new',
    legs: 'directions_run',
    abs: 'sports_martial_arts',
    arms: 'fitness_center',
    // Legacy aliases
    triceps: 'fitness_center',
    biceps: 'fitness_center',
};

export const typography = {
    fontFamily: "'Inter', sans-serif",
    heading: {
        fontWeight: 900,
        fontStyle: 'italic',
        textTransform: 'uppercase',
        letterSpacing: '-0.05em',
    },
    body: {
        fontWeight: 400,
        fontSize: '14px',
    },
    label: {
        fontWeight: 700,
        fontSize: '10px',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
    },
};

export const spacing = {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
};

export const radii = {
    sm: '6px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    full: '9999px',
};

export const shadows = {
    neonGlow: '0 0 10px rgba(223, 255, 0, 0.4)',
    neonGlowStrong: '0 0 15px rgba(223, 255, 0, 0.3), 0 0 30px rgba(223, 255, 0, 0.1)',
    redGlow: '0 0 10px rgba(255, 59, 59, 0.4)',
    redGlowStrong: '0 0 15px rgba(255, 59, 59, 0.3), 0 0 30px rgba(255, 59, 59, 0.1)',
    cardSubtle: '0 0 20px rgba(223, 255, 0, 0.1)',
};

export const equipmentTypes = ['Barbell', 'Dumbbell', 'Machine', 'Bodyweight', 'Cable', 'Band'];

export const muscleGroups = ['chest', 'legs', 'arms', 'back', 'shoulders', 'abs'];

export const motivationalQuotes = [
    "Keep going.", "Show up.", "Progress over perfection.",
    "One more rep.", "Discipline equals freedom.", "Earn your rest.",
    "Stronger than yesterday.", "No shortcuts.", "Trust the process.",
    "Be relentless.", "Pain is temporary.", "Grind now, shine later.",
    "Your only limit is you.", "Push past comfortable.", "Champions train.",
    "Consistency beats intensity.", "Work in silence.", "Rise and grind.",
    "Every rep counts.", "Stay hungry.", "Never settle.",
    "Outwork everyone.", "Mind over matter.", "Built different.",
    "The iron never lies.", "Sweat is fat crying.", "Embrace the suck.",
    "Hard work pays off.", "Be uncommon.", "Go the extra mile.",
];
