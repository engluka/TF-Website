/* cms-render.js — fetches JSON data and renders dynamic content sections */

const ARROW_SM = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>`;
const ARROW_DL = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v9M4 8l4 4 4-4M2 14h12" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ICON_CAL = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="12" height="12" rx="1.5"/><path d="M2 7h12M6 3V1M10 3V1"/></svg>`;
const ICON_PIN = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 1C5.24 1 3 3.24 3 6c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5z"/><circle cx="8" cy="6" r="1.5"/></svg>`;
const ICON_SCREEN = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="4" width="14" height="10" rx="1.5"/><path d="M11 4V3a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v1"/></svg>`;

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#1a3a5c,#0A1628)',
  'linear-gradient(135deg,#2d5282,#112240)',
  'linear-gradient(135deg,#164e63,#0e3851)',
  'linear-gradient(135deg,#1e3a5f,#0a2040)',
  'linear-gradient(135deg,#0d3b4f,#081e2a)',
  'linear-gradient(135deg,#1f2d5a,#0a1628)',
  'linear-gradient(135deg,#1a4040,#0a2428)',
  'linear-gradient(135deg,#2c1e5c,#120a28)'
];

async function loadJSON(path) {
  const res = await fetch(path + '?v=' + Date.now(), { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load ' + path);
  return res.json();
}

// Escape a string for safe use inside a double-quoted HTML attribute.
function escapeAttr(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ---- Research Page ----
async function renderResearch() {
  const featuredEl = document.getElementById('featured-report');
  const gridEl = document.getElementById('research-grid');
  if (!featuredEl && !gridEl) return;

  const { papers } = await loadJSON('data/research.json');

  if (featuredEl) {
    const f = papers.find(p => p.featured) || papers[0];
    featuredEl.innerHTML = `
      <div class="featured-report-content">
        <div class="label">Featured Report — ${f.date_display}</div>
        <h3>${f.title}</h3>
        <p>${f.summary}</p>
        ${f.pdf_url ? `<a href="${f.pdf_url}" class="btn btn-primary" style="margin-top:1.5rem">Download Full Report (PDF) ${ARROW_DL}</a>` : ''}
      </div>
      <div class="featured-report-cta">
        <div style="text-align:center;padding:2rem;background:rgba(0,196,204,.1);border:1px solid rgba(0,196,204,.2);border-radius:var(--r-lg)">
          ${f.featured_pages ? `<div style="font-family:var(--font-display);font-size:3.5rem;font-weight:800;color:var(--c-teal);line-height:1">${f.featured_pages}</div><div style="color:rgba(255,255,255,.5);font-size:.8rem;margin-top:.35rem;letter-spacing:.06em">pages</div>` : ''}
          ${f.featured_cities ? `<div style="margin-top:1.25rem;font-family:var(--font-display);font-size:3.5rem;font-weight:800;color:var(--c-teal);line-height:1">${f.featured_cities}</div><div style="color:rgba(255,255,255,.5);font-size:.8rem;margin-top:.35rem;letter-spacing:.06em">cities studied</div>` : ''}
        </div>
      </div>`;
  }

  if (gridEl) {
    gridEl.innerHTML = papers.map(p => `
      <div class="r-card research-card" data-category="${p.category}">
        ${p.image ? `<img src="${p.image}" alt="${p.title}" style="width:100%;height:180px;object-fit:cover;border-radius:var(--r-md) var(--r-md) 0 0;display:block">` : ''}
        <div class="r-card-body">
          <span class="r-card-tag">${p.tag}</span>
          <h4>${p.title}</h4>
          <p>${p.summary}</p>
        </div>
        <div class="r-card-footer">
          <span class="r-card-date">${p.date_display}</span>
          <a href="${p.pdf_url || '#'}" class="r-card-link">Read ${ARROW_SM}</a>
        </div>
      </div>`).join('');

    initResearchFilter();
  }
}

function initResearchFilter() {
  const btns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.research-card');
  if (!btns.length) return;
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      cards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.style.opacity = match ? '1' : '0';
        card.style.transform = match ? 'scale(1)' : 'scale(0.97)';
        card.style.pointerEvents = match ? '' : 'none';
        setTimeout(() => { card.style.display = match ? '' : 'none'; }, match ? 0 : 300);
        if (match) requestAnimationFrame(() => { card.style.display = ''; });
      });
    });
  });
}

// ---- Events Page ----
// Parse a "YYYY-MM-DD" sort date into a local-midnight Date (null if missing/invalid).
function parseEventDate(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || '');
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
}

// An event is "past" once it has fully concluded — strictly before today.
// Multi-day events use end_date if present, otherwise the start date.
function eventHasPassed(ev, today) {
  const ref = parseEventDate(ev.end_date) || parseEventDate(ev.date);
  return ref ? ref < today : false; // no/invalid date → keep it in upcoming
}

// Sort key for chronological ordering; undated events sort to the end.
function eventDateKey(ev) {
  const d = parseEventDate(ev.date);
  return d ? d.getTime() : Number.POSITIVE_INFINITY;
}

async function renderEvents() {
  const upcomingEl = document.getElementById('events-upcoming');
  const pastEl = document.getElementById('events-past');
  if (!upcomingEl && !pastEl) return;

  const data = await loadJSON('data/events.json');

  // Reclassify at render time: any "upcoming" event whose date has passed moves
  // into the past list, so the page stays current without editing the JSON.
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const allUpcoming = Array.isArray(data.upcoming) ? data.upcoming : [];
  const stillUpcoming = allUpcoming
    .filter(ev => !eventHasPassed(ev, today))
    .sort((a, b) => eventDateKey(a) - eventDateKey(b)); // soonest first
  const justPassed = allUpcoming
    .filter(ev => eventHasPassed(ev, today))
    .sort((a, b) => eventDateKey(b) - eventDateKey(a)); // most recent first

  // Freshly-passed events are the most recent, so they lead the past list.
  const pastEvents = justPassed.concat(Array.isArray(data.past) ? data.past : []);

  if (upcomingEl) {
    upcomingEl.innerHTML = stillUpcoming.map(ev => {
      const isOnline = /online|zoom/i.test(ev.location);
      const btnClass = `btn ${ev.registration_style || 'btn-ghost'}`;
      const btnStyle = 'padding:.65rem 1.5rem;font-size:.82rem';
      let regBtn = '';
      if (ev.registration_action === 'waitlist') {
        // Opens the in-page waiting-list sign-up modal (wired up below)
        regBtn = `<button type="button" class="${btnClass} js-waitlist-open" data-event-title="${escapeAttr(ev.title)}" style="${btnStyle}">${ev.registration_label || 'Join Waiting List'}</button>`;
      } else if (ev.registration_url && ev.registration_url !== '#') {
        regBtn = `<a href="${ev.registration_url}" class="${btnClass}" style="${btnStyle}">${ev.registration_label || 'Register'}</a>`;
      }
      return `
        <div class="event-item">
          <div class="event-date-box">
            <div class="day">${ev.day}</div>
            <div class="mon">${ev.month}</div>
          </div>
          <div class="event-info">
            <div class="event-tag">${ev.type}</div>
            <h4>${ev.title}</h4>
            <div class="event-meta-row">
              <div class="event-meta-item">${ICON_CAL} ${ev.date_display}</div>
              <div class="event-meta-item">${isOnline ? ICON_SCREEN : ICON_PIN} ${ev.location}</div>
            </div>
            <p>${ev.description}</p>
            ${regBtn ? `<div style="margin-top:1rem">${regBtn}</div>` : ''}
          </div>
        </div>`;
    }).join('');

    initWaitlist(upcomingEl);
  }

  if (pastEl) {
    pastEl.innerHTML = pastEvents.map(ev => `
      <div class="past-event-item">
        <h6>${ev.title}</h6>
        <span>${ev.date_display} · ${ev.location}</span>
      </div>`).join('');
  }
}

// ---- Waiting-list sign-up modal ----
// Injects a single shared modal and wires up every "Join Waiting List" button.
// Submitting registers the email on the dedicated Brevo waiting-list via the
// existing /subscribe function (type: 'waitlist'), mirroring the newsletter UX.
function initWaitlist(scopeEl) {
  const triggers = scopeEl.querySelectorAll('.js-waitlist-open');
  if (!triggers.length) return;

  // Build the modal once
  let modal = document.getElementById('waitlist-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'waitlist-modal';
    modal.className = 'waitlist-modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="waitlist-backdrop" data-wl-close></div>
      <div class="waitlist-card" role="dialog" aria-modal="true" aria-labelledby="waitlist-title">
        <button type="button" class="waitlist-close" data-wl-close aria-label="Close">&#x2715;</button>
        <div class="label">Waiting List</div>
        <h3 id="waitlist-title">Join the waiting list</h3>
        <p class="waitlist-event"></p>
        <p class="waitlist-intro">Add your email and we'll let you know as soon as registration opens.</p>
        <form class="waitlist-form">
          <input type="email" name="email" placeholder="Your email address" required aria-label="Email address">
          <button type="submit" class="btn btn-primary">Join</button>
        </form>
      </div>`;
    document.body.appendChild(modal);
  }

  const card     = modal.querySelector('.waitlist-card');
  const eventEl  = modal.querySelector('.waitlist-event');
  const form     = modal.querySelector('.waitlist-form');
  const input    = form.querySelector('input[type="email"]');
  const submitBtn = form.querySelector('button[type="submit"]');
  let lastTrigger = null;
  let currentEvent = '';

  const open = (trigger) => {
    lastTrigger = trigger;
    currentEvent = trigger.dataset.eventTitle || '';
    eventEl.textContent = currentEvent;
    // Reset form state each time it opens
    form.style.display = '';
    input.value = '';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Join';
    submitBtn.style.background = '';
    submitBtn.style.borderColor = '';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => input.focus(), 50);
  };

  const close = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastTrigger) lastTrigger.focus();
  };

  triggers.forEach(t => t.addEventListener('click', () => open(t)));
  modal.querySelectorAll('[data-wl-close]').forEach(el => el.addEventListener('click', close));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) close();
  });
  // Don't let clicks inside the card bubble to the backdrop
  card.addEventListener('click', e => e.stopPropagation());

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const email = input.value.trim();
    if (!email) return;

    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Joining…';
    submitBtn.disabled = true;

    try {
      const res = await fetch('/.netlify/functions/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'waitlist', eventTitle: currentEvent })
      });

      if (res.ok || res.status === 204) {
        let alreadySubscribed = false;
        try { ({ alreadySubscribed } = await res.json()); } catch { /* no JSON body */ }

        submitBtn.textContent = alreadySubscribed ? 'Already on the list' : "You're on the list!";
        submitBtn.style.background = '#059669';
        submitBtn.style.borderColor = '#059669';
        input.value = '';
        setTimeout(close, 1800);
      } else {
        throw new Error();
      }
    } catch {
      submitBtn.textContent = 'Try again';
      submitBtn.disabled = false;
      setTimeout(() => { submitBtn.textContent = originalText; }, 2500);
    }
  });
}

// ---- Team Page ----
async function renderTeam() {
  const gridEl = document.getElementById('team-grid');
  if (!gridEl) return;

  const { members } = await loadJSON('data/team.json');

  gridEl.innerHTML = members.map((m, i) => {
    const grad = AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length];
    const socials = [
      m.twitter_url  ? `<a href="${m.twitter_url}">Twitter</a>`  : '',
      m.linkedin_url ? `<a href="${m.linkedin_url}">LinkedIn</a>` : '',
      m.profile_url  ? `<a href="${m.profile_url}">${m.profile_label || 'Profile'}</a>` : ''
    ].filter(Boolean).join(' · ');

    const avatar = m.photo
      ? `<div class="team-avatar" style="--av-bg:${grad}"><img src="${m.photo}" alt="${m.name}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit;z-index:1"></div>`
      : `<div class="team-avatar" style="--av-bg:${grad}"><span>${m.initials}</span></div>`;

    return `
      <div class="team-card">
        ${avatar}
        <h4>${m.name}</h4>
        <div class="team-role">${m.role}</div>
        <button type="button" class="bio-toggle" aria-expanded="false" aria-controls="team-bio-${i}">
          <span class="bio-toggle-ic" aria-hidden="true"></span>
          <span class="bio-toggle-label">Read bio</span>
        </button>
        <div class="team-bio-wrap" id="team-bio-${i}">
          <div class="team-bio-inner">
            <p>${m.bio}</p>
            ${socials ? `<div class="team-socials">${socials}</div>` : ''}
          </div>
        </div>
      </div>`;
  }).join('');

  // Toggle a card's bio open/closed (event delegation across the grid)
  gridEl.addEventListener('click', e => {
    const btn = e.target.closest('.bio-toggle');
    if (!btn) return;
    const card = btn.closest('.team-card');
    const open = card.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    const label = btn.querySelector('.bio-toggle-label');
    if (label) label.textContent = open ? 'Hide bio' : 'Read bio';
  });
}

// ---- Site Settings ----
async function applySettings() {
  const s = await loadJSON('data/settings.json');

  // Hero background image
  if (s.hero_image) {
    const hero = document.querySelector('.hero');
    if (hero) {
      hero.style.backgroundImage =
        `linear-gradient(105deg,rgba(10,22,40,0.97) 38%,rgba(10,22,40,0.72) 70%,rgba(10,22,40,0.55) 100%),url('${s.hero_image}')`;
      hero.style.backgroundSize = 'auto, cover';
      hero.style.backgroundPosition = 'center, center 40%';
      hero.style.backgroundRepeat = 'no-repeat, no-repeat';
    }
  }

  // Hero title — DOM manipulation (not innerHTML) to keep the live .hero-word-rotate
  // node that main.js already holds a reference to
  if (s.hero_title) {
    const h1 = document.querySelector('.hero h1');
    if (h1) {
      const accentSpan = h1.querySelector('.accent');
      h1.innerHTML = '';
      s.hero_title.split('\n').forEach((line, i, arr) => {
        h1.appendChild(document.createTextNode(line));
        if (i < arr.length - 1) h1.appendChild(document.createElement('br'));
      });
      if (accentSpan) {
        h1.appendChild(document.createTextNode(' '));
        h1.appendChild(accentSpan);
      }
    }
  }

  // Hero subtitle
  if (s.hero_subtitle) {
    const desc = document.querySelector('.hero-desc');
    if (desc) desc.textContent = s.hero_subtitle;
  }

  // Stats
  const statMap = {
    '[data-count="47"]': s.stat_reports,
    '[data-count="18"]': s.stat_countries,
    '[data-count="800"]': s.stat_practitioners
  };
  Object.entries(statMap).forEach(([sel, val]) => {
    document.querySelectorAll(sel).forEach(el => {
      el.dataset.count = val;
      el.textContent = val;
    });
  });
}

// ---- Home Page ----
async function renderHome() {
  const researchEl = document.getElementById('home-research-grid');
  const newsFeatEl = document.getElementById('home-news-featured');
  const newsListEl = document.getElementById('home-news-list');
  if (!researchEl && !newsFeatEl && !newsListEl) return;

  const [researchData, newsData] = await Promise.all([
    loadJSON('data/research.json'),
    loadJSON('data/news.json')
  ]);

  if (researchEl) {
    researchEl.innerHTML = researchData.papers.slice(0, 3).map(p => `
      <div class="r-card">
        <div class="r-card-body">
          <span class="r-card-tag">${p.tag}</span>
          <h4>${p.title}</h4>
          <p>${p.summary}</p>
        </div>
        <div class="r-card-footer">
          <span class="r-card-date">${p.date_display}</span>
          <a href="research.html" class="r-card-link">Read Report ${ARROW_SM}</a>
        </div>
      </div>`).join('');
  }

  if (newsFeatEl && newsData.featured) {
    const f = newsData.featured;
    newsFeatEl.innerHTML = `
      <div class="news-img" ${f.image ? `style="background-image:url('${f.image}');background-size:cover;background-position:center"` : ''}>
        ${!f.image ? '<div class="news-img-deco"></div><div class="news-img-deco2"></div>' : ''}
        <span class="news-img-tag">${f.type}</span>
      </div>
      <div class="news-featured-body">
        <h3>${f.title}</h3>
        <p>${f.summary}</p>
        <div class="news-featured-foot">
          <span class="news-date">${f.date_display}</span>
          ${f.url ? `<a href="${f.url}" class="btn btn-ghost" style="padding:.6rem 1.25rem;font-size:.78rem">Read More</a>` : ''}
        </div>
      </div>`;
  }

  if (newsListEl) {
    newsListEl.innerHTML = newsData.items.slice(0, 4).map((item, i) => `
      <div class="news-item">
        ${item.image ? `<img src="${item.image}" alt="" style="width:64px;height:64px;object-fit:cover;border-radius:var(--r-sm);flex-shrink:0">` : `<div class="news-item-n">0${i + 1}</div>`}
        <div class="news-item-body">
          <h4>${item.title}</h4>
          <p>${item.summary}</p>
          <div class="news-item-date">${item.date_display}</div>
        </div>
      </div>`).join('');
  }
}

// ---- Init ----
// Tell the rest of the page when dynamic sections have been injected. They grow
// the document, so anything that scrolls to an anchor (e.g. the Subscribe link
// → #newsletter) must wait for this so it doesn't target a stale position.
function signalRendered() {
  document.dispatchEvent(new Event('cms:rendered'));
}

const _page = window.location.pathname.split('/').pop().replace(/\.html$/, '') || 'index';
if (_page === 'index' || _page === '') {
  applySettings().catch(console.error);
  renderHome().catch(console.error).finally(signalRendered);
} else if (_page === 'research') renderResearch().catch(console.error).finally(signalRendered);
else if (_page === 'events')     renderEvents().catch(console.error).finally(signalRendered);
else if (_page === 'team')       renderTeam().catch(console.error).finally(signalRendered);
