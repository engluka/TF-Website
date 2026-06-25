# Transport Futures — Brand Typography & Letterhead

Our signature in every piece of communication — letters, decks, reports, email — is
the **typeface pairing plus the navy/teal palette**. Used consistently, these become
recognisable as "Transport Futures" before anyone reads a word.

## The signature font: **Space Grotesk**

Space Grotesk is our **branding symbol**. It's a geometric grotesque with subtly
unconventional letterforms (the angled "G", the squared terminals) — distinctive
enough to own, neutral enough to stay serious. It already drives the headlines on
our website, so print and web now speak with one voice.

**Use it for:** the wordmark, letter subject lines, headings, report titles, pull
quotes, deck headers, and any short uppercase label (with `letter-spacing: .2em`).

- Weights: 400 / 500 / 600 / 700
- Google Fonts: <https://fonts.google.com/specimen/Space+Grotesk>

## The body font: **Manrope**

Manrope is the quiet workhorse — a clean, open sans that stays readable at small sizes
in long letters and paragraphs.

**Use it for:** all running text, addresses, contact details, captions, footnotes.

- Weights: 300 / 400 / 500 / 600
- Google Fonts: <https://fonts.google.com/specimen/Manrope>

> **Fallback (no internet / Office docs):** Space Grotesk → Arial Bold for headings;
> Manrope → Arial/Calibri for body. The hierarchy survives even without the web fonts.

## Colour palette

| Role            | Name      | HEX       | Use                                  |
|-----------------|-----------|-----------|--------------------------------------|
| Primary         | Navy      | `#0A1628` | Wordmark, headings, footer band      |
| Accent          | Teal      | `#00C4CC` | Logo mark, rules, links, highlights  |
| Accent (deep)   | Teal 700  | `#009AA0` | Hover/print-safe accent, dividers    |
| Text            | Ink       | `#0e1c33` | Body copy                            |
| Muted text      | Grey      | `#4E617F` | Secondary lines, captions            |
| Hairline        | Grey line | `#E8ECF3` | Dividers on light backgrounds        |

## The communication set

All four pieces live in `brand/` and share the same logo, fonts, and palette.

| File | What it is | How to use |
|------|------------|------------|
| `letterhead.html` | A4 letter, browser/PDF | Edit `[ … ]`, then Ctrl/Cmd+P → Save as PDF |
| `letterhead.docx` | A4 letter, Microsoft Word | Edit `[ … ]` in Word — header/footer repeat on every page |
| `email-signature.html` | Email signature | Open, edit name/title, copy the framed block, paste into Gmail/Outlook |
| `brand-typography.md` | This guide | Reference for fonts, colours, usage |

**Printing the HTML letter:** `Ctrl/Cmd + P` → **Save as PDF**, paper **A4**,
margins **None**, **"Background graphics" ON** (so the teal spine + navy footer print).
The logo is embedded as a data URI, so the file is fully self-contained.

**Word (.docx):** the logo and contact details sit in the page header/footer, so they
repeat automatically on multi-page letters. Just type your letter in the body. If
Space Grotesk / Manrope aren't installed on the machine, Word substitutes a sans-serif
and the layout still holds.

**Email signature:** the logo loads from `https://transportfutures.org/images/logo.png`,
so it must remain published for the image to appear in recipients' inboxes. Email
clients don't load Google Fonts — the signature falls back to Arial/Helvetica by design,
which keeps the navy/teal identity intact.
