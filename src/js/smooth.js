import Lenis from "lenis";
import "lenis/dist/lenis.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function initSmoothScroll() {
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  if (location.hash === "" || location.hash === "#") {
    history.replaceState(null, "", location.pathname + location.search);
  }

  const startHash = location.hash && location.hash.length > 1 ? location.hash.slice(1) : "";
  window.scrollTo(0, 0);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    if (startHash) {
      window.addEventListener(
        "load",
        () => {
          document.getElementById(startHash)?.scrollIntoView();
        },
        { once: true },
      );
    }
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

  window.addEventListener(
    "load",
    () => {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        ScrollTrigger.refresh();

        if (startHash) {
          const target = document.getElementById(startHash);
          if (target) {
            lenis.scrollTo(target, { immediate: true });
            return;
          }
        }

        if (window.scrollY !== y) lenis.scrollTo(y, { immediate: true });
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
      history.replaceState(null, "", location.pathname + location.search);
      lenis.scrollTo(0);
      return;
    }

    const target = document.getElementById(id);
    if (!target) return;

    e.preventDefault();
    history.pushState(null, "", `${location.pathname}${location.search}#${id}`);
    lenis.scrollTo(target);
  });

  return lenis;
}
