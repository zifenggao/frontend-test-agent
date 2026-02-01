import React from 'react'

const Stats = () => {
  const stats = [
    {
      value: '90%',
      label: 'Time Saved Writing Tests'
    },
    {
      value: '95%+',
      label: 'Test Coverage'
    },
    {
      value: '93%',
      label: 'Faster Issue Resolution'
    },
    {
      value: '25%',
      label: 'Overall Productivity Boost'
    },
    {
      value: '500+',
      label: 'Components Tested'
    },
    {
      value: '0.1%',
      label: 'Bug Rate After Implementation'
    }
  ]

  return (
    <section id="stats" className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            <span className="gradient-text">Quantifiable</span> Results That Matter
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Our users are already experiencing significant improvements in their
            development workflow. The numbers speak for themselves.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-8 text-center card-hover">
              <div className="text-4xl md:text-5xl font-bold gradient-text mb-3">{stat.value}</div>
              <p className="text-slate-700 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Stats
