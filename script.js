document.addEventListener("DOMContentLoaded", () => {
  // Informe o número com DDI + DDD, somente dígitos. Exemplo: 5511999999999.
  const WHATSAPP_NUMBER = "";
  const whatsappLink = document.querySelector("[data-whatsapp-link]");
  const header = document.querySelector("[data-header]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const mobileNav = document.querySelector("#mobile-nav");
  const year = document.querySelector("[data-year]");

  if (header && menuToggle && mobileNav) {
    const setMenuOpen = (open) => {
      mobileNav.hidden = !open;
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
      header.classList.toggle("is-menu-open", open);
    };

    menuToggle.addEventListener("click", () => {
      setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
    });
    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenuOpen(false));
    });
    header.querySelector(".brand")?.addEventListener("click", () => setMenuOpen(false));
    document.addEventListener("pointerdown", (event) => {
      if (!mobileNav.hidden && !header.contains(event.target)) setMenuOpen(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !mobileNav.hidden) {
        setMenuOpen(false);
        menuToggle.focus();
      }
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 700 && !mobileNav.hidden) setMenuOpen(false);
    });
  }

  if (whatsappLink && WHATSAPP_NUMBER) {
    const message = "Olá! Quero saber mais sobre o Método Mastery para minha equipe.";
    whatsappLink.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    whatsappLink.target = "_blank";
    whatsappLink.rel = "noopener noreferrer";
  }

  if (year) year.textContent = new Date().getFullYear();

  const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 24);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const staggerGroups = document.querySelectorAll(
    ".diagnosis-list, .journey, .topics, .business-list, .questions-list, .clarity-list, .experience-gallery, .accordion",
  );

  staggerGroups.forEach((group) => {
    group.classList.add("stagger-group");
    [...group.children].forEach((item, index) => {
      item.style.setProperty("--stagger-delay", `${120 + Math.min(index, 7) * 70}ms`);
    });
  });

  document.querySelectorAll(".pillar.reveal").forEach((item, index) => {
    item.style.setProperty("--reveal-delay", `${index * 90}ms`);
  });

  const revealItems = document.querySelectorAll(".reveal");

  revealItems.forEach((item) => {
    const delay = Math.min(Number(item.dataset.delay || 0), 400);
    if (delay) item.style.setProperty("--reveal-delay", `${delay}ms`);
  });

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -7%" },
    );
    revealItems.forEach((item) => observer.observe(item));
  }

  document.querySelectorAll(".faq-item button").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest(".faq-item");
      const wasOpen = item.classList.contains("is-open");

      document.querySelectorAll(".faq-item.is-open").forEach((openItem) => {
        openItem.classList.remove("is-open");
        openItem.querySelector("button").setAttribute("aria-expanded", "false");
      });

      if (!wasOpen) {
        item.classList.add("is-open");
        button.setAttribute("aria-expanded", "true");
      }
    });
  });

  const form = document.querySelector(".lead-form");
  if (!form) return;

  const whatsapp = form.querySelector("#whatsapp");
  const revenue = form.querySelector("#revenue");
  const status = form.querySelector(".form-status");

  const phoneMask = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits.replace(/^(\d{0,2})/, "($1");
    if (digits.length <= 6) return digits.replace(/^(\d{2})(\d+)/, "($1) $2");
    if (digits.length <= 10) return digits.replace(/^(\d{2})(\d{4})(\d+)/, "($1) $2-$3");
    return digits.replace(/^(\d{2})(\d{5})(\d+)/, "($1) $2-$3");
  };

  const currencyMask = (value) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    const amount = Number(digits) / 100;
    return amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  whatsapp.addEventListener("input", (event) => {
    event.target.value = phoneMask(event.target.value);
  });
  revenue.addEventListener("input", (event) => {
    event.target.value = currencyMask(event.target.value);
  });

  const textFields = form.querySelectorAll("input:not([type='radio']), textarea");
  textFields.forEach((control) => {
    const refresh = () => control.closest(".field")?.classList.toggle("is-filled", Boolean(control.value.trim()));
    control.addEventListener("input", refresh);
    control.addEventListener("blur", refresh);
  });

  const setError = (field, message) => {
    field.classList.add("has-error");
    const error = field.querySelector(".error-message");
    if (error) error.textContent = message;
  };

  const clearErrors = () => {
    form.querySelectorAll(".has-error").forEach((field) => field.classList.remove("has-error"));
    form.querySelectorAll(".error-message").forEach((error) => (error.textContent = ""));
    status.className = "form-status";
    status.textContent = "";
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearErrors();
    let firstInvalid = null;

    textFields.forEach((control) => {
      if (!control.hasAttribute("required") || control.value.trim()) return;
      const field = control.closest(".field");
      setError(field, "Preencha este campo para continuar.");
      firstInvalid ||= control;
    });

    if (whatsapp.value.replace(/\D/g, "").length < 10) {
      setError(whatsapp.closest(".field"), "Informe um WhatsApp válido com DDD.");
      firstInvalid ||= whatsapp;
    }

    const teamSize = form.querySelector("#teamSize");
    if (teamSize.value && Number(teamSize.value) < 1) {
      setError(teamSize.closest(".field"), "Informe uma equipe com pelo menos 1 pessoa.");
      firstInvalid ||= teamSize;
    }

    const challenge = form.querySelector("input[name='challenge']:checked");
    if (!challenge) {
      const fieldset = form.querySelector(".challenge-field");
      setError(fieldset, "Escolha o principal desafio da sua equipe.");
      firstInvalid ||= fieldset.querySelector("input");
    }

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    const submitButton = form.querySelector("button[type='submit']");
    const originalLabel = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = "<span>Enviando diagnóstico...</span>";

    const leadData = Object.fromEntries(new FormData(form).entries());

    try {
      await submitLead(leadData);
      form.reset();
      form.querySelectorAll(".is-filled").forEach((field) => field.classList.remove("is-filled"));
      status.className = "form-status is-success";
      status.textContent = "Diagnóstico enviado com sucesso. Em breve entraremos em contato para entender o momento da sua equipe.";
    } catch (error) {
      status.className = "form-status";
      status.style.display = "block";
      status.textContent = "Não foi possível enviar agora. Tente novamente em instantes.";
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = originalLabel;
    }
  });
});

/**
 * Ponto de integração com API, webhook ou backend.
 * Substitua a simulação abaixo por fetch("SUA_URL", { method: "POST", ... }).
 */
async function submitLead(data) {
  console.info("Lead preparado para integração:", data);
  return new Promise((resolve) => window.setTimeout(resolve, 700));
}
