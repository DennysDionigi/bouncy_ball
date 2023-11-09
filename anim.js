// Custom element definition for preloading images
class PreloadedImage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.frameCount = 179;
    this.imagePromises = [];
    this.preloadImages();
  }

  preloadImages() {
    for (let i = 0; i < this.frameCount; i++) {
      const img = new Image();
      img.src = this.getImageSrc(i);
      const promise = new Promise((resolve) => {
        img.onload = () => resolve(img);
      });
      this.imagePromises.push(promise);
      this.shadowRoot.appendChild(img);
    }

    Promise.all(this.imagePromises).then(() => {
      this.dispatchEvent(new CustomEvent('images-preloaded', { bubbles: true, composed: true }));
    });
  }

  getImageSrc(index) {
    return `./pallina/${(index + 1).toString()}.avif`;
  }
}

customElements.define('preloaded-image', PreloadedImage);

// Main document script
document.getElementById('image-preloader').addEventListener('images-preloaded', () => {
  const canvas = document.querySelector('.canvas');
  const context = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const images = document.getElementById('image-preloader').shadowRoot.querySelectorAll('img');
  let ball = { frame: 0 };

  // GSAP animation for the ball
  gsap.to(ball, {
    frame: images.length - 1,
    snap: 'frame',
    ease: 'none',
    scrollTrigger: {
      scrub: 0.5,
      pin: '.canvas',
      end: '500%'
    },
    onUpdate: () => render(context, canvas, images, ball)
  });

  // GSAP animation for the text
  gsap.fromTo('.ball-text', {
      opacity: 0
    }, {
      opacity: 1,
      scrollTrigger: {
        scrub: 1,
        start: '50%',
        end: '60%'
      },
      onComplete: () => {
        gsap.to('.ball-text', { opacity: 0 });
      }
    }
  );

  // Initial render call
  render(context, canvas, images, ball);
});

// Render function
function render(context, canvas, images, ball) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(images[ball.frame], 0, 0);
}
