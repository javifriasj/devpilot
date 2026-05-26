const BASE = process.env.NEXT_PUBLIC_API_BASE || ''

async function uploadRepo(form){
  const res = await fetch(`${BASE}/api/upload`, {method:'POST', body: form})
  if(!res.ok) throw new Error(await res.text())
  return res.json()
}

async function analyze(repoId, agent){
  const res = await fetch(`${BASE}/api/analyze`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({repoId, agent})})
  if(!res.ok) throw new Error(await res.text())
  return res.json()
}

async function sendChat(repoId, agent, message){
  const res = await fetch(`${BASE}/api/chat`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({repoId, agent, message})})
  if(!res.ok) throw new Error(await res.text())
  return res.json()
}

async function getRepo(repoId){
  const res = await fetch(`${BASE}/api/repos/${repoId}`)
  if(!res.ok) throw new Error(await res.text())
  return res.json()
}

export default {uploadRepo, analyze, sendChat, getRepo}
