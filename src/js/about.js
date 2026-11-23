import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getLenis } from "./smooth.js";

gsap.registerPlugin(ScrollTrigger);

export function initAbout() {
  const root = document.querySelector("[data-about-stages]");
  if (!root) return;

  const track = root.querySelector("[data-about-stages-track]");
  const list = track?.querySelector(".about-stages__list");
  if (!track || !list) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    initFallbackScroll(track);
    return;
  }

  root.classList.add("is-scroll-driven");

  const getTravel = () => Math.max(0, list.scrollWidth - track.clientWidth);

  const tween = gsap.to(list, {
    x: () => -getTravel(),
    ease: "none",
    scrollTrigger: {
      trigger: root,
      start: "top top",
      end: () => `+=${Math.max(getTravel() * 1.05, window.innerHeight)}`,
      pin: true,
      scrub: 0.45,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  const st = tween.scrollTrigger;

  track.addEventListener("keydown", (e) => {
    if (!st || getTravel() <= 0) return;

    const range = st.end - st.start;
    const step = Math.max(80, range * 0.08);
    let next = window.scrollY;

    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = st.start + st.progress * range + step;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = st.start + st.progress * range - step;
    else if (e.key === "Home") next = st.start;
    else if (e.key === "End") next = st.end;
    else return;

    e.preventDefault();
    next = Math.min(st.end, Math.max(st.start, next));

    const lenis = getLenis();
    if (lenis) lenis.scrollTo(next, { duration: 0.6 });
    else window.scrollTo({ top: next, behavior: "smooth" });
  });

  const refresh = () => ScrollTrigger.refresh();
  window.addEventListener("load", refresh, { once: true });
  if (document.fonts?.ready) document.fonts.ready.then(refresh);
}

function initFallbackScroll(track) {
  const maxScroll = () => Math.max(0, track.scrollWidth - track.clientWidth);

  track.addEventListener("keydown", (e) => {
    if (track.scrollWidth <= track.clientWidth) return;
    const step = Math.max(120, Math.round(track.clientWidth * 0.35));
    let next = track.scrollLeft;

    if (e.key === "ArrowRight") next += step;
    else if (e.key === "ArrowLeft") next -= step;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = maxScroll();
    else return;

    e.preventDefault();
    track.scrollLeft = Math.min(maxScroll(), Math.max(0, next));
  });
}
