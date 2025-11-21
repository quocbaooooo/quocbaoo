export async function generateText(prompt) {
  const payload = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ]
  };

  const res = await fetch('/api/proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Proxy error: ${res.status} - ${errorText}`);
  }

  return res.json();
}
