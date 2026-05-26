import React from 'react'
import ThemeToggle from './ThemeToggle'

export default function Layout({children}){
  return (
    <div className="container">
      <header className="header">
        <div className="logo">DevPilot</div>
        <div style={{marginLeft:'auto'}}>
          <ThemeToggle />
        </div>
      </header>
      <main>{children}</main>
      <footer className="footer">© DevPilot</footer>
    </div>
  )
}
