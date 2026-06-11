// copy-to-clipboard chips
document.querySelectorAll(".cmd-chip").forEach((chip) => {
  chip.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(chip.dataset.copy);
      const note = chip.querySelector(".copied-note");
      note.hidden = false;
      setTimeout(() => (note.hidden = true), 1600);
    } catch {
      /* clipboard unavailable; the command is visible anyway */
    }
  });
});

// staggered reveals
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("shown");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.2 }
);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// hanko slam: wait until the seal is fully in view
const stampObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("stamped");
      stampObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.95 }
);

document.querySelectorAll(".stamp").forEach((el) => stampObserver.observe(el));

// living poster: cursor parallax, tracked across the whole hero
const hero = document.querySelector(".hero");
if (
  hero &&
  matchMedia("(prefers-reduced-motion: no-preference)").matches &&
  matchMedia("(pointer: fine)").matches
) {
  const scene = hero.querySelector(".fuji-scene");
  let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;

  const tick = () => {
    cx += (tx - cx) * 0.07;
    cy += (ty - cy) * 0.07;
    scene.style.setProperty("--px", cx.toFixed(4));
    scene.style.setProperty("--py", cy.toFixed(4));
    if (Math.abs(tx - cx) + Math.abs(ty - cy) > 0.002) {
      raf = requestAnimationFrame(tick);
    } else {
      raf = null;
    }
  };

  const aim = (x, y) => {
    tx = x;
    ty = y;
    if (!raf) raf = requestAnimationFrame(tick);
  };

  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    aim(((e.clientX - r.left) / r.width) * 2 - 1, ((e.clientY - r.top) / r.height) * 2 - 1);
  });
  hero.addEventListener("pointerleave", () => aim(0, 0));
}
