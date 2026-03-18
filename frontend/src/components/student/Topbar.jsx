import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '@/store/slices/uiSlice';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useGetCartQuery } from '@/store/slices/cartApi';
import ProfileDropdown from '../common/ProfileDropdown';

const StudentTopbar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { theme } = useSelector((state) => state.ui);
    const { isLoggedIn, userRole, userData } = useSelector((state) => state.auth);
    const { data: cartResp } = useGetCartQuery(undefined, { skip: !isLoggedIn || userRole !== 'student' });
    const cartCount = cartResp?.data?.items?.length || 0;

    const displayName = userData?.name || 'Student';

    return (
        <div className="flex justify-between items-center py-4 mb-8">

            {/* Search Bar */}
            <div className="flex-1 max-w-xl">
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Icon icon="solar:magnifer-linear" size={18} />
                    </span>
                    <input
                        type="text"
                        placeholder="Search your course..."
                        className="w-full pl-12 pr-4 py-3 bg-card border border-border focus:border-primary/20 focus:bg-card rounded-2xl text-sm outline-none transition-all shadow-sm text-foreground placeholder:text-muted-foreground"
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-6">
                <button className="w-10 h-10 bg-card rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:shadow-md transition-all shadow-sm border border-border">
                    <Icon icon="solar:letter-linear" size={20} />
                </button>
                <button
                    onClick={() => dispatch(toggleTheme())}
                    className="w-10 h-10 bg-card rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:shadow-md transition-all shadow-sm border border-border relative overflow-hidden group"
                >
                    <Icon
                        icon="solar:sun-bold-duotone"
                        className={`absolute h-5 w-5 transition-all duration-500 ease-in-out ${
                            theme === 'dark' ? 'scale-0 -rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'
                        } text-amber-500`}
                    />
                    <Icon
                        icon="solar:moon-stars-bold-duotone"
                        className={`absolute h-5 w-5 transition-all duration-500 ease-in-out ${
                            theme === 'dark' ? 'scale-100 rotate-0 opacity-100' : 'scale-0 rotate-90 opacity-0'
                        } text-blue-400 group-hover:text-primary`}
                    />
                </button>
                <button onClick={() => navigate('/cart')} className="w-10 h-10 bg-card rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:shadow-md transition-all shadow-sm border border-border relative">
                    <Icon icon="solar:cart-large-2-linear" size={20} />
                    {cartCount > 0 && (
                        <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border border-background flex items-center justify-center text-foreground text-[8px] font-bold transform translate-x-1 -translate-y-1">
                            {cartCount}
                        </span>
                    )}
                </button>
                <button className="w-10 h-10 bg-card rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:shadow-md transition-all shadow-sm relative border border-border">
                    <Icon icon="solar:bell-linear" size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-background"></span>
                </button>

                <div className="flex items-center gap-3 pl-6 border-l border-border">
                    <ProfileDropdown />
                </div>
            </div>
        </div>
    );
};

export default StudentTopbar;
