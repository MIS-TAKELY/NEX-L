import { Icon } from '@iconify/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout as reduxLogout, updateUser } from '@/store/slices/authSlice';
import { setTheme as reduxSetTheme } from '@/store/slices/uiSlice';

const ProfileDropdown = () => {
    const dispatch = useDispatch();
    const { userData } = useSelector((state) => state.auth);
    const { theme } = useSelector((state) => state.ui);
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState('main'); // 'main' or 'display'
    const dropdownRef = useRef(null);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setTimeout(() => setView('main'), 200); // Reset after animation
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        dispatch(reduxLogout());
        navigate('/login');
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                dispatch(updateUser({ image: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const menuItems = [
        { id: 'settings', icon: 'solar:settings-bold-duotone', label: 'Settings', path: '/settings' },
        { id: 'help', icon: 'solar:help-bold-duotone', label: 'Help & support', path: '/help' },
        { id: 'display', icon: 'solar:moon-bold-duotone', label: 'Display' },
        { id: 'feedback', icon: 'solar:chat-round-line-bold-duotone', label: 'Give feedback', path: '/feedback' },
    ];

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 pl-2 focus:outline-none group"
            >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-primary overflow-hidden border-2 border-white shadow-sm transition-transform active:scale-95 group-hover:border-primary/20">
                    {userData?.image ? (
                        <img src={userData.image} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <Icon icon="solar:user-circle-bold-duotone" size={24} />
                    )}
                </div>
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence mode="wait">
                {isOpen && (
                    <motion.div
                        key={view}
                        initial={{ opacity: 0, x: view === 'main' ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: view === 'main' ? 20 : -20 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 mt-2 w-80 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden z-[100]"
                    >
                        <div className="p-4">
                            {view === 'main' ? (
                                <>
                                    {/* User Info Card */}
                                    <div className="bg-card rounded-xl shadow-sm border border-border p-4 mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="relative group/avatar">
                                                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-background shadow-sm">
                                                    {userData?.image ? (
                                                        <img src={userData.image} alt="Profile" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Icon icon="solar:user-circle-bold-duotone" size={40} className="text-muted-foreground" />
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => fileInputRef.current.click()}
                                                    className="absolute bottom-0 right-0 w-6 h-6 bg-card rounded-full shadow-md flex items-center justify-center text-foreground hover:text-primary transition-colors border border-border"
                                                >
                                                    <Icon icon="solar:camera-bold" size={14} />
                                                </button>
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                />
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <h3 className="font-bold text-foreground truncate">{userData?.name || 'User'}</h3>
                                                <p className="text-sm text-muted-foreground truncate">{userData?.email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="space-y-1">
                                        {menuItems.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => {
                                                    if (item.id === 'display') {
                                                        setView('display');
                                                    } else {
                                                        setIsOpen(false);
                                                        navigate(item.path);
                                                    }
                                                }}
                                                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted transition-colors group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-muted rounded-full flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                        <Icon icon={item.icon} size={20} />
                                                    </div>
                                                    <span className="text-sm font-semibold text-foreground/80">{item.label}</span>
                                                </div>
                                                <Icon icon="solar:alt-arrow-right-linear" className="text-muted-foreground group-hover:text-foreground transition-colors" />
                                            </button>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Display Sub-menu */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <button
                                            onClick={() => setView('main')}
                                            className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-foreground"
                                        >
                                            <Icon icon="solar:alt-arrow-left-linear" size={20} />
                                        </button>
                                        <h3 className="font-bold text-foreground text-lg">Display</h3>
                                    </div>

                                    <div className="space-y-4 px-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
                                                    <Icon icon="solar:sun-bold-duotone" size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-foreground">Light Mode</p>
                                                    <p className="text-[10px] text-muted-foreground font-medium tracking-tight">Standard white appearance</p>
                                                </div>
                                            </div>
                                            <input
                                                type="radio"
                                                name="theme"
                                                checked={theme === 'light'}
                                                onChange={() => dispatch(reduxSetTheme('light'))}
                                                className="w-5 h-5 accent-primary cursor-pointer"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
                                                    <Icon icon="solar:moon-bold-duotone" size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-foreground">Dark Mode</p>
                                                    <p className="text-[10px] text-muted-foreground font-medium tracking-tight">Easy on the eyes</p>
                                                </div>
                                            </div>
                                            <input
                                                type="radio"
                                                name="theme"
                                                checked={theme === 'dark'}
                                                onChange={() => dispatch(reduxSetTheme('dark'))}
                                                className="w-5 h-5 accent-primary cursor-pointer"
                                            />
                                        </div>

                                        <p className="text-[11px] text-primary italic mt-4 bg-primary/10 p-3 rounded-lg border border-primary/20">
                                            Theme settings are applied instantly across the entire application.
                                        </p>
                                    </div>
                                </>
                            )}

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-500/10 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 group-hover:bg-red-500/20 transition-colors">
                                        <Icon icon="solar:logout-bold-duotone" size={20} />
                                    </div>
                                    <span className="text-sm font-semibold text-red-500">Log out</span>
                                </div>
                            </button>

                            {/* Footer links */}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProfileDropdown;
