import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "danger" // 'danger' or 'warning'
}) => {
    if (!isOpen) return null;

    const colors = {
        danger: {
            icon: <AlertTriangle className="text-red-500" size={24} />,
            bg: "bg-red-50",
            button: "bg-red-600 hover:bg-red-700",
        },
        warning: {
            icon: <AlertTriangle className="text-amber-500" size={24} />,
            bg: "bg-amber-50",
            button: "bg-amber-600 hover:bg-amber-700",
        }
    };

    const style = colors[type] || colors.danger;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-background rounded-md shadow-2xl w-full max-w-md overflow-hidden relative"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1 rounded-md hover:bg-secondary transition-colors text-muted-foreground"
                    >
                        <X size={20} />
                    </button>

                    <div className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                            <div className={`p-3 rounded-md ${style.bg}`}>
                                {style.icon}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-foreground">{title}</h3>
                                <p className="text-muted-foreground mt-1 leading-relaxed">
                                    {message}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-2.5 rounded-md border border-border text-foreground font-semibold hover:bg-muted transition-colors"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className={`flex-1 px-4 py-2.5 rounded-md text-foreground font-semibold transition-colors shadow-lg shadow-black/5 ${style.button}`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ConfirmModal;
