import {useRouter} from 'next/router'
import {useEffect, useState} from 'react'
import api from '../../lib/api'
import RepoViewer from '../../components/RepoViewer'
import AgentSelector from '../../components/AgentSelector'
import ResultsPanel from '../../components/ResultsPanel'
import ChatPanel from '../../components/ChatPanel'

export default function RepoPage(){
  const router = useRouter()
  const {id} = router.query
  const [repo, setRepo] = useState(null)
  const [results, setResults] = useState(null)
  const [agent, setAgent] = useState('Analyzer')

  useEffect(()=>{
    if(!id) return
    api.getRepo(id).then(setRepo).catch(err=>setRepo({name:'Error', description:String(err)}))
  },[id])

  return (
    <div>
      <p><a href="/">← Volver</a></p>
      <RepoViewer repo={repo} />
      <AgentSelector repoId={id} onResult={setResults} onAgentChange={setAgent} />
      <ResultsPanel results={results} />
      <ChatPanel repoId={id} agent={agent} />
    </div>
  )
}
