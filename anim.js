const canvas = document.querySelector('.canvas');
const context = canvas.getContext('2d');
const frameCount = 179;
const images = [];
const ball = { frame: 0 };
const cacheName = 'ball-animation-frames';

// Set up the canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Detect image format support
const checkImageFormat = async () => {
  if (createImageBitmap && window.fetch) {
    try {
      const webp = await fetch('data:image/webp;base64,UklGRi4AAABXRUJQVlA4TCEAAAAvAUAAEB8wAiMw' + 
                               'AgSSNtse/cXjxyCCmrYNWPwmHRH9jwMA').then(r => r.blob()).then(createImageBitmap);
      const avif = await fetch('data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZt' + 
                               'aW1mMmF2aWZpbW1mMmF2aWYAAAAADnJpc2FtcGxlIGltYWdl').then(r => r.blob()).then(createImageBitmap);
      return avif && webp ? 'avif' : 'webp';
    } catch(e) {
      return 'webp';
    }
  }
};

// Get image path based on format
const getImagePath = (index, format) => `./pallina/${(index + 1).toString()}.${format}`;

// Preload and cache images
const preloadImages = async (format) => {
  const cache = await caches.open(cacheName);
  const imagePromises = [];

  for (let i = 0; i < frameCount; i++) {
    const imagePath = getImagePath(i, format);
    imagePromises.push(cache.add(imagePath));
  }

  await Promise.all(imagePromises);

  for (let i = 0; i < frameCount; i++) {
    const response = await cache.match(getImagePath(i, format));
    const blob = await response.blob();
    const img = new Image();
    img.src = URL.createObjectURL(blob);
    img.onload = () => {
      images[i] = img;
      URL.revokeObjectURL(img.src);
      if (i === 0) render(); // Start the rendering loop once the first image is loaded
    };
  }
};

// Initialize and start the animation
// Initialize and start the animation
const initAnimation = async () => {
  const format = await checkImageFormat();
  await preloadImages(format);

  gsap.to(ball, {
    frame: frameCount - 1,
    snap: "frame",
    ease: "none",
    scrollTrigger: {
      trigger: canvas,
      scrub: 0.5,
      start: "top bottom",
      end: "bottom top",
      pin: canvas,
      onUpdate: self => {
        
        ball.frame = self.progress * (frameCount - 1);
        render();
      }
    }
  });

  // Fade text
  gsap.fromTo('.ball-text', { opacity: 0 }, {
    opacity: 1,
    scrollTrigger: {
      trigger: '.ball-text',
      start: "top center",
      end: "bottom center",
      toggleActions: 'play none none reverse',
      fastScrollEnd: 'true',
      preventOverlaps:'true'
    }
  });
};




// Popola canvas
const render = () => {
  requestAnimationFrame(render);
  const index = Math.min(ball.frame, images.length - 1);
  const image = images[index];
  if (image) {
    context.canvas.width = image.width;
    context.canvas.height = image.height;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0);
  }
};

// Inizia anim
initAnimation();
