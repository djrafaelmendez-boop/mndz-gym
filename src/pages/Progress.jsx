import { useState, useEffect } from 'react';
import { api } from '../api';
import { colors } from '../styles/designTokens';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Progress() {
    const [weightLogs, setWeightLogs] = useState([]);
    const [stepsLogs, setStepsLogs] = useState([]);
    const [newWeight, setNewWeight] = useState('');
    const [newSteps, setNewSteps] = useState('');
    const [showWeightInput, setShowWeightInput] = useState(false);
    const [showStepsInput, setShowStepsInput] = useState(false);
    const [timeFilter, setTimeFilter] = useState('month');

    const loadData = async () => {
        try {
            const [w, s] = await Promise.all([api.getWeightLogs(), api.getStepsLogs()]);
            setWeightLogs(w);
            setStepsLogs(s);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleAddWeight = async () => {
        if (!newWeight) return;
        const today = new Date().toISOString().split('T')[0];
        await api.addWeightLog({ weight: parseFloat(newWeight), date: today });
        setNewWeight('');
        setShowWeightInput(false);
        loadData();
    };

    const handleAddSteps = async () => {
        if (!newSteps) return;
        const today = new Date().toISOString().split('T')[0];
        await api.addStepsLog({ steps: parseInt(newSteps), date: today });
        setNewSteps('');
        setShowStepsInput(false);
        loadData();
    };

    const filterDays = timeFilter === 'week' ? 7 : timeFilter === 'month' ? 30 : 90;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - filterDays);
    const cutoffStr = cutoff.toISOString().split('T')[0];

    const filteredWeights = weightLogs
        .filter(l => l.date >= cutoffStr)
        .sort((a, b) => a.date.localeCompare(b.date))
        .map(l => ({ date: l.date.slice(5), weight: l.weight }));

    const filteredSteps = stepsLogs
        .filter(l => l.date >= cutoffStr)
        .sort((a, b) => a.date.localeCompare(b.date))
        .map(l => ({ date: l.date.slice(5), steps: l.steps }));

    const latestWeight = weightLogs.length > 0 ? weightLogs[0].weight : null;
    const latestSteps = stepsLogs.length > 0 ? stepsLogs[0].steps : null;

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
                    marginBottom: '16px',
                }}>
                    PROGRESS
                </h1>

                {/* Time filters */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    {['week', 'month', '3months'].map(f => (
                        <button
                            key={f}
                            onClick={() => setTimeFilter(f)}
                            style={{
                                padding: '6px 14px',
                                borderRadius: '999px',
                                border: timeFilter === f ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                background: timeFilter === f ? colors.primary : 'transparent',
                                color: timeFilter === f ? '#000' : '#888',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                            }}
                        >
                            {f === '3months' ? '3 Months' : f === 'month' ? 'Month' : 'Week'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflow: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Weight Card */}
                <div style={{
                    background: colors.surfaceDark,
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '16px',
                    padding: '20px',
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '16px',
                    }}>
                        <div>
                            <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#888', letterSpacing: '0.1em', marginBottom: '4px' }}>
                                BODY WEIGHT
                            </h3>
                            {latestWeight && (
                                <span style={{ fontSize: '28px', fontWeight: 800, color: '#fff' }}>
                                    {latestWeight} <span style={{ fontSize: '14px', color: '#666' }}>lbs</span>
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => setShowWeightInput(!showWeightInput)}
                            style={{
                                background: 'rgba(223,255,0,0.1)',
                                border: `1px solid ${colors.primaryBorder}`,
                                borderRadius: '10px',
                                width: '36px',
                                height: '36px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                            }}
                        >
                            <span className="material-icons-outlined" style={{ fontSize: '18px', color: colors.primary }}>add</span>
                        </button>
                    </div>

                    {showWeightInput && (
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                            <input
                                type="number"
                                value={newWeight}
                                onChange={e => setNewWeight(e.target.value)}
                                placeholder="Weight (lbs)"
                                style={{
                                    flex: 1,
                                    padding: '10px 14px',
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '16px',
                                    fontFamily: 'Inter, sans-serif',
                                    outline: 'none',
                                }}
                            />
                            <button onClick={handleAddWeight} style={{
                                padding: '10px 16px',
                                background: colors.primary,
                                color: '#000',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 700,
                                fontSize: '13px',
                                cursor: 'pointer',
                            }}>
                                SAVE
                            </button>
                        </div>
                    )}

                    {/* Chart */}
                    {filteredWeights.length > 1 ? (
                        <div style={{ height: '180px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={filteredWeights}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                    <XAxis dataKey="date" stroke="#555" fontSize={10} />
                                    <YAxis domain={['auto', 'auto']} stroke="#555" fontSize={10} />
                                    <Tooltip
                                        contentStyle={{ background: '#1e1e1e', borderColor: '#333', borderRadius: '8px', fontSize: '12px' }}
                                        labelStyle={{ color: '#888' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="weight"
                                        stroke={colors.primary}
                                        strokeWidth={2}
                                        dot={{ fill: colors.primary, r: 3 }}
                                        activeDot={{ r: 5, fill: colors.primary, stroke: '#000' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p style={{ color: '#555', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>
                            {filteredWeights.length === 1 ? 'Add more entries to see a chart' : 'No weight entries yet'}
                        </p>
                    )}
                </div>

                {/* Steps Card */}
                <div style={{
                    background: colors.surfaceDark,
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '16px',
                    padding: '20px',
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '16px',
                    }}>
                        <div>
                            <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#888', letterSpacing: '0.1em', marginBottom: '4px' }}>
                                STEPS
                            </h3>
                            {latestSteps && (
                                <span style={{ fontSize: '28px', fontWeight: 800, color: '#fff' }}>
                                    {latestSteps.toLocaleString()}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => setShowStepsInput(!showStepsInput)}
                            style={{
                                background: 'rgba(223,255,0,0.1)',
                                border: `1px solid ${colors.primaryBorder}`,
                                borderRadius: '10px',
                                width: '36px',
                                height: '36px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                            }}
                        >
                            <span className="material-icons-outlined" style={{ fontSize: '18px', color: colors.primary }}>add</span>
                        </button>
                    </div>

                    {showStepsInput && (
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                            <input
                                type="number"
                                value={newSteps}
                                onChange={e => setNewSteps(e.target.value)}
                                placeholder="Steps today"
                                style={{
                                    flex: 1,
                                    padding: '10px 14px',
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '16px',
                                    fontFamily: 'Inter, sans-serif',
                                    outline: 'none',
                                }}
                            />
                            <button onClick={handleAddSteps} style={{
                                padding: '10px 16px',
                                background: colors.primary,
                                color: '#000',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 700,
                                fontSize: '13px',
                                cursor: 'pointer',
                            }}>
                                SAVE
                            </button>
                        </div>
                    )}

                    {filteredSteps.length > 1 ? (
                        <div style={{ height: '160px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={filteredSteps}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                    <XAxis dataKey="date" stroke="#555" fontSize={10} />
                                    <YAxis stroke="#555" fontSize={10} />
                                    <Tooltip
                                        contentStyle={{ background: '#1e1e1e', borderColor: '#333', borderRadius: '8px', fontSize: '12px' }}
                                        labelStyle={{ color: '#888' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="steps"
                                        stroke="#00E5FF"
                                        strokeWidth={2}
                                        dot={{ fill: '#00E5FF', r: 3 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p style={{ color: '#555', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>
                            {filteredSteps.length === 1 ? 'Add more entries to see a chart' : 'No steps recorded yet'}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
