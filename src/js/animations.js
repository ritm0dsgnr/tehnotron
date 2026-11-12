import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const desktopPin = () => window.matchMedia("(min-width: 768px)").matches;

export function initAnimations() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll("[data-animate] .is-animate").forEach((el) => {
      el.classList.add("is-shown");
    });
  } else {
    document.querySelectorAll("[data-animate] .is-animate").forEach((el, i) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: "1.25rem" },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          delay: i * 0.08,
          ease: "power2.out",
          onComplete: () => {
            el.classList.add("is-shown");
            gsap.set(el, { clearProps: "transform,opacity" });
          },
        },
      );
    });
  }

  initStackCover();
  initDirectionsSlider();
}

function initStackCover() {
  const stats = document.querySelector(".stats");
  if (!stats || !desktopPin()) return;

  const travel = () =>
    Math.max(stats.offsetHeight - window.innerHeight, window.innerHeight * 1.25);
  const cover = () => window.innerHeight * 0.85;

  ScrollTrigger.create({
    trigger: stats,
    start: "top top",
    end: () => `+=${travel() + cover()}`,
    pin: true,
    pinSpacing: false,
    anticipatePin: 1,
    invalidateOnRefresh: true,
  });

  const scrubRange = {
    trigger: stats,
    start: "top top",
    end: () => `+=${travel()}`,
    scrub: 0.15,
    invalidateOnRefresh: true,
  };

  const media = stats.querySelector(".stats__media");
  if (media) {
    gsap.fromTo(
      media,
      { y: 0 },
      {
        y: () => -travel() * 0.65,
        ease: "none",
        scrollTrigger: { ...scrubRange, scrub: 0.25 },
      },
    );
  }

  const items = stats.querySelectorAll(".stats__item");
  if (items.length) {
    gsap.fromTo(
      items,
      { y: 0 },
      {
        y: () => -travel() * 1.05,
        ease: "none",
        scrollTrigger: { ...scrubRange, scrub: 0.08 },
      },
    );
  }
}

function initDirectionsSlider() {
  const stage = document.querySelector("[data-directions-stage]");
  const track = document.querySelector("[data-directions-track]");
  const visual = stage?.querySelector(".directions__visual");
  if (!stage || !track) return;

  const panels = gsap.utils.toArray(track.querySelectorAll("[data-directions-panel]"));

  panels.forEach((panel, i) => {
    const num = panel.querySelector("[data-directions-num]");
    if (num) num.textContent = String(i + 1).padStart(2, "0");
  });

  const mm = gsap.matchMedia();

  mm.add("(max-width: 767px)", () => {
    const photos = gsap.utils.toArray(stage.querySelectorAll("[data-directions-photo]"));

    gsap.set(track, { clearProps: "transform" });
    ScrollTrigger.getAll().forEach((st) => {
      if (st.trigger === stage) st.kill();
    });

    panels.forEach((panel, i) => {
      const photo = photos[i];
      if (!photo) return;
      photo.classList.add("is-active");
      gsap.set(photo, { clearProps: "opacity,transform" });
      panel.insertBefore(photo, panel.firstChild);
    });

    return () => {
      photos.forEach((photo) => {
        if (visual && photo.parentElement !== visual) visual.appendChild(photo);
        photo.classList.remove("is-active");
      });
      if (photos[0]) photos[0].classList.add("is-active");
    };
  });

  mm.add("(min-width: 768px)", () => {
    const photos = gsap.utils.toArray(stage.querySelectorAll("[data-directions-photo]"));
    if (photos.length < 2 || panels.length < 2) return;

    const steps = panels.length - 1;
    const panelHeight = () => Math.max(panels[0].offsetHeight, window.innerHeight);

    gsap.set(photos, { opacity: 0 });
    gsap.set(photos[0], { opacity: 1 });

    let active = 0;
    const setActive = (index) => {
      if (index === active) return;
      active = index;
      photos.forEach((photo, i) => {
        photo.classList.toggle("is-active", i === index);
      });
    };

    setActive(0);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: stage,
        start: "top top",
        end: () => `+=${steps * window.innerHeight * 1.5}`,
        pin: true,
        scrub: 0.5,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          setActive(Math.min(steps, Math.round(self.progress * steps)));
        },
      },
    });

    panels.forEach((_, i) => {
      if (i === 0) return;
      const at = i - 1;
      tl.to(
        track,
        {
          y: () => -i * panelHeight(),
          duration: 1,
          ease: "none",
        },
        at,
      );
      tl.to(photos[i - 1], { opacity: 0, duration: 0.55, ease: "power1.inOut" }, at);
      tl.to(photos[i], { opacity: 1, duration: 0.55, ease: "power1.inOut" }, at);
    });

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
      gsap.set(track, { clearProps: "transform" });
      gsap.set(photos, { clearProps: "opacity" });
    };
  });
}
