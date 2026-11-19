const BASE = import.meta.env.BASE_URL;

const assetUrl = (path) => {
  if (!path) return "";
  if (/^(?:https?:)?\/\//.test(path) || path.startsWith("data:")) return path;
  return `${BASE}${path.replace(/^\//, "")}`;
};

export function initArticle() {
  const root = document.querySelector("[data-article]");
  if (!root) return;

  const main = root.querySelector("[data-article-main]");
  const stage = root.querySelector(".article__stage");
  const thumbs = [...root.querySelectorAll("[data-article-thumb]")];
  const prev = root.querySelector("[data-article-prev]");
  const next = root.querySelector("[data-article-next]");
  if (!main || !thumbs.length) return;

  let index = Math.max(
    0,
    thumbs.findIndex((thumb) => thumb.classList.contains("is-active")),
  );

  const show = (nextIndex) => {
    index = (nextIndex + thumbs.length) % thumbs.length;
    thumbs.forEach((thumb, i) => {
      thumb.classList.toggle("is-active", i === index);
    });
    const src = thumbs[index].dataset.src;
    if (src) main.src = assetUrl(src);
  };

  thumbs.forEach((thumb, i) => {
    thumb.addEventListener("click", () => show(i));
  });
  prev?.addEventListener("click", () => show(index - 1));
  next?.addEventListener("click", () => show(index + 1));

  if (!stage) return;

  let startX = 0;
  let startY = 0;
  let tracking = false;

  stage.addEventListener(
    "pointerdown",
    (event) => {
      if (event.target.closest(".article__arrow")) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;
      tracking = true;
      startX = event.clientX;
      startY = event.clientY;
    },
    { passive: true },
  );

  stage.addEventListener(
    "pointerup",
    (event) => {
      if (!tracking) return;
      tracking = false;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
      show(index + (dx < 0 ? 1 : -1));
    },
    { passive: true },
  );

  stage.addEventListener(
    "pointercancel",
    () => {
      tracking = false;
    },
    { passive: true },
  );
}
