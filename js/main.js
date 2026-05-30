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
    const email = nlForm.querySelector('input[type="email"]').value.trim();
    if (!email) return;

    btn.textContent = 'Subscribing…';
    btn.disabled = true;

    try {
      const res = await fetch('/.netlify/functions/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (res.ok || res.status === 204) {
        btn.textContent = 'Subscribed!';
        btn.style.background = '#059669';
        btn.style.borderColor = '#059669';
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
