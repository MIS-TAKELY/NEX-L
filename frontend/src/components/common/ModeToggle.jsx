import { Icon } from '@iconify/react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../../store/slices/uiSlice';

const ModeToggle = () => {
  const dispatch = useDispatch();
  const { theme } = useSelector((state) => state.ui);

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      className="relative w-10 h-10 flex items-center justify-center rounded-md bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-300 ring-1 ring-border shadow-sm group"
      aria-label="Toggle theme"
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
  );
};

export default ModeToggle;
