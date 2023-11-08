(() => {
  const canvas = document.querySelector('.canvas');
  const context = canvas.getContext('2d');
  const frameCount = 179;
  const chunkSize = 20;
  const images = [];
  let format = 'avif';
  let loadedImagesCount = 0;

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

  const preloadChunk = async (chunkIndex, fmt) => {
    const startIndex = chunkIndex * chunkSize;
    const endIndex = Math.min(startIndex + chunkSize, frameCount);
    const promises = [];

    for (let i = startIndex; i < endIndex; i++) {
      promises.push(new Promise(async (resolve) => {
        const response = await fetch(currentFrame(i, fmt));
        const blob = await response.blob();
        images[i] = new Image();
        images[i].src = URL.createObjectURL(blob);
        images[i].onload = () => { URL.revokeObjectURL(images[i].src); resolve(); };
        images[i].onerror = resolve;
      }));
    }

    await Promise.all(promises);
    loadedImagesCount += promises.length;
  };

  const preloadImages = async (fmt) => {
    for (let i = 0; i < Math.ceil(frameCount / chunkSize); i++) {
      await preloadChunk(i, fmt);
    }
    startAnimation();
  };

  const startAnimation = () => {
    gsap.to({frame: 0}, {
      frame: frameCount - 1,
      snap: "frame",
      ease: "none",
      scrollTrigger: {
        scrub: 0.5,
        pin: true,
        end: "+=3000",
        onUpdate: self => render(Math.round(self.frame))
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

  /*(async () => {
    format = await checkImageFormat();
    await preloadImages(format);
  })();*/



})();









