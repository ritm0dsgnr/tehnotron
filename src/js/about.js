export function initAbout() {
  const root = document.querySelector("[data-about-stages]");
  if (!root) return;

  const track = root.querySelector("[data-about-stages-track]");
  if (!track) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let dragging = false;
  let startX = 0;
  let startScroll = 0;
  let moved = false;

  const maxScroll = () => Math.max(0, track.scrollWidth - track.clientWidth);

  const onWheel = (e) => {
    if (track.scrollWidth <= track.clientWidth) return;

    const absX = Math.abs(e.deltaX);
    const absY = Math.abs(e.deltaY);
    const horizontalIntent = absX > absY || e.shiftKey;
    if (!horizontalIntent) return;

    const delta = e.shiftKey && absY >= absX ? e.deltaY : e.deltaX || e.deltaY;
    const next = track.scrollLeft + delta;
    const max = maxScroll();
    if (next <= 0 && track.scrollLeft <= 0) return;
    if (next >= max && track.scrollLeft >= max) return;

    e.preventDefault();
    track.scrollLeft = Math.min(max, Math.max(0, next));
  };

  track.addEventListener("wheel", onWheel, { passive: false });

  if (!reduceMotion) {
    track.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 || e.pointerType === "touch") return;
      dragging = true;
      moved = false;
      startX = e.clientX;
      startScroll = track.scrollLeft;
      track.classList.add("is-dragging");
      track.setPointerCapture(e.pointerId);
    });

    track.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 3) moved = true;
      track.scrollLeft = startScroll - dx;
    });

    const endDrag = (e) => {
      if (!dragging) return;
      dragging = false;
      track.classList.remove("is-dragging");
      try {
        track.releasePointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
    };

    track.addEventListener("pointerup", endDrag);
    track.addEventListener("pointercancel", endDrag);

    track.addEventListener("click", (e) => {
      if (moved) e.preventDefault();
    });
  }

  track.addEventListener("keydown", (e) => {
    if (track.scrollWidth <= track.clientWidth) return;
    const step = Math.max(120, Math.round(track.clientWidth * 0.35));
    let next = track.scrollLeft;

    if (e.key === "ArrowRight") next += step;
    else if (e.key === "ArrowLeft") next -= step;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = maxScroll();
    else return;

    e.preventDefault();
    track.scrollLeft = Math.min(maxScroll(), Math.max(0, next));
  });
}
