const Features = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-900">About Us</h2>
          <p className="text-gray-500 max-w-xl mx-auto">We provide the best learning experience with features designed for your success.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: "Local Payment Integration", desc: "Seamlessly enroll in courses using eSewa, Khalti, and IME Pay with low transaction fees." },
            { title: "AI-Powered Learning", desc: "Benefit from automatic video summarization and personalized course recommendations." },
            { title: "Gamified Progress", desc: "Stay motivated by earning performance badges and tracking your achievements." }
          ].map((feature, idx) => (
            <div key={idx} className="p-8 rounded-2xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-xl transition-all duration-300 group">
              <div className={`w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                 {/* Icon Placeholder */}
                 <div className="w-6 h-6 bg-current opacity-50 rounded-full" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
              <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
