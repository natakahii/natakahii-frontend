import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { ArrowLeft, ArrowRight, CheckCircle, Lock, Mail, Phone, ShoppingCart, Store, User } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../components/ui/input-otp';
import { useToast } from '../components/ui/toast';
import { useAuth } from '../providers/AuthProvider';
import { resolveUserDefaultRoute } from '../services/authService';
import logoImage from '../../assets/Nataka Hii_1.png';

export function Register() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { loginWithGoogle, register, resendOtp, verifyRegistration } = useAuth();

  useEffect(() => {
    let timer: number | undefined;

    if (step === 2 && countdown > 0) {
      timer = window.setInterval(() => setCountdown((currentValue) => Math.max(currentValue - 1, 0)), 1000);
    }

    return () => {
      if (timer) {
        window.clearInterval(timer);
      }
    };
  }, [countdown, step]);

  const requestedPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;

  const triggerConfetti = () => {
    const end = Date.now() + 3000;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#142490', '#F05A28'],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#142490', '#F05A28'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  };

  const navigateForUser = (user: any) => {
    navigate(requestedPath || resolveUserDefaultRoute(user), { replace: true });
  };

  const handleBack = () => setStep((currentStep) => Math.max(currentStep - 1, 1));

  const handleRegisterSubmit = async () => {
    if (password !== passwordConfirmation) {
      toast({ type: 'error', title: 'Passwords do not match', message: 'Please confirm your password again.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await register({
        name,
        email,
        phone: phone.trim() || undefined,
        password,
      });

      toast({ type: 'success', title: 'Verification code sent', message: response.message });
      setStep(2);
      setCountdown(30);
    } catch (error: any) {
      toast({ type: 'error', title: 'Unable to start registration', message: error?.message || 'Please review your details and try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyRegistration = async () => {
    if (otp.length !== 6) {
      toast({ type: 'error', title: 'Enter the full code', message: 'The verification code must be 6 digits.' });
      return;
    }

    setIsVerifying(true);

    try {
      await verifyRegistration({ email, otp });
      triggerConfetti();
      toast({ type: 'success', title: 'Account created', message: 'Welcome to Nataka Hii.' });
      setStep(3);
    } catch (error: any) {
      toast({ type: 'error', title: 'Verification failed', message: error?.message || 'Please check the code and try again.' });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);

    try {
      const response = await resendOtp(email, 'registration');
      toast({ type: 'success', title: 'Code resent', message: response.message });
      setCountdown(30);
    } catch (error: any) {
      toast({ type: 'error', title: 'Unable to resend code', message: error?.message || 'Please try again in a moment.' });
    } finally {
      setIsResending(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);

    try {
      const response = await loginWithGoogle();
      toast({ type: 'success', title: 'Account ready', message: 'Signed in with Google successfully.' });
      navigateForUser(response.user);
    } catch (error: any) {
      const message = error?.code === 'auth/popup-closed-by-user'
        ? 'Google sign-in was cancelled before completion.'
        : error?.code === 'auth/popup-blocked'
          ? 'Your browser blocked the Google sign-in popup. Please allow popups and try again.'
          : error?.message || 'Unable to sign in with Google right now.';

      toast({ type: 'error', title: 'Google sign-in failed', message });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-page)] flex flex-col items-center justify-center p-4 lg:overflow-hidden">
      <div className="w-full max-w-xl bg-white rounded-[24px] shadow-[var(--shadow-level-2)] overflow-hidden relative border border-[var(--color-border)]/50">
        <div className="p-6 md:p-8 pb-16 sm:pb-20 md:pb-24 lg:pb-40 flex items-center justify-between z-10 relative bg-white">
          <Link to="/login" className="absolute left-1/2 -translate-x-1/2 shrink-0 top-2 sm:top-4 md:top-6">
            <img
              src={logoImage}
              alt="Nataka Hii"
              className="h-[96px] sm:h-[120px] md:h-[144px] lg:h-[192px] w-auto max-w-[240px] sm:max-w-[300px] md:max-w-[360px] lg:max-w-none"
            />
          </Link>

          <div className="flex gap-1 ml-auto">
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                className={`w-6 h-0.5 rounded-full transition-colors duration-300 ${index <= step ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'}`}
              />
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-6 md:p-8 overflow-hidden relative min-h-[350px] sm:min-h-[400px] md:min-h-[450px]">
          <AnimatePresence mode="wait" initial={false}>
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center mb-6 sm:mb-8">
                  <h2 className="text-[22px] sm:text-[24px] md:text-[28px] font-bold text-[var(--color-text-heading)] mb-2 tracking-tight">Create your account</h2>
                  <p className="text-[14px] sm:text-[15px] text-[var(--color-text-muted)]">Join East Africa's premier marketplace today.</p>
                </div>

                <div className="space-y-4">
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full border-2 border-[var(--color-border)] hover:bg-[var(--color-bg-card)] flex items-center justify-center gap-3 h-12"
                    onClick={handleGoogleSignUp}
                    isLoading={isGoogleLoading}
                    disabled={isGoogleLoading}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    {isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}
                  </Button>

                  <div className="relative flex items-center justify-center py-1">
                    <div className="absolute inset-x-0 h-px bg-[var(--color-border)]" />
                    <span className="relative bg-white px-4 text-[12px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                      Or sign up with email
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[13px] font-semibold text-[var(--color-text-heading)] ml-1">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <User className="w-5 h-5 text-[var(--color-text-muted)]" />
                      </div>
                      <Input
                        placeholder="John Doe"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        className="pl-11 focus:border-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[13px] font-semibold text-[var(--color-text-heading)] ml-1">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <Mail className="w-5 h-5 text-[var(--color-text-muted)]" />
                      </div>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="pl-11 focus:border-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[13px] font-semibold text-[var(--color-text-heading)] ml-1">Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <Phone className="w-5 h-5 text-[var(--color-text-muted)]" />
                      </div>
                      <Input
                        type="tel"
                        placeholder="+254 7XX XXX XXX"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        className="pl-11 focus:border-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[13px] font-semibold text-[var(--color-text-heading)] ml-1">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <Lock className="w-5 h-5 text-[var(--color-text-muted)]" />
                      </div>
                      <Input
                        type="password"
                        placeholder="Create a strong password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
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
                        placeholder="Repeat your password"
                        value={passwordConfirmation}
                        onChange={(event) => setPasswordConfirmation(event.target.value)}
                        className="pl-11 focus:border-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    onClick={handleRegisterSubmit}
                    variant="primary"
                    size="l"
                    className="w-full sm:w-auto bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)]"
                    isLoading={isSubmitting}
                  >
                    Continue <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>

                <p className="text-center text-[13px] text-[var(--color-text-muted)] font-medium mt-6">
                  Already have an account? <Link to="/login" className="text-[var(--color-primary)] font-bold hover:underline">Log in</Link>
                </p>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-8 flex flex-col items-center justify-center min-h-[350px] text-center"
              >
                <div>
                  <div className="w-16 h-16 bg-[var(--color-primary-bg)] rounded-full flex items-center justify-center mx-auto mb-6 text-[var(--color-primary)]">
                    <Mail className="w-8 h-8" />
                  </div>
                  <h2 className="text-[22px] sm:text-[24px] md:text-[28px] font-bold text-[var(--color-text-heading)] mb-2 tracking-tight">Verify it's you</h2>
                  <p className="text-[14px] sm:text-[15px] text-[var(--color-text-muted)] max-w-sm mx-auto leading-relaxed">
                    We've sent a 6-digit code to <span className="font-bold text-[var(--color-text-heading)]">{email}</span>. Enter it below to verify your email.
                  </p>
                </div>

                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => setOtp(value)}
                    containerClassName="justify-center"
                  >
                    <InputOTPGroup className="gap-2 sm:gap-3">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          className="w-10 h-12 sm:w-14 sm:h-16 rounded-[12px] border-2 border-[var(--color-border)] bg-[var(--color-bg-page)] text-[20px] sm:text-[24px] font-bold"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <div className="w-full flex flex-col sm:flex-row gap-4 items-center justify-between mt-8">
                  <Button onClick={handleBack} variant="ghost" className="text-[var(--color-text-muted)] w-full sm:w-auto">
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back
                  </Button>

                  <div className="flex flex-col items-center gap-4 sm:flex-row-reverse w-full sm:w-auto">
                    <Button onClick={handleVerifyRegistration} variant="primary" size="l" className="w-full sm:w-auto bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)]" isLoading={isVerifying}>
                      Verify Code
                    </Button>
                    {countdown > 0 ? (
                      <span className="text-[13px] font-medium text-[var(--color-text-muted)]">Resend in 00:{countdown.toString().padStart(2, '0')}</span>
                    ) : (
                      <button onClick={handleResendOtp} disabled={isResending} className="text-[13px] font-bold text-[var(--color-primary)] hover:underline disabled:opacity-50">
                        {isResending ? 'Resending...' : 'Resend Code'}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, type: 'spring' }}
                className="text-center py-6"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-green-500 shadow-sm border-[3px] sm:border-[4px] border-white">
                  <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
                </div>

                <h2 className="text-[26px] sm:text-[30px] md:text-[36px] font-bold text-[var(--color-text-heading)] mb-2 tracking-tight">Welcome to Nataka Hii!</h2>
                <p className="text-[14px] sm:text-[15px] md:text-[16px] text-[var(--color-text-muted)] max-w-sm mx-auto mb-6 sm:mb-10">
                  Your account has been created successfully. What would you like to do next?
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <Button
                    onClick={() => navigate('/customer')}
                    variant="ghost"
                    className="h-auto py-4 flex flex-col items-center justify-center gap-3 border-2 border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-bg)] group transition-all"
                  >
                    <ShoppingCart className="w-8 h-8 text-[var(--color-primary)] group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-[15px]">Start Shopping</span>
                    <span className="text-[12px] font-normal text-[var(--color-text-muted)] opacity-80">Discover products</span>
                  </Button>

                  <Button
                    onClick={() => navigate(requestedPath === '/vendor/apply' ? requestedPath : '/vendor/apply')}
                    variant="ghost"
                    className="h-auto py-4 flex flex-col items-center justify-center gap-3 border-2 border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-bg)] group transition-all"
                  >
                    <Store className="w-8 h-8 text-[var(--color-accent)] group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-[15px]">Become a Vendor</span>
                    <span className="text-[12px] font-normal text-[var(--color-text-muted)] opacity-80">Open your store</span>
                  </Button>
                </div>

                <Button onClick={() => navigate('/customer')} variant="secondary" className="w-full sm:w-auto font-bold px-10">
                  Go to Homepage
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
