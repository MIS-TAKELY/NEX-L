import { Icon } from '@iconify/react';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentGateway = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const method = searchParams.get('method') || 'esewa';
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 font-sans">
      
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        
        {/* Header Strip */}
        <div className="h-1 w-full" style={{ backgroundColor: currentConfig.color }}></div>

        <div className="p-8">
            {/* Logo Section */}
            <div className="flex flex-col items-center mb-8">
                <div className="flex items-center justify-center gap-2 mb-2">
                     <Icon icon={currentConfig.logoIcon} className="w-10 h-10" style={{ color: currentConfig.color }} />
                     <span className="text-3xl font-bold" style={{ color: currentConfig.color }}>{currentConfig.logoText}</span>
                </div>
                {method === 'khalti' && <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">by IME</span>}
            </div>

            {/* Instruction Text */}
            <div className="text-center mb-8">
                <p className="font-bold text-gray-700 text-sm mb-4">
                    You will be redirected to your {currentConfig.name} account to complete your payment:
                </p>
                <ol className="text-xs text-gray-500 text-left space-y-1 ml-4 list-decimal">
                    {currentConfig.instructions.map((inst, idx) => (
                        <li key={idx}>{inst}</li>
                    ))}
                </ol>
                <p className="text-xs font-bold text-gray-800 mt-4">
                    *** Login with your {currentConfig.name} ID and Password ***
                </p>
            </div>

            {/* Login Form */}
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Payment Successful! (Simulation)'); navigate('/student/my-enrollments'); }}>
                
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon icon="solar:user-linear" className="text-gray-400" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Mobile or Email" 
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                        style={{ '--tw-ring-color': currentConfig.color }}
                    />
                </div>

                <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon icon="solar:lock-keyhole-linear" className="text-gray-400" />
                    </div>
                    <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Password" 
                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                        style={{ '--tw-ring-color': currentConfig.color }}
                    />
                     <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                        <Icon icon={showPassword ? "solar:eye-linear" : "solar:eye-closed-linear"} className="text-gray-400" />
                    </button>
                </div>

                <button 
                    type="submit" 
                    className="w-full py-3 text-white font-bold rounded-lg shadow-md hover:opacity-90 transition-opacity uppercase text-sm mt-6"
                    style={{ backgroundColor: method === 'khalti' ? '#5c2d91' : (method === 'esewa' ? '#60bb46' : '#dc1212ff') }}
                >
                    Login
                </button>

            </form>

            <div className="mt-8 text-center">
                 <p className="text-[10px] text-gray-400 font-bold">
                     © 2026 {currentConfig.name}. All Rights Reserved.
                 </p>
            </div>

        </div>
      </div>
    
      {/* Back Button for Demo */}
      <button onClick={() => navigate(-1)} className="mt-8 text-gray-400 text-sm hover:text-gray-600 underline">
          Cancel and Return
      </button>

    </div>
  );
};

export default PaymentGateway;
