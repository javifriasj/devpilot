import React, {useState} from 'react'
import api from '../lib/api'

export default function ChatPanel({repoId, agent}){
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  async function send(){
    if(!text) return
    const userMsg = {from:'user', text}
    setMessages(m=>[...m, userMsg])
    setText('')
    setSending(true)
    try{
      const res = await api.sendChat(repoId, agent, text)
      const bot = {from:'agent', text: res?.reply ?? (res?.message ?? 'Sin respuesta')}
      setMessages(m=>[...m, bot])
    }catch(err){
      setMessages(m=>[...m, {from:'agent', text: 'Error: '+String(err)}])
    }finally{setSending(false)}
  }

  return (
    <div style={{marginTop:16}}>
      <h3>Chat con agente: {agent}</h3>
      <div style={{minHeight:120, maxHeight:300, overflow:'auto', background:'#fff', border:'1px solid #eee', padding:8, borderRadius:8}}>
        {messages.map((m,i)=> (
          <div key={i} style={{padding:6, marginBottom:6, background: m.from==='user' ? '#e6f4ff' : '#f3f4f6', borderRadius:6}}>
            <strong style={{fontSize:12}}>{m.from}:</strong> <span style={{fontSize:14}}>{m.text}</span>
          </div>
        ))}
      </div>
      <div style={{display:'flex',gap:8,marginTop:8}}>
        <input value={text} onChange={e=>setText(e.target.value)} style={{flex:1}} placeholder="Escribe tu pregunta" />
        <button className="button" onClick={send} disabled={sending}>{sending? 'Enviando...' : 'Enviar'}</button>
      </div>
    </div>
  )
}
