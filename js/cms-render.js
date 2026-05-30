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
  const res = await fetch(path);
  if (!res.ok) throw new Error('Failed to load ' + path);
  return res.json();
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
async function renderEvents() {
  const upcomingEl = document.getElementById('events-upcoming');
  const pastEl = document.getElementById('events-past');
  if (!upcomingEl && !pastEl) return;

  const data = await loadJSON('data/events.json');

  if (upcomingEl) {
    upcomingEl.innerHTML = data.upcoming.map(ev => {
      const isOnline = /online|zoom/i.test(ev.location);
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
            ${ev.registration_url ? `<div style="margin-top:1rem"><a href="${ev.registration_url}" class="btn ${ev.registration_style || 'btn-ghost'}" style="padding:.65rem 1.5rem;font-size:.82rem">${ev.registration_label || 'Register'}</a></div>` : ''}
          </div>
        </div>`;
    }).join('');
  }

  if (pastEl) {
    pastEl.innerHTML = data.past.map(ev => `
      <div class="past-event-item">
        <h6>${ev.title}</h6>
        <span>${ev.date_display} · ${ev.location}</span>
      </div>`).join('');
  }
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
        <p>${m.bio}</p>
        ${socials ? `<div class="team-socials">${socials}</div>` : ''}
      </div>`;
  }).join('');
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
      <div class="news-img">
        <div class="news-img-deco"></div>
        <div class="news-img-deco2"></div>
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
        <div class="news-item-n">0${i + 1}</div>
        <div class="news-item-body">
          <h4>${item.title}</h4>
          <p>${item.summary}</p>
          <div class="news-item-date">${item.date_display}</div>
        </div>
      </div>`).join('');
  }
}

// ---- Init ----
const _page = window.location.pathname.split('/').pop() || 'index.html';
if (_page === 'research.html')      renderResearch().catch(console.error);
else if (_page === 'events.html')   renderEvents().catch(console.error);
else if (_page === 'team.html')     renderTeam().catch(console.error);
else if (_page === 'index.html' || _page === '') renderHome().catch(console.error);
