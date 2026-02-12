import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence } from 'motion/react';
import Toast from '../components/ui/Toast';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type, duration }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed top-24 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence mode="popLayout">
                    {toasts.map((toast) => (
                        <Toast
                            key={toast.id}
                            {...toast}
                            onClose={() => removeToast(toast.id)}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
