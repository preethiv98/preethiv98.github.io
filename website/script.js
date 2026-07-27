// Scroll reveal
const revealEls = document.querySelectorAll(".reveal");
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
revealEls.forEach((el) => io.observe(el));

// Safety net: if the observer ever misses an element, don't leave it invisible.
setTimeout(() => {
  document.querySelectorAll(".reveal:not(.in)").forEach((el) => el.classList.add("in"));
}, 2000);

// Hero signal canvas — a faint agent/node graph, ambient motion only
const canvas = document.getElementById("signal");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (canvas) {
  const ctx = canvas.getContext("2d");
  let width, height, nodes;
  const NODE_COUNT = 26;
  const LINK_DIST = 170;

  function styleColor(varName, fallback) {
    const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    return v || fallback;
  }

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    width = canvas.width = rect.width * devicePixelRatio;
    height = canvas.height = rect.height * devicePixelRatio;
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";
  }

  function makeNodes() {
    nodes = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.12 * devicePixelRatio,
      vy: (Math.random() - 0.5) * 0.12 * devicePixelRatio,
      r: (Math.random() * 1.4 + 0.8) * devicePixelRatio,
    }));
  }

  function step() {
    ctx.clearRect(0, 0, width, height);
    const accent = styleColor("--accent", "#d9a441");
    const line = styleColor("--line", "#3a3126");

    nodes.forEach((n) => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;
    });

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < LINK_DIST * devicePixelRatio) {
          const alpha = 1 - d / (LINK_DIST * devicePixelRatio);
          ctx.strokeStyle = line;
          ctx.globalAlpha = alpha * 0.5;
          ctx.lineWidth = devicePixelRatio;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 1;
    nodes.forEach((n) => {
      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    if (!reduceMotion) requestAnimationFrame(step);
  }

  resize();
  makeNodes();
  step();

  window.addEventListener("resize", () => {
    resize();
    makeNodes();
    if (reduceMotion) step();
  });
}
