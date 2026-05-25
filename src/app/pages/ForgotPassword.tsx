import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft, KeyRound, Lock, Mail, RefreshCcw } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useToast } from '../components/ui/toast';
import { useAuth } from '../providers/AuthProvider';
import mainLogo from '../../assets/Nataka Hii_1.png';

export function ForgotPassword() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { forgotPassword, resendOtp, resetPassword } = useAuth();

  useEffect(() => {
    if (step !== 2 || countdown <= 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setCountdown((currentValue) => Math.max(currentValue - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [countdown, step]);

  const handleRequestReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await forgotPassword(email);
      toast({ type: 'success', title: 'Reset passkey sent', message: response.message });
      setStep(2);
      setCountdown(30);
    } catch (error: any) {
      toast({ type: 'error', title: 'Unable to send reset passkey', message: error?.message || 'Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password !== passwordConfirmation) {
      toast({ type: 'error', title: 'Passwords do not match', message: 'Please confirm your new password again.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await resetPassword({
        email,
        otp,
        password,
        password_confirmation: passwordConfirmation,
      });

      toast({ type: 'success', title: 'Password updated', message: response.message });
      navigate('/login', { replace: true });
    } catch (error: any) {
      toast({ type: 'error', title: 'Unable to reset password', message: error?.message || 'Please check the passkey and try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);

    try {
      const response = await resendOtp(email, 'password_reset');
      toast({ type: 'success', title: 'Code resent', message: response.message });
      setCountdown(30);
    } catch (error: any) {
      toast({ type: 'error', title: 'Unable to resend passkey', message: error?.message || 'Please try again in a moment.' });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-page)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg bg-white rounded-[28px] shadow-[var(--shadow-level-3)] border border-[var(--color-border)]/60 p-6 sm:p-8">
        <Link to="/login" className="inline-flex items-center gap-2 text-[14px] font-semibold text-[var(--color-primary)] hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        <div className="mt-6 text-center">
          <img
            src={mainLogo}
            alt="Nataka Hii"
            className="h-24 w-auto mx-auto mb-4"
          />
          <h1 className="text-[30px] font-bold text-[var(--color-text-heading)] tracking-tight">
            {step === 1 ? 'Reset your password' : 'Choose a new password'}
          </h1>
          <p className="mt-2 text-[15px] text-[var(--color-text-muted)]">
            {step === 1
              ? 'We will send a one-time verification passkey to your email address.'
              : `Enter the 6-character passkey sent to ${email} and create a new password.`}
          </p>
        </div>

        {step === 1 ? (
          <form className="mt-8 space-y-5" onSubmit={handleRequestReset}>
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-[var(--color-text-heading)] ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Mail className="w-5 h-5 text-[var(--color-text-muted)]" />
                </div>
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="pl-11 focus:border-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                  required
                />
              </div>
            </div>

            <Button type="submit" size="l" className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-darker)] text-white" isLoading={isSubmitting}>
              Send Reset Passkey
            </Button>
          </form>
        ) : (
          <form className="mt-8 space-y-5" onSubmit={handleResetPassword}>
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-[var(--color-text-heading)] ml-1">Verification Passkey</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <KeyRound className="w-5 h-5 text-[var(--color-text-muted)]" />
                </div>
                <Input
                  type="text"
                  inputMode="text"
                  maxLength={6}
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6))}
                  placeholder="A7B3K9"
                  className="pl-11 tracking-[0.35em] focus:border-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-[var(--color-text-heading)] ml-1">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Lock className="w-5 h-5 text-[var(--color-text-muted)]" />
                </div>
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  className="pl-11 focus:border-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-[var(--color-text-heading)] ml-1">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Lock className="w-5 h-5 text-[var(--color-text-muted)]" />
                </div>
                <Input
                  type="password"
                  value={passwordConfirmation}
                  onChange={(event) => setPasswordConfirmation(event.target.value)}
                  placeholder="Repeat your new password"
                  className="pl-11 focus:border-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-[16px] bg-[var(--color-bg-card)] px-4 py-3">
              <span className="text-[13px] text-[var(--color-text-muted)]">
                {countdown > 0 ? `Resend passkey in 00:${countdown.toString().padStart(2, '0')}` : 'Didn’t get the email?'}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="s"
                className="text-[var(--color-primary)]"
                onClick={handleResendOtp}
                isLoading={isResending}
                disabled={countdown > 0}
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Resend
              </Button>
            </div>

            <Button type="submit" size="l" className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-white" isLoading={isSubmitting}>
              Update Password
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
