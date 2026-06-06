const header = document.querySelector(".site-header");

const updateHeader = () => {
  header.dataset.elevated = String(window.scrollY > 12);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const pageViews = document.querySelectorAll(".page-view[data-page]");
const routeLinks = document.querySelectorAll("[data-route-link]");
const validRoutes = new Set(["home", "solutions", "services", "logos", "rescue", "process", "contact"]);

const getRoute = () => {
  const rawRoute = window.location.hash.replace(/^#\/?/, "");
  return validRoutes.has(rawRoute) ? rawRoute : "home";
};

const setActivePage = () => {
  const route = getRoute();

  pageViews.forEach((view) => {
    view.hidden = view.dataset.page !== route;
  });

  routeLinks.forEach((link) => {
    link.dataset.active = String(link.dataset.routeLink === route);
  });

  document.body.dataset.currentPage = route;
  document.title =
    route === "home"
      ? "Hex Solutions | Hex the Engineer"
      : `${route.charAt(0).toUpperCase() + route.slice(1)} | Hex Solutions`;

  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  updateHeader();
};

setActivePage();
window.addEventListener("hashchange", setActivePage);

document.querySelectorAll(".project-grid").forEach((rail) => {
  let isDragging = false;
  let dragStarted = false;
  let startX = 0;
  let startScrollLeft = 0;

  rail.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    isDragging = true;
    dragStarted = false;
    startX = event.clientX;
    startScrollLeft = rail.scrollLeft;
    rail.dataset.dragging = "false";
    rail.setPointerCapture(event.pointerId);
  });

  rail.addEventListener("pointermove", (event) => {
    if (!isDragging) return;
    const deltaX = event.clientX - startX;

    if (Math.abs(deltaX) > 6) {
      dragStarted = true;
      rail.dataset.dragging = "true";
    }

    if (dragStarted) {
      event.preventDefault();
      rail.scrollLeft = startScrollLeft - deltaX;
    }
  });

  const stopDragging = (event) => {
    if (!isDragging) return;
    isDragging = false;
    rail.releasePointerCapture(event.pointerId);

    window.setTimeout(() => {
      rail.dataset.dragging = "false";
    }, 0);
  };

  rail.addEventListener("pointerup", stopDragging);
  rail.addEventListener("pointercancel", stopDragging);
  rail.addEventListener("pointerleave", stopDragging);

});

const railWheelState = new WeakMap();

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getRailUnderPointer = (event) =>
  Array.from(document.querySelectorAll(".project-grid")).find((rail) => {
    const rect = rail.getBoundingClientRect();
    const inHeightBand = event.clientY >= rect.top - 18 && event.clientY <= rect.bottom + 18;
    const inWidthBand = event.clientX >= rect.left && event.clientX <= rect.right;
    return inHeightBand && inWidthBand && rail.scrollWidth > rail.clientWidth;
  });

const animateRailScroll = (rail) => {
  const state = railWheelState.get(rail);
  if (!state) return;

  const distance = state.target - rail.scrollLeft;
  if (Math.abs(distance) < 0.5) {
    rail.scrollLeft = state.target;
    state.frame = null;
    return;
  }

  rail.scrollLeft += distance * 0.24;
  state.frame = window.requestAnimationFrame(() => animateRailScroll(rail));
};

document.addEventListener(
  "wheel",
  (event) => {
    const rail = getRailUnderPointer(event);
    if (!rail) return;

    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (delta === 0) return;

    event.preventDefault();
    event.stopPropagation();

    const maxScroll = rail.scrollWidth - rail.clientWidth;
    const state = railWheelState.get(rail) || { target: rail.scrollLeft, frame: null, restoreTimer: null };
    state.target = clamp(state.target + delta * 1.35, 0, maxScroll);
    window.clearTimeout(state.restoreTimer);
    rail.dataset.wheelScrolling = "true";
    state.restoreTimer = window.setTimeout(() => {
      rail.dataset.wheelScrolling = "false";
    }, 220);
    railWheelState.set(rail, state);

    if (!state.frame) {
      state.frame = window.requestAnimationFrame(() => animateRailScroll(rail));
    }
  },
  { capture: true, passive: false },
);

const intakeForm = document.querySelector("#intake-form");
const formStatus = document.querySelector("#form-status");

const setFormStatus = (message, state = "") => {
  if (!formStatus) return;
  formStatus.textContent = message;
  formStatus.dataset.state = state;
};

intakeForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submitButton = intakeForm.querySelector('button[type="submit"]');
  const formData = new FormData(intakeForm);
  const payload = Object.fromEntries(formData.entries());

  submitButton.disabled = true;
  setFormStatus("Sending project details...", "");

  try {
    const response = await fetch("/api/intake", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.message || "The intake form could not send yet.");
    }

    intakeForm.reset();
    setFormStatus("Got it. Hex Solutions will review the project details and follow up.", "success");
  } catch (error) {
    const localPreview = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";
    setFormStatus(
      localPreview
        ? "Local preview cannot send yet. Once deployed on Vercel with the email key, this form will submit for real."
        : error.message,
      "error",
    );
  } finally {
    submitButton.disabled = false;
  }
});

const projectData = {
  websites: {
    tag: "Service examples",
    title: "Websites and storefronts",
    description:
      "Clickable, trustworthy local business pages that show the offer fast, make the business look legit, and give customers a clear next step.",
    slides: [
      {
        type: "image",
        src: "./assets/colibri-market-mockup.png",
        className: "modal-browser",
        alt: "Colibri Stockton Mexican grocery and meat market website mockup",
        label: "Colibri market storefront concept",
      },
      {
        type: "image",
        src: "./assets/zayy-barber-mockup.jpg",
        className: "modal-browser",
        alt: "Zayy the Barber booking website mockup",
        label: "Zayy barber booking concept",
      },
      {
        type: "image",
        src: "./assets/bar-vault-full-page.png",
        className: "modal-browser",
        alt: "Bar Vault lyrics marketplace website concept",
        label: "Bar Vault music marketplace concept",
      },
    ],
  },
  "custom-apps": {
    tag: "Service examples",
    title: "Custom web apps",
    description:
      "Purpose-built tools for creators, teams, and operators: profiles, portals, dashboards, rate searches, forms, and workflows that match the real job.",
    slides: [
      {
        type: "image",
        src: "./assets/truartist-profile.png",
        className: "modal-phone",
        alt: "True Artist app profile screen showing XP, metrics, and profile tools",
        label: "True Artist creator profile",
      },
      {
        type: "image",
        src: "./assets/rate-search-sanitized.png",
        className: "modal-browser",
        alt: "Rate Search Tool dashboard screenshot with sensitive details blurred",
        label: "Rate Search business dashboard",
      },
    ],
  },
  automation: {
    tag: "Build approach",
    title: "Automation and integrations",
    description:
      "This lane is for the repeat work: spreadsheets, emails, forms, databases, reports, handoffs, and the little tasks that quietly eat the day.",
    slides: [
      {
        type: "html",
        label: "Example targets",
        html: `
          <div class="modal-note">
            <span>Coming into the portfolio soon</span>
            <h3>Turn repeat work into a button, dashboard, or clean workflow.</h3>
            <p>Good fits: quote lookups, intake forms, report builders, spreadsheet cleanup, status trackers, and alerts.</p>
          </div>`,
      },
    ],
  },
  polish: {
    tag: "Build approach",
    title: "Interface polish",
    description:
      "For apps and sites that technically work, but still feel rough. This is cleanup for layout, spacing, visual hierarchy, mobile behavior, and flow.",
    slides: [
      {
        type: "html",
        label: "What gets cleaned up",
        html: `
          <div class="modal-note">
            <span>Proof is building</span>
            <h3>Make the thing feel finished, usable, and ready to show people.</h3>
            <p>Good fits: AI-generated apps, Lovable/Bolt/Replit prototypes, rough landing pages, mobile layout fixes, and product UI cleanup.</p>
          </div>`,
      },
    ],
  },
  truartist: {
    tag: "App design",
    title: "True Artist App",
    description:
      "A mobile experience for artists, engineers, and superfans with profile tools, authentication, XP, metrics, and a creator-focused interface.",
    slides: [
      {
        type: "image",
        src: "./assets/truartist-profile.png",
        className: "modal-phone",
        alt: "True Artist app profile screen showing XP, metrics, and profile tools",
        label: "Profile, XP, and creator metrics",
      },
      {
        type: "image",
        src: "./assets/truartist-login.jpg",
        className: "modal-phone",
        alt: "True Artist app login screen with neon green sign-in controls",
        label: "Login and account access",
      },
    ],
  },
  "rate-search": {
    tag: "Business tool",
    title: "Rate Search Tool",
    description:
      "A focused rate-search workflow for filtering lanes, checking workbook status, comparing options, and turning operational data into fast answers. Sensitive details are blurred for privacy.",
    slides: [
      {
        type: "image",
        src: "./assets/rate-search-sanitized.png",
        className: "modal-browser",
        alt: "Rate Search Tool dashboard screenshot with sensitive prices, vendors, destinations, and source data blurred",
        label: "Sanitized desktop dashboard preview",
      },
    ],
  },
  colibri: {
    tag: "Website",
    title: "Colibri Meat Market",
    description:
      "A colorful local market web concept for fresh meat, hot food, groceries, location details, and a storefront that feels more current and trustworthy.",
    slides: [
      {
        type: "image",
        src: "./assets/colibri-market-mockup.png",
        className: "modal-browser",
        alt: "Colibri Stockton Mexican grocery and meat market website mockup with storefront, meat, hot food, groceries, and contact details",
        label: "Real generated storefront mockup",
      },
    ],
  },
  zayy: {
    tag: "Local business",
    title: "Zayy the Barber",
    description:
      "A booking-first local business mockup with services, gallery, reviews, location, and a bold appointment flow built around trust and conversion.",
    slides: [
      {
        type: "image",
        src: "./assets/zayy-barber-mockup.jpg",
        className: "modal-browser",
        alt: "Zayy the Barber booking website mockup with appointment flow, services, gallery, location, and reviews",
        label: "Real generated booking site mockup",
      },
    ],
  },
  "bar-vault": {
    tag: "Website idea",
    title: "Bar Vault",
    description:
      "A lyrics marketplace concept for rappers, singers, and ghostwriters to browse, license, and build around strong one-line ideas.",
    slides: [
      {
        type: "image",
        src: "./assets/bar-vault-full-page.png",
        className: "modal-browser",
        alt: "Bar Vault full page website concept with marketplace cards and AI song builder teaser",
        label: "Full-page marketplace concept",
      },
    ],
  },
};

const modal = document.querySelector("#project-modal");
const modalTitle = document.querySelector("#modal-title");
const modalTag = document.querySelector("#modal-tag");
const modalDescription = document.querySelector("#modal-description");
const modalSlide = document.querySelector("#modal-slide");
const modalCount = document.querySelector("#modal-count");
const modalDots = document.querySelector("#modal-dots");
const prevButton = document.querySelector(".modal-prev");
const nextButton = document.querySelector(".modal-next");
let activeProject = null;
let activeSlide = 0;

const renderModal = () => {
  const project = projectData[activeProject];
  const slide = project.slides[activeSlide];

  modalTitle.textContent = project.title;
  modalTag.textContent = project.tag;
  modalDescription.textContent = project.description;
  modalSlide.innerHTML =
    slide.type === "image"
      ? `<img class="modal-image ${slide.className || ""}" src="${slide.src}" alt="${slide.alt}">`
      : slide.html;

  modalCount.textContent = `${slide.label} (${activeSlide + 1} of ${project.slides.length})`;
  prevButton.disabled = project.slides.length < 2;
  nextButton.disabled = project.slides.length < 2;

  modalDots.innerHTML = project.slides
    .map(
      (_, index) =>
        `<button type="button" aria-label="Show preview ${index + 1}" aria-current="${index === activeSlide}"></button>`,
    )
    .join("");

  modalDots.querySelectorAll("button").forEach((button, index) => {
    button.addEventListener("click", () => {
      activeSlide = index;
      renderModal();
    });
  });
};

const openModal = (projectKey) => {
  activeProject = projectKey;
  activeSlide = 0;
  renderModal();
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
};

const closeModal = () => {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
};

const moveSlide = (direction) => {
  const project = projectData[activeProject];
  activeSlide = (activeSlide + direction + project.slides.length) % project.slides.length;
  renderModal();
};

document.querySelectorAll("[data-project]").forEach((card) => {
  card.addEventListener("click", (event) => {
    if (event.currentTarget.closest(".project-grid")?.dataset.dragging === "true") return;
    openModal(card.dataset.project);
  });
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openModal(card.dataset.project);
    }
  });
});

document.querySelectorAll("[data-open-project], [data-route-target]").forEach((card) => {
  const activateCard = () => {
    if (card.dataset.openProject) {
      openModal(card.dataset.openProject);
      return;
    }

    window.location.hash = `/${card.dataset.routeTarget}`;
  };

  card.addEventListener("click", activateCard);
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activateCard();
    }
  });
});

document.querySelectorAll("[data-close-modal]").forEach((element) => {
  element.addEventListener("click", closeModal);
});

prevButton.addEventListener("click", () => moveSlide(-1));
nextButton.addEventListener("click", () => moveSlide(1));

document.addEventListener("keydown", (event) => {
  if (!modal.classList.contains("is-open")) return;
  if (event.key === "Escape") closeModal();
  if (event.key === "ArrowLeft") moveSlide(-1);
  if (event.key === "ArrowRight") moveSlide(1);
});
