// offscreenWorker.js

// Include your 2D pixel style definitions (copied from pixelStyles2D.js).
const pixelStyles2D = {
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
  // (Include the rest of your pixelStyles2D definitions here exactly as before.)
  // For brevity, only "square" is fully shown. You would paste the rest (rgb, round, crt, dot, jumbotron, lcd, vhs, arcade, neon, gameboy, mosaic, comic).
};

// Default parameters.
let resolution = 96;
let pixelStyle = "square";
let brightness = 1.5;
let contrast = 1;
let saturation = 1;

// Helper function: get resolution based on 16:9 ratio.
function getResolution() {
  const width = resolution;
  const height = Math.round(resolution * (9 / 16));
  return { width, height };
}

// adjustColor function (same as in App.js).
function adjustColor(r, g, b) {
  r = r * brightness;
  g = g * brightness;
  b = b * brightness;
  r = 128 + (r - 128) * contrast;
  g = 128 + (g - 128) * contrast;
  b = 128 + (b - 128) * contrast;
  const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
  r = gray + (r - gray) * saturation;
  g = gray + (g - gray) * saturation;
  b = gray + (b - gray) * saturation;
  return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
}

// Main message handler.
self.onmessage = async function(e) {
  const data = e.data;
  if (data.type === "init") {
    // Initialize worker with OffscreenCanvas and parameters.
    self.canvas = data.canvas;
    self.ctx = self.canvas.getContext("2d");
    resolution = data.resolution;
    pixelStyle = data.pixelStyle;
    brightness = data.brightness;
    contrast = data.contrast;
    saturation = data.saturation;
    // Set initial canvas size.
    const { width, height } = getResolution();
    const PIXEL_SIZE = pixelStyles2D[pixelStyle].pixelSize;
    const PIXEL_GAP = pixelStyles2D[pixelStyle].pixelGap;
    self.canvas.width = width * (PIXEL_SIZE + PIXEL_GAP);
    self.canvas.height = height * (PIXEL_SIZE + PIXEL_GAP);
  } else if (data.type === "frame") {
    // Update parameters if provided.
    if (data.resolution !== undefined) resolution = data.resolution;
    if (data.pixelStyle !== undefined) pixelStyle = data.pixelStyle;
    if (data.brightness !== undefined) brightness = data.brightness;
    if (data.contrast !== undefined) contrast = data.contrast;
    if (data.saturation !== undefined) saturation = data.saturation;

    const { width: resWidth, height: resHeight } = getResolution();
    const PIXEL_SIZE = pixelStyles2D[pixelStyle].pixelSize;
    const PIXEL_GAP = pixelStyles2D[pixelStyle].pixelGap;
    self.canvas.width = resWidth * (PIXEL_SIZE + PIXEL_GAP);
    self.canvas.height = resHeight * (PIXEL_SIZE + PIXEL_GAP);

    // Create a temporary OffscreenCanvas for sampling.
    const tempCanvas = new OffscreenCanvas(resWidth, resHeight);
    const tempCtx = tempCanvas.getContext("2d");
    // Draw the received imageBitmap (which was created at the slider resolution).
    tempCtx.drawImage(data.imageBitmap, 0, 0, resWidth, resHeight);
    const imageData = tempCtx.getImageData(0, 0, resWidth, resHeight);
    const pixels = imageData.data;

    self.ctx.fillStyle = "#000000";
    self.ctx.fillRect(0, 0, self.canvas.width, self.canvas.height);

    for (let y = 0; y < resHeight; y++) {
      for (let x = 0; x < resWidth; x++) {
        const index = (y * resWidth + x) * 4;
        if (index < pixels.length) {
          let { r, g, b } = adjustColor(
            pixels[index],
            pixels[index + 1],
            pixels[index + 2]
          );
          const pixelX = x * (PIXEL_SIZE + PIXEL_GAP);
          const pixelY = y * (PIXEL_SIZE + PIXEL_GAP);
          const pixelBrightness = (r + g + b) / (255 * 3);
          pixelStyles2D[pixelStyle].render(self.ctx, pixelX, pixelY, r, g, b, pixelBrightness);
        }
      }
    }
    // Dispose of the imageBitmap.
    data.imageBitmap.close();
  } else if (data.type === "resize") {
    // Update resolution and pixel style if needed.
    if (data.resolution !== undefined) resolution = data.resolution;
    if (data.pixelStyle !== undefined) pixelStyle = data.pixelStyle;
    // Adjust canvas size.
    const { width, height } = getResolution();
    const PIXEL_SIZE = pixelStyles2D[pixelStyle].pixelSize;
    const PIXEL_GAP = pixelStyles2D[pixelStyle].pixelGap;
    self.canvas.width = width * (PIXEL_SIZE + PIXEL_GAP);
    self.canvas.height = height * (PIXEL_SIZE + PIXEL_GAP);
  }
};

