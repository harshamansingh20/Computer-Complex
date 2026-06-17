/* Computer Complex — site JS */
(function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────────────────────────────────
     MOBILE NAV TOGGLE
  ───────────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function () {
      const open = mobileNav.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', String(open));
    });
    mobileNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mobileNav.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ─────────────────────────────────────
     NAV SHADOW ON SCROLL
  ───────────────────────────────────── */
  var nav = document.querySelector('.nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 32);
    }, { passive: true });
  }

  /* ─────────────────────────────────────
     ENQUIRY FORM
  ───────────────────────────────────── */
  var form = document.getElementById('enquiryForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn  = form.querySelector('button[type="submit"]');
      var orig = btn.textContent;
      btn.textContent = 'Message sent!';
      btn.disabled    = true;
      btn.style.cssText = 'background:#10B981;border-color:#10B981;transform:none;';
      setTimeout(function () {
        btn.textContent  = orig;
        btn.disabled     = false;
        btn.style.cssText = '';
        form.reset();
      }, 3500);
    });
  }

  /* ─────────────────────────────────────
     SMOOTH SCROLL for on-page anchors
  ───────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id  = a.getAttribute('href');
      var tgt = id.length > 1 && document.querySelector(id);
      if (tgt) {
        e.preventDefault();
        tgt.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── Everything below needs motion ── */
  if (reduced) return;

  /* ─────────────────────────────────────
     BUTTON RIPPLE
  ───────────────────────────────────── */
  document.querySelectorAll('.btn').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      var r    = document.createElement('span');
      var rect = btn.getBoundingClientRect();
      r.className = 'ripple';
      r.style.left = (e.clientX - rect.left) + 'px';
      r.style.top  = (e.clientY - rect.top)  + 'px';
      btn.appendChild(r);
      r.addEventListener('animationend', function () { r.remove(); });
    });
  });

  /* ─────────────────────────────────────
     SCROLL REVEAL (IntersectionObserver)
  ───────────────────────────────────── */
  var REVEAL_TARGETS = [
    /* cards & content blocks */
    '.section .card',
    '.section-alt .card',
    '.testimonial-card',
    '.value-card',
    /* features */
    '.feature-item',
    '.milestone-item',
    /* stats */
    '.trust-stats .stat-item',
    /* contact */
    '.contact-detail-item',
    /* misc */
    '.photo-placeholder',
    '.it-step',
    /* section headers */
    '.section-header',
    '.story-content',
    '.story-visual',
  ].join(',');

  var revealEls = Array.from(document.querySelectorAll(REVEAL_TARGETS));

  /* Assign stagger delays for siblings inside the same parent */
  var parentMap = new Map();
  revealEls.forEach(function (el) {
    var p = el.parentElement;
    if (!parentMap.has(p)) parentMap.set(p, []);
    parentMap.get(p).push(el);
  });
  parentMap.forEach(function (siblings) {
    if (siblings.length < 2) return;
    siblings.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i * 75, 280) + 'ms';
    });
  });

  revealEls.forEach(function (el) {
    el.classList.add('rv');
    /* feature items slide from left instead of up */
    if (el.classList.contains('feature-item') || el.classList.contains('milestone-item')) {
      el.classList.add('rv-left');
    }
    /* section headers and visuals scale in */
    if (el.classList.contains('story-visual') || el.classList.contains('section-header')) {
      el.classList.add('rv-scale');
    }
  });

  var revealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        el.classList.add('visible');
        revealObs.unobserve(el);
        /* After the reveal transition ends, strip animation bookkeeping so
           hover effects (tilt, etc.) work on a clean element */
        el.addEventListener('transitionend', function handler(e) {
          if (e.propertyName === 'opacity') {
            el.classList.remove('rv', 'rv-left', 'rv-scale', 'visible');
            el.style.transitionDelay = '';
            el.removeEventListener('transitionend', handler);
          }
        });
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -48px 0px' });

  revealEls.forEach(function (el) { revealObs.observe(el); });

  /* ─────────────────────────────────────
     COUNTER ANIMATION for stat numbers
  ───────────────────────────────────── */
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function runCounter(el) {
    var raw    = el.dataset.raw || el.textContent.trim();
    el.dataset.raw = raw;                           /* cache original text */
    var numStr = raw.replace(/[^0-9]/g, '');
    if (!numStr) return;
    var target = parseInt(numStr, 10);
    var suffix = raw.replace(/[0-9,]/g, '');        /* "+", " years", etc. */
    var dur    = 1350;
    var t0     = null;

    el.classList.add('popped');

    function tick(now) {
      if (!t0) t0 = now;
      var progress = Math.min((now - t0) / dur, 1);
      var val      = Math.round(easeOutCubic(progress) * target);
      el.textContent = (target >= 1000 ? val.toLocaleString('en-IN') : val) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  var counterObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        runCounter(entry.target);
        counterObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  document.querySelectorAll('.stat-val').forEach(function (el) {
    /* Skip elements containing an SVG icon */
    if (!el.querySelector('svg') && /\d/.test(el.textContent)) {
      counterObs.observe(el);
    }
  });

  /* ─────────────────────────────────────
     CARD TILT (subtle 3-D on hover)
  ───────────────────────────────────── */
  document.querySelectorAll('.card').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect  = card.getBoundingClientRect();
      var cx    = rect.left + rect.width  / 2;
      var cy    = rect.top  + rect.height / 2;
      var dx    = (e.clientX - cx) / (rect.width  / 2);  /* -1 → 1 */
      var dy    = (e.clientY - cy) / (rect.height / 2);
      var tiltX = -(dy * 5);   /* max 5deg */
      var tiltY =  (dx * 5);
      card.style.transform = 'translateY(-2px) rotateX(' + tiltX + 'deg) rotateY(' + tiltY + 'deg)';
    });
    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
    });
  });

  /* ─────────────────────────────────────
     IT STEPS — sequential reveal
     (stagger is already handled above,
      but add a stronger delay sequence)
  ───────────────────────────────────── */
  var itSteps = Array.from(document.querySelectorAll('.it-step'));
  itSteps.forEach(function (el, i) {
    el.style.transitionDelay = (i * 120) + 'ms';
  });

  /* ─────────────────────────────────────
     SECTION HEADER — split word reveal
     (adds a class that animates the h2)
  ───────────────────────────────────── */
  var sectionObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('header-visible');
        sectionObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });

  document.querySelectorAll('.section-header').forEach(function (sh) {
    sectionObs.observe(sh);
  });

  /* ─────────────────────────────────────
     HIGHLIGHT BAR — ticker-style attention
  ───────────────────────────────────── */
  var bar = document.querySelector('.it-highlight-bar');
  if (bar) {
    bar.style.opacity = '0';
    bar.style.transform = 'translateY(-100%)';
    bar.style.transition = 'opacity .4s ease, transform .4s cubic-bezier(.22,1,.36,1)';
    /* Animate in after nav settles */
    setTimeout(function () {
      bar.style.opacity   = '1';
      bar.style.transform = 'translateY(0)';
    }, 300);
  }

  /* ─────────────────────────────────────
     TRUST STRIP — animate ISO badge
  ───────────────────────────────────── */
  var isoObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'shimmerBadge 3s ease 0s 2';
        isoObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.8 });

  var isoBadge = document.querySelector('.iso-badge');
  if (isoBadge) isoObs.observe(isoBadge);

  /* ─────────────────────────────────────
     WHATSAPP BUTTON — pulse on load
  ───────────────────────────────────── */
  var waCta = document.querySelector('a[href^="https://wa.me"]');
  if (waCta && waCta.classList.contains('btn-lg')) {
    setTimeout(function () {
      waCta.style.transition += ', box-shadow .8s ease';
      waCta.style.boxShadow  = '0 0 0 8px rgba(37,211,102,.25)';
      setTimeout(function () {
        waCta.style.boxShadow = '';
      }, 900);
    }, 1200);
  }

})();
