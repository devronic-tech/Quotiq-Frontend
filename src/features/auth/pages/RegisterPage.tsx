import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@/shared';
import { useAuth } from '@/app/providers/auth-provider';
import AuthLayout from '@/shared/components/layout/AuthLayout';
import Input from '@/shared/components/ui/Input';
import Button from '@/shared/components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsSubmitting(true);
    try {
      await registerUser(data);
      navigate('/');
    } catch (err: any) {
      const errMsg = err.response?.data?.error?.message || 'Registration failed. Please check details.';
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <h2 className="text-lg font-bold text-slate-800">Create Workspace</h2>
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
