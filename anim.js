const canvas = document.querySelector(".canvas");
const context = canvas.getContext("2d");
context.scale(1, 1);
const frameCount = 179;
const images = new Array(frameCount);
let format = 'avif'; // Default format
const cacheName = 'ball-animation-frames';
let imagesLoaded = 0;
let currentChunk = 0;
const chunkSize = 20;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

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

const currentFrame = (index, fmt) => `./pallina/${(index + 1).toString()}.${fmt}`;

const render = () => {
  const frameIndex = Math.min(ball.frame, images.length - 1);
  const frame = images[frameIndex];
  if (frame && frame.complete && !frame.naturalWidth == 0) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    const x = (canvas.width - frame.width) / 2;
    const y = (canvas.height - frame.height) / 2;
    context.drawImage(frame, x, y);
  }
};

const preloadImages = async (start, fmt) => {
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
    const image = new Image();
    image.onload = () => {
      imagesLoaded++;
      if (imagesLoaded === 1) {
        // Set canvas dimensions based on the first image
        canvas.width = image.width;
        canvas.height = image.height;
        if (start === 0) startAnimation();
      }
    };
    image.src = URL.createObjectURL(blob);
    images[i] = image;
  }
};

const loadMoreImages = () => {
  const nextChunkStart = Math.floor((window.scrollY / window.innerHeight) * (frameCount / chunkSize)) * chunkSize;
  if (nextChunkStart > currentChunk * chunkSize) {
    preloadImages(nextChunkStart, format);
    currentChunk++;
  }
};

const ball = { frame: 0 }; // Definisci ball

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

window.addEventListener('load', loadMoreImages);

(async () => {
  format = await checkImageFormat();
  preloadImages(0, format); // Preload the first chunk of images
})();
