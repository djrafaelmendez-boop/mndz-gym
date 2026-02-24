import { createCanvas, registerFont } from 'canvas';
import fs from 'fs';
import path from 'path';

// If you have a local Inter TTF, register it here
// We'll try without registering a file first and rely on system fonts,
// or we can just use "sans-serif" and draw it manually if Inter fails.
// Since Inter might not be installed on macOS globally, let's use Arial or Helvetica,
// But the user's logo MUST use "Inter". The previous HTML script used web fonts.
// Let's see if we can just download the Inter-BlackItalic.ttf file quickly.

const PRIMARY = '#DFFF00';
const BG = '#0A0A0A';

async function generate() {
    // try to load font if we downloaded it
    try {
        if (fs.existsSync('./Inter-BlackItalic.ttf')) {
            registerFont('./Inter-BlackItalic.ttf', { family: 'Inter', weight: 900, style: 'italic' });
            console.log("Registered Inter font.");
        }
    } catch (e) { }

    function drawLogoBase(ctx, width, height) {
        ctx.clearRect(0, 0, width, height);

        const isSplash = width === 2732;
        const logoScale = isSplash ? 3.5 : 1;

        const cx = width / 2;
        const cy = height / 2;

        ctx.font = `italic 900 ${280 * logoScale}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.fillStyle = PRIMARY;
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        const text = 'MNDZ';
        const yOffset = 20 * logoScale;
        ctx.fillText(text, cx, cy + yOffset);

        // Z slash effect
        const textMetrics = ctx.measureText(text);
        const mndMetrics = ctx.measureText('MND');

        const zWidth = textMetrics.width - mndMetrics.width;
        const slashX = cx + textMetrics.width / 2 - zWidth / 2;
        const slashY = cy + yOffset;

        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.moveTo(slashX - 60 * logoScale, slashY - 40 * logoScale);
        ctx.lineTo(slashX + 100 * logoScale, slashY - 40 * logoScale);
        ctx.lineTo(slashX + 60 * logoScale, slashY + 40 * logoScale);
        ctx.lineTo(slashX - 100 * logoScale, slashY + 40 * logoScale);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(slashX - 60 * logoScale, slashY - 40 * logoScale);
        ctx.lineTo(slashX + 100 * logoScale, slashY - 40 * logoScale);
        ctx.lineTo(slashX + 60 * logoScale, slashY + 40 * logoScale);
        ctx.lineTo(slashX - 100 * logoScale, slashY + 40 * logoScale);
        ctx.closePath();
        ctx.clip();

        ctx.fillText(text, cx + (15 * logoScale), cy + yOffset);
        ctx.restore();
    }

    // Icon
    const iconCanvas = createCanvas(1024, 1024);
    const iconCtx = iconCanvas.getContext('2d');
    iconCtx.fillStyle = BG;
    iconCtx.fillRect(0, 0, 1024, 1024);
    drawLogoBase(iconCtx, 1024, 1024);
    fs.writeFileSync('./src/assets/icon.png', iconCanvas.toBuffer('image/png'));

    // Splash
    const splashCanvas = createCanvas(2732, 2732);
    const splashCtx = splashCanvas.getContext('2d');
    splashCtx.fillStyle = BG;
    splashCtx.fillRect(0, 0, 2732, 2732);
    drawLogoBase(splashCtx, 2732, 2732);
    fs.writeFileSync('./src/assets/splash.png', splashCanvas.toBuffer('image/png'));

    // Logo Transparent
    const logoCanvas = createCanvas(1024, 1024);
    const logoCtx = logoCanvas.getContext('2d');
    drawLogoBase(logoCtx, 1024, 1024);
    fs.writeFileSync('./src/assets/logo_transparent.png', logoCanvas.toBuffer('image/png'));
    fs.writeFileSync('./src/assets/logo.png', iconCanvas.toBuffer('image/png')); // logo is same as icon in original setup usually

    console.log("Done generating to src/assets!");
}

generate().catch(console.error);
