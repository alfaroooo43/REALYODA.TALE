const WA_NUMBER = "6283840510687";
const FIRST_PURCHASE_KEY = "firstPurchase";

let modal = document.getElementById("discountModal");
let closeModal = document.getElementById("closeModal");
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

function buildWhatsAppUrl(productName) {
  const product = productName || "Paket E-book REALYODA TALE";
  const message = `Hai kak, saya tertarik ingin membeli produk "${product}" dengan diskon pembelian pertama, apakah masih tersedia?`;
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

document.querySelectorAll(".js-wa, .order-btn").forEach((button) => {
  const productName = button.dataset.product || button.closest("[data-product]")?.dataset.product;
  button.setAttribute("href", buildWhatsAppUrl(productName));
  button.setAttribute("target", "_blank");
  button.setAttribute("rel", "noopener");
});

function ensureDiscountModal() {
  if (modal) return;

  document.body.insertAdjacentHTML(
    "afterbegin",
    `<div class="modal-backdrop" id="discountModal" aria-hidden="true">
      <div class="discount-modal" role="dialog" aria-modal="true" aria-labelledby="discountTitle">
        <button class="modal-close" id="closeModal" aria-label="Tutup popup">&times;</button>
        <div class="gift-box">🎉</div>
        <span class="discount-pill">50% OFF</span>
        <h2 id="discountTitle">🎉 Diskon Spesial 50% Hari Ini!</h2>
        <p>Khusus pembelian pertama, dapatkan potongan 50% untuk semua e-book pilihan</p>
        <div class="urgency-box">
          <strong>🔥 Diskon akan berakhir dalam <span id="countdownTimer">10:00</span> menit!</strong>
          <span id="stockText">Tersisa 7 produk lagi hari ini</span>
        </div>
        <a class="btn btn-coral modal-cta" href="${buildWhatsAppUrl("Paket E-book REALYODA TALE")}" target="_blank" rel="noopener">Ambil Diskon Sekarang</a>
        <small>Promo terbatas hanya untuk pembelian pertama</small>
      </div>
    </div>`
  );
  modal = document.getElementById("discountModal");
  closeModal = document.getElementById("closeModal");
  bindModalEvents();
}

function bindModalEvents() {
  closeModal?.addEventListener("click", hideModal);
  modal?.addEventListener("click", (event) => {
    if (event.target === modal) hideModal();
  });
}

function startUrgencyTimer() {
  const timer = document.getElementById("countdownTimer");
  const stock = document.getElementById("stockText");
  if (!timer) return;

  let secondsLeft = 10 * 60;
  if (stock) stock.textContent = `Tersisa ${Math.floor(Math.random() * 4) + 5} produk lagi hari ini`;

  const tick = () => {
    const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
    const seconds = String(secondsLeft % 60).padStart(2, "0");
    timer.textContent = `${minutes}:${seconds}`;
    secondsLeft = Math.max(0, secondsLeft - 1);
  };

  tick();
  setInterval(tick, 1000);
}

window.addEventListener("load", () => {
  if (localStorage.getItem(FIRST_PURCHASE_KEY)) return;
  ensureDiscountModal();

  setTimeout(() => {
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    localStorage.setItem(FIRST_PURCHASE_KEY, "visited");
    startUrgencyTimer();
  }, 450);
});

function hideModal() {
  if (!modal) return;
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
}

bindModalEvents();

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") hideModal();
});

menuToggle?.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

document.querySelectorAll(".faq-item").forEach((button) => {
  button.addEventListener("click", () => {
    const panel = button.nextElementSibling;
    const isOpen = panel.classList.toggle("open");
    button.querySelector("span").textContent = isOpen ? "−" : "+";
  });
});

document.querySelectorAll(".storybook-slider").forEach((slider) => {
  const pages = Array.from(slider.querySelectorAll(".book-page"));
  const prev = slider.querySelector(".book-prev");
  const next = slider.querySelector(".book-next");
  let index = 0;
  let isAnimating = false;
  let startX = 0;
  let dragX = 0;

  function flipTo(nextIndex) {
    if (isAnimating || nextIndex === index) return;
    isAnimating = true;

    const current = pages[index];
    const targetIndex = (nextIndex + pages.length) % pages.length;
    const target = pages[targetIndex];
    target.classList.add("next-ready");
    current.classList.add("flipping");

    setTimeout(() => {
      current.classList.remove("active", "flipping");
      target.classList.remove("next-ready");
      target.classList.add("active");
      index = targetIndex;
      isAnimating = false;
    }, 840);
  }

  const nextPage = () => flipTo(index + 1);
  const prevPage = () => flipTo(index - 1);
  let autoplay = setInterval(nextPage, 2000);
  const restart = () => {
    clearInterval(autoplay);
    autoplay = setInterval(nextPage, 2000);
  };

  next?.addEventListener("click", () => {
    nextPage();
    restart();
  });
  prev?.addEventListener("click", () => {
    prevPage();
    restart();
  });

  slider.addEventListener("pointerdown", (event) => {
    startX = event.clientX;
    dragX = event.clientX;
    slider.setPointerCapture(event.pointerId);
  });

  slider.addEventListener("pointermove", (event) => {
    dragX = event.clientX;
  });

  slider.addEventListener("pointerup", (event) => {
    const delta = dragX - startX;
    if (Math.abs(delta) > 48) {
      delta < 0 ? nextPage() : prevPage();
      restart();
    }
    slider.releasePointerCapture(event.pointerId);
  });
});

document.querySelectorAll(".product-carousel").forEach((carousel) => {
  const viewport = carousel.querySelector(".carousel-viewport");
  const cards = Array.from(carousel.querySelectorAll(".product-card"));
  const prev = carousel.querySelector(".prev");
  const next = carousel.querySelector(".next");
  let isDragging = false;
  let startX = 0;
  let startScroll = 0;

  function updateActiveCard() {
    const center = viewport.scrollLeft + viewport.clientWidth / 2;
    let active = cards[0];
    let closest = Infinity;
    cards.forEach((card) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(center - cardCenter);
      if (distance < closest) {
        closest = distance;
        active = card;
      }
    });
    cards.forEach((card) => card.classList.toggle("active", card === active));
  }

  function scrollByCard(direction) {
    const cardWidth = cards[0]?.offsetWidth || viewport.clientWidth;
    viewport.scrollBy({ left: direction * (cardWidth + 22), behavior: "smooth" });
    setTimeout(updateActiveCard, 320);
  }

  prev?.addEventListener("click", () => scrollByCard(-1));
  next?.addEventListener("click", () => scrollByCard(1));
  viewport.addEventListener("scroll", () => requestAnimationFrame(updateActiveCard));

  viewport.addEventListener("pointerdown", (event) => {
    isDragging = true;
    startX = event.clientX;
    startScroll = viewport.scrollLeft;
    viewport.setPointerCapture(event.pointerId);
    carousel.classList.add("dragging");
  });

  viewport.addEventListener("pointermove", (event) => {
    if (!isDragging) return;
    viewport.scrollLeft = startScroll - (event.clientX - startX);
  });

  function stopDrag(event) {
    if (!isDragging) return;
    isDragging = false;
    carousel.classList.remove("dragging");
    if (typeof event.pointerId === "number") viewport.releasePointerCapture(event.pointerId);
    updateActiveCard();
  }

  viewport.addEventListener("pointerup", stopDrag);
  viewport.addEventListener("pointercancel", stopDrag);
  viewport.addEventListener("pointerleave", stopDrag);
  window.addEventListener("resize", updateActiveCard);
  updateActiveCard();
});
