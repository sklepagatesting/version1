document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ModifiersPlugin);

  const scroller = document.getElementById("scroller");

  scroller.innerHTML += scroller.innerHTML;

  const scrollWidth = scroller.scrollWidth / 2;
  const offset = 25;
  let position = offset;
  let velocity = 0;

  gsap.set(scroller, { x: offset });

  const fastDuration = 2;
  const fastDistance = scrollWidth * 1.5;

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

  // Mouse wheel input
  window.addEventListener("wheel", (e) => {
    velocity += e.deltaY * 0.05;
  }, { passive: true });

  // --- Touch Swipe Logic ---
  const touchScrollMultiplier = 0.12; // Increase for more sensitivity
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

    // Prevent pull-to-refresh if at the top of the page and swiping down
    if (window.scrollY === 0 && isDraggingDown) {
      e.preventDefault();
    }
  }, { passive: false });

  // GSAP ticker loop
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
