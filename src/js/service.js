export function initService() {
  const root = document.querySelector("[data-service-gallery]");
  if (!root) return;

  const photos = [...root.querySelectorAll("[data-service-photo]")];
  const prev = root.querySelector("[data-service-prev]");
  const next = root.querySelector("[data-service-next]");
  if (!photos.length || !prev || !next) return;

  let index = photos.findIndex((photo) => photo.classList.contains("is-active"));
  if (index < 0) index = 0;

  const show = (n) => {
    index = (n + photos.length) % photos.length;
    photos.forEach((photo, i) => {
      photo.classList.toggle("is-active", i === index);
    });
  };

  prev.addEventListener("click", () => show(index - 1));
  next.addEventListener("click", () => show(index + 1));
}
