import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initAnimations() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll("[data-animate] .is-animate").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    return;
  }

  document.querySelectorAll("[data-animate] .is-animate").forEach((el, i) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      delay: i * 0.08,
      ease: "power2.out",
      clearProps: "transform",
    });
  });

  initStackCover();
  initDirectionsSlider();
}

function initStackCover() {
  const stats = document.querySelector(".stats");
  if (!stats) return;

  const travel = () =>
    Math.max(stats.offsetHeight - window.innerHeight, window.innerHeight * 1.25);
  const cover = () => window.innerHeight * 0.85;

  ScrollTrigger.create({
    trigger: stats,
    start: "top top",
    end: () => `+=${travel() + cover()}`,
    pin: true,
    pinSpacing: false,
    anticipatePin: 1,
    invalidateOnRefresh: true,
  });

  const scrubRange = {
    trigger: stats,
    start: "top top",
    end: () => `+=${travel()}`,
    scrub: 0.15,
    invalidateOnRefresh: true,
  };

  const media = stats.querySelector(".stats__media");
  if (media) {
    gsap.fromTo(
      media,
      { y: 0 },
      {
        y: () => -travel() * 0.65,
        ease: "none",
        scrollTrigger: { ...scrubRange, scrub: 0.25 },
      },
    );
  }

  const items = stats.querySelectorAll(".stats__item");
  if (items.length) {
    gsap.fromTo(
      items,
      { y: 0 },
      {
        y: () => -travel() * 1.05,
        ease: "none",
        scrollTrigger: { ...scrubRange, scrub: 0.08 },
      },
    );
  }
}

function initDirectionsSlider() {
  const stage = document.querySelector("[data-directions-stage]");
  const track = document.querySelector("[data-directions-track]");
  if (!stage || !track) return;

  const photos = gsap.utils.toArray(stage.querySelectorAll("[data-directions-photo]"));
  const panels = gsap.utils.toArray(track.querySelectorAll("[data-directions-panel]"));

  panels.forEach((panel, i) => {
    const num = panel.querySelector("[data-directions-num]");
    if (num) num.textContent = String(i + 1).padStart(2, "0");
  });

  if (photos.length < 2 || panels.length < 2) return;

  const steps = panels.length - 1;
  const panelHeight = () => Math.max(panels[0].offsetHeight, window.innerHeight);

  gsap.set(photos, { opacity: 0 });
  gsap.set(photos[0], { opacity: 1 });

  let active = 0;
  const setActive = (index) => {
    if (index === active) return;
    active = index;
    photos.forEach((photo, i) => {
      photo.classList.toggle("is-active", i === index);
    });
  };

  setActive(0);

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: stage,
      start: "top top",
      end: () => `+=${steps * window.innerHeight * 1.5}`,
      pin: true,
      scrub: 0.5,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        setActive(Math.min(steps, Math.round(self.progress * steps)));
      },
    },
  });

  panels.forEach((_, i) => {
    if (i === 0) return;

    const at = i - 1;

    tl.to(
      track,
      {
        y: () => -i * panelHeight(),
        duration: 1,
        ease: "none",
      },
      at,
    );

    tl.to(photos[i - 1], { opacity: 0, duration: 0.55, ease: "power1.inOut" }, at);
    tl.to(photos[i], { opacity: 1, duration: 0.55, ease: "power1.inOut" }, at);
  });
}
