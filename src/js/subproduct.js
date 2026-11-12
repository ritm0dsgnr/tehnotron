export function initSubproduct() {
  const nav = document.querySelector("[data-subproduct-nav]");
  const toggle = document.querySelector("[data-subproduct-nav-toggle]");
  if (!nav || !toggle) return;

  const setOpen = (open) => {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  };

  const syncByViewport = () => {
    const stacked = window.matchMedia("(max-width: 1440px)").matches;
    setOpen(!stacked);
  };

  syncByViewport();
  window.addEventListener("resize", syncByViewport);

  toggle.addEventListener("click", () => {
    setOpen(!nav.classList.contains("is-open"));
  });
}
