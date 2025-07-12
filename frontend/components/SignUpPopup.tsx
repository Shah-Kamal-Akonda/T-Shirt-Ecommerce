'use client';
import React, { useState } from 'react';
import axios from 'axios';

interface SignUpPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SignupResponse {
  message: string;
}

interface VerifyCodeResponse {
  message: string;
  userId: number;
}

interface ErrorResponse {
  message: string;
  statusCode?: number;
}

const SignUpPopup: React.FC<SignUpPopupProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'signup' | 'verify' | 'success' | 'error'>('signup');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post<SignupResponse>(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, { email, password });
      if (response.data.message === 'Verification code sent to your email') {
        setStep('verify');
        setErrorMessage('');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: ErrorResponse } };
      setErrorMessage(err.response?.data?.message || 'Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post<VerifyCodeResponse>(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-code`, { email, code, password });
      if (response.data.message === 'Sign up successful') {
        setStep('success');
        setErrorMessage('');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: ErrorResponse } };
      setErrorMessage(err.response?.data?.message || 'Invalid verification code. Please try again.');
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setCode('');
    setStep('signup');
    setErrorMessage('');
    setIsLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  backdrop-blur-sm	  flex items-center justify-center z-50  ">
      <div className="bg-white p-2 md:p-4 lg:p-6  rounded-2xl border-2 md:border-4 border-green-500   w-[220px] md:w-[350px] lg:w-[400px] text-[12px]  md:text-[16px] lg:text[20px] relative">
        <button onClick={handleClose} className="absolute top-2 right-2 text-gray-600 hover:text-gray-800">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {step === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Sign Up</h2>
            {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
            <div>
              <label className="block text-gray-700 text-sm font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </form>
        )}

        {step === 'verify' && (
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Enter Verification Code</h2>
            <p className="text-gray-600 text-sm">A code has been sent to {email}</p>
            {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
            <div>
              <label className="block text-gray-700 text-sm font-medium">Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
              disabled={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>
        )}

        {step === 'success' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Sign Up Successful</h2>
            <p className="text-green-600">Your account has been created successfully!</p>
            <button
              onClick={handleClose}
              className="w-full bg-green-600 text-white p-2 rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        )}

        {step === 'error' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Verification Failed</h2>
            <p className="text-red-500 text-sm">{errorMessage}</p>
            <button
              onClick={() => setStep('verify')}
              className="w-full bg-green-600 text-white p-2 rounded hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignUpPopup;