const canvas = document.querySelector(".canvas");
const context = canvas.getContext("2d");
const frameCount = 179;
const chunkSize = 20; // Number of images to preload in each chunk
const images = new Array(frameCount).fill(null);
let format = 'avif'; // Default to AVIF
const cacheName = 'ball-animation-frames';
let currentChunk = 0;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Check image format support
const checkImageFormat = async () => {
  if (createImageBitmap && window.fetch) {
    try {
      await createImageBitmap(await (await fetch('data:image/avif;base64,...')).blob());
      return 'avif';
    } catch {
      return 'webp';
    }
  }
  return 'jpeg'; // Fallback if createImageBitmap or fetch is not supported
};

// Get image path
const currentFrame = (index, fmt) => `./pallina/${(index + 1).toString()}.${fmt}`;

// Render current frame
const render = () => {
  if (images[ball.frame]) {
    const frame = images[ball.frame];
    context.clearRect(0, 0, canvas.width, canvas.height);
    const x = (canvas.width - frame.width) / 2;
    const y = (canvas.height - frame.height) / 2;
    context.drawImage(frame, x, y);
  }
};

// Preload images in chunks
const preloadImages = async (start, fmt) => {
  const cache = await caches.open(cacheName);
  const endIndex = Math.min(start + chunkSize, frameCount);
  for (let i = start; i < endIndex; i++) {
    const imagePath = currentFrame(i, fmt);
    let response = await cache.match(imagePath);
    if (!response) {
      response = await fetch(imagePath);
      await cache.put(imagePath, response.clone());
    }
    const blob = await response.blob();
    images[i] = new Image();
    images[i].src = URL.createObjectURL(blob);
    images[i].onload = () => {
      URL.revokeObjectURL(images[i].src);
      if (i === start) {
        // Set canvas dimensions based on the first image
        canvas.width = images[start].width;
        canvas.height = images[start].height;
        if (start === 0) startAnimation();
      }
    };
  }
};

// Start GSAP animation
const startAnimation = () => {
  gsap.to(ball, {
    frame: frameCount - 1,
    snap: "frame",
    ease: "none",
    scrollTrigger: {
      scrub: true,
      pin: true,
      end: "+=3000",
      onUpdate: render
    }
  });

  gsap.fromTo('.ball-text', { opacity: 0 }, {
    opacity: 1,
    scrollTrigger: {
      scrub: 1,
      start: "50%",
      end: "60%",
      onComplete: () => gsap.to('.ball-text', { opacity: 0 }),
    }
  });
};

// Load more images on scroll
const loadMoreImages = () => {
  const nextChunkStart = Math.floor((window.scrollY / window.innerHeight) * (frameCount / chunkSize)) * chunkSize;
  if (nextChunkStart > currentChunk * chunkSize) {
    preloadImages(nextChunkStart, format);
    currentChunk++;
  }
};

window.addEventListener('load', loadMoreImages);

// Initialize
(async () => {
  format = await checkImageFormat();
  preloadImages(0, format); // Preload the first chunk of images
})();
