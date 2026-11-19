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
}
