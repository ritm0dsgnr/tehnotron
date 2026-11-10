import gsap from "gsap";

const BASE = import.meta.env.BASE_URL;

const SLIDES = [
  {
    type: "video",
    src: `${BASE}video/hero.mp4`,
    poster: `${BASE}img/01.jpg`,
    title: ["Полный цикл", "разработки продукта"],
    lead: "С внедрением технологий - от идеи до серийного производства",
    href: "#resources",
  },
  {
    type: "image",
    src: `${BASE}img/02.jpg`,
    title: ["Лучшая система", "качества"],
    lead: "Стабильность и уверенность в завтрашнем дне",
    href: "#resources",
  },
];

export function initHero() {
  const root = document.querySelector("[data-hero]");
  if (!root) return;

  const media = root.querySelector("[data-hero-media]");
  const lineEls = [...root.querySelectorAll("[data-hero-line]")];
  const leadEl = root.querySelector("[data-hero-lead]");
  const btnEl = root.querySelector("[data-hero-btn]");
  const actionsEl = root.querySelector(".hero__actions");
  const progressEl = root.querySelector("[data-hero-progress]");
  const prevBtn = root.querySelector("[data-hero-prev]");
  const nextBtn = root.querySelector("[data-hero-next]");
  const introEls = [...root.querySelectorAll("[data-hero-intro]")].sort(
    (a, b) => Number(a.getAttribute("data-hero-intro")) - Number(b.getAttribute("data-hero-intro")),
  );

  if (!media || !leadEl || !btnEl || !actionsEl || !progressEl || !prevBtn || !nextBtn) return;

  let index = 0;
  let busy = false;
  let raf = 0;
  let videoEl = null;
  let activeLayer = null;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const stopProgress = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };

  const setProgress = (value) => {
    progressEl.style.transform = `scaleX(${Math.min(1, Math.max(0, value))})`;
  };

  const trackVideo = (video) => {
    stopProgress();
    videoEl = video;
    const tick = () => {
      if (!videoEl) return;
      const d = videoEl.duration;
      setProgress(d && Number.isFinite(d) ? videoEl.currentTime / d : 0);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  };

  const trackImage = () => {
    stopProgress();
    videoEl = null;
    setProgress(0);
  };

  const createLayer = (slide) => {
    const layer = document.createElement("div");
    layer.className = "hero__media-layer";

    if (slide.type === "video") {
      const video = document.createElement("video");
      video.className = "hero__video";
      video.src = slide.src;
      if (slide.poster) video.poster = slide.poster;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = "auto";
      layer.append(video);
      return { layer, video };
    }

    const img = document.createElement("img");
    img.className = "hero__image";
    img.src = slide.src;
    img.alt = "";
    img.width = 1920;
    img.height = 1080;
    layer.append(img);
    return { layer, video: null };
  };

  const waitReady = ({ layer, video }) =>
    new Promise((resolve) => {
      if (video) {
        const done = () => {
          video.play().catch(() => {});
          resolve({ layer, video });
        };
        if (video.readyState >= 2) {
          done();
          return;
        }
        video.addEventListener("loadeddata", done, { once: true });
        video.load();
        return;
      }

      const img = layer.querySelector("img");
      if (!img || img.complete) {
        resolve({ layer, video: null });
        return;
      }
      img.addEventListener("load", () => resolve({ layer, video: null }), { once: true });
      img.addEventListener("error", () => resolve({ layer, video: null }), { once: true });
    });

  const mountSlide = async (slide, { fade } = { fade: false }) => {
    const built = createLayer(slide);
    await waitReady(built);

    const prev = activeLayer;
    media.append(built.layer);
    activeLayer = built.layer;

    if (built.video) trackVideo(built.video);
    else trackImage();

    if (!fade || !prev || reduce) {
      if (prev) prev.remove();
      gsap.set(built.layer, { opacity: 1 });
      return;
    }

    gsap.set(built.layer, { opacity: 0 });
    await gsap
      .timeline({
        defaults: { duration: 0.55, ease: "power1.out" },
        onComplete: () => prev.remove(),
      })
      .to(built.layer, { opacity: 1 }, 0)
      .to(prev, { opacity: 0 }, 0);
  };

  const applyCopy = (slide) => {
    lineEls.forEach((el, i) => {
      el.textContent = slide.title[i] || "";
    });
    leadEl.textContent = slide.lead;
    btnEl.textContent = "Подробнее";
    btnEl.setAttribute("href", slide.href || "#resources");
  };

  const showSlide = async (next, { animate } = { animate: true }) => {
    const slide = SLIDES[((next % SLIDES.length) + SLIDES.length) % SLIDES.length];
    index = ((next % SLIDES.length) + SLIDES.length) % SLIDES.length;

    if (!animate || reduce) {
      applyCopy(slide);
      setProgress(0);
      await mountSlide(slide, { fade: false });
      return;
    }

    busy = true;
    const content = [...lineEls, leadEl, actionsEl];

    await gsap.to(content, { opacity: 0, duration: 0.28, stagger: 0.04, ease: "power2.out" });
    applyCopy(slide);
    setProgress(0);
    gsap.set(content, { opacity: 0, y: 20 });

    await Promise.all([
      mountSlide(slide, { fade: true }),
      gsap.to(content, { opacity: 1, y: 0, duration: 0.45, stagger: 0.08, ease: "power2.out" }),
    ]);

    busy = false;
  };

  const goTo = (next) => {
    if (busy) return;
    showSlide(next, { animate: true });
  };

  prevBtn.addEventListener("click", () => goTo(index - 1));
  nextBtn.addEventListener("click", () => goTo(index + 1));

  applyCopy(SLIDES[0]);
  mountSlide(SLIDES[0], { fade: false });

  if (reduce) {
    gsap.set(introEls, { opacity: 1, y: 0 });
    return;
  }

  gsap.set(introEls, { opacity: 0, y: 20 });
  gsap.to(introEls, {
    opacity: 1,
    y: 0,
    duration: 0.65,
    stagger: 0.14,
    ease: "power2.out",
    delay: 0.15,
  });
}
