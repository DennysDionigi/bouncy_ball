(async() => {
  const canvas = document.querySelector('.canvas');
  const context = canvas.getContext('2d');
  const frameCount = 179;
  const chunkSize = 20; // Adjust chunk size as needed
  const images = new Array(frameCount);
  let format = 'avif'; // Default to 'avif', will check for support
  let currentChunk = 0;

  // Set canvas dimensions to the window's dimensions
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
      return 'webp';
    }
  }
};

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
        images[i].onload = () => {
          if (i === 0) { // First image determines canvas size
            canvas.width = images[0].width;
            canvas.height = images[0].height;
          }
          if (i === frameCount - 1) { // Start animation when all images are loaded
            startAnimation();
          }
        };
        images[i].src = URL.createObjectURL(blob);
      }
      currentChunk++;
    }
  };

  const startAnimation = () => {
    gsap.to({ frame: 0 }, {
      frame: frameCount - 1,
      snap: "frame",
      ease: "none",
      scrollTrigger: {
        scrub: true,
        pin: true,
        end: "+=3000",
        onUpdate: self => render(self.frame | 0) // Ensure frame is an integer
      }
    });
  };

  // Initialize
  (async () => {
    format = await checkImageFormat();
    preloadImages(format); // Preload images
  })();
})();
