import React from 'react'

export default function ResultsPanel({results}){
  if(!results) return null
  return (
    <div style={{marginTop:16}}>
      <h3>Resultados</h3>
      <div style={{whiteSpace:'pre-wrap',background:'#f3f4f6',padding:12,borderRadius:8}}>
        {typeof results === 'string' ? results : JSON.stringify(results, null, 2)}
      </div>
    </div>
  )
}
