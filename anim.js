const canvas = document.querySelector(".canvas");
const context = canvas.getContext("2d");
context.scale(.5, .5);
const frameCount = 179;
const images = [];
const ball = { frame: 0 };
const cacheName = 'ball-animation-frames';

// Set up the canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Function to check for AVIF and WEBP support and determine the image format to use
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

// Function to get the frame path
const currentFrame = (index, format) => `./pallina/${(index + 1).toString()}.${format}`;

// Function to preload images
const preloadImages = async (format) => {
  const cache = await caches.open(cacheName);
  for (let i = 0; i < frameCount; i++) {
    const imagePath = currentFrame(i, format);
    let response = await cache.match(imagePath);
    if (!response) {
      response = await fetch(imagePath);
      cache.put(imagePath, response.clone());
    }
    const blob = await response.blob();
    const image = new Image();
    image.src = URL.createObjectURL(blob);
    image.onload = () => {
      URL.revokeObjectURL(image.src); // Free up the object URL after the image is loaded
    };
    images.push(image);
  }
  startAnimation();
};

// Function to start the GSAP animation
const startAnimation = () => {
  gsap.to(ball, {
    frame: frameCount - 1,
    snap: "frame",
    ease: "none",
    scrollTrigger: {
      scrub: true,
      pin: ".canvas",
      end: "+=3000",
      onUpdate: () => render() // Update the frame on scroll
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

// Function to render the current frame
const render = () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  const frameIndex = Math.min(ball.frame, images.length - 1); // Ensure the frame index is valid
  context.drawImage(images[frameIndex], 0, 0);
};

// Main execution
(async () => {
  const format = await checkImageFormat();
  await preloadImages(format);
})();
