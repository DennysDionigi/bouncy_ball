const canvas = document.querySelector(".canvas");
const context = canvas.getContext("2d");
const frameCount = 179;
const chunkSize = 20; // Number of images to preload in each chunk
const images = new Array(frameCount).fill(null);
const cacheName = 'ball-animation-frames';
const ball = { frame: 0 };
let format = 'avif'; // Start with avif as default format
let currentChunk = 0;
let loadingChunks = false;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Check for image format support
const checkImageFormat = async () => {
  if (createImageBitmap && window.fetch) {
    try {
      await createImageBitmap(await (await fetch('data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZt' + 
                               'aW1mMmF2aWZpbW1mMmF2aWYAAAAADnJpc2FtcGxlIGltYWdl')).blob());
      return 'avif';
    } catch {
      return 'webp';
    }
  }
};

// Generate the path for the current frame
const currentFrame = (index, fmt) => `./pallina/${(index + 1).toString()}.${fmt}`;

// Render the current frame
const render = () => {
  const frameIndex = Math.min(ball.frame, images.length - 1);
  const frame = images[frameIndex];
  if (frame && frame.complete) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(frame, (canvas.width - frame.width) / 2, (canvas.height - frame.height) / 2);
  }
};

// Preload images in chunks
const preloadImages = async (start, fmt) => {
  if (loadingChunks) return; // Prevent multiple concurrent loading sequences
  loadingChunks = true;

  const cache = await caches.open(cacheName);
  const endIndex = Math.min(start + chunkSize, frameCount);
  for (let i = start; i < endIndex; i++) {
    if (images[i]) continue; // Skip if already loaded
    const imagePath = currentFrame(i, fmt);
    let response = await cache.match(imagePath);
    if (!response) {
      response = await fetch(imagePath);
      await cache.put(imagePath, response.clone());
    }
    const blob = await response.blob();
    images[i] = new Image();
    images[i].src = URL.createObjectURL(blob);
    images[i].onload = () => URL.revokeObjectURL(images[i].src);
  }

  loadingChunks = false;
};

// Load the next chunk of images when needed
const loadNextChunk = () => {
  const nextChunkStart = Math.floor(ball.frame / chunkSize) * chunkSize;
  if (nextChunkStart > currentChunk * chunkSize && nextChunkStart < frameCount) {
    currentChunk++;
    preloadImages(nextChunkStart, format);
  }
};

// Start the GSAP animation
const startAnimation = () => {
  gsap.to(ball, {
    frame: frameCount - 1,
    snap: "frame",
    ease: "none",
    scrollTrigger: {
      scrub: 0.5,
      pin: true,
      end: "+=3000",
      onUpdate: render,
      onScrubComplete: loadNextChunk
    }
  });

  gsap.fromTo('.ball-text', 
    { opacity: 0 },
    {
      opacity: 1,
      scrollTrigger: {
        scrub: 1,
        start: "50%",
        end: "60%"
      },
      onComplete: () => gsap.to('.ball-text', { opacity: 0 }),
    }
      );
  
};

// Initialize
(async () => {
  format = await checkImageFormat();
  await preloadImages(0, format); // Preload the first chunk
  startAnimation(); // Start the animation after the first chunk is loaded
  window.addEventListener('pointerdown', loadNextChunk); // Load next chunks on scroll
})();
