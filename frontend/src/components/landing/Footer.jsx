import React from 'react';

const Footer = () => {
  return (
    <footer id="contact" className="py-16 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <a href="#" className="text-2xl font-semibold tracking-tight mb-4 inline-block">
              NEXL
            </a>
            <p className="text-muted-foreground font-light max-w-sm leading-relaxed">
              Empowering learners through modern learning experiences that combine academics, skill development, and future readiness.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-4 text-sm uppercase tracking-wider">Platform</h4>
            <ul className="space-y-3">
              {['Home', 'Courses', 'About Us', 'Contact'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>nexl6911@gmail.com</li>
              <li>+977 9800000000</li>
              <li>Itahari, Nepal</li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 NEXL. All rights reserved.
          </p>
          <div className="flex gap-6">
            {['Privacy', 'Terms'].map((item) => (
              <a key={item} href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
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
