/* Portfolio v2 - interactions (dependency-free) */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  var header = $('.site-header');
  var progress = $('#progress');
  var toTop = $('#toTop');
  var heroMedia = $('.hero-media');
  var timeline = $('.timeline');

  /* ---------- One throttled scroll handler: header, progress bar, back-to-top, parallax, timeline ---------- */
  var ticking = false;
  function update() {
    ticking = false;
    var y = window.scrollY || window.pageYOffset;
    header.classList.toggle('is-scrolled', y > 8);

    if (progress) {
      var de = document.documentElement;
      var max = de.scrollHeight - de.clientHeight;
      progress.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
    }
    if (toTop) toTop.classList.toggle('is-visible', y > 700);

    if (!reduce && heroMedia && window.innerWidth > 900) {
      heroMedia.style.transform = 'translateY(' + (Math.min(y, 700) * 0.07).toFixed(1) + 'px)';
    }
    if (!reduce && timeline) {
      var r = timeline.getBoundingClientRect();
      var fill = Math.max(0, Math.min(r.height, window.innerHeight * 0.6 - r.top));
      timeline.style.setProperty('--fill', fill.toFixed(0) + 'px');
    }
  }
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
  }

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
  var navAnchors = $$('a[href^="#"]:not(.btn)', links);
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

  /* ---------- Scroll reveal (staggered). Content stays visible if JS or IntersectionObserver is missing. ---------- */
  if (!reduce && 'IntersectionObserver' in window) {
    var sel = '.section-head, .about figure, .about-text, .project, .more-work article, .gallery li, .chips, ' +
      '.design-visuals figure, .design-copy, .service, .skill, .job, .education article, .contact-info, ' +
      '.form, .facts li, .clients, .band-cta, .award';
    var items = $$(sel);

    items.forEach(function (el) {
      var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.matches(sel); });
      var i = Math.max(0, sibs.indexOf(el));
      el.style.setProperty('--d', Math.min(i, 6) * 70 + 'ms');
      el.setAttribute('data-reveal', '');
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        el.classList.add('is-in');
        io.unobserve(el);
        // Clean up afterwards so hover transitions on the same element work normally.
        setTimeout(function () {
          el.removeAttribute('data-reveal');
          el.classList.remove('is-in');
          el.style.removeProperty('--d');
        }, 1300);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Count-up numbers ---------- */
  function countUp(el) {
    var end = Number(el.getAttribute('data-count'));
    var start = null;
    var dur = 1400;
    el.textContent = '0';
    function step(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / dur, 1);
      var v = Math.round(end * (1 - Math.pow(1 - p, 3)));
      el.textContent = v.toLocaleString('en-US');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = $$('[data-count]');
  if (counters.length && !reduce && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        cio.unobserve(e.target);
        countUp(e.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---------- Gallery: categories + filter chips ---------- */
  var catMap = {
    'valve-actuator-inspection.jpg': 'pipeline',
    'valve-actuator-install.jpg': 'pipeline',
    'eacop_team.jpg': 'pipeline',
    'eacop2.jpg': 'pipeline',
    'solar1.jpg': 'solar',
    'solar_structure.jpg': 'solar',
    'unhcr_cable.jpg': 'solar',
    'mogas-ac-inspection.jpg': 'hvac',
    'cfao1.jpg': 'hvac',
    'coke.jpg': 'plants',
    'Aquafina.JPG': 'plants'
  };
  $$('.gallery li').forEach(function (li) {
    var img = $('img', li);
    var file = img ? img.getAttribute('src').split('/').pop() : '';
    li.setAttribute('data-cat', catMap[file] || 'other');
  });

  var chips = $$('.chip');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var f = chip.getAttribute('data-filter');
      chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
      $$('.gallery li').forEach(function (li) {
        var show = f === 'all' || li.getAttribute('data-cat') === f;
        li.hidden = !show;
        li.classList.remove('pop');
        if (show && !reduce) { void li.offsetWidth; li.classList.add('pop'); }
      });
    });
  });

  /* ---------- Lightbox: native <dialog>, arrows, keyboard, swipe ---------- */
  var box = document.getElementById('lightbox');
  var boxImg = $('img', box);
  var boxCap = $('figcaption', box);
  var cur = 0;

  function shots() { return $$('.gallery li:not([hidden]) .shot'); }

  function show(i) {
    var list = shots();
    if (!list.length) return;
    cur = (i + list.length) % list.length;
    var b = list[cur];
    var img = $('img', b);
    boxImg.src = img.currentSrc || img.src;
    boxImg.alt = img.alt;
    boxCap.textContent = $('span', b).textContent + ' (' + (cur + 1) + ' of ' + list.length + ')';
    if (!reduce) { boxImg.style.animation = 'none'; void boxImg.offsetWidth; boxImg.style.animation = ''; }
  }

  var gallery = $('.gallery');
  if (gallery) {
    gallery.addEventListener('click', function (e) {
      var b = e.target.closest('.shot');
      if (!b) return;
      show(shots().indexOf(b));
      if (typeof box.showModal === 'function' && !box.open) box.showModal();
    });
  }
  box.addEventListener('click', function (e) {
    if (e.target.closest('.lb-prev')) { show(cur - 1); return; }
    if (e.target.closest('.lb-next')) { show(cur + 1); return; }
    if (e.target === box || e.target.closest('.lightbox-close')) box.close();
  });
  box.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') show(cur - 1);
    else if (e.key === 'ArrowRight') show(cur + 1);
  });
  var touchX = null;
  box.addEventListener('touchstart', function (e) { touchX = e.changedTouches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) show(dx < 0 ? cur + 1 : cur - 1);
    touchX = null;
  }, { passive: true });
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
