import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PaymentMethodSelection = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { userData } = useSelector((state) => state.auth);

    const courseIds = searchParams.get('courseIds')?.split(',') || [];
    const amount = searchParams.get('amount') || 0;
    const courseCount = courseIds.length;

    useEffect(() => {
        if (!userData) {
            navigate('/login?redirect=/cart');
        }
        if (courseIds.length === 0) {
            navigate('/cart');
        }
    }, [userData, courseIds, navigate]);

    const handlePaymentMethod = (method) => {
        const courseIdsParam = courseIds.join(',');
        navigate(`/payment-gateway?method=${method}&courseIds=${courseIdsParam}&amount=${amount}`);
    };

    const paymentMethods = [
        {
            id: 'esewa',
            name: 'eSewa',
            icon: 'solar:wallet-money-bold-duotone',
            color: '#60bb46',
            description: 'Pay securely with your eSewa wallet'
        },
        {
            id: 'khalti',
            name: 'Khalti',
            icon: 'solar:wallet-2-bold-duotone',
            color: '#5c2d91',
            description: 'Pay with Khalti digital wallet'
        },
        {
            id: 'connectips',
            name: 'ConnectIPS',
            icon: 'solar:card-transfer-bold-duotone',
            color: '#dc1212ff',
            description: 'Pay via your bank account',
            disabled: true
        }
    ];

    return (
        <div className="min-h-screen bg-secondary/30 py-12">
            <div className="container mx-auto px-6 max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/cart')}
                        className="flex items-center gap-2 text-gray-600 dark:text-zinc-400 hover:text-primary mb-4 transition-colors"
                    >
                        <Icon icon="solar:arrow-left-linear" size={20} />
                        Back to Cart
                    </button>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Select Payment Method</h1>
                    <p className="text-gray-600 dark:text-zinc-400">
                        Choose your preferred payment method to complete your purchase
                    </p>
                </div>

                {/* Order Summary Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border-2 border-gray-100 dark:border-zinc-800 p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Order Summary</h2>
                    <div className="space-y-2">
                        <div className="flex justify-between text-gray-600 dark:text-zinc-400">
                            <span>Courses</span>
                            <span className="font-semibold">{courseCount} {courseCount === 1 ? 'course' : 'courses'}</span>
                        </div>
                        <div className="border-t border-gray-200 dark:border-zinc-700 pt-3 mt-3">
                            <div className="flex justify-between text-2xl font-bold text-primary dark:text-accent">
                                <span>Total Amount</span>
                                <span>Rs. {Number(amount).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Available Payment Methods</h2>
                    {paymentMethods.map((method) => (
                        <button
                            key={method.id}
                            onClick={() => !method.disabled && handlePaymentMethod(method.id)}
                            disabled={method.disabled}
                            className={`w-full bg-white dark:bg-zinc-900 rounded-2xl border-2 p-6 transition-all duration-300 ${method.disabled
                                    ? 'border-gray-200 dark:border-zinc-800 opacity-50 cursor-not-allowed'
                                    : 'border-gray-100 dark:border-zinc-800 hover:border-primary hover:shadow-lg cursor-pointer'
                                }`}
                        >
                            <div className="flex items-center gap-6">
                                <div
                                    className="w-16 h-16 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: `${method.color}15` }}
                                >
                                    <Icon icon={method.icon} size={32} style={{ color: method.color }} />
                                </div>
                                <div className="flex-1 text-left">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                                        {method.name}
                                        {method.disabled && (
                                            <span className="text-xs font-normal text-gray-500 dark:text-zinc-500 bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded">
                                                Coming Soon
                                            </span>
                                        )}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-zinc-400">{method.description}</p>
                                </div>
                                {!method.disabled && (
                                    <Icon icon="solar:arrow-right-linear" size={24} className="text-gray-400" />
                                )}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Security Note */}
                <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-100 dark:border-blue-800 rounded-xl p-4">
                    <div className="flex gap-3">
                        <Icon icon="solar:shield-check-bold-duotone" size={24} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <div>
                            <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-1">Secure Payment</h4>
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                All transactions are encrypted and secure. Your payment information is never stored on our servers.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentMethodSelection;
