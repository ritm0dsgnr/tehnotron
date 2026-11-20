import gsap from "gsap";

export function initCareer() {
  const root = document.querySelector("[data-career-events]");
  if (!root) return;

  const photos = gsap.utils.toArray(root.querySelectorAll("[data-career-events-photo]"));
  const slides = gsap.utils.toArray(root.querySelectorAll("[data-career-events-slide]"));
  const prev = root.querySelector("[data-career-events-prev]");
  const next = root.querySelector("[data-career-events-next]");
  const total = slides.length;
  if (!total) return;

  const pad = (n) => String(n).padStart(2, "0");
  const totalLabel = pad(total);

  slides.forEach((slide, n) => {
    const count = slide.querySelector("[data-career-events-count]");
    if (!count) return;
    count.innerHTML = `<span class="career-events__count-current">${pad(n + 1)}</span><span class="career-events__count-rest"> / ${totalLabel}</span>`;
  });

  let index = 0;
  let busy = false;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const applyActive = (i) => {
    slides.forEach((slide, n) => {
      slide.classList.toggle("is-active", n === i);
    });
    photos.forEach((photo, n) => {
      photo.classList.toggle("is-active", n === i);
      gsap.set(photo, { opacity: n === i ? 1 : 0 });
    });
    index = i;
  };

  const showSlide = (i) => {
    if (busy || i === index || !slides[i]) return;

    if (reduce) {
      applyActive(i);
      return;
    }

    busy = true;
    const photoOut = photos[index];
    const photoIn = photos[i];

    slides.forEach((slide, n) => {
      slide.classList.toggle("is-active", n === i);
    });

    if (photoIn) gsap.set(photoIn, { opacity: 0 });

    const tl = gsap.timeline({
      onComplete: () => {
        if (photoOut) photoOut.classList.remove("is-active");
        if (photoIn) photoIn.classList.add("is-active");
        index = i;
        busy = false;
      },
    });

    if (photoOut) {
      tl.to(photoOut, { opacity: 0, duration: 0.45, ease: "power2.inOut" }, 0);
    }
    if (photoIn) {
      tl.to(photoIn, { opacity: 1, duration: 0.55, ease: "power2.inOut" }, 0.05);
    }
  };

  applyActive(0);

  prev?.addEventListener("click", () => {
    showSlide((index - 1 + total) % total);
  });

  next?.addEventListener("click", () => {
    showSlide((index + 1) % total);
  });
}
