import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logoo.png';

const Footer = () => {
    return (
        <footer className="bg-[#455672] text-foreground pt-16 pb-8 font-sans">
            <div className="container mx-auto px-6 lg:px-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Column 1: About */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-1">
                            <img
                                src={logo}
                                alt="NEXL"
                                className="h-8 w-auto brightness-0 invert"
                            />
                            <span className="text-2xl font-bold text-foreground">EXL</span>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">
                           Empowering learners through modern learning experiences that combine academics, skill development, and future readiness in one accessible platform.

                        </p>
                    </div>

                    {/* Column 2: Platform */}
                    <div>
                        <h3 className="text-lg font-bold mb-6">Platform</h3>
                        <ul className="space-y-4 text-gray-300 text-sm">
                            <li><Link to="/" className="hover:text-foreground transition-colors">Home</Link></li>
                            <li><Link to="/course-list" className="hover:text-foreground transition-colors">Courses</Link></li>
                            <li><Link to="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
                            <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Learning */}
                    <div>
                        <h3 className="text-lg font-bold mb-6">Learning</h3>
                        <ul className="space-y-4 text-gray-300 text-sm">
                            <li><Link to="/course-list" className="hover:text-foreground transition-colors">Browse Courses</Link></li>
                            <li><Link to="/certifications" className="hover:text-foreground transition-colors">Certifications</Link></li>
                            <li><Link to="/learning-paths" className="hover:text-foreground transition-colors">Learning Paths</Link></li>
                            <li><Link to="/faqs" className="hover:text-foreground transition-colors">FAQs</Link></li>
                            <li><Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
                        </ul>
                    </div>

                    {/* Column 4: Get In Touch */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-lg font-bold mb-6">Get In Touch</h3>
                            <ul className="space-y-4 text-gray-300 text-sm">
                                <li className="flex items-center gap-3">
                                    <Icon icon="solar:letter-linear" className="text-accent" size={18} />
                                    <span>nexl6911@gmail.com</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Icon icon="solar:phone-calling-linear" className="text-accent" size={18} />
                                    <span>+977 9800000000</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Icon icon="solar:map-point-linear" className="text-accent" size={18} />
                                    <span>Itahari, Nepal</span>
                                </li>
                            </ul>
                            
                            <div className="flex gap-4 mt-6">
                                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="bg-background/10 hover:bg-accent transition-colors p-2 rounded-md">
                                    <Icon icon="mdi:facebook" size={20} />
                                </a>
                                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="bg-background/10 hover:bg-accent transition-colors p-2 rounded-md">
                                    <Icon icon="mdi:instagram" size={20} />
                                </a>
                                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="bg-background/10 hover:bg-accent transition-colors p-2 rounded-md">
                                    <Icon icon="mdi:linkedin" size={20} />
                                </a>
                            </div>
                        </div>
                         
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex flex-col md:flex-row w-full justify-between items-center gap-4">
                        <p>&copy; {new Date().getFullYear()} NEXL. All rights reserved.</p>
                        
                        <div className="flex gap-4">
                            <Link to="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
                            <span>|</span>
                            <Link to="/terms" className="hover:text-foreground transition-colors">Terms & Conditions</Link>
                        </div>
                        
                        <p>Designed with <Icon icon="solar:heart-bold" className="inline text-red-500 mx-1" /> by NEXL Team</p>
                    </div>
                </div>
            </div>
            

        </footer>
    );
};

export default Footer;
