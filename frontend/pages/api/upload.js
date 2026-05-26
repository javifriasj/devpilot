// Este endpoint proxy recibe el form-data del frontend y lo reenvía al backend FastAPI
export const config = {
  api: {
    bodyParser: false,
  },
}

const formidable = require('formidable');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }

  const form = new formidable.IncomingForm();

  return await new Promise((resolve) => {
    form.parse(req, async (err, fields, files) => {
      try {
        if (err) {
          if (!res.headersSent) res.status(400).json({ error: 'Error al procesar el formulario' });
          resolve();
          return;
        }

        let file = files.repo;
        if (!file) {
          if (!res.headersSent) res.status(400).json({ error: 'No se envió archivo ZIP' });
          resolve();
          return;
        }

        // formidable puede devolver un array o diferentes nombres de propiedad según la versión
        if (Array.isArray(file)) file = file[0];
        const fs = require('fs');
        const FormData = require('form-data');

        // intentar varias propiedades comunes para obtener la ruta temporal del archivo
        const filePath = file?.filepath || file?.path || file?.file?.filepath || file?.file?.path;
        const filename = file?.originalFilename || file?.originalName || file?.name || 'upload.zip';

        if (!filePath || typeof filePath !== 'string') {
          console.error('Upload: missing file path from formidable', { file });
          if (!res.headersSent) res.status(400).json({ error: 'No se pudo leer el archivo subido', details: 'file.path missing' });
          resolve();
          return;
        }

        // Reenviar el archivo al backend FastAPI
        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath), filename);
        const apiUrl = (process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, '') || 'http://localhost:8000') + '/upload-zip';
        try {
          // log formidable file info for debugging
          try { console.info('Formidable files:', Object.keys(files), files) } catch (e) { console.warn('Could not log files', e) }

          // Use node-fetch explicitly to ensure compatibility with the 'form-data' package
          const mod = await import('node-fetch');
          const fetchFn = mod.default || mod;

          // Calculate content-length when possible and include it in headers
          const headers = formData.getHeaders();
          try {
            const getLength = () => new Promise((resolve, reject) => {
              formData.getLength((err, length) => err ? reject(err) : resolve(length));
            });
            const length = await getLength();
            if (typeof length === 'number') headers['Content-Length'] = length;
          } catch (e) {
            // ignore length errors; fetch will stream the body
            console.warn('Could not calculate form-data length', e);
          }

          const resp = await fetchFn(apiUrl, {
            method: 'POST',
            body: formData,
            headers,
          });

          // read text first to avoid json parse errors on empty body
          const text = await resp.text();
          console.info('Backend response status:', resp.status);
          console.info('Backend response body:', text);

          let parsed = null;
          try { parsed = text ? JSON.parse(text) : null } catch (e) { parsed = text }

          if (!res.headersSent) {
            if (parsed === null) res.status(resp.status).send('')
            else res.status(resp.status).json(parsed)
          }
          resolve();
          return;
        } catch (e) {
          console.error('Upload proxy fetch error', e);
          if (!res.headersSent) res.status(500).json({ error: 'Error al conectar con el backend' });
          resolve();
          return;
        }
      } catch (e) {
        console.error('Unexpected error in upload handler', e);
        if (!res.headersSent) res.status(500).json({ error: 'Error interno' });
        resolve();
        return;
      }
    });
  });
}
