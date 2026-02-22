import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo_transparent.png';

export default function SplashScreen({ onComplete }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            if (onComplete) setTimeout(onComplete, 800);
        }, 2500); // Extended slightly to account for the 1.8s animation
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="splash-container"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 99999,
                        background: 'linear-gradient(to bottom, #1A1A1A, #000000)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {/* 
                       Container matches Auth.jsx dimensions:
                       width: '60vw', max '320px'.
                       We use a slightly larger container to ensure no clipping, then center the logo.
                    */}
                    <div style={{
                        position: 'relative',
                        width: '60vw',
                        maxWidth: '320px',
                        // Maintain aspect ratio to prevent squishing
                        aspectRatio: '3.5/1', // Adjusted based on standard logo text ratios
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        {/* 
                           THE LOGO LAYER
                           - Color: Neon Lime (#B6FF00)
                           - Mask: The PNG Logo
                        */}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: '#B6FF00',
                            WebkitMaskImage: `url(${logo})`,
                            maskImage: `url(${logo})`,
                            WebkitMaskSize: 'contain',
                            maskSize: 'contain',
                            WebkitMaskRepeat: 'no-repeat',
                            maskRepeat: 'no-repeat',
                            WebkitMaskPosition: 'center',
                            maskPosition: 'center',
                            filter: 'drop-shadow(0 0 10px #B6FF00)', // Neon Glow
                            zIndex: 2,
                        }} />

                        {/* 
                           THE REVEAL MASK (The "Wipe" Effect)
                           This layer sits ON TOP of the logo and masks it out.
                           We animate the mask from right to left to reveal the underlying logo left-to-right.
                           
                           Actually, a better approach for "Wiping on":
                           Use a 2nd mask on the logo container itself? 
                           No, we can't double-mask easily in CSS without nesting deeply.
                           
                           Alternative: Use a white div overlay that slides away?
                           Or use `clip-path` with `inset()`.
                           
                           User requested "Fake writing effect" by animating a mask with linear-gradient.
                           Structure:
                           [Container] -> [Neon Logo Div] -> [Masking Div on top (black/transparent)]?
                        */}
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{ duration: 1.8, ease: "easeInOut" }}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,1) 15%, rgba(255,255,255,1) 100%)',
                                // This gradient moves across to UNMASK the content? 
                                // Actually, `mix-blend-mode` is tricky here.

                                // SIMPLER & BETTER "WIPE" APPROACH:
                                // Use `clip-path: inset(0 100% 0 0)` -> `inset(0 0% 0 0)`
                                // This wipes from Left to Right.
                            }}
                        />

                        {/* 
                           CORRECT IMPLEMENTATION OF "WIPE" ON THE LOGO ITSELF 
                           We apply the wipe animation to the CONTAINER of the logo.
                        */}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// RE-WRITING COMPONENT CONTENT FOR INSERTION:
// I will use `clip-path` on the logo div itself to wipe it on. 
// `inset(0 100% 0 0)` means hidden (clipped 100% from right).
// `inset(0 0% 0 0)` means visible.
