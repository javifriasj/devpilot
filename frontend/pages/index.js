import React, { useRef, useState } from "react";

export default function Home() {
  const [dragActive, setDragActive] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  async function subirZip(file) {
    setMensaje(null);
    setError(null);
    setLoading(true);
    try {
      const form = new FormData();
      form.append('repo', file);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (res.ok && (data.mensaje || data.id)) {
        setMensaje(data.mensaje || 'Subida correcta');
        setUploadResult(data.id ? data : null);
      } else {
        setError(data.error || 'Error al subir el archivo');
      }
    } catch (err) {
      setError('Error de red o servidor');
    } finally {
      setLoading(false);
    }
  }

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      subirZip(files[0]);
    }
  };

  const handleChange = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      subirZip(files[0]);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#e7d8c5",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
        color: "#141414",
        padding: 24,
      }}
    >
      {/* Logo image (public) */}
      <div style={{ marginBottom: 18 }}>
        <img src="/devpilot-logo.svg" alt="DevPilot" width={240} height={64} style={{ display: 'block' }} />
      </div>
      {/* Nombre del proyecto */}
      <h1 style={{
        fontSize: 48,
        fontWeight: 800,
        margin: 0,
        color: "#141414",
        letterSpacing: -2,
        textAlign: "center"
      }}>
        DevPilot
      </h1>
      {/* Descripción (oculta tras subir) */}
      {!uploadResult && (
        <p style={{
          fontSize: 20,
          color: "#7d7d7d",
          marginTop: 12,
          marginBottom: 32,
          textAlign: "center",
          maxWidth: 520
        }}>
          Analiza y explora tu código de forma sencilla y visual. Sube tu archivo .zip y deja que DevPilot haga el resto.
        </p>
      )}
      {/* Área Drag & Drop */}
      <div style={{ width: "100%", maxWidth: 520 }}>
        {!uploadResult ? (
          <form
            onDragEnter={handleDrag}
            onSubmit={(e) => e.preventDefault()}
            style={{ width: "100%" }}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".zip"
              style={{ display: "none" }}
              onChange={handleChange}
              disabled={!!uploadResult}
            />
            <div
              onClick={() => !uploadResult && inputRef.current.click()}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              style={{
                border: dragActive ? "2px solid #141414" : "2px dashed #b6afa4",
                background: dragActive ? "#ffffff" : "#f9f6f2",
                borderRadius: 16,
                padding: "48px 24px",
                textAlign: "center",
                color: "#7d7d7d",
                fontSize: 18,
                cursor: loading ? "wait" : "pointer",
                transition: "all 0.2s",
                boxShadow: dragActive ? "0 4px 24px #b6afa433" : "none"
              }}
            >
              {loading
                ? "Subiendo archivo..."
                : dragActive
                ? "¡Suelta tu archivo .zip aquí!"
                : "Arrastra y suelta tu archivo .zip aquí, o haz clic para seleccionarlo"}
            </div>
            {mensaje && <p style={{ color: 'green', marginTop: 16 }}>{mensaje}</p>}
            {error && <p style={{ color: 'red', marginTop: 16 }}>{error}</p>}
          </form>
        ) : (
          <div style={{ marginTop: 8 }}>
            <div className="info-large pop-in" style={{ maxWidth: '100%' }}>
              <div className="title">{uploadResult.filename}</div>
              <div className="meta">{uploadResult.count ?? uploadResult.files?.length ?? 0} archivos</div>
              <div className="files">
                <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--primary)' }}>
                  {(uploadResult.files||[]).map((f,i)=> (
                    <li key={i} style={{ marginBottom: 6 }}>{f.path} — {f.size} bytes</li>
                  ))}
                </ul>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button
                  onClick={async ()=>{
                    try{
                      await fetch(`/api/uploads/${uploadResult.id}`, {method:'DELETE'})
                    }catch(e){console.error(e)}
                    setUploadResult(null); setMensaje(null);
                  }}
                  className="button"
                  style={{ background: '#fff', border: '1px solid #d6d0c6', color: '#2e2b28', padding: '8px 14px', borderRadius: 8 }}
                >Volver</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
