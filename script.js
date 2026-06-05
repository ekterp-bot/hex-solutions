const header = document.querySelector(".site-header");

const updateHeader = () => {
  header.dataset.elevated = String(window.scrollY > 12);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const projectData = {
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
        src: "./assets/zayy-barber-mockup.png",
        className: "modal-browser",
        alt: "Zayy the Barber booking website mockup with appointment flow, services, gallery, location, and reviews",
        label: "Real generated booking site mockup",
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
  card.addEventListener("click", () => openModal(card.dataset.project));
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openModal(card.dataset.project);
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
