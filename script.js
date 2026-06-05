const header = document.querySelector(".site-header");

const updateHeader = () => {
  header.dataset.elevated = String(window.scrollY > 12);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });
