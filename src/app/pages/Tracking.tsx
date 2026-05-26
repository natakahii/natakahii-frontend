import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';
import { Badge, VendorVerificationBadge } from '../components/ui/badge';
import { ChevronLeft, Package, MapPin, MessageSquare, AlertCircle, CheckCircle, Truck, Store, Map } from 'lucide-react';

const trackingSteps = [
  { id: 'placed', label: 'Order Placed', status: 'completed', time: 'Order confirmed', icon: Package },
  { id: 'dropoff', label: 'Vendor Dropoff', status: 'completed', time: 'Handed to courier', icon: Store },
  { id: 'quality', label: 'Quality Check', status: 'completed', time: 'Passed inspection', icon: CheckCircle },
  { id: 'transit', label: 'In Transit', status: 'active', time: 'In progress', icon: Truck },
  { id: 'delivered', label: 'Delivered', status: 'upcoming', time: 'Estimated soon', icon: MapPin },
];

export function Tracking() {
  return (
    <div className="bg-[var(--color-bg-page)] min-h-[calc(100vh-72px)] py-6 lg:py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link to="/customer" className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-[var(--color-border)] hover:bg-[var(--color-bg-card)] transition-colors">
              <ChevronLeft className="w-5 h-5 text-[var(--color-text-heading)]" />
            </Link>
            <div>
              <h1 className="text-[24px] md:text-[28px] font-bold text-[var(--color-text-heading)] tracking-tight">Track Order</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[14px] font-mono font-bold text-[var(--color-text-muted)]">#ORDER-ID</span>
                <span className="w-1 h-1 rounded-full bg-[var(--color-text-muted)]" />
                <Badge variant="hot-deal" className="bg-[var(--color-primary)]">In Transit</Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button variant="secondary" className="flex-1 md:flex-none font-bold shadow-sm">
              <MessageSquare className="w-4 h-4 mr-2" /> Contact Vendor
            </Button>
            <Button variant="ghost" className="flex-1 md:flex-none text-red-600 hover:bg-red-50 hover:text-red-700 font-bold border border-red-200 shadow-sm">
              <AlertCircle className="w-4 h-4 mr-2" /> Dispute
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: TIMELINE & INFO */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Package Info Card */}
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[var(--color-border)]/50">
              <h3 className="text-[16px] font-bold text-[var(--color-text-heading)] mb-4 tracking-tight flex items-center gap-2">
                <Package className="w-5 h-5 text-[var(--color-primary)]" />
                Package Details
              </h3>
              
              <div className="flex gap-4 mb-4">
                <div className="w-16 h-16 rounded-[12px] bg-[var(--color-primary-bg)] border border-[var(--color-border)] shrink-0 flex items-center justify-center">
                  <Package className="w-8 h-8 text-[var(--color-primary)]" />
                </div>
                <div className="flex flex-col justify-center">
                  <div className="font-bold text-[14px] text-[var(--color-text-heading)] leading-tight mb-1">Your Order</div>
                  <div className="text-[12px] text-[var(--color-text-muted)]">Details will appear here</div>
                  <div className="mt-2">
                    <VendorVerificationBadge tone="compact" label="Verified Vendor" />
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-[var(--color-border)] grid grid-cols-2 gap-4 text-[13px]">
                <div>
                  <div className="text-[var(--color-text-muted)] mb-1">Courier</div>
                  <div className="font-bold text-[var(--color-text-heading)] flex items-center gap-1">
                    Assigned Courier <CheckCircle className="w-3 h-3 text-[var(--color-primary)]" />
                  </div>
                </div>
                <div>
                  <div className="text-[var(--color-text-muted)] mb-1">Est. Delivery</div>
                  <div className="font-bold text-[var(--color-text-heading)]">Pending</div>
                </div>
              </div>
            </div>

            {/* Tracking Timeline */}
            <div className="bg-white rounded-[24px] p-6 shadow-[var(--shadow-level-1)] border border-[var(--color-border)]/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-accent)]/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
              
              <h3 className="text-[18px] font-bold text-[var(--color-text-heading)] mb-6 tracking-tight">Tracking History</h3>
              
              <div className="relative pl-4 space-y-8">
                {/* Vertical Line */}
                <div className="absolute top-4 bottom-8 left-[23px] w-0.5 bg-[var(--color-border)] z-0" />
                
                {trackingSteps.map((step, idx) => {
                  const Icon = step.icon;
                  const isCompleted = step.status === 'completed';
                  const isActive = step.status === 'active';
                  const isUpcoming = step.status === 'upcoming';
                  
                  return (
                    <div key={step.id} className="relative z-10 flex gap-4 group">
                      
                      {/* Step Indicator */}
                      <div className="shrink-0 flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm border-2 transition-all ${
                          isCompleted ? 'bg-[var(--color-accent)] border-[var(--color-accent)]' :
                          isActive ? 'bg-[var(--color-primary)] border-[var(--color-primary)] shadow-md ring-4 ring-[var(--color-primary)]/10 scale-110' :
                          'bg-white border-[var(--color-border)]'
                        }`}>
                          <Icon className={`w-4 h-4 ${isCompleted || isActive ? 'text-white' : 'text-[var(--color-text-muted)]'}`} />
                        </div>
                        {/* Connecting Line Progress (only draw if completed/active) */}
                        {idx < trackingSteps.length - 1 && (isCompleted || isActive) && (
                          <div className={`absolute top-10 left-[19px] w-0.5 h-full -z-10 ${isCompleted ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-primary)]'}`} />
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className={`pt-1 flex-1 ${isUpcoming ? 'opacity-50' : 'opacity-100'}`}>
                        <h4 className={`text-[15px] font-bold tracking-tight ${isCompleted ? 'text-[var(--color-text-heading)]' : isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}>
                          {step.label}
                        </h4>
                        <p className={`text-[13px] mt-1 ${isActive ? 'font-medium text-[var(--color-text-heading)]' : 'text-[var(--color-text-muted)]'}`}>
                          {step.time}
                        </p>
                        
                        {isActive && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 bg-[var(--color-bg-page)] rounded-[12px] p-3 border border-[var(--color-border)] text-[13px] text-[var(--color-text-muted)] leading-relaxed">
                            Tracking updates will appear here once your order is in transit.
                          </motion.div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
          </div>

          {/* RIGHT: MAP VISUALIZATION */}
          <div className="lg:col-span-8 flex flex-col">
            <div className="bg-white rounded-[24px] shadow-[var(--shadow-level-2)] border border-[var(--color-border)]/50 overflow-hidden flex-1 min-h-[400px] flex flex-col relative">
              
              {/* Overlay Map UI */}
              <div className="absolute inset-0 bg-[#E5E9EC]">
                {/* Abstract map background */}
                <div className="absolute inset-0 opacity-20 bg-[var(--color-primary-bg)]" />
                
                {/* Map route illustration */}
                <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  {/* Dashed route line */}
                  <path d="M 200,100 Q 300,150 400,300 T 700,500" fill="none" stroke="var(--color-primary)" strokeWidth="4" strokeDasharray="10, 10" className="opacity-50" />
                  <path d="M 200,100 Q 300,150 400,300" fill="none" stroke="var(--color-primary)" strokeWidth="4" className="drop-shadow-md" />
                  
                  {/* Origin */}
                  <circle cx="200" cy="100" r="8" fill="var(--color-accent)" stroke="white" strokeWidth="3" className="shadow-lg" />
                  {/* Destination */}
                  <circle cx="700" cy="500" r="12" fill="white" stroke="var(--color-text-muted)" strokeWidth="3" />
                  <circle cx="700" cy="500" r="4" fill="var(--color-text-muted)" />
                </svg>

                {/* Current Location Marker (Truck) */}
                <div className="absolute top-[280px] left-[380px] -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="relative">
                    <div className="absolute inset-0 bg-[var(--color-primary)] rounded-full animate-ping opacity-30 scale-150" />
                    <div className="w-14 h-14 bg-[var(--color-primary-darker)] rounded-full flex items-center justify-center shadow-xl border-4 border-white">
                      <Truck className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-white px-4 py-2 rounded-[12px] shadow-lg border border-[var(--color-border)]/50 text-[13px] font-bold text-[var(--color-text-heading)] whitespace-nowrap flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
                    Driver is 15 mins away
                    {/* Triangle pointer */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white" />
                  </div>
                </div>
              </div>

              {/* Map Controls */}
              <div className="absolute bottom-6 right-6 flex flex-col gap-2">
                <Button variant="secondary" size="icon" className="bg-white shadow-md border-[var(--color-border)]/50">
                  <Map className="w-5 h-5 text-[var(--color-text-heading)]" />
                </Button>
                <Button variant="secondary" size="icon" className="bg-white shadow-md border-[var(--color-border)]/50 font-bold text-[18px]">
                  +
                </Button>
                <Button variant="secondary" size="icon" className="bg-white shadow-md border-[var(--color-border)]/50 font-bold text-[18px]">
                  -
                </Button>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
