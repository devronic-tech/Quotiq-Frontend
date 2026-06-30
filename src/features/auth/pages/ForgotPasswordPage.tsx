import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/shared';
import { forgotPasswordApi } from '@/features/auth/api/auth.api';
import AuthLayout from '@/shared/components/layout/AuthLayout';
import Input from '@/shared/components/ui/Input';
import Button from '@/shared/components/ui/Button';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsSubmitting(true);
    try {
      await forgotPasswordApi(data.email);
      setIsSent(true);
      toast.success('Password reset link sent to your email.');
    } catch (err: any) {
      const errMsg = err.response?.data?.error?.message || 'Something went wrong. Please try again.';
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <h2 className="text-lg font-bold text-slate-100">Reset Password</h2>
          <p className="text-xs text-slate-500 mt-1">
            We will email you a link to reset your password.
          </p>
        </div>
      </div>

      {isSent ? (
        <div className="text-center space-y-4 py-4">
          <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-800/30">
            <Mail size={22} />
          </div>
          <h3 className="text-sm font-bold text-slate-200 font-semibold">Check your email</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            A secure link has been sent to your email. Click the link inside to set a new password.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="name@company.com"
            icon={<Mail size={16} />}
            error={errors.email?.message}
            {...register('email')}
          />

          <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isSubmitting}>
            Send Reset Link
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
