const canvas = document.querySelector(".canvas");
const context = canvas.getContext("2d");
context.scale(1, 1);
const frameCount = 179;
const images = [];
const ball = { frame: 0 };
const cacheName = 'ball-animation-frames';

// Dimensione canvas
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

// Function to get the frame path
const currentFrame = (index, format) => `./pallina/${(index + 1).toString()}.${format}`;

// Frame corrente e base 
const render = () => {
  if (images.length > 0) {
    const img = images[0];
    // Spazio in base alla prima img x centrare il rendering
    if (canvas.width !== img.width || canvas.height !== img.height) {
      canvas.width = img.width;
      canvas.height = img.height;
    }

    const frameIndex = Math.min(ball.frame, images.length - 1); // Ensure the frame index is valid
    const frame = images[frameIndex];
    if (frame) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      // Posizione img rispetto al canvas
      const x = (canvas.width - frame.width) / 2;
      const y = (canvas.height - frame.height) / 2;
      context.drawImage(frame, x, y); // Centra l'img
    }
  }
};

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
    image.onload = () => {
      imagesLoaded++;
      if (imagesLoaded === 1) {
        // Imposta dimensione spazio lavoro
        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0); // Disegna primo frame
      }
      URL.revokeObjectURL(image.src); // svuota memoria
      images[i] = image; // Array di immagini
      if (imagesLoaded === frameCount) { // controlls
        startAnimation(); // Inizia dopo la cache
      }
    };
    image.onerror = () => {
      console.error('Error loading image:', imagePath);
    };
    image.src = URL.createObjectURL(blob);
  }
};

// GSAP
const startAnimation = () => {
  gsap.to(ball, {
    frame: frameCount - 1,
    snap: "frame",
    ease: "none",
    scrollTrigger: {
      scrub: true,
      pin: ".canvas",
      end: "+=3000",
      onUpdate: () => render() // Aggiorna frame allo scroll
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


// Esegui il tutto in asyncrono
(async () => {
  const format = await checkImageFormat();
  await preloadImages(format);
})();
