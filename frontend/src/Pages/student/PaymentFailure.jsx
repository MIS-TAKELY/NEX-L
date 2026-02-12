import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';

const PaymentFailure = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
                <Icon icon="solar:close-circle-bold" className="w-20 h-20 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h2>
                <p className="text-gray-600 mb-6">Your transaction was cancelled or failed. No charges were made.</p>
                <div className="space-y-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Return Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentFailure;
