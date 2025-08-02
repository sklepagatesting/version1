document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ModifiersPlugin);

  const scroller = document.getElementById("scroller");

  // Duplicate content for seamless scroll
  scroller.innerHTML += scroller.innerHTML;

  const scrollWidth = scroller.scrollWidth / 2;
  const offset = 25;
  let position = offset;
  let velocity = 0;

  // Set initial position
  gsap.set(scroller, { x: offset });

  const fastDuration = 2;
  const fastDistance = scrollWidth * 1.5;

  // Intro animation
  gsap.to(scroller, {
    x: `-=${fastDistance}`,
    duration: fastDuration,
    ease: "power4.out",
    modifiers: {
      x: gsap.utils.unitize(x => {
        const raw = parseFloat(x) - offset;
        const looped = raw % scrollWidth;
        return looped + offset;
      })
    },
    onUpdate() {
      position = parseFloat(gsap.getProperty(scroller, "x"));
    }
  });

  // --- Mouse Wheel Scroll ---
  window.addEventListener("wheel", (e) => {
    velocity += e.deltaY * 0.05;
  }, { passive: true });

  // --- Touch Input on Entire Viewport ---
  let startY;

  window.addEventListener("touchstart", (e) => {
    startY = e.touches[0].clientY;
    velocity = 0;
  }, { passive: true });

  window.addEventListener("touchmove", (e) => {
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;

    // Treat vertical swipe like mouse wheel scroll
    velocity += -deltaY * 0.05;

    startY = currentY;

    // Optional: prevent vertical scroll (uncomment to block)
    // e.preventDefault();
  }, { passive: true }); // Change to false if using preventDefault()

  // --- GSAP Ticker: Scroll Loop ---
  gsap.ticker.add(() => {
    if (Math.abs(velocity) > 0.001) {
      position -= velocity;
      velocity *= 0.94;

      if (position <= -scrollWidth + offset) {
        position += scrollWidth;
      }
      if (position >= offset) {
        position -= scrollWidth;
      }

      gsap.set(scroller, { x: position });
    }
  });
});
