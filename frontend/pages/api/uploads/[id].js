import { NextApiRequest, NextApiResponse } from 'next'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  const { id } = req.query
  if (req.method !== 'DELETE') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const apiUrl = (process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, '') || '') + `/upload-zip/${id}`
  try {
    const mod = await import('node-fetch')
    const fetchFn = mod.default || mod
    const resp = await fetchFn(apiUrl, { method: 'DELETE' })
    const text = await resp.text()
    res.status(resp.status).send(text)
  } catch (e) {
    console.error('Proxy delete error', e)
    res.status(500).json({ error: 'Proxy error' })
  }
}
