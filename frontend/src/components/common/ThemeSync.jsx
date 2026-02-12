import { useEffect } from 'react';
import { useSelector } from 'react-redux';

/**
 * ThemeSync component doesn't render anything.
 * Its purpose is to synchronize the theme state from Redux to the document element.
 */
const ThemeSync = () => {
    const { theme } = useSelector((state) => state.ui);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    return null;
};

export default ThemeSync;
