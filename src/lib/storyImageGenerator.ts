import { InstagramStoryContent, MediaAsset } from '@/types';

/**
 * Generates an Instagram Story image with text overlay using Canvas API (browser-side)
 * or returns overlay config for server-side rendering via CSS
 */
export function getStoryOverlayConfig(story: InstagramStoryContent) {
  const overlayConfigs = {
    dark: {
      background: 'rgba(0,0,0,0.55)',
      headlineColor: '#FFFFFF',
      subtextColor: '#E5E7EB',
      ctaBackground: '#6366F1',
      ctaColor: '#FFFFFF',
    },
    light: {
      background: 'rgba(255,255,255,0.75)',
      headlineColor: '#111827',
      subtextColor: '#374151',
      ctaBackground: '#6366F1',
      ctaColor: '#FFFFFF',
    },
    gradient: {
      background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)',
      headlineColor: '#FFFFFF',
      subtextColor: '#F3F4F6',
      ctaBackground: '#F97316',
      ctaColor: '#FFFFFF',
    },
  };

  return overlayConfigs[story.overlayStyle] ?? overlayConfigs.dark;
}

/**
 * Generate story image as base64 using Canvas (runs in browser)
 */
export async function generateStoryImageCanvas(
  imageBase64: string,
  story: InstagramStoryContent
): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve(imageBase64);
      return;
    }

    const img = new Image();
    img.onload = () => {
      // Draw background image (cover fit)
      const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
      const x = (canvas.width - img.width * scale) / 2;
      const y = (canvas.height - img.height * scale) / 2;
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

      // Gradient overlay
      const gradient = ctx.createLinearGradient(0, canvas.height * 0.4, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, 'rgba(0,0,0,0.85)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Brand accent bar at top
      ctx.fillStyle = '#6366F1';
      ctx.fillRect(0, 0, canvas.width, 8);

      // Headline
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 96px Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const headline = story.headline.toUpperCase();
      wrapText(ctx, headline, canvas.width / 2, canvas.height * 0.72, canvas.width - 120, 110);

      // Subtext
      ctx.fillStyle = '#E5E7EB';
      ctx.font = '52px Inter, Arial, sans-serif';
      wrapText(ctx, story.subtext, canvas.width / 2, canvas.height * 0.82, canvas.width - 160, 64);

      // CTA Button
      const ctaY = canvas.height * 0.90;
      const ctaW = 400;
      const ctaH = 90;
      const ctaX = (canvas.width - ctaW) / 2;
      
      ctx.fillStyle = '#6366F1';
      roundRect(ctx, ctaX, ctaY - ctaH / 2, ctaW, ctaH, 45);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 44px Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(story.ctaText, canvas.width / 2, ctaY);

      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };

    img.onerror = () => resolve(imageBase64);
    img.src = `data:image/jpeg;base64,${imageBase64}`;
  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
