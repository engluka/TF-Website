/* Transport Futures — Main JS */

// ---- Nav scroll ----
const nav = document.getElementById('mainNav');
if (nav) {
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ---- Active nav link ----
(function () {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();

// ---- Mobile menu ----
const hamburger    = document.getElementById('hamburger');
const mobileMenu   = document.getElementById('mobileMenu');
const mobileClose  = document.getElementById('mobileClose');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
}
if (mobileClose && mobileMenu) {
  mobileClose.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
}
document.querySelectorAll('.nav-mobile a').forEach(a => {
  a.addEventListener('click', () => {
    mobileMenu && mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ---- Reveal on scroll ----
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Fallback: reveal elements already in the viewport on page load
window.addEventListener('load', () => {
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('visible');
  });
});

// ---- In-page anchor scrolling (robust to late-loading content) ----
// cms-render.js injects the News/Research sections after fetching their JSON,
// which grows the page and pushes lower anchors (e.g. #newsletter) further down.
// If a hash link is followed before that content lands, the browser scrolls to a
// stale position — that's why the first "Subscribe" click stopped at News &
// Commentary and only the second reached the form. Gate same-page hash scrolling
// until cms-render signals (via 'cms:rendered') that the dynamic content is in.
(function () {
  const page = (location.pathname.split('/').pop() || 'index').replace(/\.html$/, '');
  const hasDynamic = ['index', '', 'research', 'events', 'team'].includes(page);
  let ready = !hasDynamic;
  document.addEventListener('cms:rendered', () => { ready = true; }, { once: true });

  function scrollToId(id) {
    const target = document.getElementById(id);
    if (!target) return;
    const go = () => target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (ready) { go(); return; }
    let done = false;
    const once = () => { if (done) return; done = true; go(); };
    document.addEventListener('cms:rendered', once, { once: true });
    setTimeout(once, 2500); // safety net if rendering never signals
  }

  document.querySelectorAll('a[href*="#"]').forEach(a => {
    let url;
    try { url = new URL(a.getAttribute('href'), location.href); } catch { return; }
    if (url.pathname !== location.pathname || !url.hash || url.hash === '#') return;
    a.addEventListener('click', e => {
      const id = decodeURIComponent(url.hash.slice(1));
      if (!document.getElementById(id)) return;
      e.preventDefault();
      history.pushState(null, '', url.hash);
      scrollToId(id);
    });
  });

  // Arriving with a hash from another page (e.g. index.html#newsletter): the
  // browser's initial jump fires before the dynamic content lands, so realign.
  if (location.hash && location.hash !== '#') {
    window.addEventListener('load', () => scrollToId(decodeURIComponent(location.hash.slice(1))));
  }
})();

// ---- Counter animation ----
function runCounter(el) {
  const target   = parseInt(el.dataset.count, 10);
  const suffix   = el.dataset.suffix || '';
  const duration = 1800;
  const start    = performance.now();
  const update   = now => {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target).toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      runCounter(e.target);
      counterObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

// ---- Panel bar animation ----
const barObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.panel-bar-fill').forEach(bar => {
        const w = bar.dataset.width || '0%';
        setTimeout(() => { bar.style.width = w; }, 200);
      });
      barObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.hero-panel').forEach(el => {
  el.querySelectorAll('.panel-bar-fill').forEach(b => { b.style.width = '0'; });
  barObserver.observe(el);
});

// ---- Research filter ----
const filterBtns   = document.querySelectorAll('.filter-btn');
const researchCards = document.querySelectorAll('.research-card');

if (filterBtns.length) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      researchCards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.style.opacity = match ? '1' : '0';
        card.style.transform = match ? 'scale(1)' : 'scale(0.97)';
        card.style.pointerEvents = match ? '' : 'none';
        setTimeout(() => {
          card.style.display = match ? '' : 'none';
        }, match ? 0 : 300);
        if (match) {
          requestAnimationFrame(() => { card.style.display = ''; });
        }
      });
    });
  });
}

// ---- Hero rotating word (typewriter) ----
const rotatingWord = document.querySelector('.hero-word-rotate');
if (rotatingWord) {
  const words = ['Transport', 'Mobility', 'Cities', 'People'];
  let idx = 0;

  function typeWord(word, done) {
    let i = 0;
    rotatingWord.textContent = '';
    (function type() {
      rotatingWord.textContent = word.slice(0, ++i);
      if (i < word.length) setTimeout(type, 100);
      else done();
    })();
  }

  function deleteWord(done) {
    (function del() {
      const cur = rotatingWord.textContent;
      if (cur.length === 0) { done(); return; }
      rotatingWord.textContent = cur.slice(0, -1);
      setTimeout(del, 60);
    })();
  }

  function loop() {
    typeWord(words[idx], () => {
      setTimeout(() => {
        deleteWord(() => {
          idx = (idx + 1) % words.length;
          setTimeout(loop, 400);
        });
      }, 1800);
    });
  }

  loop();
}

// ---- Newsletter form (Brevo) ----
const nlForm = document.querySelector('.newsletter-form');
if (nlForm) {
  nlForm.addEventListener('submit', async e => {
    e.preventDefault();
    const btn   = nlForm.querySelector('button');
    const input = nlForm.querySelector('input[type="email"]');
    const email = input.value.trim();
    if (!email) return;

    const originalText = btn.textContent;
    btn.textContent = 'Subscribing…';
    btn.disabled = true;

    try {
      const res = await fetch('/.netlify/functions/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (res.ok || res.status === 204) {
        let alreadySubscribed = false;
        try {
          ({ alreadySubscribed } = await res.json());
        } catch { /* no JSON body */ }

        input.value = '';
        input.placeholder = alreadySubscribed
          ? "You're already subscribed!"
          : 'Thanks for subscribing!';
        btn.textContent = alreadySubscribed ? 'Already subscribed' : 'Subscribed!';
        btn.style.background = '#059669';
        btn.style.borderColor = '#059669';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
          btn.style.borderColor = '';
          btn.disabled = false;
          input.placeholder = 'Your email address';
        }, 4000);
      } else {
        throw new Error();
      }
    } catch {
      btn.textContent = 'Try again';
      btn.disabled = false;
    }
  });
}

// ---- Contact form (Formspree) ----
// Replace YOUR_FORM_ID below with the ID from formspree.io/forms
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xvzyyelv';

const ctForm = document.querySelector('.contact-form');
if (ctForm) {
  ctForm.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = ctForm.querySelector('button[type="submit"]');
    const successMsg = document.getElementById('formSuccess');

    btn.textContent = 'Sending…';
    btn.disabled = true;

    try {
      const data = new FormData(ctForm);
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' }
      });

      if (res.ok) {
        btn.style.display = 'none';
        if (successMsg) successMsg.style.display = 'flex';
        ctForm.reset();
      } else {
        btn.textContent = 'Failed — try again';
        btn.disabled = false;
      }
    } catch {
      btn.textContent = 'Failed — try again';
      btn.disabled = false;
    }
  });
}
