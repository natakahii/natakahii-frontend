import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { FormField } from '../../components/ui/form-field';
import { useToast } from '../../components/ui/toast';
import { CheckCircle2, Store, MapPin, Building, ChevronRight, Clock, XCircle, ArrowRight } from 'lucide-react';
import { AnimatedCheckmark } from '../../components/ui/animated-checkmark';
import { useNavigate } from 'react-router';
import { VendorSubscriptionPlan } from './VendorSubscriptionPlan';
import confetti from 'canvas-confetti';

type ApplicationState = 'NOT_APPLIED' | 'PENDING' | 'APPROVED' | 'REJECTED';

export function VendorApply() {
  const [appState, setAppState] = useState<ApplicationState>('NOT_APPLIED');
  const [step, setStep] = useState(1);
  const [shopName, setShopName] = useState('');
  const [shopDescription, setShopDescription] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'pro' | 'enterprise'>('basic');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 5) {
      setStep(step + 1);
    } else {
      setAppState('PENDING');
      toast({
        type: 'info',
        title: 'Application Submitted',
        message: 'Your application is now under review. We will notify you shortly.',
      });
      // Simulate review process for demo
      setTimeout(() => {
        setAppState('APPROVED');
        triggerConfetti();
        toast({
          type: 'success',
          title: 'Application Approved',
          message: 'Welcome to Nataka Hii! Your vendor account is ready.',
        });
      }, 3000);
    }
  };

  const triggerConfetti = () => {
    const end = Date.now() + 3 * 1000;
    const colors = ['#142490', '#F05A28'];

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  const renderNotApplied = () => (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-8">
      {/* Left Panel - Benefits */}
      <div className="md:col-span-1 space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-[var(--color-primary-darker)] mb-2">Why sell on Nataka Hii?</h2>
          <p className="text-[var(--color-text-body)]">Reach millions of customers across East Africa with our AI-powered platform.</p>
        </div>
        
        <div className="space-y-6">
          {[
            { title: "Massive Audience", desc: "Access over 10 million active users daily." },
            { title: "AI Assistant", desc: "Our AI helps customers find your products faster." },
            { title: "Video Commerce", desc: "Sell through engaging TikTok-style feeds." },
            { title: "Secure Escrow", desc: "Guaranteed payments, zero fraud." }
          ].map((benefit, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full bg-[var(--color-primary-bg)] flex items-center justify-center text-[var(--color-primary)] font-bold">
                  {i + 1}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-[var(--color-text-heading)]">{benefit.title}</h4>
                <p className="text-sm text-[var(--color-text-body)]">{benefit.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="md:col-span-2">
        <Card className="border-[var(--color-border)] shadow-[var(--shadow-level-2)]">
          <CardHeader>
            <div className="flex items-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors
                    ${s === step ? 'bg-[var(--color-accent)] text-white' : 
                      s < step ? 'bg-[var(--color-primary)] text-white' : 
                      'bg-[var(--color-primary-bg)] text-[var(--color-text-muted)]'}`}>
                    {s < step ? <CheckCircle2 className="w-5 h-5" /> : s}
                  </div>
                  {s < 5 && (
                    <div className={`w-8 sm:w-16 h-1 mx-2 rounded ${s < step ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'}`} />
                  )}
                </div>
              ))}
            </div>
            <CardTitle className="text-2xl text-[var(--color-text-heading)]">
              {step === 1 && "Business Information"}
              {step === 2 && "Location Details"}
              {step === 3 && "Shop Identity"}
              {step === 4 && "Subscription Plan"}
              {step === 5 && "Review & Submit"}
            </CardTitle>
            <CardDescription>Tell us about your business to start selling.</CardDescription>
          </CardHeader>

          <form onSubmit={handleApply}>
            <input type="hidden" name="shop_name" value={shopName} />
            <input type="hidden" name="subscription_plan" value={selectedPlan} />
            <CardContent className="space-y-4">
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <FormField label="Business Legal Name" required error="Business name must be exactly as registered.">
                    <Input id="bizName" placeholder="e.g. Mambo Jambo Ltd" required error={true} />
                  </FormField>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Business Email" required>
                      <Input id="email" type="email" placeholder="contact@example.com" required />
                    </FormField>
                    <FormField label="Phone Number" required>
                      <Input id="phone" type="tel" placeholder="+254 700 000 000" required />
                    </FormField>
                  </div>
                </div>
              )}
              
              {step === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="region">Region / County</Label>
                      <Input id="region" placeholder="Nairobi" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="city">City / Town</Label>
                      <Input id="city" placeholder="Nairobi" required />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="ward">Ward / Area</Label>
                    <Input id="ward" placeholder="Kilimani" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address">Physical Address</Label>
                    <Textarea id="address" placeholder="Street name, Building, Floor" required />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <div className="grid gap-2">
                    <Label htmlFor="shopName">Shop Display Name</Label>
                    <Input
                      id="shopName"
                      name="shop_name"
                      placeholder="The name customers will see"
                      value={shopName}
                      onChange={(event) => setShopName(event.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="desc">Shop Description</Label>
                    <Textarea
                      id="desc"
                      name="description"
                      placeholder="What do you sell?"
                      className="min-h-[100px]"
                      value={shopDescription}
                      onChange={(event) => setShopDescription(event.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                  <VendorSubscriptionPlan selectedPlan={selectedPlan} onSelectPlan={setSelectedPlan} />
                </div>
              )}

              {step === 5 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="bg-[var(--color-bg-card)] p-4 rounded-lg space-y-3">
                    <div className="flex gap-2 text-sm">
                      <Building className="w-5 h-5 text-[var(--color-primary)]" />
                      <span className="font-medium">Business:</span> Mambo Jambo Ltd
                    </div>
                    <div className="flex gap-2 text-sm">
                      <MapPin className="w-5 h-5 text-[var(--color-primary)]" />
                      <span className="font-medium">Location:</span> Kilimani, Nairobi
                    </div>
                    <div className="flex gap-2 text-sm">
                      <MapPin className="w-5 h-5 text-[var(--color-primary)]" />
                      <span className="font-medium">Subscription Plan:</span> {selectedPlan === 'basic' ? 'Basic Account' : selectedPlan === 'pro' ? 'Pro Account' : 'Enterprise Account'}
                    </div>
                    <div className="flex gap-2 text-sm">
                      <Store className="w-5 h-5 text-[var(--color-primary)]" />
                      <span className="font-medium">Shop Name:</span> {shopName || 'N/A'}
                    </div>
                  </div>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    By submitting this application, you agree to our Vendor Terms of Service and Privacy Policy.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t border-[var(--color-border)] pt-6 mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
                className="text-[var(--color-primary)] border-[var(--color-primary)]"
              >
                Back
              </Button>
              <Button 
                type="submit"
                className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-white gap-2"
              >
                {step === 5 ? "Submit Application" : "Continue"}
                {step < 5 && <ChevronRight className="w-4 h-4" />}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );

  const renderPending = () => (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center border-[var(--color-border)]">
        <CardContent className="pt-12 pb-8 px-8 space-y-6">
          <div className="w-20 h-20 bg-[var(--color-warning-bg)] rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-[var(--color-warning)]" />
          </div>
          <Badge className="bg-[var(--color-warning)] text-white hover:bg-[var(--color-warning)] mx-auto px-4 py-1">
            Application Pending Review
          </Badge>
          <h2 className="text-2xl font-bold text-[var(--color-text-heading)]">Hang tight!</h2>
          <p className="text-[var(--color-text-body)]">
            We've received your application (Submitted {new Date().toLocaleDateString()}). Our team is reviewing it. Estimated review time is 24-48 hours.
          </p>
          <div className="bg-[var(--color-bg-page)] p-4 rounded-lg text-sm text-[var(--color-text-muted)]">
            We'll notify you via SMS & email as soon as there's an update.
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderApproved = () => (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center border-none shadow-[var(--shadow-level-3)] bg-gradient-to-b from-white to-[var(--color-primary-bg)]">
        <CardContent className="pt-12 pb-8 px-8 space-y-6">
          <div className="w-24 h-24 bg-[var(--color-success-bg)] rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
            <AnimatedCheckmark className="w-12 h-12 text-[var(--color-success)]" />
          </div>
          <h2 className="text-3xl font-bold text-[var(--color-primary-darker)]">
            Congratulations! 🎉
          </h2>
          <p className="text-lg text-[var(--color-text-body)]">
            You're now a Vendor on Nataka Hii.
          </p>
          <div className="pt-4">
            <Button 
              size="lg"
              onClick={() => navigate('/vendor/dashboard')}
              className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-white gap-2 text-lg h-14"
            >
              Go to Vendor Dashboard
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderRejected = () => (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center border-[var(--color-border)]">
        <CardContent className="pt-12 pb-8 px-8 space-y-6">
          <div className="w-20 h-20 bg-[var(--color-error-bg)] rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-[var(--color-error)]" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--color-text-heading)]">Application Not Approved</h2>
          <div className="bg-[var(--color-bg-card)] p-4 rounded-lg text-left text-sm text-[var(--color-text-body)] border border-[var(--color-error)]">
            <p className="font-semibold text-[var(--color-error)] mb-1">Reason:</p>
            <p>The business registration document provided was illegible. Please provide a clear, scanned copy of your certificate.</p>
          </div>
          <div className="pt-4 space-y-3 flex flex-col">
            <Button 
              onClick={() => { setAppState('NOT_APPLIED'); setStep(1); }}
              className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
            >
              Re-apply
            </Button>
            <Button variant="link" className="text-[var(--color-text-muted)]">
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-bg-page)] pt-8 pb-20">
      {appState === 'NOT_APPLIED' && renderNotApplied()}
      {appState === 'PENDING' && renderPending()}
      {appState === 'APPROVED' && renderApproved()}
      {appState === 'REJECTED' && renderRejected()}
      
      {/* Dev toggle controls for previewing states */}
      <div className="fixed bottom-4 right-4 bg-white p-2 rounded shadow flex gap-2 text-xs border">
        <span className="font-bold flex items-center mr-2">Dev:</span>
        <Button size="sm" variant="outline" onClick={() => setAppState('NOT_APPLIED')}>Form</Button>
        <Button size="sm" variant="outline" onClick={() => setAppState('PENDING')}>Pending</Button>
        <Button size="sm" variant="outline" onClick={() => { setAppState('APPROVED'); triggerConfetti(); }}>Approved</Button>
        <Button size="sm" variant="outline" onClick={() => setAppState('REJECTED')}>Rejected</Button>
      </div>
    </div>
  );
}