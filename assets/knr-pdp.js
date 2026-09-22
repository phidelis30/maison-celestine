/**
 * Non-blocking Vanilla JS for Maison Célestine KNR PDP
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initMobileNav();
  initVariantPicker();
  initGallery();
  initAccordions();
  initBeforeAfterSlider();
  initTestimonialCarousel();
  initRitualScroll();
  initGalleryProgress();
  initCarouselProgress();
  initDeliveryNotice();
  initFooterAccordions();
});

// 1. Header scroll effect
function initHeaderScroll() {
  const header = document.querySelector('.knr-header');
  if (!header) return;

  // merchants can turn the sticky behaviour off per section
  if (header.dataset.sticky === 'false') return;

  // The base theme turns .page-wrapper into the scroll container above 990px
  // (`height: 100dvh; overflow-y: auto`), so on desktop the window never
  // scrolls. Watch both and use whichever actually moved.
  const wrapper = header.closest('.page-wrapper') || document.querySelector('.page-wrapper');

  const offset = () => Math.max(
    window.scrollY || document.documentElement.scrollTop || 0,
    wrapper ? wrapper.scrollTop : 0
  );

  const sync = () => {
    header.classList.toggle('knr-header--scrolled', offset() > 40);
  };

  window.addEventListener('scroll', sync, { passive: true });
  if (wrapper) wrapper.addEventListener('scroll', sync, { passive: true });
  sync();
}

// 1b. Mobile navigation drawer (slides in from the left)
function initMobileNav() {
  const nav = document.querySelector('.knr-header__nav');
  const burger = document.querySelector('.knr-header__burger');
  if (!nav || !burger) return;

  // Mount the backdrop inside the header so it shares the drawer's stacking
  // context — on <body> it out-stacks the header (z-index 40) and covers it.
  const header = document.querySelector('.knr-header');
  const backdrop = document.createElement('div');
  backdrop.className = 'knr-nav-backdrop';
  (header || document.body).appendChild(backdrop);

  const setOpen = (open) => {
    nav.classList.toggle('is-mobile-open', open);
    burger.classList.toggle('is-open', open);
    if (header) header.classList.toggle('is-nav-open', open);
    backdrop.classList.toggle('is-visible', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  };

  burger.addEventListener('click', () => setOpen(!nav.classList.contains('is-mobile-open')));
  backdrop.addEventListener('click', () => setOpen(false));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });
}

// 2. Dynamic Variant Selector
// Scoped per group so the quick-buy card's buttons don't fight the main picker.
function initVariantPicker() {
  const groups = document.querySelectorAll('.knr-variants__options, .knr-quick-buy-card__variants');

  groups.forEach(group => {
    const variantBtns = group.querySelectorAll('.knr-variant-btn');
    if (!variantBtns.length) return;

    const card = group.closest('.knr-quick-buy-card');
    const variantInput = document.querySelector('input[name="id"]');
    const priceCurrent = card
      ? card.querySelector('.knr-quick-buy-card__price')
      : document.querySelector('.knr-price-current');
    const priceCompare = card ? null : document.querySelector('.knr-price-compare');
    const priceUnit = card ? null : document.querySelector('.knr-price-unit');
    const mainImg = card ? null : document.querySelector('.knr-gallery__main-img');
    const atcBtn = card
      ? card.querySelector('.knr-atc-btn')
      : document.querySelector('.knr-product-form .knr-atc-btn');

    variantBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        variantBtns.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');

        const variantId = btn.dataset.variantId;
        const price = btn.dataset.price;
        const comparePrice = btn.dataset.comparePrice;
        const unit = btn.dataset.unit;
        const imgSrc = btn.dataset.img;

        if (variantInput && variantId) variantInput.value = variantId;
        if (priceCurrent && price) priceCurrent.textContent = price;
        if (priceCompare) {
          if (comparePrice && comparePrice !== price) {
            priceCompare.textContent = comparePrice;
            priceCompare.style.display = 'inline';
          } else {
            priceCompare.style.display = 'none';
          }
        }
        if (priceUnit && unit) priceUnit.textContent = unit;
        if (mainImg && imgSrc) mainImg.src = imgSrc;

        // Keep the engagement card's form pointed at the same variant.
        if (card && variantId) {
          const cardInput = card.querySelector('[data-quick-buy-id]');
          if (cardInput) cardInput.value = variantId;
        }

        // Out-of-stock variants disable the buy button.
        if (atcBtn) {
          const available = btn.dataset.available !== 'false';
          atcBtn.disabled = !available;
          atcBtn.textContent = available
            ? (atcBtn.dataset.availableText || 'Ajouter au panier')
            : (atcBtn.dataset.soldOutText || 'Rupture de stock');
        }
      });
    });
  });
}

// 3. Gallery Thumbnails Switching
function initGallery() {
  const mainImg = document.querySelector('.knr-gallery__main-img');
  if (!mainImg) return;

  const show = (src) => {
    if (!src || mainImg.src === src) return;
    mainImg.style.opacity = '0.5';
    mainImg.src = src;
    setTimeout(() => { mainImg.style.opacity = '1'; }, 150);
  };

  // --- thumbnail layouts ---
  const thumbs = document.querySelectorAll('.knr-gallery__thumb');
  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('is-active'));
      thumb.classList.add('is-active');
      show(thumb.dataset.img);
    });
  });

  // --- stacked layout: the photo list ---
  const picks = Array.from(document.querySelectorAll('[data-gallery-select]'));
  if (!picks.length) return;

  // below 769px the list becomes the swipeable carousel, so tapping to swap
  // the hero would fight the swipe — selection is a desktop behaviour
  const isCarousel = () => window.matchMedia('(max-width: 768px)').matches;

  const select = (img) => {
    if (isCarousel()) return;
    picks.forEach(p => p.classList.remove('is-selected'));
    img.classList.add('is-selected');
    show(img.dataset.img);
  };

  picks.forEach(img => {
    img.addEventListener('click', () => select(img));
    img.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        select(img);
      }
    });
  });

  // --- pagination dots (two photos per page) ---
  const track = document.querySelector('[data-gallery-track]');
  const dots = Array.from(document.querySelectorAll('[data-gallery-page]'));
  if (!track || !dots.length) return;

  const pageWidth = () => {
    const first = track.querySelector('.knr-gallery__secondary-img');
    if (!first) return track.clientWidth;
    const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
    return (first.getBoundingClientRect().width + gap) * 2;
  };

  const syncDots = () => {
    const step = pageWidth();
    const page = step > 0 ? Math.round(track.scrollLeft / step) : 0;
    dots.forEach((d, i) => d.classList.toggle('is-active', i === page));
  };

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      track.scrollTo({ left: i * pageWidth(), behavior: 'smooth' });
    });
  });

  track.addEventListener('scroll', syncDots, { passive: true });
  window.addEventListener('resize', syncDots, { passive: true });
  syncDots();
}

// 4. Collapsible Accordions (PDP details & FAQs)
function initAccordions() {
  const headers = document.querySelectorAll('.knr-accordion__header, .knr-faq-item__question');
  headers.forEach(header => {
    header.addEventListener('click', () => {
      const parent = header.closest('.knr-accordion, .knr-faq-item');
      if (parent) {
        parent.classList.toggle('is-open');
      }
    });
  });
}

// 5. Interactive Before/After Comparison Slider
function initBeforeAfterSlider() {
  const slider = document.querySelector('.knr-ba-slider');
  if (!slider) return;

  const beforeWrap = slider.querySelector('.knr-ba-slider__before-wrap');
  const handle = slider.querySelector('.knr-ba-slider__handle');
  if (!beforeWrap || !handle) return;

  let isDragging = false;

  function updatePosition(x) {
    const rect = slider.getBoundingClientRect();
    let pos = ((x - rect.left) / rect.width) * 100;
    if (pos < 0) pos = 0;
    if (pos > 100) pos = 100;
    beforeWrap.style.width = `${pos}%`;
    handle.style.left = `${pos}%`;
  }

  // Mouse Events
  slider.addEventListener('mousedown', (e) => {
    isDragging = true;
    updatePosition(e.clientX);
  });
  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    updatePosition(e.clientX);
  });
  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Touch Events
  slider.addEventListener('touchstart', (e) => {
    isDragging = true;
    if (e.touches[0]) updatePosition(e.touches[0].clientX);
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging || !e.touches[0]) return;
    updatePosition(e.touches[0].clientX);
  }, { passive: true });

  window.addEventListener('touchend', () => {
    isDragging = false;
  });
}

// 6. Testimonial carousel (before/after section) — chevrons page through blocks
function initTestimonialCarousel() {
  document.querySelectorAll('[data-testimonial-track]').forEach(track => {
    const root = track.closest('.knr-ba-testimonial');
    if (!root) return;

    const slides = Array.from(track.children);
    const nav = root.querySelector('[data-testimonial-nav]');
    const prev = root.querySelector('[data-testimonial-prev]');
    const next = root.querySelector('[data-testimonial-next]');

    if (slides.length <= 1) {
      if (nav) nav.hidden = true;
      return;
    }

    let index = 0;
    const render = () => {
      track.style.transform = 'translateX(-' + (index * 100) + '%)';
      slides.forEach((slide, i) => {
        slide.setAttribute('aria-hidden', String(i !== index));
      });
    };

    const go = (step) => {
      index = (index + step + slides.length) % slides.length;
      render();
    };

    if (prev) prev.addEventListener('click', () => go(-1));
    if (next) next.addEventListener('click', () => go(1));

    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    });

    render();
  });
}

// 7. Ritual carousel — chevron scrolls one card, wrapping at the end
function initRitualScroll() {
  document.querySelectorAll('[data-ritual-scroll]').forEach(btn => {
    const ritual = btn.closest('.knr-ritual');
    const track = ritual && ritual.querySelector('[data-ritual-track]');
    if (!track) return;

    const canScroll = () => track.scrollWidth - track.clientWidth > 1;

    const sync = () => {
      btn.disabled = !canScroll();
    };

    btn.addEventListener('click', () => {
      if (!canScroll()) return;
      const card = track.querySelector('.knr-ritual-card');
      const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 8;
      const step = card ? card.getBoundingClientRect().width + gap : track.clientWidth;
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 5;
      track.scrollTo({ left: atEnd ? 0 : track.scrollLeft + step, behavior: 'smooth' });
    });

    window.addEventListener('resize', sync, { passive: true });
    sync();
  });
}

// 8. Mobile gallery carousel indicator
function initGalleryProgress() {
  document.querySelectorAll('.knr-main-product').forEach(section => {
    const gallery = section.querySelector('.knr-gallery');
    const bar = section.querySelector('.knr-gallery-progress');
    if (!gallery || !bar) return;
    const fill = bar.querySelector('.knr-gallery-progress__fill');
    if (!fill) return;

    const sync = () => {
      const count = gallery.querySelectorAll('.knr-gallery__main, .knr-gallery__secondary-img').length;
      if (count <= 1) {
        bar.style.visibility = 'hidden';
        return;
      }
      bar.style.visibility = '';
      fill.style.width = (100 / count) + '%';
      const max = gallery.scrollWidth - gallery.clientWidth;
      const ratio = max > 0 ? gallery.scrollLeft / max : 0;
      fill.style.transform = 'translateX(' + (ratio * (count - 1) * 100) + '%)';

      // left arrow only once you've moved on, right arrow until the last slide
      const prevBtn = section.querySelector('[data-gallery-prev]');
      const nextBtn = section.querySelector('[data-gallery-next]');
      if (prevBtn) prevBtn.hidden = max <= 0 || gallery.scrollLeft <= 2;
      if (nextBtn) nextBtn.hidden = max <= 0 || gallery.scrollLeft >= max - 2;
    };

    const prev = section.querySelector('[data-gallery-prev]');
    const next = section.querySelector('[data-gallery-next]');
    const slideStep = () => gallery.clientWidth;

    if (prev) prev.addEventListener('click', () => {
      gallery.scrollBy({ left: -slideStep(), behavior: 'smooth' });
    });
    if (next) next.addEventListener('click', () => {
      gallery.scrollBy({ left: slideStep(), behavior: 'smooth' });
    });

    gallery.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync, { passive: true });
    sync();
  });
}

// 9. Generic carousel indicator (how-to-use, latest news)
function initCarouselProgress() {
  document.querySelectorAll('[data-carousel-progress]').forEach(bar => {
    const section = bar.closest('section');
    const track = section && section.querySelector('.knr-how-to-use__grid, .knr-latest-news__grid');
    const fill = bar.querySelector('.knr-carousel-progress__fill');
    if (!track || !fill) return;

    const sync = () => {
      const count = track.children.length;
      const max = track.scrollWidth - track.clientWidth;
      if (count <= 1 || max <= 0) {
        bar.style.visibility = 'hidden';
        return;
      }
      bar.style.visibility = '';
      fill.style.width = (100 / count) + '%';
      fill.style.transform = 'translateX(' + ((track.scrollLeft / max) * (count - 1) * 100) + '%)';
    };

    track.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync, { passive: true });
    sync();
  });
}

// 10. Delivery notice — rotating messages with clickable indicators
function initDeliveryNotice() {
  document.querySelectorAll('.knr-delivery-notice').forEach(notice => {
    const track = notice.querySelector('[data-delivery-track]');
    const dots = Array.from(notice.querySelectorAll('[data-delivery-index]'));
    if (!track) return;

    const slides = Array.from(track.children);
    if (slides.length <= 1) {
      if (dots.length <= 1) return;
    }

    let index = 0;
    let timer = null;
    const speed = parseFloat(notice.dataset.deliveryAutoplay || '0') * 1000;

    const render = () => {
      track.style.transform = 'translateX(-' + (index * 100) + '%)';
      dots.forEach((d, i) => d.classList.toggle('is-active', i === index));
    };

    const go = (i) => {
      index = (i + slides.length) % slides.length;
      render();
    };

    const start = () => {
      if (!speed || slides.length <= 1) return;
      stop();
      timer = setInterval(() => go(index + 1), speed);
    };
    const stop = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        go(i);
        start();   // restart the cycle from the chosen message
      });
    });

    // pause while the visitor is reading
    notice.addEventListener('mouseenter', stop);
    notice.addEventListener('mouseleave', start);
    notice.addEventListener('focusin', stop);
    notice.addEventListener('focusout', start);

    render();
    start();
  });
}

// 11. Footer link columns collapse into accordions on mobile
function initFooterAccordions() {
  const mq = window.matchMedia('(max-width: 768px)');
  document.querySelectorAll('.knr-footer__col').forEach(col => {
    if (col.classList.contains('knr-footer__col--about')) return;
    const title = col.querySelector('.knr-footer__col-title');
    if (!title) return;

    title.addEventListener('click', () => {
      if (!mq.matches) return;
      col.classList.toggle('is-open');
    });
  });
}
