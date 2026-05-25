const ENABLED = false; // set to true to show the widget

const FONT_OPTIONS = [
  {
    id: 'space-grotesk',
    label: 'Space Grotesk',
    sub: '+ Manrope',
    url: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;600;700&family=Manrope:wght@300;400;500;600&display=swap',
    display: "'Space Grotesk', sans-serif",
    body: "'Manrope', sans-serif",
  },
  {
    id: 'syne',
    label: 'Syne',
    sub: '+ Inter',
    url: 'https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:ital,wght@0,300;0,400;0,500;1,300&display=swap',
    display: "'Syne', sans-serif",
    body: "'Inter', sans-serif",
  },
  {
    id: 'fraunces',
    label: 'Fraunces',
    sub: '+ Plus Jakarta Sans',
    url: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;0,9..144,800;1,9..144,300&family=Plus+Jakarta+Sans:wght@300;400;500&display=swap',
    display: "'Fraunces', serif",
    body: "'Plus Jakarta Sans', sans-serif",
  },
  {
    id: 'barlow',
    label: 'Barlow Condensed',
    sub: '+ DM Sans (original)',
    url: 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap',
    display: "'Barlow Condensed', sans-serif",
    body: "'DM Sans', sans-serif",
  },
];

const STORAGE_KEY = 'tf_font';

function applyFont(opt) {
  let link = document.getElementById('font-switcher-link');
  if (!link) {
    link = document.createElement('link');
    link.id = 'font-switcher-link';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  link.href = opt.url;
  document.documentElement.style.setProperty('--font-display', opt.display);
  document.documentElement.style.setProperty('--font-body', opt.body);
  localStorage.setItem(STORAGE_KEY, opt.id);
  document.querySelectorAll('.fs-btn').forEach(b => {
    b.classList.toggle('fs-btn--active', b.dataset.id === opt.id);
  });
}

function buildWidget() {
  const style = document.createElement('style');
  style.textContent = `
    #font-switcher {
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      font-family: system-ui, sans-serif; font-size: 13px;
    }
    #fs-toggle {
      background: #00C4CC; color: #0A1628;
      border: none; border-radius: 20px;
      padding: 8px 16px; font-weight: 700; font-size: 12px;
      letter-spacing: .06em; text-transform: uppercase;
      cursor: pointer; box-shadow: 0 4px 20px rgba(0,196,204,.4);
      display: flex; align-items: center; gap: 6px;
    }
    #fs-toggle:hover { background: #00d4dc; }
    #fs-panel {
      background: #0A1628; border: 1px solid rgba(255,255,255,.1);
      border-radius: 12px; padding: 12px;
      margin-bottom: 10px; display: none;
      box-shadow: 0 16px 48px rgba(0,0,0,.5);
      min-width: 220px;
    }
    #fs-panel.open { display: block; }
    #fs-panel h6 {
      color: rgba(255,255,255,.4); font-size: 10px;
      letter-spacing: .12em; text-transform: uppercase;
      margin: 0 0 10px; font-weight: 600;
    }
    .fs-btn {
      display: flex; flex-direction: column;
      width: 100%; text-align: left;
      background: transparent; border: 1px solid rgba(255,255,255,.08);
      border-radius: 8px; padding: 9px 12px; margin-bottom: 6px;
      cursor: pointer; color: rgba(255,255,255,.7);
      transition: all .2s; gap: 1px;
    }
    .fs-btn:last-child { margin-bottom: 0; }
    .fs-btn:hover { border-color: rgba(0,196,204,.5); color: #fff; background: rgba(0,196,204,.06); }
    .fs-btn--active { border-color: #00C4CC; color: #fff; background: rgba(0,196,204,.1); }
    .fs-btn strong { font-size: 13px; font-weight: 600; }
    .fs-btn span { font-size: 11px; color: rgba(255,255,255,.4); }
    .fs-btn--active span { color: #00C4CC; }
  `;
  document.head.appendChild(style);

  const wrapper = document.createElement('div');
  wrapper.id = 'font-switcher';

  const panel = document.createElement('div');
  panel.id = 'fs-panel';
  panel.innerHTML = '<h6>Font pairing</h6>';

  FONT_OPTIONS.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'fs-btn';
    btn.dataset.id = opt.id;
    btn.innerHTML = `<strong>${opt.label}</strong><span>${opt.sub}</span>`;
    btn.addEventListener('click', () => applyFont(opt));
    panel.appendChild(btn);
  });

  const toggle = document.createElement('button');
  toggle.id = 'fs-toggle';
  toggle.innerHTML = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg> Fonts`;
  toggle.addEventListener('click', () => panel.classList.toggle('open'));

  wrapper.appendChild(panel);
  wrapper.appendChild(toggle);
  document.body.appendChild(wrapper);
}

document.addEventListener('DOMContentLoaded', () => {
  if (!ENABLED) return;
  buildWidget();
  const saved = localStorage.getItem(STORAGE_KEY);
  const initial = FONT_OPTIONS.find(o => o.id === saved) || FONT_OPTIONS[0];
  applyFont(initial);
});
