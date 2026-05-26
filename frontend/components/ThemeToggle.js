import React, {useEffect, useState} from 'react'

const STORAGE_KEY = 'devpilot-theme'

export default function ThemeToggle(){
  const [dark, setDark] = useState(false)

  useEffect(()=>{
    try{
      const stored = localStorage.getItem(STORAGE_KEY)
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      const initial = stored ? (stored === 'dark') : prefersDark
      setDark(initial)
      apply(initial)
    }catch(e){/* ignore */}
  },[])

  function apply(isDark){
    const root = document.documentElement
    if(isDark) root.classList.add('dark')
    else root.classList.remove('dark')
  }

  function toggle(){
    const next = !dark
    setDark(next)
    try{ localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light') }catch(e){}
    apply(next)
  }

  return (
    <button onClick={toggle} className="button ghost" aria-label="Toggle theme" style={{padding:'6px 10px'}}>
      {dark ? '🌙 Dark' : '☀️ Light'}
    </button>
  )
}
