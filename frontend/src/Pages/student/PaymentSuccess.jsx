import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Icon } from '@iconify/react';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [verifying, setVerifying] = useState(true);
    const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
    const [errorDetails, setErrorDetails] = useState(null);

    useEffect(() => {
        const verifyPayment = async () => {
            // Log everything for debugging
            let gateway = searchParams.get('gateway');
            let dataBase64 = searchParams.get('data');

            console.log('DEBUG - Raw URL Params:', { gateway, dataBase64 });

            // FIX: eSewa mangles the URL by adding ?data=... to as success_url that already has ?gateway=esewa
            // Resulting in gateway="esewa?data=ey..."
            if (gateway && gateway.includes('?data=')) {
                console.log('DEBUG - Detected mangled eSewa URL. Splitting params...');
                const parts = gateway.split('?data=');
                gateway = parts[0];
                dataBase64 = parts[1];
                console.log('DEBUG - Fixed Params:', { gateway, dataBase64 });
            }

            try {
                if (gateway?.toLowerCase() === 'esewa') {
                    if (dataBase64) {
                        let decodedData;
                        let jsonString;
                        try {
                            // Trim to remove any whitespace that might cause atob to fail
                            jsonString = atob(dataBase64.trim());
                            console.log('DEBUG - Decoded JSON String:', jsonString);

                            // Handle potential eSewa malformed JSON (double quotes for COMPLETE)
                            // Some versions of eSewa UAT have been known to send: "status":"COMPLETE""
                            const sanitizedJson = jsonString.replace(/"status":"COMPLETE""/g, '"status":"COMPLETE"');
                            decodedData = JSON.parse(sanitizedJson);
                        } catch (e) {
                            console.error('DEBUG - Parsing Error:', e);
                            setStatus('error');
                            setErrorDetails({
                                message: 'Malformed eSewa response data',
                                reason: 'JSON_PARSE_ERROR',
                                error: e.message,
                                rawString: jsonString || 'Could not decode Base64'
                            });
                            setVerifying(false);
                            return;
                        }

                        console.log('DEBUG - Parsed Data:', decodedData);
                        const { product_code, total_amount, transaction_uuid } = decodedData;

                        // Call backend
                        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/payments/esewa/verify`, {
                            params: { product_code, total_amount, transaction_uuid },
                            withCredentials: true
                        });

                        console.log('DEBUG - Backend Response:', response.data);

                        if (response.data.success) {
                            setStatus('success');
                            setTimeout(() => navigate('/student/my-enrollments'), 3000);
                        } else {
                            setStatus('error');
                            setErrorDetails({
                                message: response.data.message || 'Verification rejected by server',
                                ...response.data
                            });
                        }
                    } else {
                        setStatus('error');
                        setErrorDetails({
                            message: 'MISSING_DATA: The payment data summary is missing.',
                            hint: 'This usually happens if the gateway fails to provide transaction details.'
                        });
                    }
                } else if (gateway?.toLowerCase() === 'khalti') {
                    setStatus('success');
                    setTimeout(() => navigate('/student/my-enrollments'), 3000);
                } else {
                    console.warn('DEBUG - Unknown gateway:', gateway);
                    setStatus('error');
                    setErrorDetails({ message: `UNKNOWN_GATEWAY: Received "${gateway}". Expected "esewa" or "khalti".` });
                }
            } catch (error) {
                console.error('DEBUG - Network/Server Error:', error);
                setStatus('error');
                setErrorDetails({
                    message: error.message || 'Payment Verification Request Failed',
                    networkError: true,
                    status: error.response?.status,
                    backendData: error.response?.data
                });
            } finally {
                setVerifying(false);
            }
        };

        verifyPayment();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen bg-muted flex flex-col justify-center items-center p-6 font-sans text-foreground">
            <div className="bg-card p-12 rounded-md shadow-soft max-w-xl w-full text-center border border-border/50">
                {verifying ? (
                    <div className="py-16">
                        <div className="w-24 h-24 mx-auto mb-10 relative">
                            <div className="absolute inset-0 rounded-md border-[8px] border-primary/10"></div>
                            <div className="absolute inset-0 rounded-md border-[8px] border-primary border-t-transparent animate-spin"></div>
                            <Icon icon="solar:shield-check-bold-duotone" className="absolute inset-0 m-auto w-12 h-12 text-primary" />
                        </div>
                        <h2 className="text-4xl font-black mb-4 tracking-tighter">Securing Enrollment</h2>
                        <p className="text-muted-foreground font-bold px-10">Talking to payment servers...</p>
                    </div>
                ) : status === 'success' ? (
                    <div className="py-10">
                        <div className="w-32 h-32 bg-emerald-500/10 rounded-md flex items-center justify-center mx-auto mb-10 border-[10px] border-card shadow-2xl">
                            <Icon icon="solar:check-circle-bold" className="w-16 h-16 text-emerald-500" />
                        </div>
                        <h2 className="text-5xl font-black mb-4 tracking-tighter">You're In!</h2>
                        <p className="text-muted-foreground font-bold mb-12">Your payment was confirmed. Welcome to the NEXL family.</p>
                        <div className="relative">
                            <div className="absolute -top-6 left-0 right-0 h-1.5 bg-muted rounded-md overflow-hidden">
                                <div className="h-full bg-primary animate-[progress_3s_linear]"></div>
                            </div>
                            <button
                                onClick={() => navigate('/student/my-enrollments')}
                                className="w-full py-6 bg-primary text-primary-foreground font-black rounded-md hover:opacity-90 transition-all transform active:scale-95 shadow-xl shadow-primary/20"
                            >
                                START LEARNING NOW
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="py-8">
                        <div className="w-24 h-24 bg-destructive/10 rounded-md flex items-center justify-center mx-auto mb-8 border-[8px] border-card shadow-xl">
                            <Icon icon="solar:shield-warning-bold" className="w-12 h-12 text-destructive" />
                        </div>
                        <h2 className="text-4xl font-black mb-6 tracking-tighter">Verification Issue</h2>

                        <div className="bg-muted/50 p-8 rounded-md mb-10 text-left border border-border/50 shadow-inner overflow-hidden">
                            <div className="flex items-center gap-2 mb-6">
                                <span className="px-3 py-1 bg-destructive/10 text-destructive text-[10px] font-black rounded-md uppercase tracking-widest border border-destructive/20">Diagnostic Report</span>
                            </div>

                            <p className="text-foreground font-black text-xl mb-4 leading-tight">
                                {errorDetails?.message || 'Something went wrong during auto-verification.'}
                            </p>

                            <div className="space-y-4">
                                <div className="bg-card/60 p-6 rounded-md border border-border/50 shadow-sm">
                                    <p className="text-[10px] font-black text-muted-foreground/60 uppercase mb-3 tracking-widest">Technical Data</p>
                                    <pre className="text-[11px] font-mono text-muted-foreground max-h-64 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                                        {JSON.stringify(errorDetails || { info: 'No details available' }, null, 2)}
                                    </pre>
                                </div>

                                {errorDetails?.hint && (
                                    <p className="text-xs text-muted-foreground font-medium italic">
                                        💡 Tip: {errorDetails.hint}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full py-6 bg-primary text-primary-foreground font-bold rounded-md hover:opacity-95 transition-all shadow-xl shadow-primary/20"
                            >
                                Try Refreshing
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="w-full py-4 text-muted-foreground font-bold rounded-md hover:bg-muted transition-all text-sm"
                            >
                                Back to Home
                            </button>
                        </div>
                        <p className="mt-8 text-[10px] text-muted-foreground font-medium px-10">
                            If money was deducted from your account, please send a screenshot of this page to our support team.
                        </p>
                    </div>
                )}
            </div>
            <p className="mt-12 text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.4em]">Secure Node 02V2</p>
            <style>{`
                @keyframes progress {
                    from { width: 0%; }
                    to { width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default PaymentSuccess;
