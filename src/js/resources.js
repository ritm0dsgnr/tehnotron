import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initResources() {
  const root = document.querySelector("[data-resources]");
  if (!root) return;

  const photos = gsap.utils.toArray(root.querySelectorAll("[data-resources-photo]"));
  const slides = gsap.utils.toArray(root.querySelectorAll("[data-resources-slide]"));
  const title = root.querySelector("[data-resources-title]");
  const line = root.querySelector("[data-resources-vline]");
  const prev = root.querySelector("[data-resources-prev]");
  const next = root.querySelector("[data-resources-next]");
  const total = slides.length;
  if (!total) return;

  const pad = (n) => String(n).padStart(2, "0");
  const totalLabel = pad(total);

  slides.forEach((slide, n) => {
    const count = slide.querySelector("[data-resources-count]");
    if (!count) return;
    count.innerHTML = `<span class="resources__count-current">${pad(n + 1)}</span><span class="resources__count-rest"> / ${totalLabel}</span>`;
  });

  let index = 0;
  let busy = false;
  let ready = false;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const slideInX = () => Math.round(window.innerWidth * 0.55);

  const applyActive = (i) => {
    slides.forEach((slide, n) => {
      const on = n === i;
      slide.classList.toggle("is-active", on);
      gsap.set(slide, {
        opacity: on ? 1 : 0,
        x: 0,
        visibility: on ? "visible" : "hidden",
      });
    });
    photos.forEach((photo, n) => {
      const on = n === i;
      photo.classList.toggle("is-active", on);
      gsap.set(photo, { opacity: on ? 1 : 0, x: 0 });
    });
    index = i;
  };

  const showSlide = (i) => {
    if (!ready || busy || i === index || !slides[i]) return;

    if (reduce) {
      applyActive(i);
      return;
    }

    busy = true;
    const current = slides[index];
    const incoming = slides[i];
    const photoOut = photos[index];
    const photoIn = photos[i];

    gsap.set(incoming, { opacity: 0, x: slideInX(), visibility: "visible" });
    if (photoIn) gsap.set(photoIn, { opacity: 0, x: 48 });

    const tl = gsap.timeline({
      onComplete: () => {
        current.classList.remove("is-active");
        incoming.classList.add("is-active");
        gsap.set(current, { visibility: "hidden", x: 0 });
        if (photoOut) {
          photoOut.classList.remove("is-active");
          gsap.set(photoOut, { opacity: 0, x: 0 });
        }
        if (photoIn) photoIn.classList.add("is-active");
        index = i;
        busy = false;
      },
    });

    tl.to(
      current,
      {
        opacity: 0,
        x: -40,
        duration: 0.4,
        ease: "power2.in",
      },
      0,
    );

    tl.to(
      incoming,
      {
        opacity: 1,
        x: 0,
        duration: 0.7,
        ease: "power2.out",
      },
      0.12,
    );

    if (photoOut) {
      tl.to(
        photoOut,
        {
          opacity: 0,
          x: -36,
          duration: 0.8,
          ease: "power1.inOut",
        },
        0,
      );
    }

    if (photoIn) {
      photoIn.classList.add("is-active");
      tl.to(
        photoIn,
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: "power1.inOut",
        },
        0,
      );
    }
  };

  const go = (dir) => {
    showSlide((index + dir + total) % total);
  };

  prev?.addEventListener("click", () => go(-1));
  next?.addEventListener("click", () => go(1));

  applyActive(0);

  if (reduce) {
    applyActive(0);
    if (title) gsap.set(title, { opacity: 1, x: 0 });
    if (line) gsap.set(line, { scaleY: 1 });
    ready = true;
    return;
  }

  gsap.set(slides[0], { opacity: 0, x: slideInX(), visibility: "visible" });
  slides.slice(1).forEach((slide) => {
    gsap.set(slide, { opacity: 0, x: 0, visibility: "hidden" });
  });

  const enter = {
    trigger: root,
    start: "top 70%",
    once: true,
  };

  if (title) {
    gsap.fromTo(
      title,
      { opacity: 0, x: 60 },
      {
        opacity: 1,
        x: 0,
        duration: 0.9,
        ease: "power2.out",
        scrollTrigger: enter,
      },
    );
  }

  gsap.to(slides[0], {
    opacity: 1,
    x: 0,
    duration: 0.9,
    delay: 0.08,
    ease: "power2.out",
    scrollTrigger: enter,
    onComplete: () => {
      ready = true;
    },
  });

  if (line) {
    gsap.fromTo(
      line,
      { scaleY: 0 },
      {
        scaleY: 1,
        duration: 1.1,
        ease: "power2.inOut",
        scrollTrigger: enter,
      },
    );
  }
}
