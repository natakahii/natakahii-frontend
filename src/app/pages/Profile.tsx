import { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { User, Settings, Heart, Bell, Star, Store, MapPin, Package, CreditCard, ChevronRight, LogOut, FileText, Camera, Mail } from 'lucide-react';

const tabs = [
  { id: 'orders', label: 'My Orders', icon: Package },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'reviews', label: 'My Reviews', icon: Star },
  { id: 'following', label: 'Following', icon: User },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Profile() {
  const [activeTab, setActiveTab] = useState('orders');

  return (
    <div className="bg-[var(--color-bg-page)] min-h-[calc(100vh-72px)] py-8 lg:py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* HEADER & QUICK STATS */}
        <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-sm border border-[var(--color-border)]/50 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[var(--color-primary-bg)] to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-28 h-28 rounded-full overflow-hidden bg-[var(--color-bg-card)] border-4 border-white shadow-[var(--shadow-level-2)]">
                <ImageWithFallback src="https://images.unsplash.com/photo-1556452576-3e2d58536f62?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200" alt="Jane Doe" className="w-full h-full object-cover" />
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shadow-md border-2 border-white hover:bg-[var(--color-primary-darker)] transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            
            {/* User Info */}
            <div className="flex-1 text-center md:text-left flex flex-col justify-center">
              <h1 className="text-[28px] md:text-[32px] font-bold text-[var(--color-text-heading)] tracking-tight mb-1">Jane Doe</h1>
              <p className="text-[14px] text-[var(--color-text-muted)] flex items-center justify-center md:justify-start gap-2 mb-4">
                <Mail className="w-4 h-4" /> jane.doe@example.com <span className="w-1 h-1 rounded-full bg-[var(--color-border)]" /> Joined Oct 2023
              </p>
              
              {/* Stats */}
              <div className="flex flex-wrap justify-center md:justify-start gap-4 sm:gap-8 text-[13px] font-bold text-[var(--color-text-heading)]">
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-[24px] tracking-tighter text-[var(--color-primary)]">12</span>
                  <span className="text-[var(--color-text-muted)] font-medium">Orders</span>
                </div>
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-[24px] tracking-tighter text-[var(--color-primary)]">34</span>
                  <span className="text-[var(--color-text-muted)] font-medium">Wishlist</span>
                </div>
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-[24px] tracking-tighter text-[var(--color-primary)]">8</span>
                  <span className="text-[var(--color-text-muted)] font-medium">Reviews</span>
                </div>
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-[24px] tracking-tighter text-[var(--color-primary)]">15</span>
                  <span className="text-[var(--color-text-muted)] font-medium">Following</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* SIDEBAR NAVIGATION */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="bg-white rounded-[24px] p-4 shadow-sm border border-[var(--color-border)]/50">
              <nav className="flex flex-col space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center justify-between p-3 rounded-[12px] transition-all font-bold text-[14px] ${isActive ? 'bg-[var(--color-primary-bg)] text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-page)] hover:text-[var(--color-text-heading)]'}`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`} />
                        {tab.label}
                      </div>
                      {isActive && <ChevronRight className="w-4 h-4" />}
                    </button>
                  );
                })}
                
                <div className="pt-4 mt-4 border-t border-[var(--color-border)]">
                  <button className="w-full flex items-center gap-3 p-3 rounded-[12px] transition-all font-bold text-[14px] text-red-600 hover:bg-red-50">
                    <LogOut className="w-5 h-5" /> Logout
                  </button>
                </div>
              </nav>
            </div>

            {/* BECOME A VENDOR CARD */}
            <div className="bg-gradient-to-br from-[var(--color-accent)] to-[#D84515] rounded-[24px] p-6 text-white shadow-[var(--shadow-level-2)] relative overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4 pointer-events-none group-hover:scale-110 transition-transform" />
              
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-[12px] flex items-center justify-center mb-4 border border-white/30">
                <Store className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-[18px] font-bold tracking-tight mb-2">Become a Vendor</h3>
              <p className="text-[13px] opacity-90 leading-relaxed mb-6">Start selling to active buyers across East Africa today. Affordable setup fees.</p>
              
              <Link to="/vendor/apply" className="w-full">
                <Button variant="secondary" className="w-full bg-white text-[var(--color-accent)] border-none hover:bg-gray-50 shadow-md font-bold">
                  Open Store <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="lg:col-span-9">
            <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-sm border border-[var(--color-border)]/50 min-h-[500px]">
              
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
                    <h2 className="text-[20px] font-bold text-[var(--color-text-heading)] tracking-tight">Recent Orders</h2>
                    <Button variant="ghost" className="text-[var(--color-primary)] font-bold text-[13px]">View All</Button>
                  </div>
                  
                  {[1, 2].map((i) => (
                    <div key={i} className="rounded-[16px] border border-[var(--color-border)] p-4 sm:p-5 hover:border-[var(--color-primary)] transition-colors">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-[var(--color-border)]/50">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-[15px] text-[var(--color-text-heading)] tracking-tight">Order #NH-8492-{i}</span>
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[var(--color-primary-bg)] text-[var(--color-primary)]">In Transit</span>
                          </div>
                          <div className="text-[13px] text-[var(--color-text-muted)]">Placed on 12 Oct 2023 • 2 Items</div>
                        </div>
                        <div className="text-[18px] font-bold text-[var(--color-accent)] tracking-tight">KES 16,900</div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="flex -space-x-4">
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm bg-[var(--color-bg-card)]">
                            <ImageWithFallback src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" alt="Item" className="w-full h-full object-cover" />
                          </div>
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm bg-[var(--color-bg-card)] flex items-center justify-center text-[12px] font-bold text-[var(--color-text-muted)]">
                            +1
                          </div>
                        </div>
                        <div className="flex-1 sm:ml-4 text-[13px] font-bold text-[var(--color-text-heading)] w-full sm:w-auto text-center sm:text-left">
                          Sold by Kazi Kicks & 1 other
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Link to="/tracking" className="flex-1 sm:flex-none">
                            <Button variant="primary" size="s" className="w-full bg-[var(--color-primary)] shadow-sm">Track</Button>
                          </Link>
                          <Button variant="secondary" size="s" className="flex-1 sm:flex-none">Details</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <h2 className="text-[20px] font-bold text-[var(--color-text-heading)] tracking-tight pb-4 border-b border-[var(--color-border)]">Account Settings</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-semibold text-[var(--color-text-heading)] ml-1">Full Name</label>
                      <input type="text" defaultValue="Jane Doe" className="w-full rounded-[8px] border-2 border-[var(--color-border)] bg-white px-4 py-3 text-[14px] text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-shadow" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-semibold text-[var(--color-text-heading)] ml-1">Email Address</label>
                      <input type="email" defaultValue="jane.doe@example.com" className="w-full rounded-[8px] border-2 border-[var(--color-border)] bg-white px-4 py-3 text-[14px] text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-shadow" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-semibold text-[var(--color-text-heading)] ml-1">Phone Number</label>
                      <input type="tel" defaultValue="+254 712 345 678" className="w-full rounded-[8px] border-2 border-[var(--color-border)] bg-white px-4 py-3 text-[14px] text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-shadow" />
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button variant="primary" size="l" className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] shadow-[var(--shadow-level-2)] px-8">
                      Save Changes
                    </Button>
                  </div>
                </div>
              )}

              {/* Placeholder for other tabs */}
              {(activeTab !== 'orders' && activeTab !== 'settings') && (
                <div className="flex flex-col items-center justify-center min-h-[300px] text-center opacity-50">
                  <FileText className="w-16 h-16 text-[var(--color-text-muted)] mb-4" />
                  <h3 className="text-[18px] font-bold text-[var(--color-text-heading)] mb-2">Nothing to see here</h3>
                  <p className="text-[14px] text-[var(--color-text-muted)]">Content for {activeTab} will appear here.</p>
                </div>
              )}
              
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}


