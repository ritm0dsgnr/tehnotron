const BASE = import.meta.env.BASE_URL;

const assetUrl = (path) => {
  if (!path) return "";
  if (/^(?:https?:)?\/\//.test(path) || path.startsWith("data:")) return path;
  return `${BASE}${path.replace(/^\//, "")}`;
};

export function initCard() {
  const root = document.querySelector("[data-card]");
  if (!root) return;

  const main = root.querySelector("[data-card-main]");
  const video = root.querySelector("[data-card-video]");
  const thumbs = [...root.querySelectorAll("[data-card-thumb]")];
  const prev = root.querySelector("[data-card-prev]");
  const next = root.querySelector("[data-card-next]");
  if (!main || !thumbs.length) return;

  let index = Math.max(
    0,
    thumbs.findIndex((thumb) => thumb.classList.contains("is-active")),
  );
  let videoSrc = "";

  const stopVideo = () => {
    if (!video) return;
    video.pause();
    video.removeAttribute("src");
    video.load();
    video.hidden = true;
    videoSrc = "";
  };

  const playVideo = (src, poster) => {
    if (!video) return;
    const nextSrc = assetUrl(src);
    main.hidden = true;
    video.hidden = false;
    if (poster) video.poster = assetUrl(poster);
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    if (videoSrc !== nextSrc) {
      videoSrc = nextSrc;
      video.src = nextSrc;
      video.load();
    }
    video.play().catch(() => {});
  };

  const showImage = (src) => {
    stopVideo();
    main.hidden = false;
    main.src = assetUrl(src);
  };

  const setActive = (nextIndex) => {
    index = ((nextIndex % thumbs.length) + thumbs.length) % thumbs.length;
    const thumb = thumbs[index];
    const type = thumb.getAttribute("data-type") || "image";
    const src = thumb.getAttribute("data-src");
    const poster = thumb.getAttribute("data-poster") || "";

    if (type === "video" && src) playVideo(src, poster);
    else if (src) showImage(src);

    thumbs.forEach((item, i) => item.classList.toggle("is-active", i === index));
  };

  thumbs.forEach((thumb, i) => {
    thumb.addEventListener("click", () => setActive(i));
  });

  prev?.addEventListener("click", () => setActive(index - 1));
  next?.addEventListener("click", () => setActive(index + 1));

  setActive(index);
}
