import React, {useState} from 'react'
import api from '../lib/api'
import {useRouter} from 'next/router'

export default function UploadForm(){
  const [file, setFile] = useState(null)
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()

  async function handleSubmit(e){
    e.preventDefault()
    setError(null)
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
      if(res?.id){
        router.push(`/repo/${res.id}`)
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
      <button type="submit" className="button" disabled={loading} style={{marginTop:12}}>
        {loading? 'Subiendo...' : 'Enviar'}
      </button>
    </form>
  )
}
