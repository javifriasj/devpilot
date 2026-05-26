// Este endpoint proxy recibe el form-data del frontend y lo reenvía al backend FastAPI
export const config = {
  api: {
    bodyParser: false,
  },
}

const formidable = require('formidable');

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(400).json({ error: 'Error al procesar el formulario' });
      return;
    }
    const file = files.repo;
    if (!file) {
      res.status(400).json({ error: 'No se envió archivo ZIP' });
      return;
    }
    // Reenviar el archivo al backend FastAPI
    const fetch = require('node-fetch');
    const fs = require('fs');
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('file', fs.createReadStream(file.filepath), file.originalFilename);
    const apiUrl = (process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, '') || 'http://localhost:8000') + '/upload-zip';
    try {
      const resp = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
        headers: formData.getHeaders(),
      });
      const data = await resp.json();
      res.status(resp.status).json(data);
    } catch (e) {
      res.status(500).json({ error: 'Error al conectar con el backend' });
    }
  });
}
