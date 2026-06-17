/* Computer Complex — illustration & animation engine */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────────────────────────────────
     TERMINAL TYPING ANIMATION
     Only runs on the home page (index.html)
  ───────────────────────────────────── */
  var typeEl = document.getElementById('typeTarget');
  if (typeEl) {
    var phrases = [
      'building a live website',
      'mastering digital marketing',
      'designing brand graphics',
      'coding the Smart way',
      'learning GST & accounts',
      'speaking English fluently',
      'creating content from a phone',
      'using AI in everyday work',
    ];
    var pi = 0, ci = 0, deleting = false;

    function tick() {
      var phrase = phrases[pi % phrases.length];
      if (deleting) {
        ci--;
        typeEl.textContent = phrase.slice(0, ci);
        if (ci <= 0) {
          deleting = false;
          pi++;
          setTimeout(tick, 500);
          return;
        }
        setTimeout(tick, reduced ? 0 : 28);
      } else {
        ci++;
        typeEl.textContent = phrase.slice(0, ci);
        if (ci >= phrase.length) {
          deleting = true;
          setTimeout(tick, reduced ? 0 : 2000);
          return;
        }
        setTimeout(tick, reduced ? 0 : 62);
      }
    }
    setTimeout(tick, 1000); /* start after page settles */
  }

  /* ─────────────────────────────────────
     ABOUT PAGE: TIMELINE SPINE
  ───────────────────────────────────── */
  var milestoneList = document.querySelector('.milestone-list');
  if (milestoneList) {
    var spineObs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        milestoneList.classList.add('spine-lit');
        spineObs.disconnect();
      }
    }, { threshold: 0.4 });
    spineObs.observe(milestoneList);
  }

  /* ─────────────────────────────────────
     INDUSTRIAL TRAINING: STEP TRACK
  ───────────────────────────────────── */
  var stepsWrap = document.querySelector('.it-steps-wrap');
  if (stepsWrap) {
    var trackObs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        stepsWrap.classList.add('track-lit');
        trackObs.disconnect();
      }
    }, { threshold: 0.35 });
    trackObs.observe(stepsWrap);
  }

  /* ─────────────────────────────────────
     ABOUT PAGE: PARTICLE FIELD in hero
  ───────────────────────────────────── */
  var pField = document.querySelector('.particle-field');
  if (pField && !reduced) {
    var configs = [
      { left:'12%', top:'60%', tx:'18px', ty:'-44px', dur:'5.5s', delay:'0s' },
      { left:'22%', top:'80%', tx:'-12px', ty:'-55px', dur:'6.2s', delay:'.8s' },
      { left:'35%', top:'50%', tx:'24px', ty:'-38px', dur:'4.8s', delay:'1.4s' },
      { left:'50%', top:'75%', tx:'-20px', ty:'-50px', dur:'7.0s', delay:'.3s' },
      { left:'63%', top:'40%', tx:'14px', ty:'-60px', dur:'5.2s', delay:'2.0s' },
      { left:'74%', top:'70%', tx:'-16px', ty:'-42px', dur:'6.5s', delay:'1.1s' },
      { left:'85%', top:'55%', tx:'10px', ty:'-48px', dur:'5.8s', delay:'.6s' },
      { left:'42%', top:'30%', tx:'-8px',  ty:'-36px', dur:'4.5s', delay:'2.5s' },
    ];
    configs.forEach(function (c) {
      var dot = document.createElement('span');
      dot.style.cssText = [
        'left:' + c.left,
        'top:' + c.top,
        '--tx:' + c.tx,
        '--ty:' + c.ty,
        '--dur:' + c.dur,
        '--delay:' + c.delay,
      ].join(';');
      pField.appendChild(dot);
    });
  }

  /* ─────────────────────────────────────
     COURSES PAGE: DUPLICATE MARQUEE ROW
     (needs two copies for seamless loop)
  ───────────────────────────────────── */
  var strip = document.querySelector('.course-tag-strip');
  if (strip) {
    var first = strip.querySelector('.cts-inner');
    if (first) {
      /* Clone the inner track so the marquee loops without a gap */
      var clone = first.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      strip.appendChild(clone);
    }
  }


})();
