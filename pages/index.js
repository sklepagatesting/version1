document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ModifiersPlugin);

  const scroller = document.getElementById("scroller");

  // Duplicate for seamless loop
  scroller.innerHTML += scroller.innerHTML;

  const scrollWidth = scroller.scrollWidth / 2;

  // Dynamically align first card with correct margin
  const firstCard = scroller.children[0];
  const cardStyle = window.getComputedStyle(firstCard);
  const marginRight = parseFloat(cardStyle.marginRight);
  const initialOffset = marginRight;

  let position = initialOffset;
  let velocity = 0;

  // Set initial scroll position
  gsap.set(scroller, { x: initialOffset });

  const cards = scroller.children;

  // Prevent scroller from collapsing
  const cardHeight = cards[0].offsetHeight;
  scroller.style.height = cardHeight + "px";
  scroller.style.overflow = "hidden";

  // Set initial card state (GPU-friendly)
  gsap.set(cards, {
    scaleY: 0,
    transformOrigin: "bottom right",
    willChange: "transform"
  });

  // Intro animation after 3 seconds
  setTimeout(() => {
    const fastDuration = 2;
    const fastDistance = scrollWidth * 1.5;

    const tl = gsap.timeline({
      onComplete: () => {
        position = parseFloat(gsap.getProperty(scroller, "x"));
        scroller.style.height = ""; // release height lock
        scroller.style.overflow = ""; // restore default
      }
    });

    // Fast scroll + scaleY grow together
    tl.to(cards, {
      scaleY: 1,
      duration: 1,
      ease: "power2.out"
    }, 0);

    tl.to(scroller, {
      x: `-=${fastDistance}`,
      duration: fastDuration,
      ease: "power4.out",
      modifiers: {
        x: gsap.utils.unitize(x => {
          const raw = parseFloat(x);
          const looped = raw % scrollWidth;
          return looped;
        })
      }
    }, 0);
  }, 2000);

  // Wheel input
  window.addEventListener("wheel", (e) => {
    velocity += e.deltaY * 0.05;
  }, { passive: true });

  // Touch input
  const touchScrollMultiplier = 0.12;
  let startY;
  let isDraggingDown = false;

  window.addEventListener("touchstart", (e) => {
    startY = e.touches[0].clientY;
    velocity = 0;
    isDraggingDown = false;
  }, { passive: true });

  window.addEventListener("touchmove", (e) => {
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;

    if (deltaY > 0) isDraggingDown = true;

    velocity += -deltaY * touchScrollMultiplier;
    startY = currentY;

    if (window.scrollY === 0 && isDraggingDown) {
      e.preventDefault();
    }
  }, { passive: false });

  // Continuous scroll logic
  gsap.ticker.add(() => {
    if (Math.abs(velocity) > 0.001) {
      position -= velocity;
      velocity *= 0.94;

      if (position <= -scrollWidth) {
        position += scrollWidth;
      }
      if (position >= 0) {
        position -= scrollWidth;
      }

      gsap.set(scroller, { x: position });
    }
  });
});









const currentImage = document.getElementById("image-current");
const nextImage = document.getElementById("image-next");
const titles = document.querySelectorAll(".article-title");

let lastSrc = currentImage.src;
let isAnimating = false;

titles.forEach(title => {
  title.addEventListener("mouseenter", () => {
    const newSrc = title.dataset.img;

    if (!newSrc || newSrc === lastSrc || isAnimating) return;

    isAnimating = true;
    lastSrc = newSrc;

    // Prepare next image
    nextImage.src = newSrc;
    gsap.set(nextImage, {
      scale: 1.1,
      opacity: 0,
      zIndex: 2,
    });

    gsap.set(currentImage, {
      zIndex: 1
    });

    // Animate next image to zoom out and fade in
    gsap.to(nextImage, {
      opacity: 1,
      scale: 1,
      duration: 0.4,
      ease: "power2.out",
      onComplete: () => {
        // Swap roles
        currentImage.src = newSrc;

        // Reset nextImage immediately after transition
        gsap.set(nextImage, {
          opacity: 0,
          scale: 1.1
        });

        isAnimating = false;
      }
    });
  });
});

// Initial states
gsap.set(currentImage, { scale: 1.1, opacity: 1, zIndex: 1 });
gsap.set(nextImage, { scale: 1.1, opacity: 0, zIndex: 2 });
