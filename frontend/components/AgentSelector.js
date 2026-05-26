import React, {useState} from 'react'
import api from '../lib/api'

export default function AgentSelector({repoId, onResult, onAgentChange}){
  const [agent, setAgent] = useState('Analyzer')
  const [running, setRunning] = useState(false)
  const [error, setError] = useState(null)

  async function start(){
    setError(null)
    setRunning(true)
    try{
      const res = await api.analyze(repoId, agent)
      if(res) onResult && onResult(res)
    }catch(err){
      setError(String(err))
    }finally{setRunning(false)}
  }

  function handleChange(e){
    const v = e.target.value
    setAgent(v)
    onAgentChange && onAgentChange(v)
  }

  return (
    <div>
      <label>Seleccionar agente</label>
      <div style={{display:'flex',gap:8,alignItems:'center',marginTop:8}}>
        <select value={agent} onChange={handleChange}>
          <option>Planner</option>
          <option>Analyzer</option>
          <option>Coder</option>
          <option>Docs</option>
        </select>
        <button className="button" onClick={start} disabled={running}>
          {running ? 'Ejecutando...' : 'Ejecutar'}
        </button>
      </div>
      {error && <p style={{color:'red'}}>{error}</p>}
    </div>
  )
}
