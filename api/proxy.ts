// api/proxy.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const API_ENDPOINT = process.env.AI_ENDPOINT;
    const API_KEY = process.env.AI_API_KEY;

    if (!API_ENDPOINT || !API_KEY) {
      return res.status(500).json({ error: 'API endpoint or API key not configured' });
    }

    const payload = req.body || {};

    const r = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const text = await r.text();
    const contentType = r.headers.get('content-type') || 'application/json';
    res.status(r.status).setHeader('content-type', contentType).send(text);

  } catch (err) {
    console.error('Proxy error', err);
    res.status(500).json({ error: 'Proxy internal error' });
  }
}
