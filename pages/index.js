Document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ModifiersPlugin);

  const scroller = document.getElementById("scroller");

  // Duplicate for seamless loop
  scroller.innerHTML += scroller.innerHTML;

  const scrollWidth = scroller.scrollWidth / 2;
  const initialOffset = 25;
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
        // Set the initial position after the intro animation finishes
        position = parseFloat(gsap.getProperty(scroller, "x")) % scrollWidth;
        if (position > 0) position -= scrollWidth;

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

    // Removed the 'modifiers' from this part
    tl.to(scroller, {
      x: `-=${fastDistance}`,
      duration: fastDuration,
      ease: "power4.out",
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

      // This logic will now work correctly after the intro animation
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
