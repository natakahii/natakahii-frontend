import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useToast } from '../components/ui/toast';
import { resolveUserDefaultRoute } from '../services/authService';
import { Mail, Phone, Lock, Eye, EyeOff, ShoppingBag, Users, Shield, Star, Truck, CreditCard } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import logoImage from '../../assets/words only.png';
import img01 from '../../assets/img 01.png';
import mainLogo from '../../assets/Nataka Hii_1.png';

export function Login() {
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { login, loginWithGoogle } = useAuth();

  const slideshowImages = [
    {
      url: img01,
      alt: 'East African crafts and handmade goods'
    },
    {
      url: img01,
      alt: 'Online shopping and digital commerce'
    },
    {
      url: img01,
      alt: 'Fashion retail and clothing store'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideshowImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const requestedPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;

  const navigateForUser = (user: any) => {
    navigate(requestedPath || resolveUserDefaultRoute(user), { replace: true });
  };

  const resolveGoogleError = (error: any) => {
    if (error?.code === 'auth/popup-closed-by-user') {
      return 'Google sign-in was cancelled before completion.';
    }

    if (error?.code === 'auth/popup-blocked') {
      return 'Your browser blocked the Google sign-in popup. Please allow popups and try again.';
    }

    return error?.message || 'Unable to sign in with Google right now.';
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsLoading(true);

    try {
      const response = await login(identifier, password);
      toast({ type: 'success', title: 'Login successful', message: 'Welcome back to Nataka Hii.' });
      navigateForUser(response.user);
    } catch (error: any) {
      toast({ type: 'error', title: 'Login failed', message: error?.message || 'Please check your credentials.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);

    try {
      const response = await loginWithGoogle();
      toast({ type: 'success', title: 'Login successful', message: 'Signed in with Google successfully.' });
      navigateForUser(response.user);
    } catch (error: any) {
      toast({ type: 'error', title: 'Google sign-in failed', message: resolveGoogleError(error) });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsAppleLoading(true);

    try {
      toast({ type: 'info', title: 'Coming Soon', message: 'Apple sign-in will be available soon.' });
    } finally {
      setIsAppleLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[var(--color-bg-page)] lg:flex lg:overflow-hidden">
      {/* Desktop Left Side - Product Showcase (hidden on mobile) */}
      <div className="hidden lg:block w-full lg:w-1/2 relative overflow-hidden flex flex-col h-auto shrink-0">
        {/* Background product slideshow - hidden on mobile */}
        <div className="hidden lg:block absolute inset-0">
          {slideshowImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={image.url}
                alt={image.alt}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        </div>

        {/* Content overlay - Mobile: compact / Desktop: full */}
        <div className="relative z-10 flex flex-col justify-between h-full p-4 lg:p-10">
          {/* Desktop: Logo at top / Mobile: Hidden spacer */}
          <div className="hidden lg:block text-center lg:mt-20">
            <img
              src={logoImage}
              alt="Nataka Hii"
              className="h-14 w-auto mx-auto mb-2"
            />
            <p className="text-white/80 text-[14px]">East Africa's Premier Marketplace</p>
          </div>

          {/* Middle - Value Props & Stats */}
          <div className="space-y-3 lg:space-y-6">
            {/* Mobile: Logo here / Desktop: Trust badges */}
            <div className="lg:hidden text-center">
              <p className="text-[var(--color-text-heading)] text-[14px] font-bold mb-1">Nataka Hii</p>
              <p className="text-[var(--color-text-muted)] text-[11px]">East Africa's Premier Marketplace</p>
            </div>

            {/* Trust badges - visible on both */}
            <div className="flex flex-wrap gap-2 lg:gap-3 justify-center">
              <div className="flex items-center gap-1.5 lg:gap-2 bg-[var(--color-bg-card)] lg:bg-white/10 lg:backdrop-blur-sm rounded-full px-3 lg:px-4 py-1.5 lg:py-2 border border-[var(--color-border)] lg:border-0">
                <Shield className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-[var(--color-accent)]" />
                <span className="text-[var(--color-text-body)] lg:text-white text-[11px] lg:text-[13px] font-medium">Verified Vendors</span>
              </div>
              <div className="flex items-center gap-1.5 lg:gap-2 bg-[var(--color-bg-card)] lg:bg-white/10 lg:backdrop-blur-sm rounded-full px-3 lg:px-4 py-1.5 lg:py-2 border border-[var(--color-border)] lg:border-0">
                <Truck className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-[var(--color-accent)]" />
                <span className="text-[var(--color-text-body)] lg:text-white text-[11px] lg:text-[13px] font-medium">Fast Delivery</span>
              </div>
              <div className="flex items-center gap-1.5 lg:gap-2 bg-[var(--color-bg-card)] lg:bg-white/10 lg:backdrop-blur-sm rounded-full px-3 lg:px-4 py-1.5 lg:py-2 border border-[var(--color-border)] lg:border-0">
                <CreditCard className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-[var(--color-accent)]" />
                <span className="text-[var(--color-text-body)] lg:text-white text-[11px] lg:text-[13px] font-medium">Secure Payments</span>
              </div>
            </div>

            {/* Live stats - compact on mobile, full on desktop */}
            <div className="hidden lg:grid grid-cols-3 gap-2 lg:gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl lg:rounded-2xl p-2 lg:p-5 text-center">
                <div className="flex items-center justify-center gap-1 lg:gap-2 mb-1 lg:mb-2">
                  <ShoppingBag className="w-4 h-4 lg:w-5 lg:h-5 text-[var(--color-accent)]" />
                </div>
                <div className="text-[16px] lg:text-[28px] font-bold text-white">2,847</div>
                <div className="text-[9px] lg:text-[12px] text-white/70">Orders This Week</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl lg:rounded-2xl p-2 lg:p-5 text-center">
                <div className="flex items-center justify-center gap-1 lg:gap-2 mb-1 lg:mb-2">
                  <Users className="w-4 h-4 lg:w-5 lg:h-5 text-[var(--color-accent)]" />
                </div>
                <div className="text-[16px] lg:text-[28px] font-bold text-white">1,200+</div>
                <div className="text-[9px] lg:text-[12px] text-white/70">Verified Vendors</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl lg:rounded-2xl p-2 lg:p-5 text-center">
                <div className="flex items-center justify-center gap-1 lg:gap-2 mb-1 lg:mb-2">
                  <Star className="w-4 h-4 lg:w-5 lg:h-5 text-[var(--color-accent)]" />
                </div>
                <div className="text-[16px] lg:text-[28px] font-bold text-white">100K+</div>
                <div className="text-[9px] lg:text-[12px] text-white/70">Happy Customers</div>
              </div>
            </div>
          </div>

          {/* Slide indicators - hidden on mobile */}
          <div className="hidden lg:flex gap-2 justify-center">
            {slideshowImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 lg:h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'w-6 lg:w-8 bg-[var(--color-accent)]'
                    : 'w-1.5 lg:w-2 bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="w-full flex items-center justify-center p-6 sm:p-12 overflow-hidden">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <img
              src={mainLogo}
              alt="Nataka Hii"
              className="hidden sm:block h-28 w-auto mx-auto mb-4"
            />
            <h2 className="text-[32px] font-bold text-[var(--color-text-heading)] mb-2 tracking-tight">Welcome Back</h2>
            <p className="text-[16px] text-[var(--color-text-muted)]">Log in to continue shopping on Natakahii.</p>
          </div>

          <div className="flex p-1 bg-[var(--color-bg-card)] rounded-[12px] mb-8 shadow-sm">
            <button
              onClick={() => setMethod('email')}
              className={`flex-1 py-2.5 text-[14px] font-bold rounded-[8px] transition-all flex items-center justify-center gap-2 ${method === 'email' ? 'bg-white shadow-[var(--shadow-level-1)] text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)]'}`}
            >
              <Mail className="w-4 h-4" /> Email
            </button>
            <button
              onClick={() => setMethod('phone')}
              className={`flex-1 py-2.5 text-[14px] font-bold rounded-[8px] transition-all flex items-center justify-center gap-2 ${method === 'phone' ? 'bg-white shadow-[var(--shadow-level-1)] text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)]'}`}
            >
              <Phone className="w-4 h-4" /> Phone
            </button>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-[var(--color-text-heading)] ml-1">
                {method === 'email' ? 'Email Address' : 'Phone Number'}
              </label>
              <Input
                type={method === 'email' ? 'email' : 'tel'}
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder={method === 'email' ? 'you@example.com' : '+255 7XX XXX XXX'}
                required
                className="focus:border-[var(--color-accent)] focus:ring-[var(--color-accent)]"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[13px] font-semibold text-[var(--color-text-heading)]">Password</label>
                <Link to="/forgot-password" className="text-[13px] font-semibold text-[var(--color-accent)] hover:underline">Forgot Password?</Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Lock className="w-5 h-5 text-[var(--color-text-muted)]" />
                </div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="pl-11 pr-11 focus:border-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)]"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="primary" size="l" className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-darker)] text-white mt-2" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Log In'}
            </Button>
          </form>

          <div className="mt-8 relative flex items-center justify-center">
            <div className="absolute inset-x-0 h-px bg-[var(--color-border)]" />
            <span className="relative bg-[var(--color-bg-page)] px-4 text-[13px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
              Or continue with
            </span>
          </div>

          <div className="mt-8 flex gap-3">
            <Button
              type="button"
              variant="ghost"
              className="flex-1 border-2 border-[var(--color-border)] hover:bg-[var(--color-bg-card)] flex items-center justify-center gap-3 h-12"
              onClick={handleGoogleSignIn}
              isLoading={isGoogleLoading}
              disabled={isGoogleLoading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {isGoogleLoading ? 'Connecting...' : 'Google'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="flex-1 border-2 border-[var(--color-border)] hover:bg-[var(--color-bg-card)] flex items-center justify-center gap-3 h-12"
              onClick={handleAppleSignIn}
              isLoading={isAppleLoading}
              disabled={isAppleLoading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.84-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              {isAppleLoading ? 'Connecting...' : 'Apple'}
            </Button>
          </div>

          <p className="mt-8 text-center text-[14px] text-[var(--color-text-muted)] font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-[var(--color-primary)] font-bold hover:text-[var(--color-accent)] hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
