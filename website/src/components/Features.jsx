import React from 'react'

const Features = () => {
  const features = [
    {
      icon: '🤖',
      title: 'AI Test Generation',
      description: 'Generate comprehensive tests automatically using cutting-edge AI models. Supports all popular frontend frameworks.'
    },
    {
      icon: '⚡',
      title: 'Lightning Fast Execution',
      description: 'Parallel test execution with smart scheduling. Run your tests 5-10x faster than traditional methods.'
    },
    {
      icon: '🔍',
      title: 'Intelligent Analysis',
      description: 'AI-powered root cause analysis. Get instant insights and actionable recommendations for test failures.'
    },
    {
      icon: '📊',
      title: 'Advanced Coverage',
      description: 'Visualize test coverage in real-time. Identify gaps and ensure maximum code coverage with minimal effort.'
    },
    {
      icon: '🧩',
      title: 'VS Code Integration',
      description: 'Seamless IDE integration. Generate tests, run them, and analyze results without leaving your editor.'
    },
    {
      icon: '🔌',
      title: 'CI/CD Ready',
      description: 'Integrate with GitHub Actions, GitLab CI, and Jenkins. Automate your testing workflow from day one.'
    }
  ]

  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Powerful Features That <span className="gradient-text">Transform</span> Your Testing
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            From AI-powered test generation to intelligent result analysis, we've built the
            complete solution for modern frontend testing
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-8 card-hover">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
              <p className="text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
