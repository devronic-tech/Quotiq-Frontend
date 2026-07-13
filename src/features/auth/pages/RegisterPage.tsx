import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@/shared';
import { useAuth } from '@/app/providers/auth-provider';
import { sendOtpApi, verifyOtpApi } from '@/features/auth/api/auth.api';
import AuthLayout from '@/shared/components/layout/AuthLayout';
import Input from '@/shared/components/ui/Input';
import Button from '@/shared/components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Building2, KeyRound, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OTP States
  const [otpRequired, setOtpRequired] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpAttemptsRemaining, setOtpAttemptsRemaining] = useState(3);
  const [cachedFormData, setCachedFormData] = useState<RegisterInput | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      verificationToken: '', // Required by backend schema but optional/filled later on frontend
    }
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsSubmitting(true);
    try {
      // Send OTP first to verify the email
      await sendOtpApi(data.email, 'signup');
      setCachedFormData(data);
      setOtpRequired(true);
      setOtpAttemptsRemaining(3);
      setOtpCode('');
      setOtpError('');
      toast.success('Verification code sent to your email');
    } catch (err: any) {
      const errMsg = err.response?.data?.error?.message || 'Failed to send verification code. Please try again.';
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtpAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cachedFormData) return;
    if (!otpCode || otpCode.length !== 6) {
      setOtpError('OTP must be exactly 6 digits');
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError('');
    try {
      // 1. Verify OTP and get verification token
      const result = await verifyOtpApi(cachedFormData.email, otpCode, 'signup');
      if (result.verificationToken) {
        // 2. Register user with form data + token
        await registerUser({
          ...cachedFormData,
          verificationToken: result.verificationToken,
        });
        navigate('/');
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.error?.message || 'Verification failed';
      setOtpError(errMsg);
      toast.error(errMsg);

      if (errMsg.includes('attempts remaining')) {
        const match = errMsg.match(/(\d+)\s+attempts/);
        if (match) {
          setOtpAttemptsRemaining(parseInt(match[1]));
        }
      } else if (errMsg.includes('Too many incorrect attempts') || otpAttemptsRemaining <= 1) {
        setOtpAttemptsRemaining(0);
        toast.error('Too many incorrect attempts. Please fill form and request a new code.');
        setTimeout(() => {
          setOtpRequired(false);
          setOtpCode('');
          setOtpError('');
          setCachedFormData(null);
        }, 2000);
      }
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (!cachedFormData) return;
    try {
      await sendOtpApi(cachedFormData.email, 'signup');
      setOtpCode('');
      setOtpError('');
      setOtpAttemptsRemaining(3);
      toast.success('A new verification code has been sent');
    } catch (err: any) {
      const errMsg = err.response?.data?.error?.message || 'Failed to resend code';
      toast.error(errMsg);
    }
  };

  if (otpRequired && cachedFormData) {
    return (
      <AuthLayout>
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setOtpRequired(false)}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors font-semibold"
          >
            <ArrowLeft size={12} /> Back to Register
          </button>
          <div className="text-center mt-4">
            <h2 className="text-lg font-bold text-slate-100">Verify Your Email</h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter the 6-digit code sent to <strong className="text-slate-300">{cachedFormData.email}</strong>
            </p>
          </div>
        </div>

        <form onSubmit={handleVerifyOtpAndRegister} className="space-y-4">
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
            Verify & Create Workspace
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
        <h2 className="text-lg font-bold text-slate-100">Create Workspace</h2>
        <p className="text-xs text-slate-500 mt-1">Register your organization & admin account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Organization Name"
          type="text"
          placeholder="Acme Corporation"
          icon={<Building2 size={16} />}
          error={errors.organizationName?.message}
          {...register('organizationName')}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            type="text"
            placeholder="John"
            icon={<UserIcon size={16} />}
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input
            label="Last Name"
            type="text"
            placeholder="Doe"
            icon={<UserIcon size={16} />}
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

        <Input
          label="Work Email"
          type="email"
          placeholder="john.doe@company.com"
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

        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          icon={<Lock size={16} />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isSubmitting}>
          Create Workspace
        </Button>
      </form>

      <div className="text-center mt-6 text-xs text-slate-500">
        Already have a workspace?{' '}
        <Link
          to="/login"
          className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          Sign In
        </Link>
      </div>
    </AuthLayout>
  );
}
