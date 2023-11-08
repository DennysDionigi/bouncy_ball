(() => {
  const canvas = document.querySelector('.canvas');
  const context = canvas.getContext('2d');
  const frameCount = 179;
  const images = new Array(frameCount).fill(null);
  const ball = { frame: 0 };
  const cacheName = 'ball-animation-frames';
  let format = 'avif'; // Default format
  let chunkIndex = 0;
  const chunkSize = 20; // Number of images to load per chunk
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

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
      return 'avif';
    }
  }
};

  const currentFrame = (index, fmt) => `./pallina/${(index + 1).toString()}.${fmt}`;

  const render = () => {
    if (images.length > 0) {
      const img = images[0];
      if (canvas.width !== img.width || canvas.height !== img.height) {
        canvas.width = img.width;
        canvas.height = img.height;
      }
      const frameIndex = Math.min(ball.frame, images.length - 1);
      const frame = images[frameIndex];
      if (frame) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        const x = (canvas.width - frame.width) / 2;
        const y = (canvas.height - frame.height) / 2;
        context.drawImage(frame, x, y);
      }
    }
  };

  const preloadImages = async (fmt) => {
    const cache = await caches.open(cacheName);
    const startIndex = chunkIndex * chunkSize;
    const endIndex = Math.min(startIndex + chunkSize, frameCount);
    
    for (let i = startIndex; i < endIndex; i++) {
      const imagePath = currentFrame(i, fmt);
      let response = await cache.match(imagePath);
      if (!response) {
        response = await fetch(imagePath);
        cache.put(imagePath, response.clone());
      }
      const blob = await response.blob();
      images[i] = new Image();
      images[i].src = URL.createObjectURL(blob);
      images[i].onload = () => {
        URL.revokeObjectURL(images[i].src);
        if (i === startIndex) {
          render(); // Render the first frame of each chunk
        }
      };
    }
    chunkIndex++; // Prepare for the next chunk
  };

  const startAnimation = () => {
    gsap.to(ball, {
      frame: frameCount - 1,
      snap: "frame",
      ease: "none",
      scrollTrigger: {
        scrub: true,
        pin: '.canvas',
        end: "+=3000",
        onUpdate: () => render()
      }
    });

    gsap.fromTo('.ball-text', { opacity: 0 }, {
      opacity: 1,
      scrollTrigger: {
        scrub: 1,
        start: "50%",
        end: "60%",
        onLeave: () => gsap.to('.ball-text', { opacity: 0 })
      }
    });
  };

  // Initial call to start loading images in chunks
  const init = async () => {
    format = await checkImageFormat();
    await preloadImages(format); // Preload the first chunk
    startAnimation(); // Start the animation after the first chunk is loaded
    // Set an interval to preload remaining chunks
    const preloadInterval = setInterval(async () => {
      if (chunkIndex * chunkSize < frameCount) {
        await preloadImages(format);
      } else {
        clearInterval(preloadInterval); // Clear interval when done
      }
    }, 2000); // Adjust the interval as needed
  };

  init();
})();

