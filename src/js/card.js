export function initCard() {
  const root = document.querySelector("[data-card]");
  if (!root) return;

  const main = root.querySelector("[data-card-main]");
  const thumbs = [...root.querySelectorAll("[data-card-thumb]")];
  const prev = root.querySelector("[data-card-prev]");
  const next = root.querySelector("[data-card-next]");
  if (!main || !thumbs.length) return;

  let index = Math.max(
    0,
    thumbs.findIndex((thumb) => thumb.classList.contains("is-active")),
  );

  const setActive = (nextIndex) => {
    index = ((nextIndex % thumbs.length) + thumbs.length) % thumbs.length;
    const thumb = thumbs[index];
    const src = thumb.getAttribute("data-src");
    if (src) main.src = src;
    thumbs.forEach((item, i) => item.classList.toggle("is-active", i === index));
  };

  thumbs.forEach((thumb, i) => {
    thumb.addEventListener("click", () => setActive(i));
  });

  prev?.addEventListener("click", () => setActive(index - 1));
  next?.addEventListener("click", () => setActive(index + 1));
}
