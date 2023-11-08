(() => {
  const canvas = document.querySelector('.canvas');
  const context = canvas.getContext('2d');
  const frameCount = 179;
  const chunkSize = 20; // Number of images to load per chunk
  const images = [];
  const ball = { frame: 0 };
  let format = 'avif'; // Default format
  let currentChunk = 0;
  let allImagesLoaded = false;

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
    if (images[ball.frame]) {
      const img = images[ball.frame];
     const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
      const x = (canvas.width - img.width * scale) / 2;
      const y = (canvas.height - img.height * scale) / 2;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, x, y, img.width * scale, img.height * scale);
    }
  };


const preloadImages = async (fmt) => {
    while (currentChunk < Math.ceil(frameCount / chunkSize)) {
      const chunkStart = currentChunk * chunkSize;
      const chunkEnd = Math.min(chunkStart + chunkSize, frameCount);

      for (let i = chunkStart; i < chunkEnd; i++) {
        if (images[i]) continue; // Skip if already loaded

        const imagePath = currentFrame(i, fmt);
        const response = await fetch(imagePath);
        const blob = await response.blob();
        images[i] = new Image();
        images[i].src = URL.createObjectURL(blob);

        images[i].onload = (() => {
          URL.revokeObjectURL(images[i].src); // Free memory
          if (i === frameCount - 1) {
            allImagesLoaded = true;
            startAnimation();
          }
        });
      }

      currentChunk++;
    }
  };

  const startAnimation = () => {
    if (!allImagesLoaded) {
      console.error('Animation attempted to start before all images were loaded.');
      return;
    }

    gsap.to(ball, {
      frame: frameCount - 1,
      snap: "frame",
      ease: "none",
      scrollTrigger: {
        scrub: true,
        pin: ".canvas",
        end: "+=3000",
        onUpdate: () => render()
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

  (async () => {
    format = await checkImageFormat();
    await preloadImages(format);
  })();
})();


