const canvas = document.querySelector(".canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const context = canvas.getContext("2d");
const frameCount = 179;
const images = [];
let ball = { frame: 0 };
const cacheName = 'ball-animation-frames';

// Function to detect image format support
const checkImageFormat = async () => {
  if (createImageBitmap && window.fetch) {
    const webp = await fetch('data:image/webp;base64,UklGRi4AAABXRUJQVlA4TCEAAAAvAUAAEB8wAiMw' + 
                             'AgSSNtse/cXjxyCCmrYNWPwmHRH9jwMA').then(r => r.blob()).then(createImageBitmap).then(() => 'webp', () => 'avif');
    const avif = await fetch('data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZt' + 
                             'aW1mMmF2aWZpbW1mMmF2aWYAAAAADnJpc2FtcGxlIGltYWdl').then(r => r.blob()).then(createImageBitmap).then(() => 'avif', () => webp);
    return avif;
  }
  return 'webp'; // Fallback for very old browsers
};

// Function to get the image path based on the detected format and index
const currentFrame = (index, format) => `./pallina/${(index + 1).toString()}.${format}`;

// Function to preload and cache images
const preloadImages = async (format) => {
  const cache = await caches.open(cacheName);
  
  await Promise.all(Array.from({ length: frameCount }, async (_, index) => {
    const imagePath = currentFrame(index, format);
    const response = await cache.match(imagePath);

    if (response) {
      const blob = await response.blob();
      const image = createImageFromBlob(blob, index);
      images[index] = image;
    } else {
      const image = new Image();
      image.src = imagePath;
      image.onload = async () => {
        await cache.add(imagePath);
        images[index] = image;
        if (index === 0) startAnimation(); // Start the animation once the first image is loaded and cached
      };
    }
  }));
};

// Function to create an image element from a blob
const createImageFromBlob = (blob, index) => {
  const url = URL.createObjectURL(blob);
  const image = new Image();
  image.onload = () => URL.revokeObjectURL(url); // Clean up the blob URL
  image.src = url;
  return image;
};

// Function to start the GSAP animation
const startAnimation = () => {
  gsap.to(ball, {
    frame: frameCount - 1,
    snap: "frame",
    ease: "none",
    scrollTrigger: {
      scrub: 0.5,
      pin: ".canvas",
      end: "+=5000", // Note: This will be 5000% of the viewport height
    },
    onUpdate: render, // Call the render function to update the canvas
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

// Render function to draw the current frame
function render() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  const frame = images[ball.frame];
  if (frame) {
    context.drawImage(frame, 0, 0);
  }
}

// Main execution
(async () => {
  const format = await checkImageFormat();
  await preloadImages(format);
})();


