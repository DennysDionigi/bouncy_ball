const canvas = document.querySelector('.canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const context = canvas.getContext('2d');
const frameCount = 179;
const images = [];
const ball = { frame: 0 };

// Function to check supported image format
const checkImageFormat = async () => {
  if (createImageBitmap && window.fetch) {
    try {
      const webp = await fetch('data:image/webp;base64,UklGRi4AAABXRUJQVlA4TCEAAAAvAUAAEB8wAiMw' +
                               'AgSSNtse/cXjxyCCmrYNWPwmHRH9jwMA').then(r => r.blob()).then(createImageBitmap);
      const avif = await fetch('data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZt' +
                               'aW1mMmF2aWZpbW1mMmF2aWYAAAAADnJpc2FtcGxlIGltYWdl').then(r => r.blob()).then(createImageBitmap);
      return avif ? 'avif' : (webp ? 'webp' : 'jpeg');
    } catch (e) {
      return 'webp'; // Fallback if AVIF or WebP are not supported
    }
  }
};

// Function to get the image path with the correct format
const currentFrame = (index, format) => `./pallina/${(index + 1).toString()}.${format}`;

// Preload images with caching
const preloadImages = async (format) => {
  for (let i = 0; i < frameCount; i++) {
    const img = new Image();
    const imagePath = currentFrame(i, format);

    if ('caches' in window) {
      try {
        const cache = await caches.open('ball-animation');
        let response = await cache.match(imagePath);

        if (!response) {
          await cache.add(imagePath);
          response = await cache.match(imagePath);
        }

        const blob = await response.blob();
        img.src = URL.createObjectURL(blob);
      } catch (error) {
        console.error('Caching failed for:', imagePath, error);
        img.src = imagePath; // Fallback to normal loading
      }
    } else {
      img.src = imagePath; // Fallback if Cache API is not supported
    }

    images.push(img);
  }
};

// Call the preloadImages function and initialize the GSAP animations
const init = async () => {
  const format = await checkImageFormat();
  await preloadImages(format);

  gsap.to(ball, {
    frame: frameCount - 1,
    snap: "frame",
    ease: "none",
    scrollTrigger: {
      scrub: 0.5,
      pin: true,
      end: "500%"
    },
    onUpdate: render, // Call render to update the frame
  });

  gsap.fromTo(
    '.ball-text', 
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

// Start the initialization
init();

// Render function to display the current frame
function render() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  const currentImage = images[Math.round(ball.frame)];
  if (currentImage && currentImage.complete) {
    // Adjust canvas size to match the image if needed
    context.canvas.width = currentImage.naturalWidth || currentImage.width;
    context.canvas.height = currentImage.naturalHeight || currentImage.height;
    context.drawImage(currentImage, 0, 0);
  }
}
