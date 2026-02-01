import React from 'react'

const Testimonials = () => {
  const testimonials = [
    {
      quote: 'Frontend Test Agent reduced our testing time from 10 hours per sprint to just 1 hour. Our team can now focus on building features instead of writing tests.',
      author: 'Sarah Johnson',
      role: 'CTO at TechCorp',
      image: 'https://picsum.photos/id/1027/200/200'
    },
    {
      quote: 'The AI test generation is remarkably accurate. It covers edge cases I would never think of manually. Our test coverage jumped from 65% to 95% overnight.',
      author: 'Michael Chen',
      role: 'Senior Frontend Engineer',
      image: 'https://picsum.photos/id/1012/200/200'
    },
    {
      quote: 'The VS Code integration is a game-changer. I can generate tests right from the editor, run them, and see results instantly without switching tools.',
      author: 'Emma Rodriguez',
      role: 'Lead Developer',
      image: 'https://picsum.photos/id/1011/200/200'
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            What Our <span className="gradient-text">Users</span> Are Saying
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Real developers from real teams sharing their experiences with
            Frontend Test Agent
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-slate-50 rounded-xl shadow-lg p-8 card-hover">
              <div className="text-4xl text-primary mb-6">“</div>
              <p className="text-slate-700 mb-6 italic">{testimonial.quote}</p>
              <div className="flex items-center">
                <img
                  src={testimonial.image}
                  alt={testimonial.author}
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
                <div>
                  <p className="font-bold text-slate-800">{testimonial.author}</p>
                  <p className="text-slate-600">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials
