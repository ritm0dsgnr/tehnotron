const LEAVE_MS = 380;
const READY_FALLBACK_MS = 2200;

const sameDocument = (url) =>
  url.pathname === location.pathname && url.search === location.search;

const shouldSkipLink = (anchor, url) => {
  if (!anchor || !url) return true;
  if (anchor.target && anchor.target !== "_self") return true;
  if (anchor.hasAttribute("download")) return true;
  if (anchor.dataset.noTransition != null) return true;
  if (url.origin !== location.origin) return true;
  if (sameDocument(url)) return true;
  if (url.hash === "#request") return true;
  if (anchor.matches("[data-request-open]")) return true;
  const protocol = url.protocol;
  if (protocol === "mailto:" || protocol === "tel:" || protocol === "javascript:") return true;
  return false;
};

export function initPageTransition() {
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const reveal = () => {
    root.classList.remove("is-page-leaving");
    root.classList.add("is-page-ready");
  };

  if (reduce) {
    reveal();
    return;
  }

  const scheduleReveal = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(reveal);
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleReveal, { once: true });
  } else {
    scheduleReveal();
  }

  window.addEventListener(
    "pageshow",
    (event) => {
      if (event.persisted) reveal();
    },
    { passive: true },
  );

  window.setTimeout(reveal, READY_FALLBACK_MS);

  let leaving = false;

  document.addEventListener(
    "click",
    (event) => {
      if (leaving) return;
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = event.target.closest("a[href]");
      if (!anchor) return;

      let url;
      try {
        url = new URL(anchor.href, location.href);
      } catch {
        return;
      }

      if (shouldSkipLink(anchor, url)) return;

      event.preventDefault();
      leaving = true;
      root.classList.remove("is-page-ready");
      root.classList.add("is-page-leaving");

      window.setTimeout(() => {
        location.href = url.href;
      }, LEAVE_MS);
    },
    true,
  );
}
