// copy feedback: an order-stub toast plus a burst of sushi
const showToast = (() => {
  const el = document.createElement("div");
  el.className = "order-toast";
  el.setAttribute("role", "status");
  el.innerHTML =
    '<span class="toast-head">Order copied <span lang="ja">注文票</span></span>' +
    "<p>The order is a prompt. Paste it into Claude Code, Cursor, or wherever " +
    "your agent lives, and the kitchen sets itself up.</p>";
  document.body.appendChild(el);
  let timer;
  return () => {
    el.classList.add("show");
    clearTimeout(timer);
    timer = setTimeout(() => el.classList.remove("show"), 5500);
  };
})();

const SUSHI = [
  '<svg viewBox="0 0 100 70"><ellipse cx="50" cy="52" rx="34" ry="14" fill="#f3ead3" stroke="#2a221b" stroke-width="4"/><path d="M16 44 Q50 14 84 44 Q50 60 16 44 Z" fill="#d93a1f" stroke="#2a221b" stroke-width="4"/></svg>',
  '<svg viewBox="0 0 100 70"><circle cx="50" cy="38" r="28" fill="#2a221b"/><circle cx="50" cy="38" r="20" fill="#f3ead3"/><circle cx="50" cy="38" r="9" fill="#d93a1f" stroke="#2a221b" stroke-width="3"/></svg>',
  '<svg viewBox="0 0 100 70"><ellipse cx="50" cy="52" rx="34" ry="14" fill="#f3ead3" stroke="#2a221b" stroke-width="4"/><path d="M18 46 Q48 12 84 40 L78 50 Q50 60 18 46 Z" fill="#e393bd" stroke="#2a221b" stroke-width="4"/></svg>',
];

function sushiBurst(button) {
  if (!matchMedia("(prefers-reduced-motion: no-preference)").matches) return;
  const layer = document.createElement("div");
  layer.className = "sushi-burst";
  document.body.appendChild(layer);
  const r = button.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  let alive = 12;
  for (let i = 0; i < 12; i++) {
    const piece = document.createElement("div");
    piece.className = "piece";
    piece.innerHTML = SUSHI[i % SUSHI.length];
    piece.style.width = `${20 + Math.random() * 14}px`;
    piece.style.left = `${cx}px`;
    piece.style.top = `${cy}px`;
    layer.appendChild(piece);
    const dx = (Math.random() - 0.5) * 300;
    const rise = -(70 + Math.random() * 130);
    const fall = 150 + Math.random() * 170;
    const spin = (Math.random() - 0.5) * 1080;
    piece
      .animate(
        [
          {
            transform: "translate(-50%, -50%) translate(0, 0) rotate(0deg)",
            opacity: 1,
            easing: "cubic-bezier(0.33, 1, 0.68, 1)",
          },
          {
            transform: `translate(-50%, -50%) translate(${dx * 0.7}px, ${rise}px) rotate(${spin * 0.5}deg)`,
            opacity: 1,
            offset: 0.45,
            easing: "cubic-bezier(0.32, 0, 0.67, 0.2)",
          },
          {
            transform: `translate(-50%, -50%) translate(${dx}px, ${fall}px) rotate(${spin}deg)`,
            opacity: 0,
          },
        ],
        { duration: 950 + Math.random() * 450 }
      )
      .finished.then(() => {
        piece.remove();
        if (--alive === 0) layer.remove();
      });
  }
}

document.querySelectorAll("[data-copy]").forEach((el) => {
  el.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(el.dataset.copy);
      sushiBurst(el);
      showToast();
    } catch {
      /* clipboard unavailable; the prompt is visible on the ticket anyway */
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
