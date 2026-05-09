import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useToast } from '../components/ui/toast';
import { Camera, CheckCircle2, ChevronRight, Lock, LogOut, Mail, Phone, Settings, Shield, Store, User } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import { updateProfile, updateProfilePhoto } from '../services/profileService';

const tabs = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'security', label: 'Security', icon: Lock },
];

export function Profile() {
  const [activeTab, setActiveTab] = useState('overview');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { hasRole, logout, roleNames, updateUser, user } = useAuth();

  useEffect(() => {
    setName(user?.name || '');
    setPhone(user?.phone || '');
  }, [user?.name, user?.phone]);

  if (!user) {
    return null;
  }

  const joinedLabel = user.created_at
    ? new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(new Date(user.created_at))
    : 'Recently';

  const profileImage = user.profile_photo || '';

  const handleSaveProfile = async () => {
    setIsSaving(true);

    try {
      const response = await updateProfile({
        name: name.trim(),
        phone: phone.trim() || null,
      });

      updateUser(response.user);
      toast({ type: 'success', title: 'Profile updated', message: response.message });
    } catch (error: any) {
      toast({ type: 'error', title: 'Unable to save profile', message: error?.message || 'Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);
    setIsUploadingPhoto(true);

    try {
      const response = await updateProfilePhoto(formData);
      updateUser(response.user);
      toast({ type: 'success', title: 'Photo updated', message: response.message });
    } catch (error: any) {
      toast({ type: 'error', title: 'Unable to update photo', message: error?.message || 'Please choose another image and try again.' });
    } finally {
      event.target.value = '';
      setIsUploadingPhoto(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logout();
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="bg-[var(--color-bg-page)] min-h-[calc(100vh-72px)] py-8 lg:py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-sm border border-[var(--color-border)]/50 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[var(--color-primary-bg)] to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
            <div className="relative shrink-0">
              <div className="w-28 h-28 rounded-full overflow-hidden bg-[var(--color-bg-card)] border-4 border-white shadow-[var(--shadow-level-2)]">
                <ImageWithFallback src={profileImage} alt={user.name} className="w-full h-full object-cover" />
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUploadPhoto} />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shadow-md border-2 border-white hover:bg-[var(--color-primary-darker)] transition-colors disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 text-center md:text-left flex flex-col justify-center">
              <h1 className="text-[28px] md:text-[32px] font-bold text-[var(--color-text-heading)] tracking-tight mb-1">{user.name}</h1>
              <p className="text-[14px] text-[var(--color-text-muted)] flex items-center justify-center md:justify-start gap-2 mb-4">
                <Mail className="w-4 h-4" /> {user.email} <span className="w-1 h-1 rounded-full bg-[var(--color-border)]" /> Joined {joinedLabel}
              </p>

              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                {roleNames.map((role) => (
                  <Badge key={role} className="bg-[var(--color-primary-bg)] text-[var(--color-primary)] hover:bg-[var(--color-primary-bg)]">
                    {role.replace('_', ' ')}
                  </Badge>
                ))}
                <Badge className="bg-[var(--color-accent-bg)] text-[var(--color-accent)] hover:bg-[var(--color-accent-bg)]">
                  {user.status || 'active'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-[13px] font-bold text-[var(--color-text-heading)]">
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-[var(--color-text-muted)] font-medium">Account Status</span>
                  <span className="text-[18px] tracking-tight text-[var(--color-primary)] capitalize">{user.status || 'active'}</span>
                </div>
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-[var(--color-text-muted)] font-medium">Primary Role</span>
                  <span className="text-[18px] tracking-tight text-[var(--color-primary)]">{roleNames[0] || 'customer'}</span>
                </div>
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-[var(--color-text-muted)] font-medium">Phone</span>
                  <span className="text-[18px] tracking-tight text-[var(--color-primary)]">{user.phone || 'Not set'}</span>
                </div>
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-[var(--color-text-muted)] font-medium">Photo</span>
                  <span className="text-[18px] tracking-tight text-[var(--color-primary)]">{isUploadingPhoto ? 'Uploading...' : 'Ready'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
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
                  <button onClick={handleLogout} disabled={isLoggingOut} className="w-full flex items-center gap-3 p-3 rounded-[12px] transition-all font-bold text-[14px] text-red-600 hover:bg-red-50 disabled:opacity-50">
                    <LogOut className="w-5 h-5" /> {isLoggingOut ? 'Signing out...' : 'Logout'}
                  </button>
                </div>
              </nav>
            </div>

            <div className="bg-gradient-to-br from-[var(--color-accent)] to-[#D84515] rounded-[24px] p-6 text-white shadow-[var(--shadow-level-2)] relative overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4 pointer-events-none group-hover:scale-110 transition-transform" />

              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-[12px] flex items-center justify-center mb-4 border border-white/30">
                <Store className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-[18px] font-bold tracking-tight mb-2">{hasRole('vendor') ? 'Vendor Dashboard' : 'Become a Vendor'}</h3>
              <p className="text-[13px] opacity-90 leading-relaxed mb-6">
                {hasRole('vendor')
                  ? 'Manage products, analytics, and fulfillment from your seller workspace.'
                  : 'Start selling to active buyers across East Africa today. Affordable setup fees.'}
              </p>

              <Link to={hasRole('vendor') ? '/vendor/dashboard' : '/vendor/apply'} className="w-full">
                <Button variant="secondary" className="w-full bg-white text-[var(--color-accent)] border-none hover:bg-gray-50 shadow-md font-bold">
                  {hasRole('vendor') ? 'Open Dashboard' : 'Open Store'} <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-9">
            <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-sm border border-[var(--color-border)]/50 min-h-[500px]">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
                    <h2 className="text-[20px] font-bold text-[var(--color-text-heading)] tracking-tight">Account Overview</h2>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Signed In
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-[18px] border border-[var(--color-border)] p-5 bg-[var(--color-bg-card)]">
                      <div className="flex items-center gap-3 text-[var(--color-primary)] mb-3">
                        <User className="w-5 h-5" />
                        <h3 className="font-bold text-[16px] text-[var(--color-text-heading)]">Identity</h3>
                      </div>
                      <p className="text-[14px] text-[var(--color-text-body)]"><span className="font-semibold">Name:</span> {user.name}</p>
                      <p className="text-[14px] text-[var(--color-text-body)] mt-2"><span className="font-semibold">Email:</span> {user.email}</p>
                    </div>

                    <div className="rounded-[18px] border border-[var(--color-border)] p-5 bg-[var(--color-bg-card)]">
                      <div className="flex items-center gap-3 text-[var(--color-primary)] mb-3">
                        <Shield className="w-5 h-5" />
                        <h3 className="font-bold text-[16px] text-[var(--color-text-heading)]">Access</h3>
                      </div>
                      <p className="text-[14px] text-[var(--color-text-body)]"><span className="font-semibold">Roles:</span> {roleNames.join(', ') || 'customer'}</p>
                      <p className="text-[14px] text-[var(--color-text-body)] mt-2"><span className="font-semibold">Status:</span> {user.status || 'active'}</p>
                    </div>

                    <div className="rounded-[18px] border border-[var(--color-border)] p-5 bg-[var(--color-bg-card)]">
                      <div className="flex items-center gap-3 text-[var(--color-primary)] mb-3">
                        <Phone className="w-5 h-5" />
                        <h3 className="font-bold text-[16px] text-[var(--color-text-heading)]">Contact</h3>
                      </div>
                      <p className="text-[14px] text-[var(--color-text-body)]">{user.phone || 'Add your phone number in Settings so delivery teams can reach you quickly.'}</p>
                    </div>

                    <div className="rounded-[18px] border border-[var(--color-border)] p-5 bg-[var(--color-bg-card)]">
                      <div className="flex items-center gap-3 text-[var(--color-primary)] mb-3">
                        <Store className="w-5 h-5" />
                        <h3 className="font-bold text-[16px] text-[var(--color-text-heading)]">Seller Tools</h3>
                      </div>
                      <p className="text-[14px] text-[var(--color-text-body)]">
                        {hasRole('vendor')
                          ? 'Your vendor access is active. Head to the dashboard to manage your store.'
                          : 'Vendor onboarding is available once you’re ready to start selling.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <h2 className="text-[20px] font-bold text-[var(--color-text-heading)] tracking-tight pb-4 border-b border-[var(--color-border)]">Account Settings</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-semibold text-[var(--color-text-heading)] ml-1">Full Name</label>
                      <input type="text" value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-[8px] border-2 border-[var(--color-border)] bg-white px-4 py-3 text-[14px] text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-shadow" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-semibold text-[var(--color-text-heading)] ml-1">Email Address</label>
                      <input type="email" value={user.email} disabled className="w-full rounded-[8px] border-2 border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-3 text-[14px] text-[var(--color-text-muted)] focus:outline-none transition-shadow" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-semibold text-[var(--color-text-heading)] ml-1">Phone Number</label>
                      <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="w-full rounded-[8px] border-2 border-[var(--color-border)] bg-white px-4 py-3 text-[14px] text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-shadow" />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button variant="primary" size="l" className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] shadow-[var(--shadow-level-2)] px-8" isLoading={isSaving} onClick={handleSaveProfile}>
                      Save Changes
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="flex flex-col items-center justify-center min-h-[300px] text-center opacity-90">
                  <Lock className="w-16 h-16 text-[var(--color-text-muted)] mb-4" />
                  <h3 className="text-[18px] font-bold text-[var(--color-text-heading)] mb-2">Password and recovery</h3>
                  <p className="text-[14px] text-[var(--color-text-muted)] max-w-md">
                    Need to change your password? Use the password reset flow to request a verification code and set a new one securely.
                  </p>
                  <Link to="/forgot-password" className="mt-6">
                    <Button variant="secondary">Reset Password</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
