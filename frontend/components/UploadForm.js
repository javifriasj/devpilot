import React, {useState} from 'react'
import api from '../lib/api'
import {useRouter} from 'next/router'

export default function UploadForm(){
  const [file, setFile] = useState(null)
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [uploadResult, setUploadResult] = useState(null)
  const [expanded, setExpanded] = useState(false)
  const router = useRouter()

  async function handleSubmit(e){
    e.preventDefault()
    setError(null)
    setMensaje(null)
    if(!file && !url){
      setError('Selecciona un ZIP o pega una URL de GitHub')
      return
    }
    setLoading(true)
    try{
      const form = new FormData()
      if(file) form.append('repo', file)
      if(url) form.append('url', url)
      const res = await api.uploadRepo(form)
      if(res && Object.keys(res).length === 0) {
        setUploadResult({ filename: file?.name || file?.filename || 'upload.zip', files: [] })
        setExpanded(false)
      } else if(res?.id){
        setUploadResult(res)
        setExpanded(false)
      } else if(res?.mensaje){
        // backwards compatibility
        setUploadResult({ filename: res.mensaje, files: [] })
      } else {
        setError('Respuesta inválida del servidor')
      }
    }catch(err){
      setError(String(err))
    }finally{setLoading(false)}
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>Subir ZIP del repositorio</label>
      <input type="file" accept=".zip" onChange={e=>setFile(e.target.files[0])} />

      <div style={{marginTop:10}}>
        <label>o pegar URL de GitHub</label>
        <input type="url" value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://github.com/user/repo" style={{width:'100%'}} />
      </div>

      {error && <p style={{color:'red'}}>{error}</p>}
      {uploadResult ? (
        <div style={{border:'1px solid #ddd', padding:10, marginTop:10}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div>
              <strong>{uploadResult.filename}</strong>
              <div>{uploadResult.count ?? uploadResult.files?.length ?? 0} archivos</div>
            </div>
            <div>
              <button type="button" onClick={()=>setExpanded(e=>!e)} style={{marginRight:8}}>{expanded? 'Minimizar' : 'Mostrar'}</button>
              <button type="button" onClick={async ()=>{
                if(!uploadResult?.id) { setUploadResult(null); setFile(null); return }
                try{ await api.deleteUpload(uploadResult.id) }catch(e){ console.error(e) }
                setUploadResult(null); setFile(null);
              }}>Volver</button>
            </div>
          </div>
          {expanded && (
            <div style={{marginTop:10, maxHeight:200, overflow:'auto'}}>
              <ul>
                {(uploadResult.files||[]).slice(0,100).map((f,i)=> (
                  <li key={i}>{f.path} — {f.size} bytes</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : null}
      <button type="submit" className="button" disabled={loading} style={{marginTop:12}}>
        {loading? 'Subiendo...' : 'Enviar'}
      </button>
    </form>
  )
}
