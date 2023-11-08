const canvas = document.querySelector(".canvas");
const context = canvas.getContext("2d");
const frameCount = 179;
const images = [];
const ball = { frame: 0 };
const cacheName = 'ball-animation-frames';

// Set up the canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Function to check for AVIF and WEBP support and determine the image format to use
const checkImageFormat = async () => {
  const avif = 'data:image/avif;base64,...'; // Replace with actual base64 encoded AVIF image
  const webp = 'data:image/webp;base64,...'; // Replace with actual base64 encoded WEBP image
  try {
    await createImageBitmap(await (await fetch(avif)).blob());
    return 'avif'; // AVIF is supported
  } catch {
    try {
      await createImageBitmap(await (await fetch(webp)).blob());
      return 'webp'; // WEBP is supported
    } catch {
      return 'webp'; // Fallback  default
    }
  }
};

// Function to get the frame path
const currentFrame = (index, format) => `./best-ball/${(index + 1).toString()}.${format}`;

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
