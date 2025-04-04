import React, { useState, useEffect, useRef, useMemo } from 'react';
import './App.css'; // Assuming you have Tailwind CSS setup via App.css or similar
import { pixelStyles2D } from './pixelStyles2D'; // Assuming this file exists

function App() {
  // State declarations with updated slider ranges
  const [videoFile, setVideoFile] = useState(null);
  const [videoSrc, setVideoSrc] = useState(null); // Use separate state for URL
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [brightness, setBrightness] = useState(1.5); // Range: 0.5 - 3
  const [contrast, setContrast] = useState(1);       // Range: 0.5 - 2.5 (1 is neutral)
  const [saturation, setSaturation] = useState(1);   // Range: 0 (grayscale) - 2 (max), 1 is normal
  const [resolution, setResolution] = useState(96);
  const [pixelStyle, setPixelStyle] = useState('square');
  const [frameSkip, setFrameSkip] = useState(0);
  const [targetFps] = useState(25); // Target FPS threshold
  const [videoAspectRatio, setVideoAspectRatio] = useState(16/9); // Default aspect ratio

  // Store the actual resolution to use (may differ from slider in fullscreen)
  const actualResolutionRef = useRef(resolution);
  // Store the current pixel style to persist across fullscreen changes
  const currentStyleRef = useRef(pixelStyle);
  // Store color adjustment values to persist across fullscreen changes
  const colorAdjustmentsRef = useRef({
    brightness,
    contrast,
    saturation
  });

  // Update the refs when values change
  useEffect(() => {
    currentStyleRef.current = pixelStyle;
  }, [pixelStyle]);

  useEffect(() => {
    colorAdjustmentsRef.current = {
      brightness,
      contrast,
      saturation
    };
    // Trigger redraw if playing when color changes
     if (isPlaying && videoRef.current && !videoRef.current.paused) {
       forceRedraw();
     }
  }, [brightness, contrast, saturation, isPlaying]); // Added isPlaying dependency

  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const ctxRef = useRef(null);
  const requestRef = useRef(null);
  const containerRef = useRef(null);
  const appRef = useRef(null);

  // Frame tracking for skipping
  const frameRef = useRef({
    skipCount: 0,
    totalFrames: 0,
    lastResolution: resolution,
    lastTime: performance.now(),
    frameCount: 0
  });

  // Create a temporary canvas ref to reuse for sampling the video
  const tempCanvasRef = useRef(null);

  // Update actual resolution when slider changes (but only in non-fullscreen mode)
  useEffect(() => {
    if (!isFullscreen) {
      actualResolutionRef.current = resolution;
    }
  }, [resolution, isFullscreen]);

  // Reset frame skip when resolution changes
  useEffect(() => {
    const currentRes = actualResolutionRef.current;
    if (frameRef.current.lastResolution !== currentRes) {
      // Reset frame skip when resolution is lowered
      if (currentRes < frameRef.current.lastResolution) {
        setFrameSkip(0);
        frameRef.current.skipCount = 0;
      }
      frameRef.current.lastResolution = currentRes;
    }
  }, [resolution, isFullscreen]); // resolution dependency handles slider changes

  // Detect video aspect ratio when loaded
  useEffect(() => {
    if (videoRef.current && videoSrc) { // Check videoSrc instead of videoFile
      const video = videoRef.current;
      const handleMetadataLoaded = () => {
        if (video.videoWidth && video.videoHeight) {
          const aspectRatio = video.videoWidth / video.videoHeight;
          setVideoAspectRatio(aspectRatio);
          // Update canvas size once aspect ratio is known
          updateCanvasSize();
        }
      };

      video.addEventListener('loadedmetadata', handleMetadataLoaded);
      // Ensure video source is updated
      if (video.src !== videoSrc) {
         video.src = videoSrc;
         video.load(); // Important to load the new source
      }


      return () => {
          video.removeEventListener('loadedmetadata', handleMetadataLoaded);
      };
    }
  }, [videoSrc]); // Depend on videoSrc

  // Optimized color adjustment function
  const adjustColor = useMemo(() => {
    // Memoize the function itself, it will read the latest values from the ref
    return (r, g, b) => {
        const { brightness, contrast, saturation } = colorAdjustmentsRef.current;

        // Calculate grayscale value first (for saturation)
        const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b; // Don't round yet

        // Apply saturation (0 = grayscale, 1 = normal, 2 = super saturated)
        if (saturation !== 1) {
            r = gray + (r - gray) * saturation;
            g = gray + (g - gray) * saturation;
            b = gray + (b - gray) * saturation;
        }

        // Apply brightness
        r *= brightness;
        g *= brightness;
        b *= brightness;

        // Apply contrast (scale around midpoint 128)
        const contrastFactor = contrast; // Use directly
        r = 128 + (r - 128) * contrastFactor;
        g = 128 + (g - 128) * contrastFactor;
        b = 128 + (b - 128) * contrastFactor;

        // Clamp values
        r = Math.max(0, Math.min(255, r));
        g = Math.max(0, Math.min(255, g));
        b = Math.max(0, Math.min(255, b));

        // Round only at the end
        return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
    };
  }, []); // No dependencies needed here as it uses the ref

  // Get the current 2D style
  const getCurrentPixelStyle = () => pixelStyles2D[currentStyleRef.current];

  // Resolution based on the video's aspect ratio
  const getResolution = () => {
    const width = actualResolutionRef.current;
    // Use the detected aspect ratio for height calculation
    const height = Math.round(width / videoAspectRatio) || 1; // Ensure height is at least 1
    return { width, height };
  };

  // Update canvas dimensions
  const updateCanvasSize = () => {
    const canvas = canvasRef.current;
    if (!canvas || !ctxRef.current) return; // Ensure context is also ready
    const { width: resWidth, height: resHeight } = getResolution();

    if (resWidth <= 0 || resHeight <= 0) return; // Avoid invalid dimensions

    const style = getCurrentPixelStyle();
    const PIXEL_SIZE = style.pixelSize;
    const PIXEL_GAP = style.pixelGap;
    const totalPixelWidth = PIXEL_SIZE + PIXEL_GAP;

    const requiredCanvasWidth = resWidth * totalPixelWidth;
    const requiredCanvasHeight = resHeight * totalPixelWidth;

    // Check if canvas dimensions need updating
    let needsUpdate = canvas.width !== requiredCanvasWidth || canvas.height !== requiredCanvasHeight;

    const container = containerRef.current;
    if (!container) return; // Need container for sizing

    let displayWidth, displayHeight;

    if (isFullscreen) {
      const containerWidth = window.innerWidth;
      const containerHeight = window.innerHeight;

      // Calculate dimensions to maintain aspect ratio with letterboxing/pillarboxing
      if (containerWidth / containerHeight > videoAspectRatio) {
        // Container is wider than video - pillarboxing
        displayHeight = containerHeight;
        displayWidth = displayHeight * videoAspectRatio;
      } else {
        // Container is taller than video - letterboxing
        displayWidth = containerWidth;
        displayHeight = displayWidth / videoAspectRatio;
      }
    } else {
      // Non-fullscreen: Let CSS handle the display size based on container
      displayWidth = container.clientWidth;
      displayHeight = displayWidth / videoAspectRatio; // Maintain aspect ratio

      // Ensure canvas fits within container dimensions (using CSS max-width/max-height)
      canvas.style.width = '100%';
      canvas.style.height = 'auto'; // Let aspect ratio dictate height via CSS
      canvas.style.maxWidth = '100%';
      canvas.style.maxHeight = '100%';
      canvas.style.objectFit = 'contain'; // CSS handles fitting
    }

    // Apply calculated display size for fullscreen
    if(isFullscreen) {
        canvas.style.width = `${displayWidth}px`;
        canvas.style.height = `${displayHeight}px`;
        canvas.style.maxWidth = ''; // Remove constraints in fullscreen
        canvas.style.maxHeight = '';
    }


    // Update internal canvas resolution if needed
    if (needsUpdate) {
      canvas.width = requiredCanvasWidth;
      canvas.height = requiredCanvasHeight;
       // Re-apply context settings after resize
      const ctx = ctxRef.current;
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Force a redraw if playing after size update
    if (isPlaying) {
      forceRedraw();
    }
  };


  // Initialize the canvas 2D context
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    // Check if context already exists
    if (!ctxRef.current) {
        const ctx = canvas.getContext('2d', {
            alpha: false,
            desynchronized: true, // Keep for potential performance gains
           // willReadFrequently: true // Only needed if frequently using getImageData, which we are
        });
        if (!ctx) {
            console.error("Failed to get 2D context");
            return;
        }
        ctx.imageSmoothingEnabled = false;
        ctxRef.current = ctx;
    }

    // Initial setup and resize handling
    updateCanvasSize(); // Call initially

    const handleResize = () => updateCanvasSize();
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(requestRef.current);
      window.removeEventListener('resize', handleResize);
      requestRef.current = null; // Clean up ref
    };
    // Dependencies: isFullscreen changes layout, pixelStyle affects size calculation, videoAspectRatio affects size
  }, [isFullscreen, pixelStyle, videoAspectRatio]);

  // Create the temporary canvas once
  useEffect(() => {
    if (!tempCanvasRef.current) {
      tempCanvasRef.current = document.createElement('canvas');
      const tempCtx = tempCanvasRef.current.getContext('2d', {
        alpha: false,
        willReadFrequently: true // Important for getImageData
      });
      tempCtx.imageSmoothingEnabled = false; // Use NN sampling for pixelation
    }
  }, []);


  // Helper to request a single frame draw
   const forceRedraw = () => {
     if (requestRef.current === null && videoRef.current) { // Avoid queuing multiple frames if one is pending
       requestRef.current = requestAnimationFrame(updateLEDDisplay);
     }
   };


  // Main render loop
  const updateLEDDisplay = (now) => {
    // Reset requestRef immediately to allow scheduling the next frame
    requestRef.current = null;

    if (!videoRef.current || !ctxRef.current || !canvasRef.current || !tempCanvasRef.current) {
        // console.warn("Render prerequisites not met");
        return; // Exit if refs aren't ready
    }
    const video = videoRef.current;
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;

    // Skip rendering if video is paused, ended, or hasn't started playing
    if (video.paused || video.ended || video.readyState < video.HAVE_FUTURE_DATA) {
        // Still schedule next frame check if playing intention is true
        if(isPlaying) scheduleNextFrame();
        return;
    }


    // --- Frame Skipping Logic ---
    frameRef.current.totalFrames++;
    if (frameSkip > 0) {
      frameRef.current.skipCount = (frameRef.current.skipCount + 1) % (frameSkip + 1);
      if (frameRef.current.skipCount !== 0) {
        scheduleNextFrame(); // Schedule next frame check even if skipping draw
        return;
      }
    }


    // --- Drawing Logic ---
    const { width: resWidth, height: resHeight } = getResolution();
    if (resWidth <= 0 || resHeight <= 0) { // Check valid resolution
        scheduleNextFrame();
        return;
    }

    const currentStyle = getCurrentPixelStyle();
    const PIXEL_SIZE = currentStyle.pixelSize;
    const PIXEL_GAP = currentStyle.pixelGap;
    const totalPixelWidth = PIXEL_SIZE + PIXEL_GAP;

    // Reuse the temporary canvas
    const tempCanvas = tempCanvasRef.current;
    const tempCtx = tempCanvas.getContext('2d'); // Assuming context is persistent
    // Ensure temp canvas size matches desired resolution
    if (tempCanvas.width !== resWidth || tempCanvas.height !== resHeight) {
        tempCanvas.width = resWidth;
        tempCanvas.height = resHeight;
        tempCtx.imageSmoothingEnabled = false; // Re-apply after resize
    }

    // Draw the video frame scaled down to the internal resolution
    try {
        tempCtx.drawImage(video, 0, 0, resWidth, resHeight);
        const imageData = tempCtx.getImageData(0, 0, resWidth, resHeight);
        const pixels = imageData.data;

        // Clear main canvas efficiently
        if (canvas.width > 0 && canvas.height > 0) {
            ctx.fillStyle = '#000000'; // Use fillStyle for solid color clear
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Process each pixel block
        for (let y = 0; y < resHeight; y++) {
            for (let x = 0; x < resWidth; x++) {
                const index = (y * resWidth + x) * 4;
                // Ensure we don't read past the buffer (though imageData should match dimensions)
                if (index + 3 < pixels.length) {
                    let { r, g, b } = adjustColor(
                        pixels[index],
                        pixels[index + 1],
                        pixels[index + 2]
                    );
                    const pixelX = x * totalPixelWidth;
                    const pixelY = y * totalPixelWidth;
                    // Calculate brightness for effects based on adjusted values
                    const pixelBrightness = (r + g + b) / (255 * 3);
                    currentStyle.render(ctx, pixelX, pixelY, r, g, b, pixelBrightness);
                }
            }
        }
    } catch (error) {
        console.error("Error drawing frame:", error);
        // Potentially handle specific errors like security errors with getImageData
    }

    // --- Adaptive Frame Skipping ---
    if (!now) now = performance.now(); // Ensure 'now' is defined
    const elapsed = now - (frameRef.current.lastTime || now); // Handle initial case
    frameRef.current.frameCount++;

    // Check performance roughly every second (adjust interval as needed)
    if (elapsed >= 1000) {
        const fps = (frameRef.current.frameCount * 1000) / elapsed;

        // Adjust frame skip based on performance (more conservative adjustments)
        if (fps < targetFps - 3 && fps > 0) { // Lower threshold slightly
            setFrameSkip(prev => Math.min(5, prev + 1));
        } else if (fps > targetFps + 5 && frameSkip > 0) { // Higher threshold slightly
            setFrameSkip(prev => Math.max(0, prev - 1));
        }

        // Reset counters
        frameRef.current.frameCount = 0;
        frameRef.current.lastTime = now;
    }

    // --- Schedule Next Frame ---
    scheduleNextFrame();
  };

   // Helper to schedule the next frame update
   const scheduleNextFrame = () => {
     if (isPlaying && requestRef.current === null) { // Only schedule if playing and no frame is pending
       requestRef.current = requestAnimationFrame(updateLEDDisplay);
     }
   };


  // Video playback effect
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn('Autoplay prevented:', error);
          // If autoplay is prevented, update state
          setIsPlaying(false);
        });
      }
      // Reset frame tracking when starting playback
      frameRef.current = { ...frameRef.current, totalFrames: 0, skipCount: 0, frameCount: 0, lastTime: performance.now() };
      scheduleNextFrame(); // Start the render loop
    } else {
      video.pause();
      // Cancel any pending frame request when pausing
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    }

    // Cleanup function to cancel animation frame when component unmounts or isPlaying changes
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    };
  }, [isPlaying, videoSrc]); // Also re-run if videoSrc changes

  // Mute effect
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Fullscreen toggling
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      // Entering fullscreen
      const elem = containerRef.current;
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(err => console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`));
      } else if (elem.mozRequestFullScreen) { /* Firefox */
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) { /* IE/Edge */
        elem.msRequestFullscreen();
      }
    } else {
      // Exiting fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => console.error(`Error attempting to disable full-screen mode: ${err.message} (${err.name})`));
      } else if (document.mozCancelFullScreen) { /* Firefox */
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) { /* Chrome, Safari & Opera */
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) { /* IE/Edge */
        document.msExitFullscreen();
      }
    }
  };

  // Fullscreen change handler
  useEffect(() => {
    const handleFullscreenChange = () => {
      const newFullscreenState = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement || // Safari
        document.mozFullScreenElement ||    // Firefox
        document.msFullscreenElement       // IE/Edge
      );
      setIsFullscreen(newFullscreenState);

      // Ensure canvas size is updated after the transition completes
      // Use a small timeout to allow the browser to settle
       setTimeout(() => {
         updateCanvasSize();
       }, 100); // Adjust timeout if needed
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange); // Safari
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);    // Firefox
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);     // IE/Edge

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []); // No dependencies needed, sets up global listeners

  // Restart video
  const restartVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      if (!isPlaying) {
        setIsPlaying(true); // Automatically play on restart
      } else {
           // If already playing, ensure the render loop continues
           forceRedraw();
      }
    }
  };

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      // Revoke previous object URL if it exists
      if (videoSrc && videoSrc.startsWith('blob:')) {
        URL.revokeObjectURL(videoSrc);
      }

      // Pause current playback
      if (videoRef.current && isPlaying) {
        setIsPlaying(false); // This will trigger pause via useEffect
      }

      // Create new video URL and update state
      const newVideoUrl = URL.createObjectURL(file);
      setVideoFile(file); // Keep track of the file if needed
      setVideoSrc(newVideoUrl); // Update the source for the video element

      // Reset relevant states
      setFrameSkip(0);
      frameRef.current = { ...frameRef.current, skipCount: 0, totalFrames: 0, frameCount: 0, lastTime: performance.now() };

      // Attempt to play shortly after setting the source
      // Use timeout to ensure the video element processes the new src
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = 0; // Ensure starting from the beginning
          setIsPlaying(true); // Trigger play via state change and useEffect
        }
      }, 100); // Small delay
    }
  };

  // Reset frame skip manually
  const resetFrameSkip = () => {
    setFrameSkip(0);
    frameRef.current.skipCount = 0;
  };

  // Handle resolution slider change
  const handleResolutionChange = (newResolution) => {
    setResolution(newResolution);
    // Update actual resolution ref immediately if not fullscreen
    if (!isFullscreen) {
      actualResolutionRef.current = newResolution;
      // Update canvas size immediately for visual feedback
      updateCanvasSize();
    }
    // Render loop will pick up the new resolution on the next frame
  };

  // Slider component - *** CHANGED onChange to onInput ***
  const Slider = ({ label, value, min, max, step, onChange, formatValue, leftLabel, centerLabel, rightLabel }) => (
    <div className="mb-3">
      <label className="block mb-1 text-sm">
        {label}: {formatValue ? formatValue(value) : value}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        // Use onInput for live updates while dragging
        onInput={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500" // Style slider track/thumb
      />
      {(leftLabel || centerLabel || rightLabel) && (
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          {leftLabel && <span>{leftLabel}</span>}
          {centerLabel && <span className="text-center flex-1">{centerLabel}</span>}
          {rightLabel && <span>{rightLabel}</span>}
        </div>
      )}
    </div>
  );

// --- Fullscreen Controls Component (Issue 2 Fix) ---
const FullscreenControls = () => {
  const [showControls, setShowControls] = useState(true); // Start visible briefly
  const hideTimeoutRef = useRef(null);
  const controlsVisibleRef = useRef(true); // Ref to track visibility state instantly

  useEffect(() => {
    controlsVisibleRef.current = showControls; // Sync ref with state
  }, [showControls]);

  useEffect(() => {
    if (!isFullscreen) {
      setShowControls(false); // Hide immediately if not fullscreen
      if (hideTimeoutRef.current) {
         clearTimeout(hideTimeoutRef.current);
         hideTimeoutRef.current = null;
       }
      return;
    }

    // Initially show controls, then start timer to hide them
    setShowControls(true);
    hideTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        hideTimeoutRef.current = null;
    }, 3000); // Hide after 3 seconds initially

    const handleMouseMove = (e) => {
      if (!isFullscreen) return; // Extra safety check

      const hoverZoneHeight = 120; // Height of the hover area from the bottom (adjust as needed)
      const isMouseInHoverZone = e.clientY > window.innerHeight - hoverZoneHeight;

      if (isMouseInHoverZone) {
        // If mouse enters the bottom zone, show controls and clear any pending hide timeout
        if (!controlsVisibleRef.current) { // Only update state if it's currently hidden
             setShowControls(true);
        }
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = null;
        }
      } else {
        // If mouse leaves the bottom zone, start timer to hide controls (if not already running)
        if (controlsVisibleRef.current && !hideTimeoutRef.current) {
          hideTimeoutRef.current = setTimeout(() => {
            setShowControls(false);
            hideTimeoutRef.current = null;
          }, 2000); // Hide after 2 seconds of inactivity in the zone
        }
      }
    };

    // Listen on the document to track mouse position anywhere on screen
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    };
  }, [isFullscreen]); // Effect runs when fullscreen state changes

  // Only render the controls container when in fullscreen mode
  if (!isFullscreen) return null;

  return (
    <div
      // No ref needed here as we check mouse position globally
      className={`fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-4 pb-6 z-50 transition-opacity duration-500 ease-in-out ${ // Use gradient for smoother look
        showControls ? 'opacity-100' : 'opacity-0 pointer-events-none' // Hide visually and disable interaction when faded out
      }`}
    >
       {/* Flex container for the sliders */}
       <div className="max-w-3xl mx-auto flex flex-wrap justify-center gap-x-6 gap-y-2">
            <div className="flex-1 min-w-[180px] max-w-[250px]"> {/* Control width */}
                <Slider
                label="Brightness"
                value={brightness}
                min={0.5} max={3} step={0.1}
                onChange={setBrightness}
                formatValue={(val) => val.toFixed(1)}
                />
            </div>
            <div className="flex-1 min-w-[180px] max-w-[250px]">
                <Slider
                label="Contrast"
                value={contrast}
                min={0.5} max={2.5} step={0.1}
                onChange={setContrast}
                formatValue={(val) => val.toFixed(1)}
                />
            </div>
            <div className="flex-1 min-w-[180px] max-w-[250px]">
                <Slider
                label="Saturation"
                value={saturation}
                min={0} max={2} step={0.1}
                onChange={setSaturation}
                formatValue={(val) => val.toFixed(1)}
                />
            </div>
       </div>
    </div>
  );
};


  // --- Main App Render ---
  return (
    <div ref={appRef} className="flex flex-col items-center p-4 bg-gray-900 text-white min-h-screen">
      {/* Non-Fullscreen Top Controls */}
      {!isFullscreen && (
        <div className="w-full max-w-3xl mx-auto mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <input
              type="file"
              accept="video/*,.mkv,.avi,.mov" // Accept common video types
              onChange={handleFileChange}
              className="p-2 bg-gray-800 rounded border border-gray-700 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
             <div className="flex flex-wrap gap-2 justify-center">
               {videoSrc && ( // Show buttons only when a video source exists
                 <>
                   <button
                     onClick={() => setIsPlaying(!isPlaying)}
                     className="px-3 py-1.5 bg-blue-600 rounded hover:bg-blue-700 transition text-sm flex items-center"
                   >
                     {isPlaying ? '⏸ Pause' : '▶ Play'}
                   </button>
                   <button
                     onClick={restartVideo}
                     className="px-3 py-1.5 bg-green-600 rounded hover:bg-green-700 transition text-sm flex items-center"
                   >
                     🔄 Restart
                   </button>
                   <button
                     onClick={() => setIsMuted(!isMuted)}
                     className="px-3 py-1.5 bg-gray-600 rounded hover:bg-gray-700 transition text-sm flex items-center"
                   >
                     {isMuted ? '🔇 Unmute' : '🔊 Mute'}
                   </button>
                   <button
                     onClick={toggleFullscreen}
                     className="px-3 py-1.5 bg-purple-600 rounded hover:bg-purple-700 transition text-sm flex items-center"
                   >
                      ⛶ Fullscreen
                   </button>
                 </>
               )}
             </div>
        </div>
      )}

      {/* Video Container */}
      <div
        ref={containerRef}
        className={`relative bg-black overflow-hidden mx-auto group ${ // Added group for potential future use
          isFullscreen
            ? 'fixed inset-0 z-40 w-screen h-screen flex items-center justify-center m-0 p-0 border-0 rounded-none' // z-40 below controls
            : 'w-full max-w-3xl aspect-video rounded-lg border-2 border-gray-700 shadow-lg flex items-center justify-center'
        }`}
        // *** THIS IS THE FIXED LINE ***
        style={{ '--video-aspect-ratio': videoAspectRatio }} // Pass aspect ratio via CSS variable
      >
        <div className="w-full h-full flex items-center justify-center"> {/* Centering div */}
            <canvas
              ref={canvasRef}
              key="2d-canvas" // Ensure key stability
              // className="block" // Use block display, sizing handled by parent/style
              style={{
                display: 'block', // Important for correct sizing
                boxShadow: 'inset 0 0 15px rgba(0, 0, 0, 0.7)',
                objectFit: 'contain', // CSS handles fitting within the calculated style width/height
                maxWidth: '100%', // Ensure it doesn't overflow container
                maxHeight: '100%',
                // Width/Height set dynamically in updateCanvasSize
              }}
            />
        </div>

        {/* Hidden Video Element */}
        <video
          ref={videoRef}
          // src={videoSrc} // Src is set dynamically in useEffect
          className="hidden" // Keep hidden
          loop
          muted={isMuted}
          onEnded={() => setIsPlaying(false)} // Set playing to false on end
          playsInline // Important for mobile playback
          preload="metadata" // Load enough to get dimensions/duration
        />

        {/* Fullscreen Controls (Rendered conditionally inside component) */}
        <FullscreenControls />

        {/* Fullscreen Exit Button (optional, always visible in fullscreen) */}
        {isFullscreen && (
            <button
                onClick={toggleFullscreen}
                className="absolute top-4 right-4 z-50 px-3 py-1.5 bg-red-600 rounded hover:bg-red-700 transition text-sm flex items-center opacity-70 hover:opacity-100"
                title="Exit Fullscreen"
             >
                 ⏹ Exit
             </button>
        )}
      </div>

      {/* Non-Fullscreen Bottom Controls Panel */}
      {videoSrc && !isFullscreen && (
        <div className="mt-4 w-full max-w-3xl mx-auto p-4 bg-gray-800 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div>
              <div className="mb-4">
                <label htmlFor="pixelStyleSelect" className="block mb-2 text-sm font-medium">Pixel Style:</label>
                <div className="relative">
                  <select
                    id="pixelStyleSelect"
                    value={pixelStyle}
                    onChange={(e) => setPixelStyle(e.target.value)}
                    className="w-full p-2 bg-gray-700 rounded border border-gray-600 appearance-none pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.keys(pixelStyles2D).map((styleKey) => (
                      <option key={styleKey} value={styleKey}>
                        {pixelStyles2D[styleKey].name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  {pixelStyles2D[pixelStyle].description}
                </p>
              </div>

              <Slider
                label="Resolution"
                value={resolution}
                min={32} max={384} step={16}
                onChange={handleResolutionChange}
                formatValue={(val) => `${val}×${Math.round(val / (videoAspectRatio || 16/9))}`}
                leftLabel="32px" rightLabel="384px"
              />

              <Slider
                label="Brightness"
                value={brightness}
                min={0.5} max={3} step={0.1}
                onChange={setBrightness}
                formatValue={(val) => val.toFixed(1)}
                leftLabel="Dim" rightLabel="Bright"
              />
            </div>

            {/* Right Column */}
            <div>
              <Slider
                label="Contrast"
                value={contrast}
                min={0.5} max={2.5} step={0.1}
                onChange={setContrast}
                formatValue={(val) => val.toFixed(1)}
                leftLabel="Low" centerLabel="1.0" rightLabel="High"
              />

              <Slider
                label="Saturation"
                value={saturation}
                min={0} max={2} step={0.1}
                onChange={setSaturation}
                formatValue={(val) => val.toFixed(1)}
                leftLabel="B&W" centerLabel="1.0" rightLabel="Vibrant"
              />

              <div className="mt-6 pt-4 border-t border-gray-700">
                <h3 className="text-sm font-semibold mb-2">Performance</h3>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>Target FPS: {targetFps}</p>
                  <p>Aspect Ratio: {videoAspectRatio?.toFixed(2) ?? 'N/A'}</p>
                  <div className="flex justify-between items-center">
                       <p>Frame Skip: {frameSkip > 0 ? `${frameSkip} frame${frameSkip > 1 ? 's' : ''}` : 'None'}</p>
                       {frameSkip > 0 && (
                         <button
                           onClick={resetFrameSkip}
                           className="px-2 py-0.5 bg-blue-600 rounded text-xs hover:bg-blue-700 transition"
                         >
                           Reset Skip
                         </button>
                       )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;