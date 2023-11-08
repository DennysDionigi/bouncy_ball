(async () => {
  const canvas = document.querySelector('.canvas');
  const context = canvas.getContext('2d');
  const frameCount = 179;
  const chunkSize = 20;
  const images = new Array(frameCount);
  let format = 'avif'; // Default format assumed
  let loadedImagesCount = 0;
  let allImagesLoaded = false;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Function to check supported image format
 // Controllo webp e avif
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

  // Function to return the path for a frame
  const currentFrame = (index, fmt) => `./pallina/${(index + 1).toString()}.${fmt}`;

  // Function to render the current frame
  const render = (frameIndex) => {
    const img = images[frameIndex];
    if (img && img.complete) {
      const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
      const x = (canvas.width - img.width * scale) / 2;
      const y = (canvas.height - img.height * scale) / 2;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, x, y, img.width * scale, img.height * scale);
    }
  };

  // Function to preload images in chunks
  const preloadImages = async (fmt) => {
    for (let i = 0; i < frameCount; i += chunkSize) {
      const chunkPromises = [];
      for (let j = i; j < i + chunkSize && j < frameCount; j++) {
        chunkPromises.push(new Promise(async (resolve) => {
          const response = await fetch(currentFrame(j, fmt));
          const blob = await response.blob();
          const image = new Image();
          image.src = URL.createObjectURL(blob);
          image.onload = () => {
            URL.revokeObjectURL(image.src);
            images[j] = image;
            loadedImagesCount++;
            if (loadedImagesCount === frameCount) {
              allImagesLoaded = true;
            }
            resolve();
          };
          image.onerror = resolve;
        }));
      }
      await Promise.all(chunkPromises);
    }
  };

  // Function to start the GSAP animation
  const startAnimation = () => {
    if (!allImagesLoaded) {
      console.error('Attempt to start animation before all images are loaded.');
      return;
    }
    const ball = { frame: 0 }; // Object to keep track of the current frame
    gsap.to(ball, {
      frame: frameCount - 1,
      snap: "frame",
      ease: "none",
      scrollTrigger: {
        scrub: true,
        pin: true,
        end: "+=3000",
        onUpdate: () => render(Math.round(ball.frame))
      }
    });
    gsap.fromTo('.ball-text', 
      { opacity: 0 },
      {
        opacity: 1,
        scrollTrigger: {
          scrub: 1,
          start: "50%",
          end: "60%",
          onComplete: () => gsap.to('.ball-text', { opacity: 0 }),
        }
      }
    );
  };

  format = await checkImageFormat();
  await preloadImages(format);
  const loadingCheckInterval = setInterval(() => {
    if (allImagesLoaded) {
      clearInterval(loadingCheckInterval);
      startAnimation();
    }
  }, 100);
})();
