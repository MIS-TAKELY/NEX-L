import { Icon } from '@iconify/react';
import logo from '../../assets/logoo.png';

const Footer = () => {
    return (
        <footer className="bg-primary text-white pt-16 pb-8 font-sans">
            <div className="container mx-auto px-6 lg:px-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Column 1: About */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                             <div className="bg-white p-1 rounded-sm">
                                <img src={logo} alt="NEXL" className="h-8 w-8 object-contain" />
                             </div>
                            <div className='flex flex-col'>
                                <span className="text-xl font-bold leading-none">NEXL</span>
                                <span className='text-[10px] tracking-widest uppercase opacity-80'>Education</span>
                            </div>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">
Empowering students across Nepal through modern learning experiences that combine academics, skill development, and future readiness in one accessible platform.
                        </p>
                    </div>

                    {/* Column 2: Company */}
                    <div>
                        <h3 className="text-lg font-bold mb-6">Company</h3>
                        <ul className="space-y-4 text-gray-300 text-sm">
                            <li><a href="#" className="hover:text-white transition-colors">About NEXL</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">LMS Platform</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Gallery</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Blogs</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Projects</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                        </ul>
                    </div>

                    {/* Column 3: Services */}
                    <div>
                        <h3 className="text-lg font-bold mb-6">Services</h3>
                        <ul className="space-y-4 text-gray-300 text-sm">
                            <li><a href="#" className="hover:text-white transition-colors">IT Courses & Training</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">LMS System</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">School Management System</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Web Development</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Mobile App Development</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Digital Marketing</a></li>
                        </ul>
                    </div>

                    {/* Column 4: Contact & Trusted By */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-lg font-bold mb-6">Get In Touch</h3>
                            <ul className="space-y-4 text-gray-300 text-sm">
                                <li className="flex items-center gap-3">
                                    <Icon icon="solar:letter-linear" className="text-accent" size={18} />
                                    <span>hello@nexl.edu.np</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Icon icon="solar:phone-calling-linear" className="text-accent" size={18} />
                                    <span>+977 9827093876</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Icon icon="solar:map-point-linear" className="text-accent" size={18} />
                                    <span>Itahari, Nepal</span>
                                </li>
                            </ul>
                            
                            <div className="flex gap-4 mt-6">
                                <a href="#" className="bg-white/10 hover:bg-accent transition-colors p-2 rounded-full">
                                    <Icon icon="mdi:facebook" size={20} />
                                </a>
                                <a href="#" className="bg-white/10 hover:bg-accent transition-colors p-2 rounded-full">
                                    <Icon icon="mdi:instagram" size={20} />
                                </a>
                                <a href="#" className="bg-white/10 hover:bg-accent transition-colors p-2 rounded-full">
                                    <Icon icon="mdi:linkedin" size={20} />
                                </a>
                                <a href="#" className="bg-white/10 hover:bg-accent transition-colors p-2 rounded-full">
                                    <Icon icon="mdi:youtube" size={20} />
                                </a>
                            </div>
                        </div>
                         
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
                    <p>&copy; {new Date().getFullYear()} NEXL. All rights reserved.</p>
                    <p>Designed with <Icon icon="solar:heart-bold" className="inline text-red-500 mx-1" /> by NEXL Team</p>
                </div>
            </div>
            

        </footer>
    );
};

export default Footer;
