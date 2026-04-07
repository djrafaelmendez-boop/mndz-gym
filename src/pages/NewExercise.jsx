import { useState, useRef } from 'react';
import { api } from '../api';
import { colors, equipmentTypes } from '../styles/designTokens';
import MuscleGroupSelector from '../components/MuscleGroupSelector';

export default function NewExercise({ onBack }) {
    const [name, setName] = useState('');
    const [muscleGroup, setMuscleGroup] = useState('');
    const [equipment, setEquipment] = useState('');
    const [notes, setNotes] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef(null);

    const handlePhotoSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setImageUrl(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleCreate = async () => {
        if (!name.trim()) {
            alert('Please enter an exercise name.');
            return;
        }
        if (!muscleGroup) {
            alert('Please select a primary muscle group.');
            return;
        }
        setSaving(true);
        try {
            await api.createExercise({
                name,
                muscleGroup,
                equipment: equipment || 'Bodyweight',
                notes,
                instructions: notes,
                imageUrl: imageUrl || null,
                videoUrl: videoUrl || null,
            });
            onBack();
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '14px 16px',
        background: colors.surfaceDark,
        border: `1px solid ${colors.borderDark}`,
        borderRadius: '12px',
        color: '#fff',
        fontSize: '16px',
        fontWeight: 600,
        fontFamily: 'Inter, sans-serif',
        outline: 'none',
    };

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{
                padding: '16px 20px',
                paddingTop: 'calc(env(safe-area-inset-top) + 24px)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: `linear-gradient(to bottom, ${colors.bgGradientTop} 0%, ${colors.bgDark} 100px)`,
            }}>
                <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff' }}>
                    <span className="material-icons-outlined">arrow_back</span>
                </button>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: '-0.03em' }}>
                        NEW EXERCISE
                    </h2>
                    <p style={{ fontSize: '11px', color: '#888', fontWeight: 500 }}>Add to database</p>
                </div>
            </div>

            {/* Form */}
            <div style={{ flex: 1, overflow: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#888', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>
                        EXERCISE NAME
                    </label>
                    <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Tricep Extensions"
                        style={inputStyle}
                    />
                </div>

                <MuscleGroupSelector selected={muscleGroup} onSelect={setMuscleGroup} />

                <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#888', letterSpacing: '0.1em', display: 'block', marginBottom: '10px' }}>
                        EQUIPMENT
                    </label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {equipmentTypes.map(type => (
                            <button
                                key={type}
                                onClick={() => setEquipment(type)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    border: equipment === type ? `1px solid ${colors.primary}` : '1px solid rgba(255,255,255,0.1)',
                                    background: equipment === type ? 'rgba(223,255,0,0.1)' : 'transparent',
                                    color: equipment === type ? colors.primary : '#888',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#888', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>
                        HOW TO
                    </label>
                    <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Add instructions for this exercise..."
                        rows={3}
                        style={{
                            ...inputStyle,
                            resize: 'vertical',
                        }}
                    />
                </div>

                {/* Add Photo */}
                <div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handlePhotoSelect}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            width: '100%',
                            padding: '14px 16px',
                            background: colors.surfaceDark,
                            border: `1px solid ${colors.borderDark}`,
                            borderRadius: '12px',
                            color: imageUrl ? colors.primary : '#888',
                            fontSize: '14px',
                            fontWeight: 600,
                            fontFamily: 'Inter, sans-serif',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                        }}
                    >
                        <span className="material-icons-outlined" style={{ fontSize: '20px' }}>
                            {imageUrl ? 'check_circle' : 'add_photo_alternate'}
                        </span>
                        {imageUrl ? 'Photo Added' : 'Add Photo'}
                    </button>
                    {imageUrl && (
                        <div style={{ marginTop: '8px', position: 'relative' }}>
                            <img
                                src={imageUrl}
                                alt="Preview"
                                style={{
                                    width: '100%',
                                    maxHeight: '160px',
                                    objectFit: 'cover',
                                    borderRadius: '12px',
                                    border: `1px solid ${colors.borderDark}`,
                                }}
                            />
                            <button
                                onClick={() => setImageUrl('')}
                                style={{
                                    position: 'absolute',
                                    top: '8px',
                                    right: '8px',
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    background: 'rgba(0,0,0,0.7)',
                                    border: 'none',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <span className="material-icons-outlined" style={{ fontSize: '16px' }}>close</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Add Video Link */}
                <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#888', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>
                        ADD VIDEO LINK
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="material-icons-outlined" style={{ fontSize: '20px', color: '#888', flexShrink: 0 }}>link</span>
                        <input
                            value={videoUrl}
                            onChange={e => setVideoUrl(e.target.value)}
                            placeholder="https://youtube.com/watch?v=..."
                            style={{
                                ...inputStyle,
                                flex: 1,
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Create button */}
            <div style={{ padding: '16px 20px', paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
                <button
                    onClick={handleCreate}
                    disabled={saving}
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
                        cursor: saving ? 'not-allowed' : 'pointer',
                        boxShadow: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                    }}
                >
                    <span className="material-icons-outlined" style={{ fontSize: '20px' }}>add</span>
                    {saving ? 'CREATING...' : 'CREATE EXERCISE'}
                </button>
            </div>
        </div>
    );
}
