import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';

const PaymentFailure = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-muted flex flex-col justify-center items-center p-4">
            <div className="bg-background p-8 rounded-md shadow-lg max-w-md w-full text-center">
                <Icon icon="solar:close-circle-bold" className="w-20 h-20 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">Payment Failed</h2>
                <p className="text-muted-foreground mb-6">Your transaction was cancelled or failed. No charges were made.</p>
                <div className="space-y-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full py-3 bg-blue-600 text-foreground font-bold rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-3 bg-secondary text-foreground font-bold rounded-md hover:bg-gray-200 transition-colors"
                    >
                        Return Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentFailure;
