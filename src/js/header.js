export function initHeader() {
  const header = document.querySelector("[data-header]");
  if (!header) return;

  const megaItems = [...header.querySelectorAll("[data-nav-mega]")];
  const solidAfter = () => Math.min(window.innerHeight * 0.35, 280);
  let lastY = 0;
  let ticking = false;
  let closeTimer = 0;
  let allowHide = false;

  const closeAll = () => {
    megaItems.forEach((item) => item.classList.remove("is-open"));
    header.classList.remove("is-mega");
  };

  const openItem = (item) => {
    window.clearTimeout(closeTimer);
    megaItems.forEach((el) => el.classList.toggle("is-open", el === item));
    header.classList.add("is-mega");
  };

  const scheduleClose = () => {
    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(closeAll, 180);
  };

  const show = (y = window.scrollY) => {
    header.classList.remove("is-hidden");
    header.classList.toggle("is-scrolled", y > solidAfter());
    lastY = y;
  };

  const onScroll = () => {
    const y = window.scrollY;

    if (!allowHide) {
      show(y);
      return;
    }

    const goingDown = y > lastY;
    const past = y > 40;
    const solid = y > solidAfter();

    if (header.classList.contains("is-mega")) {
      header.classList.remove("is-hidden");
      header.classList.toggle("is-scrolled", solid);
    } else if (goingDown && past) {
      header.classList.add("is-hidden");
      header.classList.remove("is-scrolled");
      closeAll();
    } else {
      header.classList.remove("is-hidden");
      header.classList.toggle("is-scrolled", solid);
    }

    lastY = y;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        onScroll();
        ticking = false;
      });
    },
    { passive: true },
  );

  const armHide = () => {
    if (allowHide) return;
    allowHide = true;
    lastY = window.scrollY;
    header.classList.add("is-ready");
  };

  window.addEventListener("wheel", armHide, { passive: true, once: true });
  window.addEventListener("touchstart", armHide, { passive: true, once: true });
  window.addEventListener(
    "keydown",
    (e) => {
      if (
        e.key === "ArrowDown" ||
        e.key === "ArrowUp" ||
        e.key === "PageDown" ||
        e.key === "PageUp" ||
        e.key === "Home" ||
        e.key === "End" ||
        e.key === " "
      ) {
        armHide();
      }
    },
    { passive: true },
  );

  megaItems.forEach((item) => {
    item.addEventListener("mouseenter", () => openItem(item));
    item.addEventListener("mouseleave", scheduleClose);
    item.addEventListener("focusin", () => openItem(item));
    item.addEventListener("focusout", () => {
      requestAnimationFrame(() => {
        if (!item.contains(document.activeElement)) scheduleClose();
      });
    });
  });

  header.addEventListener("mouseleave", scheduleClose);

  show(0);

  window.addEventListener(
    "load",
    () => {
      requestAnimationFrame(() => {
        show(window.scrollY);
      });
    },
    { once: true },
  );
}
