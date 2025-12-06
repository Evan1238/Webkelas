export default async function handler(req, res) {
  // 1. Cek apakah metode request benar (harus POST)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Ambil query makanan dari frontend
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  // 3. Ambil API Key dari brankas Vercel (Environment Variable)
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API Key not configured on server' });
  }

  try {
    // 4. Panggil Google Gemini API dari sisi server (Aman!)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Estimasi kalori untuk "${query}". Return ONLY JSON format: {"name": "FoodName", "cal": 123}. No markdown formatting, no explanation, just the raw JSON object.`
            }]
          }]
        }),
      }
    );

    const data = await response.json();

    // 5. Kirim hasil balik ke frontend
    return res.status(200).json(data);

  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ error: 'Failed to fetch from Google' });
  }
}
