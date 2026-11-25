(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- reveal on scroll ---- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el, i) => {
      el.style.transitionDelay = `${(i % 4) * 80}ms`;
      io.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---- pat the hat: yarn-ball confetti ---- */
  const jimmy = document.getElementById("jimmy");
  if (jimmy) {
    jimmy.addEventListener("click", (e) => {
      jimmy.classList.remove("is-patted");
      void jimmy.offsetWidth; // restart animation
      jimmy.classList.add("is-patted");
      if (reduceMotion) return;

      const rect = jimmy.getBoundingClientRect();
      const x0 = e.clientX || rect.left + rect.width / 2;
      const y0 = e.clientY || rect.top + rect.height / 3;
      const colors = ["#e0866a", "#c4644a", "#f2b39e", "#9945ff", "#14f195"];

      for (let i = 0; i < 18; i++) {
        const ball = document.createElement("span");
        ball.className = "yarnball";
        ball.style.left = `${x0 - 11}px`;
        ball.style.top = `${y0 - 11}px`;
        ball.style.backgroundColor = colors[i % colors.length];
        const size = 14 + Math.random() * 16;
        ball.style.width = ball.style.height = `${size}px`;
        document.body.appendChild(ball);

        const angle = Math.random() * Math.PI * 2;
        const dist = 90 + Math.random() * 180;
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist - 120;
        ball.animate(
          [
            { transform: "translate(0,0) rotate(0deg)", opacity: 1 },
            { transform: `translate(${dx}px, ${dy}px) rotate(${Math.random() * 540}deg)`, opacity: 1, offset: 0.6 },
            { transform: `translate(${dx * 1.2}px, ${dy + 260}px) rotate(720deg)`, opacity: 0 },
          ],
          { duration: 1100 + Math.random() * 500, easing: "cubic-bezier(.2,.7,.4,1)" }
        ).onfinish = () => ball.remove();
      }
    });
  }

  /* ---- lightbox ---- */
  const items = Array.from(document.querySelectorAll(".gallery__item"));
  const box = document.getElementById("lightbox");
  if (!box || !items.length) return;
  const boxImg = box.querySelector(".lightbox__img");
  let current = 0;
  let lastFocus = null;

  const show = (i) => {
    current = (i + items.length) % items.length;
    const img = items[current].querySelector("img");
    boxImg.src = img.src;
    boxImg.alt = img.alt;
  };
  const open = (i) => {
    lastFocus = document.activeElement;
    show(i);
    box.hidden = false;
    document.body.style.overflow = "hidden";
    box.querySelector(".lightbox__close").focus();
  };
  const close = () => {
    box.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  };

  items.forEach((btn, i) => btn.addEventListener("click", () => open(i)));
  box.querySelector(".lightbox__close").addEventListener("click", close);
  box.querySelector(".lightbox__nav--prev").addEventListener("click", () => show(current - 1));
  box.querySelector(".lightbox__nav--next").addEventListener("click", () => show(current + 1));
  box.addEventListener("click", (e) => { if (e.target === box) close(); });
  document.addEventListener("keydown", (e) => {
    if (box.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });

  // simple swipe on touch devices
  let touchX = null;
  box.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  box.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    touchX = null;
  });
})();
