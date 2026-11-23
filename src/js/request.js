import { getLenis } from "./smooth.js";

export function initRequest() {
  const root = document.querySelector("[data-request]");
  if (!root) return;

  const form = root.querySelector("[data-request-form]");
  const formView = root.querySelector("[data-request-form-view]");
  const successView = root.querySelector("[data-request-success]");
  const phoneInput = root.querySelector("[data-request-phone]");
  const emailInput = root.querySelector("[data-request-email]");
  const phoneError = root.querySelector("[data-request-error-phone]");
  const emailError = root.querySelector("[data-request-error-email]");
  const closeBtns = [...root.querySelectorAll("[data-request-close]")];
  const panel = root.querySelector("[data-request-panel]");
  let open = false;

  const digits = (value) => String(value || "").replace(/\D/g, "");

  const formatPhone = (value) => {
    let d = digits(value).slice(0, 11);
    if (d.startsWith("7")) d = `8${d.slice(1)}`;

    const parts = [];
    if (d.length > 0) parts.push(d.slice(0, 1));
    if (d.length > 1) parts.push(d.slice(1, 4));
    if (d.length > 4) parts.push(d.slice(4, 7));
    if (d.length > 7) parts.push(d.slice(7, 11));
    return parts.join(" ");
  };

  const isPhoneOk = (value) => {
    const d = digits(value);
    return d.length === 11 && d.startsWith("8");
  };

  const isEmailOk = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());

  const setFieldError = (input, errorEl, invalid) => {
    if (!input) return;
    input.classList.toggle("is-invalid", invalid);
    if (errorEl) errorEl.classList.toggle("is-show", invalid);
  };

  const clearErrors = () => {
    setFieldError(phoneInput, phoneError, false);
    setFieldError(emailInput, emailError, false);
  };

  const resetForm = () => {
    form?.reset();
    clearErrors();
    if (formView) formView.hidden = false;
    if (successView) successView.hidden = true;
  };

  const setOpen = (next) => {
    if (open === next) return;
    open = next;
    document.documentElement.classList.toggle("is-request-open", open);
    const lenis = getLenis();

    if (open) {
      lenis?.stop();
      root.hidden = false;
      requestAnimationFrame(() => {
        root.classList.add("is-open");
      });
      root.querySelector(".request__close")?.focus();
      return;
    }

    root.classList.remove("is-open");
    lenis?.start();
    window.setTimeout(() => {
      if (!open) {
        root.hidden = true;
        resetForm();
      }
    }, 300);
  };

  const openRequest = () => {
    resetForm();
    setOpen(true);
  };

  const closeRequest = () => setOpen(false);

  document.addEventListener("click", (e) => {
    const trigger = e.target.closest('a[href="#request"], [data-request-open]');
    if (!trigger) return;
    e.preventDefault();
    openRequest();
  });

  closeBtns.forEach((btn) => btn.addEventListener("click", closeRequest));

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && open) closeRequest();
  });

  phoneInput?.addEventListener("input", () => {
    const next = formatPhone(phoneInput.value);
    if (phoneInput.value !== next) phoneInput.value = next;
    setFieldError(phoneInput, phoneError, false);
  });

  phoneInput?.addEventListener("blur", () => {
    if (!phoneInput.value.trim()) return;
    phoneInput.value = formatPhone(phoneInput.value);
  });

  emailInput?.addEventListener("input", () => setFieldError(emailInput, emailError, false));

  form?.addEventListener("submit", (e) => {
    e.preventDefault();

    const phoneInvalid = !isPhoneOk(phoneInput?.value);
    const emailInvalid = !isEmailOk(emailInput?.value);

    setFieldError(phoneInput, phoneError, phoneInvalid);
    setFieldError(emailInput, emailError, emailInvalid);

    if (phoneInvalid || emailInvalid) {
      (phoneInvalid ? phoneInput : emailInput)?.focus();
      return;
    }

    if (formView) formView.hidden = true;
    if (successView) successView.hidden = false;
    panel?.querySelector(".request__close")?.focus();
  });

  if (location.hash === "#request") {
    history.replaceState(null, "", location.pathname + location.search);
    openRequest();
  }
}
