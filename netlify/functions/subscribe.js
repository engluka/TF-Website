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

    const text = await res.text();

    if (res.ok || res.status === 204) {
      return { statusCode: 200, body: 'OK' };
    }

    return { statusCode: res.status, body: text };
  } catch (err) {
    return { statusCode: 500, body: err.message };
  }
};
