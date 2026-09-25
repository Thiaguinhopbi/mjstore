const MJ = (() => {
  "use strict";

  const WHATSAPP = "5500000000000";
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  function digitsOnly(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function loader() {
    const el = $("#pageLoader");
    if (!el) return;
    const hide = () => el.classList.add("is-hidden");
    if (prefersReduced) {
      hide();
      return;
    }
    window.addEventListener("load", () => setTimeout(hide, 420));
    setTimeout(hide, 2600);
  }

  function navbarScroll() {
    const nav = $("#mainNav");
    const backToTop = $("#backToTop");
    if (!nav) return;

    const onScroll = () => {
      const y = window.scrollY;
      nav.classList.toggle("is-scrolled", y > 24);
      if (backToTop) backToTop.classList.toggle("is-visible", y > 520);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    if (backToTop) {
      backToTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
      });
    }
  }

  function closeMobileNav() {
    const nav = $("#navMenu");
    if (!nav || !nav.classList.contains("show")) return;
    const collapse = window.bootstrap && window.bootstrap.Collapse.getOrCreateInstance(nav, { toggle: false });
    if (collapse) collapse.hide();
  }

  function navLinks() {
    const links = $$('#mainNav .navbar-nav .nav-link[href^="#"]');
    if (!links.length) return;

    const sections = links
      .map((link) => {
        const id = link.getAttribute("href").slice(1);
        const section = document.getElementById(id);
        return section ? { link, section } : null;
      })
      .filter(Boolean);

    const nav = $("#mainNav");
    const offset = () => (nav ? nav.offsetHeight + 40 : 100);

    const setActive = (id) => {
      sections.forEach(({ link }) => link.classList.toggle("active", link.getAttribute("href") === `#${id}`));
    };

    const update = () => {
      const y = window.scrollY + offset() + 12;
      let current = sections.length ? sections[0].section.id : null;

      sections.forEach(({ section }) => {
        if (section.offsetTop <= y) current = section.id;
      });

      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 4) {
        current = sections[sections.length - 1].section.id;
      }

      setActive(current);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    links.forEach((link) => link.addEventListener("click", closeMobileNav));
    $$(".nav-cta a, .nav-cta button").forEach((el) => el.addEventListener("click", closeMobileNav));
  }

  function reveal() {
    const items = $$(".reveal");
    if (!items.length) return;

    if (prefersReduced || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const delay = parseInt(el.dataset.delay || "0", 10) * 90;
          setTimeout(() => el.classList.add("is-in"), delay);
          io.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );

    items.forEach((el) => io.observe(el));
  }

  function counters() {
    const nums = $$("[data-count]");
    if (!nums.length) return;

    const format = (value, decimals) => {
      const fixed = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();
      const [int, dec] = fixed.split(".");
      const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      return dec ? `${grouped},${dec}` : grouped;
    };

    const run = (el) => {
      const target = parseFloat(el.dataset.count) || 0;
      const decimals = parseInt(el.dataset.decimals || "0", 10);
      const suffix = el.dataset.suffix || "";
      const duration = 1600;

      if (prefersReduced) {
        el.textContent = `${format(target, decimals)}${suffix}`;
        return;
      }

      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = `${format(target * eased, decimals)}${suffix}`;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if (!("IntersectionObserver" in window)) {
      nums.forEach(run);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          run(entry.target);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.5 }
    );

    nums.forEach((el) => io.observe(el));
  }

  function productFilters() {
    const chips = $$("#productFilters .filter-chip");
    const cols = $$("#productGrid .product-col");
    const empty = $("#filterEmpty");
    if (!chips.length || !cols.length) return;

    const apply = (filter) => {
      let visible = 0;

      cols.forEach((col) => {
        const match = filter === "todos" || col.dataset.category === filter;
        col.classList.toggle("is-hidden", !match);
        if (match) {
          visible += 1;
          const card = $(".product-card", col);
          if (card) {
            card.classList.remove("is-in");
            requestAnimationFrame(() => card.classList.add("is-in"));
          }
        }
      });

      if (empty) empty.classList.toggle("d-none", visible !== 0);
    };

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chips.forEach((c) => {
          c.classList.toggle("is-active", c === chip);
          c.setAttribute("aria-selected", c === chip ? "true" : "false");
        });
        apply(chip.dataset.filter);
      });
    });
  }

  function upgradeStepper() {
    const steps = $$("#upgradeSteps .upgrade-step");
    const panels = $$("#upgradePanel .upgrade-panel-item");
    if (!steps.length || !panels.length) return;

    const activate = (index) => {
      steps.forEach((step, i) => {
        step.classList.toggle("is-active", i === index);
        step.setAttribute("aria-selected", i === index ? "true" : "false");
      });
      panels.forEach((panel, i) => panel.classList.toggle("is-active", i === index));
    };

    steps.forEach((step, index) => {
      step.addEventListener("click", () => activate(index));
      step.addEventListener("keydown", (e) => {
        if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
        e.preventDefault();
        const next = e.key === "ArrowDown" ? (index + 1) % steps.length : (index - 1 + steps.length) % steps.length;
        steps[next].focus();
        activate(next);
      });
    });

    activate(0);
  }

  function prefillContact() {
    $$("[data-prefill]").forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const value = trigger.dataset.prefill;
        if (!value) return;
        const model = $("#model");
        const category = $("#category");
        const message = $("#message");

        if (model) model.value = value;

        if (category) {
          const lower = value.toLowerCase();
          if (lower.includes("iphone")) category.value = "iPhone";
          else if (lower.includes("ipad")) category.value = "iPad";
          else if (lower.includes("macbook")) category.value = "MacBook";
          else if (lower.includes("watch") || lower.includes("airpods")) category.value = "Apple Watch / Acessórios";
          else if (lower.includes("xiaomi") || lower.includes("redmi")) category.value = "Xiaomi";
          else if (lower.includes("upgrade")) category.value = "Upgrade de aparelho";
        }

        if (message && !message.value.trim()) {
          message.value = `Gostaria de uma cotação de: ${value}.`;
        }
      });
    });
  }

  function masks() {
    const phone = $("#phone");
    const zip = $("#zip");
    const qZip = $("#qZip");

    const applyPhone = (el) => {
      if (!el) return;
      el.addEventListener("input", () => {
        let v = digitsOnly(el.value).slice(0, 11);
        if (v.length > 10) v = v.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
        else if (v.length > 6) v = v.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
        else if (v.length > 2) v = v.replace(/(\d{2})(\d{0,5})/, "($1) $2");
        else if (v.length > 0) v = v.replace(/(\d{0,2})/, "($1");
        el.value = v;
      });
    };

    const applyZip = (el) => {
      if (!el) return;
      el.addEventListener("input", () => {
        const v = digitsOnly(el.value).slice(0, 8);
        el.value = v.length > 5 ? `${v.slice(0, 5)}-${v.slice(5)}` : v;
      });
    };

    applyPhone(phone);
    applyZip(zip);
    applyZip(qZip);
  }

  function contactForm() {
    const form = $("#contactForm");
    const status = $("#formStatus");
    const btn = $("#submitBtn");
    if (!form) return;

    const setStatus = (text, type) => {
      if (!status) return;
      status.textContent = text;
      status.className = `form-status is-visible is-${type}`;
    };

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.classList.add("was-validated");
        setStatus("Revise os campos destacados para enviar sua solicitação.", "error");
        const firstInvalid = $(".is-invalid", form);
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Enviando...';
      }

      const get = (id) => ($(id) ? $(id).value.trim() : "");
      const data = {
        modelo: get("#model") || "A definir",
        categoria: get("#category"),
        nome: get("#name"),
        email: get("#email"),
        telefone: get("#phone"),
        cep: get("#zip"),
        mensagem: get("#message")
      };

      const message = [
        "Olá, MJStore Imports! Quero solicitar uma cotação:",
        "",
        `*Aparelho:* ${data.modelo}`,
        `*Linha:* ${data.categoria}`,
        `*Nome:* ${data.nome}`,
        `*E-mail:* ${data.email}`,
        `*WhatsApp:* ${data.telefone}`,
        data.cep ? `*CEP de entrega:* ${data.cep}` : null,
        data.mensagem ? `*Mensagem:* ${data.mensagem}` : null
      ]
        .filter((line) => line !== null)
        .join("\n");

      window.setTimeout(() => {
        window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
        form.reset();
        form.classList.remove("was-validated");
        setStatus("Tudo certo! Abrimos o WhatsApp com seu pedido montado. Se a janela não abriu, envie sua mensagem pelo nosso perfil.", "success");

        if (btn) {
          btn.disabled = false;
          btn.innerHTML = '<i class="bi bi-send"></i> Solicitar cotação';
        }
      }, 700);
    });
  }

  function quoteModal() {
    const form = $("#quoteForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const model = $("#qModel");
      const zip = $("#qZip");
      const qty = $("#qQty");

      if (!model.value.trim()) {
        model.classList.add("is-invalid");
        model.focus();
        return;
      }
      model.classList.remove("is-invalid");

      const text = [
        "Olá, MJStore Imports! Quero um orçamento para:",
        "",
        `*Aparelho:* ${model.value.trim()}`,
        `*Quantidade:* ${qty ? qty.value || "1" : "1"}`,
        zip && zip.value.trim() ? `*CEP de entrega:* ${zip.value.trim()}` : null
      ]
        .filter((line) => line !== null)
        .join("\n");

      window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank", "noopener");

      if (window.bootstrap) {
        const modal = window.bootstrap.Modal.getInstance($("#quoteModal"));
        if (modal) modal.hide();
      }
      form.reset();
    });

    $("#qModel")?.addEventListener("input", (e) => e.target.classList.remove("is-invalid"));
  }

  function carousel() {
    const el = $("#testimonialCarousel");
    if (!el || !window.bootstrap) return;
    const instance = window.bootstrap.Carousel.getOrCreateInstance(el, { interval: 6000, ride: "carousel", pause: "hover" });

    const wrap = el.closest(".testimonial-carousel") || el;
    wrap.addEventListener("mouseenter", () => instance.pause());
    wrap.addEventListener("mouseleave", () => instance.cycle());
  }

  function currentYear() {
    const el = $("#year");
    if (el) el.textContent = new Date().getFullYear();
  }

  function init() {
    loader();
    navbarScroll();
    navLinks();
    reveal();
    counters();
    productFilters();
    upgradeStepper();
    prefillContact();
    masks();
    contactForm();
    quoteModal();
    carousel();
    currentYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  return { init };
})();
