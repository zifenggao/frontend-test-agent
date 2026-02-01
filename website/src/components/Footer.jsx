import React from 'react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4 gradient-text">Frontend Test Agent</h3>
            <p className="text-slate-300 mb-4">
              AI-powered frontend testing automation that transforms your
              development workflow.
            </p>
            <div className="flex space-x-4">
              <a href="https://github.com/yourusername/frontend-test-agent" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a href="https://twitter.com/yourusername" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="https://discord.gg/xxx" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.312 3.75a2.25 2.25 0 00-2.272-2.003h-.162c-.993 0-1.832.423-2.426 1.083-1.174 1.202-2.763 1.202-3.938 0C8.62 2.167 7.78 1.75 6.785 1.75H6.62a2.25 2.25 0 00-2.272 2.003C3.522 5.827 2.25 9.02 2.25 12 2.25 14.98 3.522 18.173 4.348 20.25a2.25 2.25 0 002.272 2.003h.162c.995 0 1.835-.423 2.428-1.083 1.175-1.202 2.763-1.202 3.938 0 .593.66 1.433 1.083 2.428 1.083h.162a2.25 2.25 0 002.272-2.003C20.478 18.173 21.75 14.98 21.75 12c0-2.98-1.277-6.173-2.094-8.25zm-7.034 9.933a.75.75 0 01-1.145.958C10.57 13.275 9 13.163 9 12s1.57-.275 3.133-.641a.75.75 0 01.145 1.458zM15.75 12c0 1.163-1.57 1.275-3.132.641a.75.75 0 11.144-1.458C14.085 11.725 15.75 10.837 15.75 12z"/>
                </svg>
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#features" className="text-slate-300 hover:text-white transition-colors">Features</a></li>
              <li><a href="#stats" className="text-slate-300 hover:text-white transition-colors">Statistics</a></li>
              <li><a href="#docs" className="text-slate-300 hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-slate-300 hover:text-white transition-colors">GitHub</a></li>
              <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Issue Tracker</a></li>
              <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Contributing Guide</a></li>
              <li><a href="#" className="text-slate-300 hover:text-white transition-colors">API Reference</a></li>
              <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Changelog</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-slate-300 hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Discord Community</a></li>
              <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Report a Bug</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-slate-700 text-center">
          <p className="text-slate-300">
            &copy; {currentYear} Frontend Test Agent. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
