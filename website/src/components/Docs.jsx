import React from 'react'

const Docs = () => {
  const quickStartSteps = [
    {
      number: '1',
      title: 'Install the Package',
      description: 'Install globally via npm or yarn. The installation process takes less than 1 minute.',
      code: 'npm install -g frontend-test-agent'
    },
    {
      number: '2',
      title: 'Generate Tests',
      description: 'Use the generate command to create tests for your components. Support React, Vue, and Angular.',
      code: 'test-agent generate src/components --framework react'
    },
    {
      number: '3',
      title: 'Run Tests',
      description: 'Execute the generated tests using your preferred test runner (Jest, Cypress, Playwright).',
      code: 'test-agent run __tests__ --runner jest'
    },
    {
      number: '4',
      title: 'Analyze Results',
      description: 'Get intelligent analysis and actionable recommendations for your test results.',
      code: 'test-agent analyze test-results.json'
    }
  ]

  return (
    <section id="docs" className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            <span className="gradient-text">Quick Start</span> Guide
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Get started with Frontend Test Agent in just a few minutes. Our
            documentation is comprehensive and easy to follow.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-slate-800 mb-6">4 Simple Steps</h3>
              {quickStartSteps.map((step, index) => (
                <div key={index} className="mb-8 last:mb-0">
                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-xl mr-4 mt-1">
                      {step.number}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-800 mb-2">{step.title}</h4>
                      <p className="text-slate-600 mb-4">{step.description}</p>
                      <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                        <code className="text-sm text-white">{step.code}</code>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="bg-white rounded-xl shadow-lg p-8 h-full">
              <h3 className="text-2xl font-bold text-slate-800 mb-6">VS Code Extension</h3>
              <div className="text-slate-600 mb-6">
                <p className="mb-4">Install our VS Code extension for the ultimate testing experience:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Right-click components to generate tests instantly</li>
                  <li>Run tests without leaving your editor</li>
                  <li>View results in real-time with detailed analysis</li>
                  <li>Keyboard shortcuts for maximum efficiency</li>
                  <li>Interactive coverage visualization</li>
                </ul>
              </div>
              <a 
                href="#"
                className="inline-block px-6 py-3 gradient-bg text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-shadow text-center"
              >
                Download VS Code Extension
              </a>
            </div>
          </div>
        </div>
        <div className="mt-12 text-center">
          <a 
            href="https://github.com/yourusername/frontend-test-agent/blob/main/README.md"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-primary text-lg font-medium hover:underline"
          >
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            View Full Documentation on GitHub
          </a>
        </div>
      </div>
    </section>
  )
}

export default Docs
