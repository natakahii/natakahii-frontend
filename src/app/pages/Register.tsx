import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { CheckCircle, ArrowLeft, ArrowRight, User, Mail, Phone, ShoppingCart, Heart, Store } from 'lucide-react';
import confetti from 'canvas-confetti';

export function Register() {
  const [step, setStep] = useState(1);
  const [countdown, setCountdown] = useState(30);
  const navigate = useNavigate();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleNext = () => {
    if (step === 2) {
      // Trigger confetti on success
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#142490', '#F05A28']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#142490', '#F05A28']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
    setStep(s => Math.min(s + 1, 3));
  };

  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  return (
    <div className="min-h-screen bg-[var(--color-bg-page)] flex flex-col items-center justify-center p-4">
      
      <div className="w-full max-w-xl bg-white rounded-[24px] shadow-[var(--shadow-level-2)] overflow-hidden relative border border-[var(--color-border)]/50">
        
        {/* Header / Progress */}
        <div className="p-6 md:p-8 pb-0 flex items-center justify-between z-10 relative bg-white">
          <Link to="/login" className="text-[20px] font-bold tracking-tight text-[var(--color-primary-darker)] shrink-0">
            NATAKA <span className="text-[var(--color-accent)]">HII</span>
          </Link>
          
          <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <div 
                key={i} 
                className={`w-12 h-1.5 rounded-full transition-colors duration-300 ${i <= step ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'}`}
              />
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 md:p-8 overflow-hidden relative min-h-[450px]">
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
                <div className="text-center sm:text-left mb-8">
                  <h2 className="text-[28px] font-bold text-[var(--color-text-heading)] mb-2 tracking-tight">Create your account</h2>
                  <p className="text-[15px] text-[var(--color-text-muted)]">Join East Africa's premier marketplace today.</p>
                </div>

                <div className="space-y-4">
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
                  <h2 className="text-[28px] font-bold text-[var(--color-text-heading)] mb-2 tracking-tight">Verify it's you</h2>
                  <p className="text-[15px] text-[var(--color-text-muted)] max-w-sm mx-auto leading-relaxed">
                    We've sent a 6-digit code to <span className="font-bold text-[var(--color-text-heading)]">john@example.com</span>. Enter it below to verify your email.
                  </p>
                </div>

                <div className="flex gap-2 sm:gap-4 justify-center">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <input
                      key={i}
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
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 shadow-sm border-[4px] border-white">
                  <CheckCircle className="w-12 h-12" />
                </div>
                
                <h2 className="text-[36px] font-bold text-[var(--color-text-heading)] mb-2 tracking-tight">Welcome to Nataka Hii!</h2>
                <p className="text-[16px] text-[var(--color-text-muted)] max-w-sm mx-auto mb-10">
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
