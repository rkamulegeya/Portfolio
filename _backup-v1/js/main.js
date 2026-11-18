/* ═══════════════════════════════════════
   main.js — Ronald Kamulegeya Portfolio
═══════════════════════════════════════ */

'use strict';

/* ── PAGE LOADER ── */
window.addEventListener('load', () => {
  const loader = document.getElementById('pageLoader');
  if (loader) {
    setTimeout(() => loader.classList.add('hidden'), 400);
  }
});

/* ── NAVBAR SCROLL BEHAVIOUR ── */
const navbar = document.getElementById('navbar');
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;

  // Navbar shadow
  if (scrollY > 20) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  // Back to top visibility
  if (scrollY > 400) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }

  // Active nav link highlight
  highlightNavLink();
}, { passive: true });

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ── ACTIVE NAV LINK ── */
function highlightNavLink() {
  const sections = document.querySelectorAll('section[id], div[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  let current = '';

  sections.forEach(section => {
    const top = section.offsetTop - 100;
    if (window.scrollY >= top) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
}

/* ── HAMBURGER MENU ── */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

// Close menu on link click
navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

// Close menu on outside click
document.addEventListener('click', (e) => {
  if (!navbar.contains(e.target)) {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  }
});

/* ── SMOOTH SCROLL FOR ALL ANCHOR LINKS ── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const href = anchor.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const offset = navbar.offsetHeight + 16;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ── SCROLL REVEAL ── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger delay based on position in parent
      const siblings = Array.from(entry.target.parentElement.children);
      const index = siblings.indexOf(entry.target);
      const delay = Math.min(index * 80, 400);

      setTimeout(() => {
        entry.target.classList.add('visible');
      }, delay);

      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.08,
  rootMargin: '0px 0px -40px 0px'
});

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── COUNTER ANIMATION ── */
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.getAttribute('data-count'));
      if (!target) return;
      animateCounter(el, target);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num[data-count]').forEach(el => counterObserver.observe(el));

function animateCounter(el, target) {
  const suffix = el.querySelector('span') ? el.querySelector('span').outerHTML : '';
  const duration = 1200;
  const start = performance.now();

  const update = (time) => {
    const elapsed = time - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current = Math.round(eased * target);
    el.innerHTML = current + suffix;
    if (progress < 1) requestAnimationFrame(update);
  };

  requestAnimationFrame(update);
}

/* ── CONTACT FORM ── */
const contactForm = document.getElementById('contactForm');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    const btn = contactForm.querySelector('.btn-submit');
    btn.classList.add('loading');
    btn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite">
        <path d="M21 12a9 9 0 11-6.219-8.56"/>
      </svg>
      Sending...
    `;

    // Re-enable after 5 seconds in case of issues
    setTimeout(() => {
      btn.classList.remove('loading');
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
        Send Message
      `;
    }, 5000);
  });
}

/* ── GALLERY LIGHTBOX ── */
const galleryItems = document.querySelectorAll('.gitem');

galleryItems.forEach(item => {
  item.addEventListener('click', () => {
    const img = item.querySelector('img');
    const cap = item.querySelector('.gcap');
    openLightbox(img.src, cap ? cap.textContent : '');
  });
});

function openLightbox(src, caption) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position:fixed;inset:0;background:rgba(11,31,58,0.95);z-index:9999;
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    padding:24px;cursor:zoom-out;animation:fadeIn .2s ease;
  `;
  overlay.innerHTML = `
    <style>@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes spin{to{transform:rotate(360deg)}}</style>
    <img src="${src}" style="max-width:90vw;max-height:80vh;object-fit:contain;border-radius:12px;box-shadow:0 32px 64px rgba(0,0,0,0.5)" />
    <p style="color:rgba(255,255,255,0.65);font-size:14px;margin-top:16px;text-align:center;font-family:'DM Sans',sans-serif;">${caption}</p>
    <button style="position:absolute;top:20px;right:24px;background:rgba(255,255,255,0.1);border:none;color:#fff;width:40px;height:40px;border-radius:50%;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;">&times;</button>
  `;
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  const close = () => {
    document.body.removeChild(overlay);
    document.body.style.overflow = '';
  };
  overlay.addEventListener('click', close);
  overlay.querySelector('button').addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); }, { once: true });
}

/* ── PROJECT CARD TILT EFFECT ── */
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `translateY(-6px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

/* ── WHATSAPP FLOATING BUTTON ── */
const waBtn = document.createElement('a');
waBtn.href = 'https://wa.me/256778559236?text=Hi%20Ronald%2C%20I%20found%20your%20portfolio%20and%20would%20like%20to%20discuss%20a%20project.';
waBtn.target = '_blank';
waBtn.setAttribute('aria-label', 'Chat on WhatsApp');
waBtn.style.cssText = `
  position:fixed;bottom:88px;right:28px;width:50px;height:50px;background:#25D366;
  border-radius:50%;display:flex;align-items:center;justify-content:center;
  box-shadow:0 4px 18px rgba(37,211,102,0.5);z-index:900;transition:all .25s ease;
  text-decoration:none;
`;
waBtn.innerHTML = `
  <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M11.5 0C5.149 0 0 5.149 0 11.5c0 2.018.522 3.912 1.435 5.557L.002 23l6.119-1.397A11.451 11.451 0 0 0 11.5 23C17.851 23 23 17.851 23 11.5S17.851 0 11.5 0zm0 21.044a9.522 9.522 0 0 1-4.86-1.326l-.349-.207-3.624.827.853-3.524-.228-.362A9.495 9.495 0 0 1 2 11.5C2 6.262 6.262 2 11.5 2S21 6.262 21 11.5 16.738 21.044 11.5 21.044z"/>
  </svg>
`;
waBtn.addEventListener('mouseenter', () => { waBtn.style.transform = 'scale(1.1) translateY(-2px)'; });
waBtn.addEventListener('mouseleave', () => { waBtn.style.transform = ''; });
document.body.appendChild(waBtn);

/* ── FORM FIELD AUTOFILL FIX ── */
document.querySelectorAll('input, textarea, select').forEach(field => {
  field.addEventListener('focus', () => field.parentElement.classList.add('focused'));
  field.addEventListener('blur', () => field.parentElement.classList.remove('focused'));
});

/* ── KEYBOARD NAVIGATION ── */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    document.body.classList.add('keyboard-nav');
  }
});
document.addEventListener('mousedown', () => {
  document.body.classList.remove('keyboard-nav');
});

console.log('%c Ronald Kamulegeya Portfolio', 'font-size:18px;font-weight:bold;color:#0E9F7E;');
console.log('%c Built with ❤️ | rkamulegeya12@gmail.com', 'font-size:12px;color:#4A5568;');
