import React, { useState, useEffect } from 'react'

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header 
      className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <div className="text-2xl font-bold">
              <span className="gradient-text">Frontend Test Agent</span>
            </div>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#features" className="text-slate-700 hover:text-primary transition-colors font-medium">Features</a>
            <a href="#stats" className="text-slate-700 hover:text-primary transition-colors font-medium">Stats</a>
            <a href="#docs" className="text-slate-700 hover:text-primary transition-colors font-medium">Documentation</a>
            <a href="https://github.com/yourusername/frontend-test-agent" target="_blank" rel="noopener noreferrer" className="text-slate-700 hover:text-primary transition-colors font-medium">GitHub</a>
          </nav>
          <div className="flex items-center space-x-4">
            <a href="#get-started" className="hidden sm:block px-6 py-2 gradient-bg text-white rounded-lg font-medium hover:shadow-lg transition-shadow">Get Started</a>
            <button className="md:hidden text-slate-700 focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
