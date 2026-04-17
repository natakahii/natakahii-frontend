import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useToast } from '../components/ui/toast';
import { login } from '../services/authService';
import { Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';

export function Login() {
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (method !== 'email') {
      toast({ type: 'warning', title: 'Phone login not supported yet', message: 'Please login with your email address.' });
      return;
    }

    setIsLoading(true);

    try {
      const response = await login(email, password);
      toast({ type: 'success', title: 'Login successful', message: 'Welcome back to Nataka Hii.' });

      const role = response.user?.roles?.[0]?.name;
      if (role === 'vendor') {
        navigate('/vendor/dashboard');
      } else {
        navigate('/customer');
      }
    } catch (error: any) {
      toast({ type: 'error', title: 'Login failed', message: error?.message || 'Please check your credentials.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--color-bg-page)] overflow-hidden">
      {/* Left side - Illustration */}
      <div className="hidden lg:flex w-1/2 relative bg-[var(--color-primary-darker)] overflow-hidden items-center justify-center flex-col p-12">
        <div className="absolute inset-0 opacity-40 mix-blend-overlay">
          <img 
            src="https://images.unsplash.com/photo-1771945701675-80f0a5ed7f8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGdlb21ldHJpYyUyMGNvbG9yZnVsJTIwZW5lcmd5fGVufDF8fHx8MTc3NjIxMjg5Nnww&ixlib=rb-4.1.0&q=80&w=1080" 
            alt="Abstract" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-darker)] via-[var(--color-primary)]/80 to-[var(--color-accent)]/40" />
        
        <div className="relative z-10 text-center text-white max-w-md">
          <h1 className="text-[48px] font-bold tracking-tight mb-4">
            NATAKA <span className="text-[var(--color-accent)]">HII</span>
          </h1>
          <p className="text-[18px] opacity-90 leading-relaxed mb-8">
            Experience the vibrant energy of East African commerce. Verified vendors, secure payments, and AI-powered discovery.
          </p>
          <div className="flex gap-4 justify-center">
            <div className="w-16 h-2 rounded-full bg-[var(--color-accent)]" />
            <div className="w-8 h-2 rounded-full bg-white/30" />
            <div className="w-8 h-2 rounded-full bg-white/30" />
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-[32px] font-bold text-[var(--color-text-heading)] mb-2 tracking-tight">Welcome Back</h2>
            <p className="text-[16px] text-[var(--color-text-muted)]">Log in to continue shopping on Natakahii.</p>
          </div>

          {/* Toggle */}
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
                value={method === 'email' ? email : undefined}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={method === 'email' ? 'you@example.com' : '+254 7XX XXX XXX'} 
                required 
                className="focus:border-[var(--color-accent)] focus:ring-[var(--color-accent)]"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[13px] font-semibold text-[var(--color-text-heading)]">Password</label>
                <a href="#" className="text-[13px] font-semibold text-[var(--color-accent)] hover:underline">Forgot Password?</a>
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
              {isLoading ? 'Signing in…' : 'Log In'}
            </Button>
          </form>

          <div className="mt-8 relative flex items-center justify-center">
            <div className="absolute inset-x-0 h-px bg-[var(--color-border)]" />
            <span className="relative bg-[var(--color-bg-page)] px-4 text-[13px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
              Or continue with
            </span>
          </div>

          <div className="mt-8">
            <Button variant="ghost" className="w-full border-2 border-[var(--color-border)] hover:bg-[var(--color-bg-card)] flex items-center justify-center gap-3 h-12">
              <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
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
