import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type, duration, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const variants = {
        success: {
            icon: <CheckCircle2 size={20} className="text-green-500" />,
            bgColor: 'bg-green-50',
            borderColor: 'border-green-100',
            textColor: 'text-green-800'
        },
        error: {
            icon: <AlertCircle size={20} className="text-red-500" />,
            bgColor: 'bg-red-50',
            borderColor: 'border-red-100',
            textColor: 'text-red-800'
        },
        info: {
            icon: <Info size={20} className="text-blue-500" />,
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-100',
            textColor: 'text-blue-800'
        }
    };

    const style = variants[type] || variants.info;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 50 }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-md border shadow-lg ${style.bgColor} ${style.borderColor} min-w-[300px] max-w-md`}
        >
            <div className="flex-shrink-0">{style.icon}</div>
            <p className={`flex-1 text-sm font-semibold ${style.textColor}`}>{message}</p>
            <button
                onClick={onClose}
                className="flex-shrink-0 p-1 rounded-md hover:bg-black/5 transition-colors text-muted-foreground"
            >
                <X size={16} />
            </button>
        </motion.div>
    );
};

export default Toast;
