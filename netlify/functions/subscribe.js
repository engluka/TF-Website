const SENDER = { name: 'Transport Futures', email: 'hello@transportfutures.org' };

const welcomeEmail = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#0a1628;line-height:1.6">
    <h2 style="color:#0a1628;margin-bottom:.5rem">Welcome to Transport Futures</h2>
    <p>Thanks for subscribing! You'll now receive our latest research, events, and commentary on sustainable mobility and transport policy across Africa.</p>
    <p style="margin-top:1.5rem">
      <a href="https://transportfutures.org" style="background:#14b8a6;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:bold">Visit our website</a>
    </p>
    <p style="margin-top:2rem;font-size:13px;color:#64748b">If you didn't subscribe, you can safely ignore this email.</p>
  </div>
`;

// Confirmation email for an event waiting-list sign-up. `eventTitle` may be empty.
const waitlistEmail = (eventTitle) => `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#0a1628;line-height:1.6">
    <h2 style="color:#0a1628;margin-bottom:.5rem">You're on the waiting list</h2>
    <p>Thanks for your interest${eventTitle ? ` in <strong>${eventTitle}</strong>` : ''}! We've added you to the waiting list and will email you as soon as registration opens.</p>
    <p style="margin-top:1.5rem">
      <a href="https://transportfutures.org/events.html" style="background:#14b8a6;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:bold">View all events</a>
    </p>
    <p style="margin-top:2rem;font-size:13px;color:#64748b">If you didn't sign up, you can safely ignore this email.</p>
  </div>
`;

// Strip any HTML from the editor-supplied event title before embedding it in email.
function sanitizeTitle(str) {
  return String(str || '').replace(/<[^>]*>/g, '').trim().slice(0, 160);
}

// Whether `email` is already a Brevo contact in `listId`. Lets us welcome an
// existing newsletter subscriber the first time they join a *different* list
// (e.g. an event waiting list). Returns false on 404 or any error.
async function isInList(email, listId, apiKey) {
  try {
    const res = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
      headers: { 'api-key': apiKey, accept: 'application/json' }
    });
    if (!res.ok) return false;
    const data = await res.json();
    return Array.isArray(data.listIds) && data.listIds.includes(listId);
  } catch {
    return false;
  }
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let email, type, eventTitle;
  try {
    ({ email, type, eventTitle } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  if (!email) {
    return { statusCode: 400, body: 'Email required' };
  }

  if (!process.env.BREVO_API_KEY) {
    return { statusCode: 500, body: 'Missing API key' };
  }

  // Route event waiting-list sign-ups to their own Brevo list; everything else
  // goes to the newsletter list (id 3).
  const isWaitlist = type === 'waitlist';
  let listId = 3;
  if (isWaitlist) {
    listId = parseInt(process.env.BREVO_WAITLIST_LIST_ID, 10);
    if (!listId) {
      return { statusCode: 500, body: 'Waiting list is not configured' };
    }
  }
  const cleanTitle = sanitizeTitle(eventTitle);

  // For the waiting list, "already subscribed" means already on *that* list, so
  // existing newsletter contacts still get a confirmation the first time they
  // join. The newsletter path keeps its original 201/204 semantics.
  const alreadyOnWaitlist = isWaitlist
    ? await isInList(email, listId, process.env.BREVO_API_KEY)
    : false;

  try {
    const res = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, listIds: [listId], updateEnabled: true })
    });

    if (!res.ok && res.status !== 204) {
      const text = await res.text();
      return { statusCode: res.status, body: text };
    }

    // Newsletter: Brevo returns 201 for a new contact, 204 when updating an
    // existing one. Waitlist: use actual list membership (checked above).
    const alreadySubscribed = isWaitlist ? alreadyOnWaitlist : res.status === 204;

    // Only email brand-new contacts (don't fail the request if this errors)
    if (!alreadySubscribed) {
      try {
        await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': process.env.BREVO_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sender: SENDER,
            to: [{ email }],
            subject: isWaitlist
              ? `You're on the waiting list${cleanTitle ? ` — ${cleanTitle}` : ''}`
              : 'Welcome to Transport Futures',
            htmlContent: isWaitlist ? waitlistEmail(cleanTitle) : welcomeEmail
          })
        });
      } catch (e) {
        console.error('Confirmation email failed:', e.message);
      }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alreadySubscribed })
    };
  } catch (err) {
    return { statusCode: 500, body: err.message };
  }
};
