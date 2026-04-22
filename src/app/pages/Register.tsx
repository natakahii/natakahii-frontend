import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useToast } from '../components/ui/toast';
import { loginWithGoogle } from '../services/authService';
import { CheckCircle, ArrowLeft, ArrowRight, User, Mail, Phone, ShoppingCart, Store } from 'lucide-react';
import confetti from 'canvas-confetti';
import logoImage from '../../assets/Nataka Hii_1.png';

export function Register() {
  const [step, setStep] = useState(1);
  const [countdown, setCountdown] = useState(30);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (step === 2 && countdown > 0) {
      timer = setInterval(() => setCountdown((currentValue) => currentValue - 1), 1000);
    }

    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleNext = () => {
    if (step === 2) {
      const duration = 3 * 1000;
      const end = Date.now() + duration;

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
    }

    setStep((currentStep) => Math.min(currentStep + 1, 3));
  };

  const handleBack = () => setStep((currentStep) => Math.max(currentStep - 1, 1));

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);

    try {
      await loginWithGoogle();
      toast({ type: 'success', title: 'Account ready', message: 'Signed in with Google successfully.' });
      navigate('/customer');
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

                  <div className="space-y-1.5 relative">
                    <label className="text-[13px] font-semibold text-[var(--color-text-heading)] ml-1">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <User className="w-5 h-5 text-[var(--color-text-muted)]" />
                      </div>
                      <Input placeholder="John Doe" className="pl-11 focus:border-[var(--color-accent)] focus:ring-[var(--color-accent)]" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[13px] font-semibold text-[var(--color-text-heading)] ml-1">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <Mail className="w-5 h-5 text-[var(--color-text-muted)]" />
                      </div>
                      <Input type="email" placeholder="john@example.com" className="pl-11 focus:border-[var(--color-accent)] focus:ring-[var(--color-accent)]" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[13px] font-semibold text-[var(--color-text-heading)] ml-1">Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <Phone className="w-5 h-5 text-[var(--color-text-muted)]" />
                      </div>
                      <Input type="tel" placeholder="+254 7XX XXX XXX" className="pl-11 focus:border-[var(--color-accent)] focus:ring-[var(--color-accent)]" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button onClick={handleNext} variant="primary" size="l" className="w-full sm:w-auto bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)]">
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
                    We've sent a 6-digit code to <span className="font-bold text-[var(--color-text-heading)]">john@example.com</span>. Enter it below to verify your email.
                  </p>
                </div>

                <div className="flex gap-2 sm:gap-4 justify-center">
                  {[1, 2, 3, 4, 5, 6].map((index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength={1}
                      className="w-10 h-12 sm:w-14 sm:h-16 text-center text-[24px] font-bold rounded-[12px] border-2 border-[var(--color-border)] focus:border-[var(--color-accent)] focus:ring-[var(--color-accent)] focus:outline-none transition-all shadow-sm bg-[var(--color-bg-page)]"
                    />
                  ))}
                </div>

                <div className="w-full flex flex-col sm:flex-row gap-4 items-center justify-between mt-8">
                  <Button onClick={handleBack} variant="ghost" className="text-[var(--color-text-muted)] w-full sm:w-auto">
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back
                  </Button>

                  <div className="flex flex-col items-center gap-4 sm:flex-row-reverse w-full sm:w-auto">
                    <Button onClick={handleNext} variant="primary" size="l" className="w-full sm:w-auto bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)]">
                      Verify Code
                    </Button>
                    {countdown > 0 ? (
                      <span className="text-[13px] font-medium text-[var(--color-text-muted)]">Resend in 00:{countdown.toString().padStart(2, '0')}</span>
                    ) : (
                      <button onClick={() => setCountdown(30)} className="text-[13px] font-bold text-[var(--color-primary)] hover:underline">Resend Code</button>
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
                    onClick={() => navigate('/profile')}
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
