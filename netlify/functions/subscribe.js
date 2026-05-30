exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let email;
  try {
    ({ email } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, body: 'Invalid request' };
  }

  if (!email) {
    return { statusCode: 400, body: 'Email required' };
  }

  const res = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, listIds: [3], updateEnabled: true })
  });

  if (res.ok || res.status === 204) {
    return { statusCode: 200, body: 'OK' };
  }

  const err = await res.text();
  return { statusCode: res.status, body: err };
};
