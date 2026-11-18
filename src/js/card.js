const BASE = import.meta.env.BASE_URL;

const assetUrl = (path) => {
  if (!path) return "";
  if (/^(?:https?:)?\/\//.test(path) || path.startsWith("data:")) return path;
  return `${BASE}${path.replace(/^\//, "")}`;
};

const frameFromVideo = (src, at = 1) =>
  new Promise((resolve, reject) => {
    const el = document.createElement("video");
    el.muted = true;
    el.playsInline = true;
    el.preload = "auto";
    el.src = assetUrl(src);

    const fail = () => reject(new Error("video poster failed"));

    el.addEventListener(
      "loadeddata",
      async () => {
        try {
          const duration = Number.isFinite(el.duration) ? el.duration : at;
          el.currentTime = Math.min(at, Math.max(0.1, duration * 0.05));
          await new Promise((done) => {
            el.addEventListener("seeked", done, { once: true });
          });
          const canvas = document.createElement("canvas");
          canvas.width = el.videoWidth || 1920;
          canvas.height = el.videoHeight || 1080;
          canvas.getContext("2d").drawImage(el, 0, 0);
          resolve(canvas.toDataURL("image/jpeg", 0.86));
        } catch (err) {
          reject(err);
        } finally {
          el.removeAttribute("src");
          el.load();
        }
      },
      { once: true },
    );
    el.addEventListener("error", fail, { once: true });
  });

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
    if (poster) video.poster = poster.startsWith("data:") ? poster : assetUrl(poster);
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

  const prepareVideoPoster = async (thumb) => {
    if (thumb.getAttribute("data-type") !== "video") return;
    const src = thumb.getAttribute("data-src");
    if (!src) return;

    try {
      const poster = await frameFromVideo(src);
      thumb.setAttribute("data-poster", poster);
      const img = thumb.querySelector("img");
      if (img) img.src = poster;
      if (video) video.poster = poster;
      if (main && thumbs[index] === thumb) main.src = poster;
    } catch {
      /* leave static poster if any */
    }
  };

  thumbs.forEach((thumb, i) => {
    thumb.addEventListener("click", () => setActive(i));
  });

  prev?.addEventListener("click", () => setActive(index - 1));
  next?.addEventListener("click", () => setActive(index + 1));

  setActive(index);
  Promise.all(thumbs.map((thumb) => prepareVideoPoster(thumb))).then(() => {
    if (thumbs[index]?.getAttribute("data-type") === "video") setActive(index);
  });
}
