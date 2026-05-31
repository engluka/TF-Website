# Transport Futures Website — Build & Operations Manual

*A complete guide to how transportfutures.org is built, what each tool does, how
they connect, what it costs, and how to keep it running. Written so a colleague
with no prior context can understand and maintain the site.*

> **Legend:** ✅ = confirmed from the project code · ⚠️ = account/dashboard detail
> you should verify in the relevant service (not visible in the code).

---

## 1. The one-paragraph summary

The website is a **plain static site** — hand-written HTML, CSS, and JavaScript
with **no framework and no build step**. The code lives in **GitHub**. It is
hosted on **Netlify**, which also runs one small serverless function (the
newsletter signup). Editors change text/content through the **Decap CMS** admin
panel, which saves changes back into GitHub. The **contact form** is handled by
**Formspree**; the **newsletter** is handled by **Brevo**. The domain
(transportfutures.org) is registered/managed via **Squarespace** and/or
**Cloudflare**, which point visitors to Netlify. Publishing to the live site is
done **manually** with one command (auto-publishing is intentionally turned off
to avoid build costs).

---

## 2. Architecture at a glance

```
                        ┌──────────────────────────────────────────┐
   Editors (CMS)        │                 GitHub                    │
   ────────────►        │   engluka/TF-Website  (branch: main)      │
   /admin panel         │   = the single source of truth (code +   │
        │               │     content JSON files)                   │
        │ commits        └───────────────┬──────────────────────────┘
        ▼                                │  manual deploy
   Netlify Identity                      ▼  (netlify deploy --prod)
   + Git Gateway          ┌──────────────────────────────────────────┐
   (CMS login/auth)       │                Netlify                    │
                          │  • Hosts the static files (CDN)           │
                          │  • Runs serverless function: subscribe.js │
                          │  • SSL certificate                        │
                          └───────┬───────────────────────┬──────────┘
                                  │                        │
            visitor submits        │ newsletter signup      │ contact form submit
            ─────────────►         ▼                        ▼
                          ┌─────────────────┐      ┌──────────────────┐
                          │      Brevo       │      │    Formspree      │
                          │  email list +    │      │  form-to-email    │
                          │  welcome email   │      │  delivery         │
                          └─────────────────┘      └──────────────────┘

   DNS / domain path:  Visitor types transportfutures.org
                       → Squarespace (registrar) / Cloudflare (DNS) → Netlify
```

---

## 3. The tools — what each one does

| Tool | Role in plain English | Status |
|------|----------------------|--------|
| **GitHub** | Stores all the code and content. The "master copy." | ✅ `engluka/TF-Website` |
| **Netlify** | Hosts the website, serves it fast worldwide, runs the newsletter function, provides HTTPS. | ✅ site `comfy-seahorse-f83a22` |
| **Decap CMS** | The "admin panel" (`/admin`) where non-coders edit page content. | ✅ |
| **Netlify Identity + Git Gateway** | The login system for the CMS, and the bridge that lets the CMS save into GitHub. | ✅ |
| **Brevo** | Email marketing platform — stores newsletter subscribers and sends the welcome email. | ✅ list ID `3` |
| **Formspree** | Receives contact-form submissions and emails them to you (no server needed). | ✅ form `xvzyyelv` |
| **Cloudflare** | DNS and/or CDN/security layer in front of the domain. | ⚠️ verify role |
| **Squarespace** | Most likely the **domain registrar** (where transportfutures.org is bought/renewed). | ⚠️ verify role |

---

## 4. Each tool in detail — function, setup, cost

### 4.1 GitHub — the source of truth
- **What it is:** A code repository hosting service. The repo `engluka/TF-Website`
  holds every file — the HTML pages, styles, scripts, the content JSON files, and
  the CMS config. The `main` branch is what gets published.
- **Why it matters:** Nothing is "the website" until it's here. Both you (editing
  files directly) and the CMS (editors clicking Publish) put changes here.
- **How it was set up:** Standard GitHub repo. The CMS connects to it through
  Netlify's Git Gateway (see 4.4) so editors never need a GitHub account.
- **Cost:** Free for this use. ✅

### 4.2 Netlify — hosting + functions + HTTPS
- **What it is:** The host. It takes the files and serves them to visitors over a
  global CDN, gives the site an HTTPS certificate, and runs serverless functions.
- **What it runs here:**
  - **Static hosting** of all the `.html`, `css/`, `js/`, `images/`, `data/` files.
  - **One serverless function:** `netlify/functions/subscribe.js` — the newsletter
    signup endpoint (talks to Brevo).
  - **Configuration** is in [`netlify.toml`](netlify.toml): publish directory is the
    repo root (`.`), functions live in `netlify/functions`, Node version 18, plus
    security headers for the `/admin` page.
- **Important setup choice — auto-builds are OFF.** Normally Netlify rebuilds and
  republishes every time GitHub changes. That was **turned off** (Site
  configuration → Build & deploy → Continuous deployment → *Stop builds*) because
  every rebuild consumed paid **build minutes**. Instead the site is published
  **manually** (see Section 6). Manual deploys upload the finished files directly
  and use **zero build minutes**.
- **Key facts:**
  - Site name: `comfy-seahorse-f83a22`
  - Site ID: `1d305c61-d995-4b2b-9c9f-ec75100b936a`
  - Account: `engluka@gmail.com`
  - Live URL: https://transportfutures.org
- **Environment variable it stores:** `BREVO_API_KEY` (the secret key the
  newsletter function uses — lives in Netlify, never in the code). ✅
- **Cost:** Currently the free/Starter tier. Free includes generous bandwidth and
  function calls; the build-minute limit is the thing that was being exceeded,
  which is now sidestepped by manual deploys. ⚠️ confirm current plan in the
  Netlify dashboard → Billing.

### 4.3 Decap CMS — the content editor (`/admin`)
- **What it is:** An open-source content management system (formerly "Netlify
  CMS"). It gives editors a friendly admin panel at
  **https://transportfutures.org/admin** to change page content without touching code.
- **How it works here:** It is loaded in [`admin/index.html`](admin/index.html)
  from a CDN, and its configuration — which fields editors can edit — is in
  [`admin/config.yml`](admin/config.yml). Editors can manage:
  - **Site Settings** (hero title/subtitle/image, the three homepage stats)
  - **Research Papers**, **Events**, **Team Members**, **News & Commentary**
- **Where the content actually lives:** Not in a database — in plain JSON files in
  the [`data/`](data/) folder (`settings.json`, `research.json`, `events.json`,
  `team.json`, `news.json`). When an editor clicks Publish, the CMS commits the
  updated JSON to GitHub. The website's JavaScript ([`js/cms-render.js`](js/cms-render.js))
  reads those JSON files and draws the content onto the page.
- **Editorial workflow:** Turned on (`publish_mode: editorial_workflow`), so CMS
  edits can go through a draft/review step before going to `main`.
- **Cost:** Free (open source). ✅

### 4.4 Netlify Identity + Git Gateway — CMS login
- **What it is:** Two linked Netlify features:
  - **Identity** = the user accounts / login for the `/admin` panel.
  - **Git Gateway** = the secure bridge that lets a logged-in editor write to the
    GitHub repo *without* having their own GitHub account or token.
- **How it's wired:** The homepage loads the Netlify Identity widget; the CMS
  backend in `admin/config.yml` is set to `git-gateway`. Editors log in with email
  invites you send from the Netlify dashboard.
- **To add a new editor:** Netlify dashboard → Identity → *Invite users*. ⚠️
- **Cost:** Free for a small number of users. ⚠️ (Note: Netlify Identity is a
  legacy product — it still works, but keep an eye on Netlify's roadmap.)

### 4.5 Brevo — newsletter / email
- **What it is:** An email marketing + transactional email platform (formerly
  "Sendinblue"). It stores newsletter subscribers and sends email.
- **What it does here:** When a visitor enters their email in the newsletter box,
  the browser calls the Netlify function `subscribe.js`, which:
  1. Adds/updates the contact in Brevo **list ID `3`** (via Brevo's Contacts API).
  2. If they're brand new, sends them a **welcome email** (via Brevo's
     transactional email API) from sender **hello@transportfutures.org**.
  3. Tells the page whether they were new or already subscribed (so the form can
     say "Thanks for subscribing!" vs "You're already subscribed!").
- **The secret key:** `BREVO_API_KEY`, stored as an environment variable in Netlify
  (see 4.2). It is **not** in the code.
- **Setup needed/verify:** ⚠️ The Brevo account must (a) have that API key,
  (b) have a list with ID `3`, and (c) have `hello@transportfutures.org` verified
  as a sender for the welcome email to send.
- **Cost:** Brevo has a free tier (limited emails/day) and paid plans above that.
  ⚠️ confirm the plan in the Brevo dashboard.

### 4.6 Formspree — contact form
- **What it is:** A service that receives form submissions and emails them to you,
  so a static site can have a working contact form with no backend.
- **What it does here:** The contact page form posts to the Formspree endpoint
  **`https://formspree.io/f/xvzyyelv`** (set in [`js/main.js`](js/main.js)). On
  success it shows a thank-you message. Submissions land in your Formspree inbox
  and/or your email.
- **Note:** The newsletter checkbox on the contact form is sent to Formspree as a
  field — it is **not** automatically wired into Brevo. (Mentioned so nobody
  assumes ticking it subscribes them.)
- **Cost:** Formspree free tier covers a limited number of submissions/month; paid
  plans above that. ⚠️ confirm plan.

### 4.7 Cloudflare — DNS / CDN / security ⚠️
- **Likely role:** Managing the domain's DNS records (and possibly acting as a
  CDN/security proxy) so that requests for `transportfutures.org` are directed to
  Netlify.
- **What to verify in the Cloudflare dashboard:**
  - Whether Cloudflare is the **DNS host** (the domain's nameservers point to
    Cloudflare), and what record points the domain at Netlify (a `CNAME`/`A`
    record to Netlify).
  - Whether the **proxy ("orange cloud")** is ON or OFF. ⚠️ **Maintenance tip:** with
    Netlify, it's usually safest to keep Cloudflare in **DNS-only ("grey cloud")**
    mode so Netlify manages SSL — running both proxies can cause SSL/redirect
    conflicts.
- **Cost:** Cloudflare's core DNS/CDN is free. ⚠️

### 4.8 Squarespace — domain registrar ⚠️
- **Likely role:** Where the domain **transportfutures.org** was purchased and is
  renewed (Squarespace runs the former Google Domains registrar). It may also be a
  leftover from a previous version of the site.
- **What to verify:**
  - That the **domain registration/renewal** is here, and when it **expires** (set a
    calendar reminder — an expired domain takes the whole site offline).
  - Whether the **nameservers** point to Cloudflare (4.7) or directly to Netlify.
- **Cost:** Domain registration is typically ~US$20–40/year for a `.org`. ⚠️ confirm.

---

## 5. How it all connects — the workflows

### 5.1 Publishing content (two ways in, one way live)
**A. You edit files on your computer**
1. Edit an `.html` page or a `data/*.json` file.
2. `git add -A` → `git commit -m "..."` → `git push` *(saves to GitHub — does NOT publish)*
3. `.\deploy.ps1` *(this is what actually publishes to the live site)*

**B. An editor uses the CMS**
1. Editor logs in at `/admin`, makes changes, clicks Publish.
2. The CMS commits the updated JSON to GitHub.
3. Because auto-deploy is off, those changes are **in GitHub but not yet live**.
   To publish them: on your computer run `git pull` (to fetch the CMS changes),
   then `.\deploy.ps1`.

> **The golden rule:** GitHub = saved. **Live site = only after a deploy.**
> Pushing or CMS-publishing updates the source; `.\deploy.ps1` publishes it.

### 5.2 Newsletter signup (data flow)
```
Visitor types email → js/main.js → POST /.netlify/functions/subscribe
   → subscribe.js adds contact to Brevo list 3
   → (if new) Brevo sends welcome email from hello@transportfutures.org
   → page shows "Thanks for subscribing!"
```

### 5.3 Contact form (data flow)
```
Visitor fills contact form → js/main.js → POST to Formspree (xvzyyelv)
   → Formspree emails the submission to you → page shows thank-you message
```

### 5.4 A visitor loading the site (request path)
```
Browser → transportfutures.org → DNS (Cloudflare/Squarespace) → Netlify CDN
   → serves HTML/CSS/JS → js/cms-render.js fetches data/*.json → page fills in
```

---

## 6. Maintaining the website

### Routine: publishing a change
From the project folder in PowerShell:
```powershell
# 1. (if editors used the CMS) pull their changes first
git pull

# 2. (if you edited files) save them to GitHub
git add -A
git commit -m "describe the change"
git push

# 3. PUBLISH to the live site  ← the step that makes it live
.\deploy.ps1            # or:  .\deploy.ps1 -Draft   for a preview URL first

# 4. Hard-refresh the browser (Ctrl+F5) to see the change
```

### What to keep an eye on
- **Domain renewal** (Squarespace) — don't let it expire. ⚠️ Set a reminder.
- **SSL certificate** — Netlify auto-renews it; just confirm the site shows the
  padlock occasionally.
- **`BREVO_API_KEY`** — if the newsletter stops working, the key in Netlify may
  have been rotated/expired; regenerate in Brevo and update it in Netlify.
- **Formspree inbox** — check that contact submissions are arriving; confirm the
  form's notification email is current.
- **Editor access** — add/remove CMS users via Netlify Identity as staff change.
- **Decap CMS version** — it's loaded from a CDN; occasionally confirm the admin
  panel still loads after browser/CDN updates.
- **Backups** — GitHub *is* your backup (full history of every change). No separate
  backup needed for content.

### Things that are easy to get wrong
- Editing `<head>` metadata (page title/description) won't show a **visible** change
  on the page — it's for search engines. Test visible edits on visible text.
- Don't double-click HTML files to preview — content loads via `fetch()` and needs
  a server. Use `netlify dev` for local preview.
- A `git push` alone never updates the live site. Always finish with `.\deploy.ps1`.

---

## 7. Costs & subscriptions

> ⚠️ These are typical/expected figures — confirm the actual plan in each
> dashboard, since they depend on usage and any upgrades.

| Service | What you're paying for | Typical cost |
|---------|------------------------|--------------|
| **Domain** (Squarespace) | `transportfutures.org` registration/renewal | ~US$20–40 / year |
| **Netlify** | Hosting + functions + SSL | Free/Starter tier (build minutes avoided via manual deploy); paid only if you exceed free limits |
| **GitHub** | Code + content hosting | Free |
| **Decap CMS** | Content editor | Free (open source) |
| **Netlify Identity** | CMS logins | Free for small teams |
| **Brevo** | Newsletter storage + sending | Free tier, or paid plan if volume is higher |
| **Formspree** | Contact form delivery | Free tier, or paid plan above the submission limit |
| **Cloudflare** | DNS / CDN / security | Free (core plan) |

**Bottom line:** the recurring *guaranteed* cost is the **domain renewal**.
Everything else is currently designed to sit on free tiers; the only way costs
creep up is exceeding free limits (which is exactly why auto-builds were turned
off on Netlify).

---

## 8. Accounts & access checklist

Make sure the organisation (not just one person) has login access to:

- [ ] **GitHub** — the `engluka/TF-Website` repository ⚠️
- [ ] **Netlify** — account `engluka@gmail.com` (hosting, env vars, Identity, billing) ⚠️
- [ ] **Brevo** — newsletter account + API key ⚠️
- [ ] **Formspree** — the account that owns form `xvzyyelv` ⚠️
- [ ] **Cloudflare** — DNS account for the domain ⚠️
- [ ] **Squarespace** — domain registrar account ⚠️

> ⚠️ Several of these are currently tied to personal logins. For continuity,
> consider moving them to a shared organisational email and enabling 2FA.

---

## 9. Quick reference

| Item | Value |
|------|-------|
| Live site | https://transportfutures.org |
| GitHub repo | `engluka/TF-Website` (branch `main`) |
| Netlify site name | `comfy-seahorse-f83a22` |
| Netlify site ID | `1d305c61-d995-4b2b-9c9f-ec75100b936a` |
| CMS admin URL | https://transportfutures.org/admin |
| Newsletter function | `netlify/functions/subscribe.js` → Brevo list `3` |
| Newsletter sender | hello@transportfutures.org |
| Contact form endpoint | `https://formspree.io/f/xvzyyelv` |
| Secret in Netlify | `BREVO_API_KEY` (env var) |
| Publish command | `.\deploy.ps1` (= `netlify deploy --prod`) |
| Auto-deploy | **OFF** (manual deploys only, to avoid build costs) |

---

## 10. Technology summary (for the curious)

- **No framework, no build:** pages are hand-written HTML; styling is in
  `css/styles.css`; behaviour is in `js/main.js` (navigation, animations, forms)
  and `js/cms-render.js` (loads content from `data/*.json`).
- **`js/font-switcher.js`** is a design tool for trying font pairings; it's
  **disabled** in production (`ENABLED = false`) and can be ignored.
- **Why static?** It's fast, cheap, secure (no database to hack), and easy to host.
  The trade-off — no built-in admin — is solved by Decap CMS writing to JSON files.

---

*Last updated: 31 May 2026.*
