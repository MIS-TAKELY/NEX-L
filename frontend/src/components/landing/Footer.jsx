import React from 'react';

const Footer = () => {
  return (
    <footer id="contact" className="py-16 px-6 border-t border-gray-100">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <a href="#" className="text-2xl font-semibold tracking-tight mb-4 inline-block">
              NEXL
            </a>
            <p className="text-gray-500 font-light max-w-sm leading-relaxed">
              Empowering learners through modern learning experiences that combine academics, skill development, and future readiness.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-4 text-sm uppercase tracking-wider">Platform</h4>
            <ul className="space-y-3">
              {['Home', 'Courses', 'About Us', 'Contact'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-500 hover:text-[#1A1A1A] transition-colors text-sm">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li>nexl6911@gmail.com</li>
              <li>+977 9800000000</li>
              <li>Itahari, Nepal</li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400">
            © 2026 NEXL. All rights reserved.
          </p>
          <div className="flex gap-6">
            {['Privacy', 'Terms'].map((item) => (
              <a key={item} href="#" className="text-xs text-gray-400 hover:text-[#1A1A1A] transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
