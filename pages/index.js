document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ModifiersPlugin);

  const scroller = document.getElementById("scroller");

  // Duplicate content once to create the illusion of a seamless loop
  scroller.innerHTML += scroller.innerHTML;

  const scrollWidth = scroller.scrollWidth / 2;
  const offset = 25;
  let position = offset;
  let velocity = 0;

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

  // Scroll input listener
  window.addEventListener("wheel", (e) => {
    velocity += e.deltaY * 0.05;
  }, { passive: true });

  // Continuous loop
  gsap.ticker.add(() => {
    if (Math.abs(velocity) > 0.001) {
      position -= velocity;
      velocity *= 0.94;

      // New looping logic
      // Check if we've moved past the end of the content
      if (position <= -scrollWidth + offset) {
        // Teleport the element back to the beginning to create the loop
        position += scrollWidth;
      }
      
      // Check if we've moved past the beginning of the content
      if (position >= offset) {
        // Teleport the element to the end
        position -= scrollWidth;
      }

      gsap.set(scroller, { x: position });
    }
  });
});