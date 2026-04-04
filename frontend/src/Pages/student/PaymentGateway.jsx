import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

const PaymentGateway = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!userData) {
      navigate('/login?redirect=/payment-gateway' + window.location.search);
    }
  }, [userData, navigate]);


  const method = searchParams.get('method') || 'esewa';
  const amount = searchParams.get('amount') || 0;
  const courseId = searchParams.get('courseId'); // Single course (legacy)
  const courseIds = searchParams.get('courseIds')?.split(',') || (courseId ? [courseId] : []); // Multiple courses
  const courseCount = courseIds.length;
  const couponCode = searchParams.get('couponCode');

  const [loading, setLoading] = useState(false);

  // eSewa payment requires a form post
  const postToEsewa = (data) => {
    const form = document.createElement('form');
    form.setAttribute('method', 'POST');
    form.setAttribute('action', 'https://rc-epay.esewa.com.np/api/epay/main/v2/form');

    for (const key in data) {
      const hiddenField = document.createElement('input');
      hiddenField.setAttribute('type', 'hidden');
      hiddenField.setAttribute('name', key);
      hiddenField.setAttribute('value', data[key]);
      form.appendChild(hiddenField);
    }

    document.body.appendChild(form);
    form.submit();
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!userData || courseIds.length === 0) {
      alert('Missing user or course information');
      return;
    }

    setLoading(true);
    try {
      if (method === 'esewa') {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/payments/esewa/initiate`, {
          amount,
          courseIds, // Send array of course IDs
          courseId: courseIds[0], // Legacy support
          userId: userData.id || userData._id,
          couponCode: couponCode || undefined
        });

        if (response.data.success) {
          postToEsewa(response.data.paymentData);
        }
      } else if (method === 'khalti') {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/payments/khalti/initiate`, {
          amount,
          courseIds, // Send array of course IDs
          courseId: courseIds[0], // Legacy support
          userId: userData.id || userData._id,
          couponCode: couponCode || undefined
        });

        if (response.data.success && response.data.payment_url) {
          window.location.href = response.data.payment_url;
        }
      }
    } catch (error) {
      console.error('Payment initiation failed', error);
      alert('Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Config based on method
  const config = {
    esewa: {
      name: 'eSewa',
      color: '#60bb46',
      logoIcon: 'solar:wallet-money-linear',
      logoText: 'eSewa',
      instructions: [
        'Login to your eSewa account using your eSewa ID and Password',
        'Ensure your eSewa account is active and has sufficient balance',
        'Enter OTP (one time password) sent to your registered mobile number'
      ]
    },
    khalti: {
      name: 'Khalti',
      color: '#5c2d91',
      logoIcon: 'solar:wallet-2-linear',
      logoText: 'Khalti',
      instructions: [
        'Login using your Khalti ID and Password',
        'Ensure sufficient balance',
        'Enter OTP sent to your mobile'
      ]
    },
    connectips: {
      name: 'ConnectIPS',
      color: '#dc1212ff',
      logoIcon: 'solar:card-transfer-linear',
      logoText: 'ConnectIPS',
      instructions: [
        'Select your bank and login with your credentials',
        'Verify the transaction details',
        'Enter the OTP sent to your mobile or email'
      ]
    }
  };

  const currentConfig = config[method] || config['esewa'];

  return (
    <div className="min-h-screen bg-muted flex flex-col justify-center items-center p-4 font-sans">
      <div className="bg-background rounded-md shadow-xl w-full max-w-md overflow-hidden">
        <div className="h-1 w-full" style={{ backgroundColor: currentConfig.color }}></div>
        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Icon icon={currentConfig.logoIcon} className="w-10 h-10" style={{ color: currentConfig.color }} />
              <span className="text-3xl font-bold" style={{ color: currentConfig.color }}>{currentConfig.logoText}</span>
            </div>
            {method === 'khalti' && <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">by IME</span>}
          </div>

          <div className="text-center mb-8">
            <div className="bg-secondary p-4 rounded-md mb-6">
              <p className="text-sm text-muted-foreground uppercase font-bold tracking-wider">Total Amount</p>
              <p className="text-2xl font-black text-foreground">Rs. {amount}</p>
              {courseCount > 1 && (
                <p className="text-xs text-muted-foreground mt-2">{courseCount} courses</p>
              )}
            </div>
            <p className="font-bold text-foreground text-sm mb-4">
              You will be redirected to your {currentConfig.name} account to complete your payment:
            </p>
            <ol className="text-xs text-muted-foreground text-left space-y-1 ml-4 list-decimal">
              {currentConfig.instructions.map((inst, idx) => (
                <li key={idx}>{inst}</li>
              ))}
            </ol>
          </div>

          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full py-4 text-foreground font-bold rounded-md shadow-md hover:opacity-90 transition-all uppercase text-sm mt-6 flex items-center justify-center gap-2"
            style={{ backgroundColor: currentConfig.color }}
          >
            {loading ? (
              <Icon icon="eos-icons:loading" className="w-5 h-5" />
            ) : (
              `Pay with ${currentConfig.name}`
            )}
          </button>

          <div className="mt-8 text-center">
            <p className="text-[10px] text-muted-foreground font-bold">
              © 2026 {currentConfig.name}. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
      <button onClick={() => navigate(-1)} className="mt-8 text-muted-foreground text-sm hover:text-muted-foreground underline">
        Cancel and Return
      </button>
    </div>
  );
};

export default PaymentGateway;
