'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/app/context/AuthContext';

interface LoginPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>; // ADD HERE: Added onSuccess prop
}

interface LoginResponse {
  message: string;
  userId?: number;
  token?: string;
}

interface ForgotPasswordResponse {
  message: string;
}

interface ResetPasswordResponse {
  message: string;
}

interface ErrorResponse {
  message: string;
  statusCode?: number;
}

const LoginPopup: React.FC<LoginPopupProps> = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'login' | 'success' | 'error' | 'forgot' | 'verifyReset' | 'resetSuccess'>('login');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { setIsLoggedIn } = useAuth();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post<LoginResponse>(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, { email, password });
      if (response.data.message === 'Login successful' && response.data.token) {
        localStorage.setItem('token', response.data.token);
        setIsLoggedIn(true);
        setStep('success');
        setErrorMessage('');
        await onSuccess(); // Call onSuccess after login
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: ErrorResponse } };
      setErrorMessage(err.response?.data?.message || 'Failed to login. Please try again.');
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post<ForgotPasswordResponse>(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, { email });
      if (response.data.message === 'Reset code sent to your email') {
        setStep('verifyReset');
        setErrorMessage('');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: ErrorResponse } };
      setErrorMessage(err.response?.data?.message || 'Failed to send reset code. Please try again.');
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post<ResetPasswordResponse>(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, { email, code, newPassword });
      if (response.data.message === 'Password reset successful') {
        setStep('resetSuccess');
        setErrorMessage('');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: ErrorResponse } };
      setErrorMessage(err.response?.data?.message || 'Failed to reset password. Please try again.');
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setNewPassword('');
    setCode('');
    setStep('login');
    setErrorMessage('');
    setIsLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
        <button onClick={handleClose} className="absolute top-2 right-2 text-gray-600 hover:text-gray-800">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {step === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Login</h2>
            {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
            <div>
              <label className="block text-gray-700 text-sm font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-600"
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
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-600"
                required
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:bg-green-400"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
            <button
              type="button"
              onClick={() => setStep('forgot')}
              className="w-full text-green-600 hover:text-green-800 text-sm mt-2"
            >
              Forgot Password?
            </button>
          </form>
        )}

        {step === 'forgot' && (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Forgot Password</h2>
            <p className="text-gray-600 text-sm">Enter your email to receive a reset code.</p>
            {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
            <div>
              <label className="block text-gray-700 text-sm font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-600"
                required
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:bg-green-400"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Reset Code'}
            </button>
            <button
              type="button"
              onClick={() => setStep('login')}
              className="w-full text-green-600 hover:text-green-800 text-sm mt-2"
              disabled={isLoading}
            >
              Back to Login
            </button>
          </form>
        )}

        {step === 'verifyReset' && (
          <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Reset Password</h2>
            <p className="text-gray-600 text-sm">Enter the 6-digit code sent to {email} and your new password.</p>
            {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
            <div>
              <label className="block text-gray-700 text-sm font-medium">Reset Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-600"
                required
                disabled={isLoading}
                placeholder="Enter 6-digit code"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-600"
                required
                disabled={isLoading}
                placeholder="Enter new password"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:bg-green-400"
              disabled={isLoading}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
            <button
              type="button"
              onClick={() => setStep('login')}
              className="w-full text-green-600 hover:text-green-800 text-sm mt-2"
              disabled={isLoading}
            >
              Back to Login
            </button>
          </form>
        )}

        {step === 'success' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Login Successful</h2>
            <p className="text-green-600">You have logged in successfully!</p>
            <button
              onClick={handleClose}
              className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
            >
              Close
            </button>
          </div>
        )}

        {step === 'resetSuccess' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Password Reset Successful</h2>
            <p className="text-green-600">Your password has been reset successfully!</p>
            <button
              onClick={handleClose}
              className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => setStep('login')}
              className="w-full text-green-600 hover:text-green-800 text-sm mt-2"
            >
              Back to Login
            </button>
          </div>
        )}

        {step === 'error' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Operation Failed</h2>
            <p className="text-red-500 text-sm">{errorMessage}</p>
            <button
              onClick={() => setStep('login')}
              className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPopup;