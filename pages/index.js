document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ModifiersPlugin);

  const scroller = document.getElementById("scroller");

  // Duplicate content once to create the illusion of a seamless loop
  scroller.innerHTML += scroller.innerHTML;

  const scrollWidth = scroller.scrollWidth / 2;
  const offset = 25;
  let position = offset;
  let velocity = 0;
  let startX; // For tracking the initial touch position

  // Set initial position
  gsap.set(scroller, { x: offset });

  const fastDuration = 2;
  const fastDistance = scrollWidth * 1.5;

  // Animate in and sync position
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
      // Sync internal `position` with GSAP's current x
      const transform = gsap.getProperty(scroller, "x");
      position = parseFloat(transform);
    }
  });

  // Mouse/trackpad wheel input listener
  window.addEventListener("wheel", (e) => {
    velocity += e.deltaY * 0.05;
  }, { passive: true });

  // -- Touch Input Listeners --
  scroller.addEventListener("touchstart", (e) => {
    // Record the starting touch position
    startX = e.touches[0].clientX;
    velocity = 0; // Stop any existing momentum
  }, { passive: true });

  scroller.addEventListener("touchmove", (e) => {
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - startX;
    
    // Update velocity based on the horizontal drag amount
    // You may need to adjust the multiplier for sensitivity
    velocity = deltaX * 0.5;

    // Update the starting position for the next touchmove event
    startX = currentX;
  }, { passive: true });

  scroller.addEventListener("touchend", () => {
    // The velocity will now decay naturally in the ticker loop
  });

  // Continuous loop
  gsap.ticker.add(() => {
    if (Math.abs(velocity) > 0.001) {
      position -= velocity;
      velocity *= 0.94;

      // Check for boundaries and teleport
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
