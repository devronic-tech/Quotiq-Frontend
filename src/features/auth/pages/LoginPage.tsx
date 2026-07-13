import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/shared';
import { useAuth } from '@/app/providers/auth-provider';
import { loginApi, verifyOtpApi, sendOtpApi } from '@/features/auth/api/auth.api';
import AuthLayout from '@/shared/components/layout/AuthLayout';
import Input from '@/shared/components/ui/Input';
import Button from '@/shared/components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, KeyRound, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { establishSession } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OTP Verification States
  const [otpRequired, setOtpRequired] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpAttemptsRemaining, setOtpAttemptsRemaining] = useState(3);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsSubmitting(true);
    try {
      const result = await loginApi(data);
      if (result.otpRequired) {
        setLoginEmail(data.email);
        setOtpRequired(true);
        setOtpAttemptsRemaining(3);
        setOtpCode('');
        setOtpError('');
        toast.success('Verification code sent to your email');
      } else if (result.user && result.tokens) {
        establishSession(result.user, result.tokens);
        navigate('/');
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.error?.message || 'Login failed. Please check credentials.';
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      setOtpError('OTP must be exactly 6 digits');
      return;
    }
    setIsVerifyingOtp(true);
    setOtpError('');
    try {
      const result = await verifyOtpApi(loginEmail, otpCode, 'login');
      if (result.user && result.tokens) {
        establishSession(result.user, result.tokens);
        navigate('/');
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.error?.message || 'OTP verification failed';
      setOtpError(errMsg);
      toast.error(errMsg);
      
      if (errMsg.includes('attempts remaining')) {
        const match = errMsg.match(/(\d+)\s+attempts/);
        if (match) {
          setOtpAttemptsRemaining(parseInt(match[1]));
        }
      } else if (errMsg.includes('Too many incorrect attempts') || otpAttemptsRemaining <= 1) {
        setOtpAttemptsRemaining(0);
        toast.error('Too many incorrect attempts. Please log in again.');
        setTimeout(() => {
          setOtpRequired(false);
          setOtpCode('');
          setOtpError('');
        }, 2000);
      }
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await sendOtpApi(loginEmail, 'login');
      setOtpCode('');
      setOtpError('');
      setOtpAttemptsRemaining(3);
      toast.success('A new verification code has been sent');
    } catch (err: any) {
      const errMsg = err.response?.data?.error?.message || 'Failed to resend OTP';
      toast.error(errMsg);
    }
  };

  if (otpRequired) {
    return (
      <AuthLayout>
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setOtpRequired(false)}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors font-semibold"
          >
            <ArrowLeft size={12} /> Back to Credentials
          </button>
          <div className="text-center mt-4">
            <h2 className="text-lg font-bold text-slate-100">Two-Factor Authentication</h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter the 6-digit code sent to <strong className="text-slate-300">{loginEmail}</strong>
            </p>
          </div>
        </div>

        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <Input
            label="Verification Code"
            type="text"
            placeholder="123456"
            maxLength={6}
            icon={<KeyRound size={16} />}
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
            error={otpError}
            disabled={otpAttemptsRemaining <= 0}
          />

          {otpAttemptsRemaining > 0 && otpAttemptsRemaining < 3 && (
            <p className="text-xs font-semibold text-amber-500 text-center">
              {otpAttemptsRemaining} attempts remaining
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            isLoading={isVerifyingOtp}
            disabled={otpAttemptsRemaining <= 0 || otpCode.length !== 6}
          >
            Verify & Sign In
          </Button>
        </form>

        <div className="text-center mt-6 text-xs text-slate-500">
          Didn't receive the code?{' '}
          <button
            type="button"
            onClick={handleResendOtp}
            className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Resend Code
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <h2 className="text-lg font-bold text-slate-100">Welcome Back</h2>
        <p className="text-xs text-slate-500 mt-1">Access your enterprise dashboard</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="name@company.com"
          icon={<Mail size={16} />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          icon={<Lock size={16} />}
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-800 bg-slate-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-950"
            />
            <span className="text-xs font-semibold text-slate-400 select-none">Remember me</span>
          </label>
          <Link
            to="/forgot-password"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Forgot Password?
          </Link>
        </div>

        <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isSubmitting}>
          Sign In
        </Button>
      </form>

      <div className="text-center mt-6 text-xs text-slate-500">
        Don't have an account?{' '}
        <Link
          to="/register"
          className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          Create Organization
        </Link>
      </div>
    </AuthLayout>
  );
}
