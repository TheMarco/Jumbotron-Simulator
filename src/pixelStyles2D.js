// pixelStyles2D.js

export const pixelStyles2D = {
  square: {
    name: 'Square LED',
    description: 'Classic square LED pixels with sharp edges',
    pixelSize: 4,
    pixelGap: 2,
    render: (ctx, x, y, r, g, b, brightness) => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(x - 1.5, y - 1.5, 7, 7);
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(x, y, 4, 4);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(x + 0.4, y + 0.4, 3.2, 3.2);
      if (brightness > 0.5) {
        const glow = ctx.createRadialGradient(x + 2, y + 2, 0, x + 2, y + 2, 4 * 1.2);
        glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.7)`);
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x + 2, y + 2, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  },

  rgb: {
    name: 'RGB TV',
    description: 'Classic RGB subpixel arrangement like TV/monitor screens',
    pixelSize: 6,
    pixelGap: 1,
    render: (ctx, x, y, r, g, b, brightness) => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(x - 1.5, y - 1.5, 9, 9);
      const subPixelWidth = 1.5;
      const subPixelHeight = 6;
      ctx.fillStyle = `rgb(${r}, 0, 0)`;
      ctx.fillRect(x, y, subPixelWidth, subPixelHeight);
      ctx.fillStyle = `rgb(0, ${g}, 0)`;
      ctx.fillRect(x + subPixelWidth + 0.5, y, subPixelWidth, subPixelHeight);
      ctx.fillStyle = `rgb(0, 0, ${b})`;
      ctx.fillRect(x + (subPixelWidth + 0.5) * 2, y, subPixelWidth, subPixelHeight);
      ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
      ctx.fillRect(x + subPixelWidth, y, 0.5, subPixelHeight);
      ctx.fillRect(x + subPixelWidth * 2 + 0.5, y, 0.5, subPixelHeight);
      if (brightness > 0.6) {
        const glow = ctx.createRadialGradient(x + 3, y + 3, 0, x + 3, y + 3, 6);
        glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.3)`);
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x + 3, y + 3, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  },

  round: {
    name: 'Round LED',
    description: 'Circular LED pixels with soft glow',
    pixelSize: 4,
    pixelGap: 3,
    render: (ctx, x, y, r, g, b, brightness) => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(x - 2, y - 2, 8, 8);
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.beginPath();
      ctx.arc(x + 2, y + 2, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 0, 0, 1.0)';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.arc(x + 2, y + 2, 2.5, 0, Math.PI * 2);
      ctx.stroke();
      const glow = ctx.createRadialGradient(x + 2, y + 2, 0, x + 2, y + 2, 3);
      glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.3 + brightness * 0.5})`);
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x + 2, y + 2, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  crt: {
    name: 'CRT TV',
    description: 'Retro CRT TV effect with phosphor dots and continuous horizontal scanlines',
    pixelSize: 5,
    pixelGap: 1,
    render: (ctx, x, y, r, g, b, brightness) => {
      // Draw black background (with extra area to cover gaps)
      ctx.fillStyle = '#000000';
      ctx.fillRect(x - 1.5, y - 1.5, 8, 8);
      // Draw the base pixel.
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(x, y, 5, 5);
      // Outline for definition.
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(x, y, 5, 5);
      // Draw horizontal scanline spanning the full cell width (5 + gap 1 = 6).
      if (Math.floor(y / 6) % 2 === 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(x, y, 6, 1);
      }
      // Phosphor dots.
      ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.15})`;
      ctx.beginPath();
      ctx.arc(x + 1, y + 1, 0.7, 0, Math.PI * 2);
      ctx.arc(x + 3, y + 3, 0.7, 0, Math.PI * 2);
      ctx.fill();
      // Subtle glow if brightness permits.
      if (brightness > 0.3) {
        const glow = ctx.createRadialGradient(x + 2.5, y + 2.5, 0, x + 2.5, y + 2.5, 5);
        glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.2)`);
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(x, y, 5, 5);
      }
    }
  },
  dot: {
    name: 'Dot Matrix',
    description: 'Classic dot matrix display with tiny bright dots',
    pixelSize: 2,
    pixelGap: 4,
    render: (ctx, x, y, r, g, b, brightness) => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(x - 2, y - 2, 6, 6);
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.beginPath();
      ctx.arc(x + 1, y + 1, 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 0, 0, 1.0)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(x + 1, y + 1, 1.3, 0, Math.PI * 2);
      ctx.stroke();
      const glow = ctx.createRadialGradient(x + 1, y + 1, 0, x + 1, y + 1, 4);
      glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.4 + brightness * 0.6})`);
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x + 1, y + 1, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  jumbotron: {
    name: 'Stadium Jumbotron',
    description: 'Large stadium display with visible LED clusters',
    pixelSize: 6,
    pixelGap: 3,
    render: (ctx, x, y, r, g, b, brightness) => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(x - 2, y - 2, 10, 10);
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(x, y, 6, 6, 1);
      } else {
        ctx.rect(x, y, 6, 6);
      }
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 0, 0, 1.0)';
      ctx.lineWidth = 1.2;
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(x, y, 6, 6, 1);
        ctx.stroke();
      } else {
        ctx.strokeRect(x, y, 6, 6);
      }
      const ledSize = 1.5;
      ctx.fillStyle = `rgb(${Math.min(255, r + 20)}, ${g}, ${b})`;
      ctx.beginPath();
      ctx.arc(x + 3 - ledSize, y + 3 - ledSize, ledSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgb(${r}, ${Math.min(255, g + 20)}, ${b})`;
      ctx.beginPath();
      ctx.arc(x + 3 + ledSize, y + 3 - ledSize, ledSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgb(${r}, ${g}, ${Math.min(255, b + 20)})`;
      ctx.beginPath();
      ctx.arc(x + 3, y + 3 + ledSize, ledSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.arc(x + 3 - ledSize, y + 3 - ledSize, ledSize, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + 3 + ledSize, y + 3 - ledSize, ledSize, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + 3, y + 3 + ledSize, ledSize, 0, Math.PI * 2);
      ctx.stroke();
      if (brightness > 0.4) {
        const glow = ctx.createRadialGradient(x + 3, y + 3, 0, x + 3, y + 3, 6 * 1.2);
        glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.2 + brightness * 0.3})`);
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x + 3, y + 3, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  },

  lcd: {
    name: 'LCD Display',
    description: 'Modern LCD screen with subtle pixel grid',
    pixelSize: 4,
    pixelGap: 1,
    render: (ctx, x, y, r, g, b, brightness) => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(x - 1.5, y - 1.5, 7, 7);
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(x, y, 4, 4);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(x, y, 4, 1.0);
      ctx.fillRect(x, y, 1.0, 4);
      ctx.fillRect(x, y + 4 - 1.0, 4, 1.0);
      ctx.fillRect(x + 4 - 1.0, y, 1.0, 4);
      if (brightness > 0.3) {
        const backlight = ctx.createLinearGradient(x, y, x + 4, y + 4);
        backlight.addColorStop(0, `rgba(255, 255, 255, ${brightness * 0.1})`);
        backlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = backlight;
        ctx.fillRect(x, y, 4, 4);
      }
    }
  },

  vhs: {
    name: 'VHS Tape',
    description: 'Vintage VHS tape look with color bleeding',
    pixelSize: 5,
    pixelGap: 1,
    render: (ctx, x, y, r, g, b, brightness) => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(x - 1.5, y - 1.5, 8, 8);
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(x, y, 5, 5);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)';
      ctx.lineWidth = 1.0;
      ctx.strokeRect(x, y, 5, 5);
      ctx.fillStyle = `rgba(${r}, 0, 0, 0.4)`;
      ctx.fillRect(x + 1, y, 5, 5);
      ctx.fillStyle = `rgba(0, 0, ${b}, 0.4)`;
      ctx.fillRect(x - 1, y, 5, 5);
      if (Math.random() > 0.97) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(x, y, 5, 1);
      }
      if (Math.random() > 0.995) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(x - 10, y, 30, 1);
      }
    }
  },

  arcade: {
    name: 'Arcade Cabinet',
    description: 'Classic arcade game pixel style with visible mesh',
    pixelSize: 5,
    pixelGap: 2,
    render: (ctx, x, y, r, g, b, brightness) => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(x - 2, y - 2, 9, 9);
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(x, y, 5, 5, 1);
      } else {
        ctx.rect(x, y, 5, 5);
      }
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 0, 0, 1.0)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(x, y, 5, 5, 1);
      } else {
        ctx.strokeRect(x, y, 5, 5);
      }
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 5, y + 5);
      ctx.moveTo(x + 5, y);
      ctx.lineTo(x, y + 5);
      ctx.stroke();
      if (brightness > 0.6) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.arc(x + 2.5, y + 2.5, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  },

  neon: {
    name: 'Neon Sign',
    description: 'Vibrant neon sign with intense glow',
    pixelSize: 3,
    pixelGap: 3,
    render: (ctx, x, y, r, g, b, brightness) => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(x - 3, y - 3, 9, 9);
      r = Math.min(255, r * 1.2);
      g = Math.min(255, g * 1.2);
      b = Math.min(255, b * 1.2);
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.beginPath();
      ctx.arc(x + 1.5, y + 1.5, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 0, 0, 1.0)';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.arc(x + 1.5, y + 1.5, 2, 0, Math.PI * 2);
      ctx.stroke();
      const glow1 = ctx.createRadialGradient(x + 1.5, y + 1.5, 0, x + 1.5, y + 1.5, 6);
      glow1.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.6 * brightness})`);
      glow1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow1;
      ctx.beginPath();
      ctx.arc(x + 1.5, y + 1.5, 6, 0, Math.PI * 2);
      ctx.fill();
      const glow2 = ctx.createRadialGradient(x + 1.5, y + 1.5, 0, x + 1.5, y + 1.5, 12);
      glow2.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.3 * brightness})`);
      glow2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow2;
      ctx.beginPath();
      ctx.arc(x + 1.5, y + 1.5, 12, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  gameboy: {
    name: 'Game Boy',
    description: 'Classic Game Boy with 4 shades of green',
    pixelSize: 4,
    pixelGap: 1,
    render: (ctx, x, y, r, g, b, brightness) => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(x - 1.5, y - 1.5, 7, 7);
      const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      let greenShade;
      if (gray < 64) {
        greenShade = '#0f380f';
      } else if (gray < 128) {
        greenShade = '#306230';
      } else if (gray < 192) {
        greenShade = '#8bac0f';
      } else {
        greenShade = '#9bbc0f';
      }
      ctx.fillStyle = greenShade;
      ctx.fillRect(x, y, 4, 4);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(x, y, 4, 0.8);
      ctx.fillRect(x, y, 0.8, 4);
      ctx.fillRect(x, y + 4 - 0.8, 4, 0.8);
      ctx.fillRect(x + 4 - 0.8, y, 0.8, 4);
    }
  },

  mosaic: {
    name: 'Mosaic Tiles',
    description: 'Colorful mosaic tiles with grout lines',
    pixelSize: 6,
    pixelGap: 2,
    render: (ctx, x, y, r, g, b, brightness) => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(x - 2, y - 2, 10, 10);
      const variation = Math.random() * 20 - 10;
      ctx.fillStyle = `rgb(${Math.max(0, Math.min(255, r + variation))}, ${Math.max(0, Math.min(255, g + variation))}, ${Math.max(0, Math.min(255, b + variation))})`;
      ctx.beginPath();
      const irregularity = 0.4;
      ctx.moveTo(x + irregularity, y);
      ctx.lineTo(x + 6 - irregularity, y);
      ctx.lineTo(x + 6, y + irregularity);
      ctx.lineTo(x + 6, y + 6 - irregularity);
      ctx.lineTo(x + 6 - irregularity, y + 6);
      ctx.lineTo(x + irregularity, y + 6);
      ctx.lineTo(x, y + 6 - irregularity);
      ctx.lineTo(x, y + irregularity);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 0, 0, 1.0)';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(x + irregularity, y);
      ctx.lineTo(x + 6 - irregularity, y);
      ctx.lineTo(x + 6, y + irregularity);
      ctx.lineTo(x + 6, y + 6 - irregularity);
      ctx.lineTo(x + 6 - irregularity, y + 6);
      ctx.lineTo(x + irregularity, y + 6);
      ctx.lineTo(x, y + 6 - irregularity);
      ctx.lineTo(x, y + irregularity);
      ctx.closePath();
      ctx.stroke();
      if (brightness > 0.5) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.moveTo(x + 1, y + 1);
        ctx.lineTo(x + 3, y + 1);
        ctx.lineTo(x + 1, y + 3);
        ctx.closePath();
        ctx.fill();
      }
    }
  },

  // 1-Bit Mode (solid)
  oneBit: {
    name: '1-Bit B&W',
    description: 'Strict black & white rendering (1-bit mode)',
    pixelSize: 4,
    pixelGap: 2,
    render: (ctx, x, y, r, g, b, brightness) => {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      const bw = gray > 128 ? 255 : 0;
      ctx.fillStyle = `rgb(${bw}, ${bw}, ${bw})`;
      ctx.fillRect(x, y, 4, 4);
    }
  },

  // 1-Bit Mode with Ordered Dithering (uniform pixel)
  oneBitDither: {
    name: '1-Bit B&W Dither',
    description: '1-bit mode with ordered dithering, uniform pixels',
    pixelSize: 4,
    pixelGap: 2,
    render: (ctx, x, y, r, g, b, brightness) => {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      const bayer = [
        [0,  8,  2, 10],
        [12, 4, 14, 6],
        [3, 11, 1,  9],
        [15, 7, 13, 5]
      ];
      // Use the x,y coordinates of the pixel cell (assuming pixelSize is 4)
      const i = (Math.floor(x) % 4);
      const j = (Math.floor(y) % 4);
      const threshold = (bayer[j][i] / 16) * 255;
      const bw = gray > threshold ? 255 : 0;
      ctx.fillStyle = `rgb(${bw}, ${bw}, ${bw})`;
      ctx.fillRect(x, y, 4, 4);
    }
  },

  cyberpunk: {
    name: 'Cyberpunk Glitch',
    description: 'Vibrant neon with glitchy color shifts and digital noise',
    pixelSize: 6,
    pixelGap: 1,
    render: (ctx, x, y, r, g, b, brightness) => {
      const offset = 10;
      const r2 = Math.min(255, Math.max(0, r + (Math.random() * offset - offset / 2)));
      const g2 = Math.min(255, Math.max(0, g + (Math.random() * offset - offset / 2)));
      const b2 = Math.min(255, Math.max(0, b + (Math.random() * offset - offset / 2)));
      ctx.fillStyle = '#000000';
      ctx.fillRect(x - 1, y - 1, 7, 7);
      const gradient = ctx.createRadialGradient(x + 3, y + 3, 1, x + 3, y + 3, 3);
      gradient.addColorStop(0, `rgba(${r2}, ${g2}, ${b2}, 0.8)`);
      gradient.addColorStop(1, `rgba(${r2}, ${g2}, ${b2}, 0)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, 6, 6);
      if (Math.random() > 0.95) {
        ctx.fillStyle = `rgba(${r2}, ${g2}, ${b2}, 0.5)`;
        ctx.fillRect(x, y + Math.floor(Math.random() * 6), 6, 1);
      }
      ctx.strokeStyle = `rgba(${r2}, ${g2}, ${b2}, 0.5)`;
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, 6, 6);
    }
  },

  cga: {
    name: 'CGA',
    description: 'Retro CGA style with a limited 4-color palette',
    pixelSize: 4,
    pixelGap: 2,
    render: (ctx, x, y, r, g, b, brightness) => {
      const palette = [
        { r: 0, g: 0, b: 0 },
        { r: 0, g: 255, b: 255 },
        { r: 255, g: 0, b: 255 },
        { r: 255, g: 255, b: 255 }
      ];
      let best = palette[0], bestDist = Infinity;
      for (const color of palette) {
        const dr = r - color.r;
        const dg = g - color.g;
        const db = b - color.b;
        const dist = dr * dr + dg * dg + db * db;
        if (dist < bestDist) {
          bestDist = dist;
          best = color;
        }
      }
      ctx.fillStyle = '#000000';
      ctx.fillRect(x - 1, y - 1, 6, 6);
      ctx.fillStyle = `rgb(${best.r}, ${best.g}, ${best.b})`;
      ctx.fillRect(x, y, 4, 4);
    }
  },

  ega: {
    name: 'EGA',
    description: 'Retro EGA style with a 16-color palette',
    pixelSize: 4,
    pixelGap: 2,
    render: (ctx, x, y, r, g, b, brightness) => {
      const palette = [
        { r: 0, g: 0, b: 0 },
        { r: 0, g: 0, b: 170 },
        { r: 0, g: 170, b: 0 },
        { r: 0, g: 170, b: 170 },
        { r: 170, g: 0, b: 0 },
        { r: 170, g: 0, b: 170 },
        { r: 170, g: 85, b: 0 },
        { r: 170, g: 170, b: 170 },
        { r: 85, g: 85, b: 85 },
        { r: 85, g: 85, b: 255 },
        { r: 85, g: 255, b: 85 },
        { r: 85, g: 255, b: 255 },
        { r: 255, g: 85, b: 85 },
        { r: 255, g: 85, b: 255 },
        { r: 255, g: 255, b: 85 },
        { r: 255, g: 255, b: 255 }
      ];
      let best = palette[0], bestDist = Infinity;
      for (const color of palette) {
        const dr = r - color.r;
        const dg = g - color.g;
        const db = b - color.b;
        const dist = dr * dr + dg * dg + db * db;
        if (dist < bestDist) {
          bestDist = dist;
          best = color;
        }
      }
      ctx.fillStyle = '#000000';
      ctx.fillRect(x - 1, y - 1, 6, 6);
      ctx.fillStyle = `rgb(${best.r}, ${best.g}, ${best.b})`;
      ctx.fillRect(x, y, 4, 4);
    }
  },

  vga: {
    name: 'VGA',
    description: 'Crisp VGA style with clean pixels',
    pixelSize: 5,
    pixelGap: 0,
    render: (ctx, x, y, r, g, b, brightness) => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(x - 1, y - 1, 7, 7);
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(x, y, 5, 5);
      const gradient = ctx.createLinearGradient(x, y, x + 5, y + 5);
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.2)`);
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, 5, 5);
      ctx.strokeStyle = 'rgba(0,0,0,0.8)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, 5, 5);
    }
  },

  trinitron: {
    name: 'Trinitron',
    description: 'Aperture grille with round subpixels (vertical columns of R, G, B dots)',
    pixelSize: 6,
    pixelGap: 1,
    render: (ctx, x, y, r, g, b, brightness) => {
      // Black background for the cell.
      ctx.fillStyle = '#000000';
      ctx.fillRect(x - 1.5, y - 1.5, 8, 8);
      // Use three round subpixels.
      const radius = 1; // subpixel radius
      const centerY = y + 3;
      // Red subpixel (left)
      ctx.fillStyle = `rgb(${r}, 0, 0)`;
      ctx.beginPath();
      ctx.arc(x + 1, centerY, radius, 0, 2 * Math.PI);
      ctx.fill();
      // Green subpixel (center)
      ctx.fillStyle = `rgb(0, ${g}, 0)`;
      ctx.beginPath();
      ctx.arc(x + 3, centerY, radius, 0, 2 * Math.PI);
      ctx.fill();
      // Blue subpixel (right)
      ctx.fillStyle = `rgb(0, 0, ${b})`;
      ctx.beginPath();
      ctx.arc(x + 5, centerY, radius, 0, 2 * Math.PI);
      ctx.fill();
      // Optional: add a subtle uniform glow if brightness is high.
      if (brightness > 0.5) {
        const glow = ctx.createRadialGradient(x + 3, y + 3, 0, x + 3, y + 3, 6);
        glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.3)`);
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x + 3, y + 3, 6, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  },

  oneBit: {
    name: '1-Bit B&W',
    description: 'Strict black & white rendering (1-bit mode)',
    pixelSize: 4,
    pixelGap: 2,
    render: (ctx, x, y, r, g, b, brightness) => {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      const bw = gray > 128 ? 255 : 0;
      ctx.fillStyle = `rgb(${bw}, ${bw}, ${bw})`;
      ctx.fillRect(x, y, 4, 4);
    }
  },

  oneBitDither: {
    name: '1-Bit B&W Dither',
    description: '1-bit mode with ordered dithering (uniform pixels)',
    pixelSize: 4,
    pixelGap: 2,
    render: (ctx, x, y, r, g, b, brightness) => {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      const bayer = [
        [0,  8,  2, 10],
        [12, 4, 14, 6],
        [3, 11, 1,  9],
        [15, 7, 13, 5]
      ];
      // Use the pixel's top-left coordinate modulo 4 for the Bayer matrix.
      const i = (Math.floor(x) % 4);
      const j = (Math.floor(y) % 4);
      const threshold = (bayer[j][i] / 16) * 255;
      const bw = gray > threshold ? 255 : 0;
      ctx.fillStyle = `rgb(${bw}, ${bw}, ${bw})`;
      ctx.fillRect(x, y, 4, 4);
    }
  }
  
  // You can add additional styles here if desired.
  // (For example, further psychedelic or digital mosaic styles.)
};

