document.getElementById("year").textContent = new Date().getFullYear();

const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.getElementById("mobileMenu");

if (menuToggle && mobileMenu) {
  const syncMenu = (open) => {
    menuToggle.setAttribute("aria-expanded", String(open));
    mobileMenu.hidden = !open;
  };

  syncMenu(false);

  menuToggle.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") !== "true";
    syncMenu(open);
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => syncMenu(false));
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 720) syncMenu(false);
  });
}

const revealEls = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("visible"));
}

const deliveryCarousels = document.querySelectorAll("[data-delivery-carousel]");

deliveryCarousels.forEach((carousel) => {
  const viewport = carousel.querySelector(".delivery-viewport");
  const track = carousel.querySelector(".delivery-track");
  const prevBtn = carousel.querySelector(".delivery-nav.prev");
  const nextBtn = carousel.querySelector(".delivery-nav.next");

  if (!viewport || !track || !prevBtn || !nextBtn) return;

  const getStep = () => {
    const firstSlide = track.querySelector(".delivery-slide");
    if (!firstSlide) return Math.max(viewport.clientWidth * 0.9, 240);
    const gap = parseFloat(getComputedStyle(track).gap || "0");
    return firstSlide.getBoundingClientRect().width + gap;
  };

  const updateNav = () => {
    const maxScroll = viewport.scrollWidth - viewport.clientWidth - 1;
    prevBtn.disabled = viewport.scrollLeft <= 1;
    nextBtn.disabled = viewport.scrollLeft >= maxScroll;
  };

  const scrollByStep = (direction) => {
    viewport.scrollBy({
      left: direction * getStep(),
      behavior: "smooth"
    });
  };

  prevBtn.addEventListener("click", () => scrollByStep(-1));
  nextBtn.addEventListener("click", () => scrollByStep(1));

  viewport.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollByStep(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollByStep(1);
    }
  });

  viewport.addEventListener("scroll", updateNav, { passive: true });
  window.addEventListener("resize", updateNav);

  let isPointerDown = false;
  let isHorizontalSwipe = false;
  let moved = false;
  let startX = 0;
  let startY = 0;
  let startScrollLeft = 0;

  const onStart = (x, y) => {
    isPointerDown = true;
    isHorizontalSwipe = false;
    moved = false;
    startX = x;
    startY = y;
    startScrollLeft = viewport.scrollLeft;
  };

  const onMove = (x, y, event) => {
    if (!isPointerDown) return;

    const dx = x - startX;
    const dy = y - startY;

    if (!isHorizontalSwipe && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
      isHorizontalSwipe = true;
      viewport.classList.add("is-swiping");
    }

    if (!isHorizontalSwipe) return;

    moved = moved || Math.abs(dx) > 5;
    viewport.scrollLeft = startScrollLeft - dx;

    if (event && typeof event.preventDefault === "function") {
      event.preventDefault();
    }
  };

  const onEnd = () => {
    isPointerDown = false;
    isHorizontalSwipe = false;
    window.requestAnimationFrame(() => viewport.classList.remove("is-swiping"));
    window.setTimeout(() => {
      moved = false;
    }, 0);
  };

  viewport.addEventListener("mousedown", (event) => {
    onStart(event.clientX, event.clientY);
  });
  window.addEventListener("mousemove", (event) => {
    onMove(event.clientX, event.clientY, event);
  });
  window.addEventListener("mouseup", onEnd);
  viewport.addEventListener("mouseleave", onEnd);

  viewport.addEventListener("touchstart", (event) => {
    const touch = event.touches[0];
    if (!touch) return;
    onStart(touch.clientX, touch.clientY);
  }, { passive: true });

  viewport.addEventListener("touchmove", (event) => {
    const touch = event.touches[0];
    if (!touch) return;
    onMove(touch.clientX, touch.clientY, event);
  }, { passive: false });

  viewport.addEventListener("touchend", onEnd);
  viewport.addEventListener("touchcancel", onEnd);

  viewport.addEventListener("click", (event) => {
    if (moved) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);

  updateNav();
});
