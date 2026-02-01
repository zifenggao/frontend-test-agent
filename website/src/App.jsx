import React from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import Features from './components/Features'
import Stats from './components/Stats'
import Testimonials from './components/Testimonials'
import Docs from './components/Docs'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      <main>
        <Hero />
        <Features />
        <Stats />
        <Testimonials />
        <Docs />
      </main>
      <Footer />
    </div>
  )
}

export default App
