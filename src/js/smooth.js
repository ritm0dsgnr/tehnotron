import Lenis from "lenis";
import "lenis/dist/lenis.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function initSmoothScroll() {
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  if (location.hash) {
    history.replaceState(null, "", location.pathname + location.search);
  }
  window.scrollTo(0, 0);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return null;
  }

  const lenis = new Lenis({
    duration: 1.1,
    smoothWheel: true,
    touchMultiplier: 1.2,
  });

  lenis.scrollTo(0, { immediate: true });
  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  let findMode = false;
  const leaveFindMode = () => {
    if (!findMode) return;
    findMode = false;
    lenis.scrollTo(window.scrollY, { immediate: true });
    lenis.start();
    ScrollTrigger.refresh();
  };

  window.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
      findMode = true;
      lenis.stop();
      return;
    }
    if (e.key === "Escape") leaveFindMode();
  });

  window.addEventListener(
    "scroll",
    () => {
      if (!findMode) return;
      lenis.scrollTo(window.scrollY, { immediate: true });
    },
    { passive: true },
  );

  window.addEventListener("pointerdown", leaveFindMode, { passive: true });

  window.addEventListener(
    "load",
    () => {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        lenis.scrollTo(0, { immediate: true });
      });
    },
    { once: true },
  );

  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href*="#"]');
    if (!link) return;

    const url = new URL(link.href, location.href);
    if (url.pathname !== location.pathname) return;

    const id = url.hash.slice(1);
    if (!id) {
      e.preventDefault();
      return;
    }

    const target = document.getElementById(id);
    if (!target) {
      e.preventDefault();
      return;
    }

    e.preventDefault();
    history.pushState(null, "", `${location.pathname}${location.search}#${id}`);
    lenis.scrollTo(target);
  });

  return lenis;
}
