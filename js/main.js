/* ==========================================================================
   Portfolio interactions (vanilla JS, no dependencies)
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var prefersReducedMotion = reduceMotionQuery.matches;

  /* ---------- Boot sequence ---------- */
  function initBoot() {
    var boot = document.getElementById('boot');
    if (!boot) return;

    var log = document.getElementById('boot-log');
    var fill = document.getElementById('boot-bar-fill');
    var pct = document.getElementById('boot-pct');
    var skip = document.getElementById('boot-skip');
    var lines = [
      'Initializing world seed',
      'Rendering floating islands',
      'Loading data modules: Python, SQL, Power BI',
      'Calibrating insight engine',
      'Syncing quest log',
      'Spawning player'
    ];
    var finished = false;
    var timers = [];

    // Only show the intro once per browser session, and never with reduced motion.
    var seen = false;
    try { seen = sessionStorage.getItem('bootSeen') === '1'; } catch (e) { /* storage blocked */ }

    function finish() {
      if (finished) return;
      finished = true;
      timers.forEach(clearTimeout);
      boot.classList.add('is-done');
      boot.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('is-booting');
      try { sessionStorage.setItem('bootSeen', '1'); } catch (e) { /* storage blocked */ }
      setTimeout(function () { boot.remove(); }, 500);
      // Release focus so the next Tab starts from the top of the page (skip link first).
      if (document.activeElement === skip) skip.blur();
    }

    if (seen || prefersReducedMotion) {
      boot.remove();
      return;
    }

    document.body.classList.add('is-booting');
    skip.addEventListener('click', finish);
    document.addEventListener('keydown', function onKey(e) {
      if (e.key === 'Escape') { finish(); document.removeEventListener('keydown', onKey); }
    });
    skip.focus({ preventScroll: true });

    var total = 2400; // whole sequence stays under 3 seconds
    var step = total / lines.length;
    lines.forEach(function (text, i) {
      timers.push(setTimeout(function () {
        var li = document.createElement('li');
        li.innerHTML = '&gt; ' + text + '... <span class="ok">[OK]</span>';
        log.appendChild(li);
        var p = Math.round(((i + 1) / lines.length) * 100);
        fill.style.width = p + '%';
        pct.textContent = p + '%';
      }, step * i + 120));
    });
    timers.push(setTimeout(finish, total + 300));
  }

  /* ---------- Mobile navigation ---------- */
  function initNav() {
    var toggle = document.getElementById('nav-toggle');
    var menu = document.getElementById('nav-menu');
    var hud = document.getElementById('hud');
    if (!toggle || !menu) return;
    var label = toggle.querySelector('.sr-only');

    function setOpen(open) {
      toggle.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('is-open', open);
      label.textContent = open ? 'Close menu' : 'Open menu';
    }

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (menu.classList.contains('is-open') && !hud.contains(e.target)) setOpen(false);
    });

    // Reset state if the viewport grows past the mobile breakpoint.
    window.matchMedia('(min-width: 861px)').addEventListener('change', function (e) {
      if (e.matches) setOpen(false);
    });
  }

  /* ---------- Active section highlighting + scroll progress ---------- */
  function initScrollSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.hud__link'));
    var hud = document.getElementById('hud');
    var sections = links
      .map(function (a) { return document.querySelector(a.getAttribute('href')); })
      .filter(Boolean);

    function setActive(id) {
      links.forEach(function (a) {
        var active = a.getAttribute('href') === '#' + id;
        a.classList.toggle('is-active', active);
        if (active) a.setAttribute('aria-current', 'location');
        else a.removeAttribute('aria-current');
      });
    }

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        var max = document.documentElement.scrollHeight - window.innerHeight;
        hud.style.setProperty('--scroll-progress', (max > 0 ? (y / max) * 100 : 0) + '%');
        hud.classList.toggle('is-scrolled', y > 10);

        // The active section is the last one whose top has passed 40% of the viewport.
        var marker = y + window.innerHeight * 0.4;
        var current = sections[0];
        sections.forEach(function (s) { if (s.offsetTop <= marker) current = s; });
        if (y >= max - 2) current = sections[sections.length - 1];
        if (current) setActive(current.id);
        ticking = false;
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  }

  /* ---------- Reveal on scroll (also fills stat bars) ---------- */
  function initReveal() {
    var items = document.querySelectorAll('.reveal, .skill-panel');
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Hero parallax ---------- */
  function initParallax() {
    if (prefersReducedMotion) return;
    var shapes = document.querySelectorAll('.shape[data-depth]');
    var hero = document.getElementById('home');
    if (!shapes.length || !hero) return;

    var mx = 0, my = 0, sy = 0, raf = null;
    function render() {
      raf = null;
      shapes.forEach(function (el) {
        var d = parseFloat(el.dataset.depth) || 0;
        el.style.setProperty('--px', (mx * d * 30).toFixed(1) + 'px');
        el.style.setProperty('--py', (my * d * 30 - sy * d).toFixed(1) + 'px');
      });
    }
    function queue() { if (!raf) raf = requestAnimationFrame(render); }

    if (window.matchMedia('(pointer: fine)').matches) {
      hero.addEventListener('pointermove', function (e) {
        mx = (e.clientX / window.innerWidth) - 0.5;
        my = (e.clientY / window.innerHeight) - 0.5;
        queue();
      });
    }
    window.addEventListener('scroll', function () {
      if (window.scrollY > window.innerHeight) return;
      sy = window.scrollY * 0.4;
      queue();
    }, { passive: true });
  }

  /* ---------- Project filters ---------- */
  function initFilters() {
    var buttons = document.querySelectorAll('.filter');
    var cards = document.querySelectorAll('#project-grid .project');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var f = btn.dataset.filter;
        buttons.forEach(function (b) {
          var on = b === btn;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-pressed', String(on));
        });
        cards.forEach(function (card) {
          var show = f === 'all' || card.dataset.category === f;
          card.classList.toggle('is-hidden', !show);
          if (show) card.classList.add('is-visible');
        });
      });
    });
  }

  /* ---------- Expandable timeline ---------- */
  function initTimeline() {
    document.querySelectorAll('.timeline__toggle').forEach(function (btn) {
      var body = document.getElementById(btn.getAttribute('aria-controls'));
      if (!body) return;
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!open));
        body.hidden = open;
      });
    });
  }

  /* ---------- Copy email ---------- */
  function initCopyEmail() {
    var btn = document.getElementById('copy-email');
    var toast = document.getElementById('copy-toast');
    if (!btn) return;
    var label = btn.querySelector('.copy-label');
    var resetTimer;

    function fallbackCopy(text) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      ta.remove();
      return ok;
    }

    function report(ok) {
      var email = btn.dataset.email;
      toast.textContent = ok ? 'Copied ' + email + ' to clipboard.' : 'Copy failed. Please select the address above.';
      label.textContent = ok ? 'Copied!' : 'Copy Email';
      clearTimeout(resetTimer);
      resetTimer = setTimeout(function () {
        label.textContent = 'Copy Email';
        toast.textContent = '';
      }, 3000);
    }

    btn.addEventListener('click', function () {
      var email = btn.dataset.email;
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(email).then(function () { report(true); }, function () { report(fallbackCopy(email)); });
      } else {
        report(fallbackCopy(email));
      }
    });
  }

  /* ---------- Placeholder links ---------- */
  function initPlaceholderLinks() {
    document.querySelectorAll('[data-placeholder-link]').forEach(function (a) {
      if (a.getAttribute('href') !== '#') return;
      a.addEventListener('click', function (e) { e.preventDefault(); });
      a.setAttribute('title', 'Demo link coming soon');
    });
  }

  function initYear() {
    var el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  }

  initBoot();
  initNav();
  initScrollSpy();
  initReveal();
  initParallax();
  initFilters();
  initTimeline();
  initCopyEmail();
  initPlaceholderLinks();
  initYear();
})();
