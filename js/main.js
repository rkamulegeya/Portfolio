/* Portfolio v2 - small, dependency-free */
(function () {
  'use strict';

  /* ---------- Header: scrolled state ---------- */
  var header = document.querySelector('.site-header');
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');

  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    links.classList.toggle('is-open', open);
  }
  toggle.addEventListener('click', function () {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });
  links.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      toggle.focus();
    }
  });

  /* ---------- Active nav link while scrolling ---------- */
  var navAnchors = Array.prototype.slice.call(links.querySelectorAll('a[href^="#"]:not(.btn)'));
  var targets = navAnchors
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && targets.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navAnchors.forEach(function (a) {
          var active = a.getAttribute('href') === '#' + entry.target.id;
          a.classList.toggle('is-active', active);
          if (active) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    targets.forEach(function (t) { spy.observe(t); });
  }

  /* ---------- Lightbox (native <dialog>: Esc, focus trap and focus return are built in) ---------- */
  var box = document.getElementById('lightbox');
  var boxImg = box.querySelector('img');
  var boxCap = box.querySelector('figcaption');

  document.querySelectorAll('.shot').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var img = btn.querySelector('img');
      boxImg.src = img.currentSrc || img.src;
      boxImg.alt = img.alt;
      boxCap.textContent = btn.querySelector('span').textContent;
      if (typeof box.showModal === 'function') box.showModal();
    });
  });
  box.addEventListener('click', function (e) {
    if (e.target === box || e.target.closest('.lightbox-close')) box.close();
  });
  box.addEventListener('close', function () { boxImg.removeAttribute('src'); });

  /* ---------- Contact form ---------- */
  var form = document.getElementById('contactForm');
  var status = document.getElementById('formStatus');
  var submit = form.querySelector('button[type="submit"]');

  function say(msg, kind) {
    status.textContent = msg;
    status.className = 'form-status' + (kind ? ' is-' + kind : '');
  }

  form.addEventListener('submit', function (e) {
    if (!window.fetch) return; // falls back to a normal POST
    e.preventDefault();
    submit.disabled = true;
    say('Sending...', '');

    fetch(form.dataset.ajax, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(form)
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Request failed');
        return res.json();
      })
      .then(function () {
        form.reset();
        say('Thanks, your message is on its way. I will reply by email soon.', 'ok');
        if (window.gtag) gtag('event', 'generate_lead', { method: 'contact_form' });
      })
      .catch(function () {
        say('The message did not send. Please email rkamulegeya12@gmail.com directly.', 'error');
      })
      .then(function () { submit.disabled = false; });
  });

  /* ---------- Footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
