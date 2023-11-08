const canvas = document.querySelector(".canvas");
const context = canvas.getContext("2d");
const frameCount = 179;
const preloadCount = 20;
const images = Array(frameCount);
let format = 'avif'; // Default format
let loaded = 0;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

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

const currentFrame = index => `./pallina/${(index + 1).toString()}.${format}`;
const loadImages = async (start) => {
  for (let i = start; i < Math.min(start + preloadCount, frameCount); i++) {
    if (images[i]) continue; // Skip already loaded images
    const img = new Image();
    img.onload = () => {
      if (++loaded === 1) {
        canvas.width = img.width;
        canvas.height = img.height;
        startAnimation();
      }
    };
    img.src = currentFrame(i);
    images[i] = img;
  }
};

const startAnimation = () => {
  gsap.to({ frame: 0 }, {
    frame: frameCount - 1,
    snap: "frame",
    ease: "none",
    scrollTrigger: {
      scrub: 0.5,
      pin: true,
      onUpdate: self => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        const idx = Math.min(self.progress * (frameCount - 1), frameCount - 1) | 0;
        context.drawImage(images[idx], (canvas.width - images[idx].width) / 2, (canvas.height - images[idx].height) / 2);
      }
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


async () => {
  const format = await checkImageFormat();
  // Preload the initial chunk of images
  loadImages(0);
  window.addEventListener('scroll', () => {
    const nextChunkStart = Math.floor(window.scrollY / (document.body.scrollHeight / (frameCount / preloadCount))) * preloadCount;
    loadImages(nextChunkStart);
  });
}();
