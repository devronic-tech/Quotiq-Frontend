import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, resetPasswordSchema, type ForgotPasswordInput, type ResetPasswordInput } from '@/shared';
import { sendOtpApi, resetPasswordApi } from '@/features/auth/api/auth.api';
import AuthLayout from '@/shared/components/layout/AuthLayout';
import Input from '@/shared/components/ui/Input';
import Button from '@/shared/components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Lock, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  
  // OTP Reset States
  const [otpRequired, setOtpRequired] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isSubmittingReset, setIsSubmittingReset] = useState(false);
  const [otpAttemptsRemaining, setOtpAttemptsRemaining] = useState(3);
  const [otpError, setOtpError] = useState('');

  // Form for Step 1: Request OTP
  const emailForm = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  // Form for Step 2: Reset Password with OTP
  const resetForm = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
      otp: '',
      password: '',
      confirmPassword: '',
    }
  });

  const onEmailSubmit = async (data: ForgotPasswordInput) => {
    setIsSubmittingEmail(true);
    try {
      await sendOtpApi(data.email, 'forgot_password');
      setResetEmail(data.email);
      resetForm.setValue('email', data.email);
      setOtpRequired(true);
      setOtpAttemptsRemaining(3);
      setOtpError('');
      toast.success('Verification code sent to your email');
    } catch (err: any) {
      const errMsg = err.response?.data?.error?.message || 'Failed to send reset code. Please check your email.';
      toast.error(errMsg);
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  const onResetSubmit = async (data: ResetPasswordInput) => {
    setIsSubmittingReset(true);
    setOtpError('');
    try {
      await resetPasswordApi(data);
      toast.success('Password reset successful. Please login with your new password.');
      navigate('/login');
    } catch (err: any) {
      const errMsg = err.response?.data?.error?.message || 'Password reset failed';
      setOtpError(errMsg);
      toast.error(errMsg);

      if (errMsg.includes('attempts remaining')) {
        const match = errMsg.match(/(\d+)\s+attempts/);
        if (match) {
          setOtpAttemptsRemaining(parseInt(match[1]));
        }
      } else if (errMsg.includes('Too many incorrect attempts') || otpAttemptsRemaining <= 1) {
        setOtpAttemptsRemaining(0);
        toast.error('Too many incorrect attempts. Please request a new code.');
        setTimeout(() => {
          setOtpRequired(false);
          resetForm.reset();
          emailForm.reset();
        }, 2000);
      }
    } finally {
      setIsSubmittingReset(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await sendOtpApi(resetEmail, 'forgot_password');
      resetForm.setValue('otp', '');
      setOtpError('');
      setOtpAttemptsRemaining(3);
      toast.success('A new verification code has been sent');
    } catch (err: any) {
      const errMsg = err.response?.data?.error?.message || 'Failed to resend code';
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
            <ArrowLeft size={12} /> Back to Email
          </button>
          <div className="text-center mt-4">
            <h2 className="text-lg font-bold text-slate-100">Reset Password</h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter the code sent to <strong className="text-slate-300">{resetEmail}</strong> and your new password.
            </p>
          </div>
        </div>

        <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
          <Input
            label="Verification Code"
            type="text"
            placeholder="123456"
            maxLength={6}
            icon={<KeyRound size={16} />}
            error={resetForm.formState.errors.otp?.message || otpError}
            {...resetForm.register('otp', {
              onChange: (e) => {
                resetForm.setValue('otp', e.target.value.replace(/\D/g, ''));
              }
            })}
            disabled={otpAttemptsRemaining <= 0}
          />

          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            icon={<Lock size={16} />}
            error={resetForm.formState.errors.password?.message}
            {...resetForm.register('password')}
            disabled={otpAttemptsRemaining <= 0}
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            icon={<Lock size={16} />}
            error={resetForm.formState.errors.confirmPassword?.message}
            {...resetForm.register('confirmPassword')}
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
            isLoading={isSubmittingReset}
            disabled={otpAttemptsRemaining <= 0}
          >
            Reset Password
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
      <div className="mb-6">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors font-semibold"
        >
          <ArrowLeft size={12} /> Back to Sign In
        </Link>
        <div className="text-center mt-4">
          <h2 className="text-lg font-bold text-slate-100">Forgot Password</h2>
          <p className="text-xs text-slate-500 mt-1">
            We will send a 6-digit verification code to your email to reset your password.
          </p>
        </div>
      </div>

      <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="name@company.com"
          icon={<Mail size={16} />}
          error={emailForm.formState.errors.email?.message}
          {...emailForm.register('email')}
        />

        <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isSubmittingEmail}>
          Send Verification Code
        </Button>
      </form>
    </AuthLayout>
  );
}
