const ADDRESS =
  "Россия, Республика Татарстан, Набережные Челны, улица Моторная, 38";
const FALLBACK = [55.727032, 52.538596];
const ZOOM = 14;
const ORG_URL = "https://yandex.ru/maps/org/tekhnotron/1001319580/";

function loadYmaps() {
  if (window.ymaps) return Promise.resolve(window.ymaps);

  const key = import.meta.env.VITE_YANDEX_MAPS_KEY;
  const query = new URLSearchParams({ lang: "ru_RU" });
  if (key) query.set("apikey", key);

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://api-maps.yandex.ru/2.1/?${query}`;
    script.async = true;
    script.onload = () => {
      if (!window.ymaps) {
        reject(new Error("ymaps missing"));
        return;
      }
      window.ymaps.ready(() => resolve(window.ymaps));
    };
    script.onerror = () => reject(new Error("ymaps load failed"));
    document.head.appendChild(script);
  });
}

async function resolveCoords(ymaps) {
  try {
    const res = await ymaps.geocode(ADDRESS, { results: 1 });
    const obj = res.geoObjects.get(0);
    if (!obj) return FALLBACK;
    return obj.geometry.getCoordinates();
  } catch {
    return FALLBACK;
  }
}

function bindOrgOpenLink(root) {
  const setHref = (node) => {
    if (!node) return;
    if (node.tagName === "A") {
      node.href = ORG_URL;
      node.target = "_blank";
      node.rel = "noopener";
      return;
    }
    node.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      window.open(ORG_URL, "_blank", "noopener");
    });
  };

  const patch = () => {
    const promo = root.querySelector('[class*="gotoymaps"]');
    if (!promo) return false;
    setHref(promo);
    promo.querySelectorAll("a").forEach(setHref);
    return true;
  };

  if (patch()) return;

  const observer = new MutationObserver(() => {
    if (patch()) observer.disconnect();
  });
  observer.observe(root, { childList: true, subtree: true });
  window.setTimeout(() => observer.disconnect(), 4000);
}

export async function initMap() {
  const el = document.querySelector("[data-map]");
  if (!el) return;

  try {
    const ymaps = await loadYmaps();
    const coords = await resolveCoords(ymaps);

    const map = new ymaps.Map(
      el,
      {
        center: coords,
        zoom: ZOOM,
        controls: [],
      },
      {
        suppressMapOpenBlock: false,
        yandexMapDisablePoiInteractivity: true,
      },
    );

    map.behaviors.disable("scrollZoom");
    map.geoObjects.add(
      new ymaps.Placemark(
        coords,
        {
          hintContent: "ПТФК Технотрон",
          balloonContentHeader: "ПТФК Технотрон",
          balloonContentBody: ADDRESS,
          balloonContentFooter: `<a href="${ORG_URL}" target="_blank" rel="noopener">Открыть на карте</a>`,
        },
        {
          preset: "islands#blueIcon",
        },
      ),
    );
    map.setCenter(coords, ZOOM);
    bindOrgOpenLink(el);
  } catch (err) {
    console.error(err);
    el.innerHTML = `<a class="cta__map-fallback" href="${ORG_URL}" target="_blank" rel="noopener">Открыть на карте</a>`;
  }
}
