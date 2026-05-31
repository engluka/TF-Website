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

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let email;
  try {
    ({ email } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  if (!email) {
    return { statusCode: 400, body: 'Email required' };
  }

  if (!process.env.BREVO_API_KEY) {
    return { statusCode: 500, body: 'Missing API key' };
  }

  try {
    const res = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, listIds: [3], updateEnabled: true })
    });

    if (!res.ok && res.status !== 204) {
      const text = await res.text();
      return { statusCode: res.status, body: text };
    }

    // Brevo returns 201 when a new contact is created and 204 when an existing
    // contact is updated — use that to flag a repeat subscriber.
    const alreadySubscribed = res.status === 204;

    // Only welcome brand-new subscribers (don't fail the request if this errors)
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
            subject: 'Welcome to Transport Futures',
            htmlContent: welcomeEmail
          })
        });
      } catch (e) {
        console.error('Welcome email failed:', e.message);
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
