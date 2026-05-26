import React from 'react'

export default function RepoViewer({repo}){
  if(!repo) return <p>Cargando repositorio...</p>
  return (
    <div style={{marginTop:12}}>
      <h3>{repo.name || 'Repositorio'}</h3>
      <p style={{color:'#6b7280'}}>{repo.description}</p>
      <details style={{marginTop:8}}>
        <summary>Archivos (muestra limitada)</summary>
        <pre style={{maxHeight:240,overflow:'auto',background:'#f9fafb',padding:8,borderRadius:6}}>{repo.files ? repo.files.slice(0,200).join('\n') : 'Sin datos'}</pre>
      </details>
    </div>
  )
}
