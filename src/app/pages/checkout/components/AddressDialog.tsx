import { 
  User, Phone, Home, MapPin, MapPinned, Navigation, ChevronDown, 
} from 'lucide-react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Switch } from '../../../components/ui/switch';
import { cn } from '../../../components/ui/utils';
import type { PickupStation } from '../../../services/locationService';

interface AddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locView: 'none' | 'region' | 'district' | 'ward';
  setLocView: (view: 'none' | 'region' | 'district' | 'ward') => void;
  regions: string[];
  selectedRegion: string;
  setSelectedRegion: (r: string) => void;
  districts: string[];
  selectedDistrict: string;
  setSelectedDistrict: (d: string) => void;
  wards: string[];
  selectedWard: string;
  setSelectedWard: (w: string) => void;
  fullName: string;
  setFullName: (v: string) => void;
  mobileNumber: string;
  setMobileNumber: (v: string) => void;
  altMobileNumber: string;
  setAltMobileNumber: (v: string) => void;
  streetAddress: string;
  setStreetAddress: (v: string) => void;
  availableStations: PickupStation[];
  pickupStation: PickupStation | null;
  setPickupStation: (s: PickupStation | null) => void;
  handleUseMyLocation: () => void;
  isDefaultAddress: boolean;
  setIsDefaultAddress: (v: boolean) => void;
  error: string;
  handleSaveAddress: () => void;
}

export function AddressDialog({
  open,
  onOpenChange,
  locView,
  setLocView,
  regions,
  selectedRegion,
  setSelectedRegion,
  districts,
  selectedDistrict,
  setSelectedDistrict,
  wards,
  selectedWard,
  setSelectedWard,
  fullName,
  setFullName,
  mobileNumber,
  setMobileNumber,
  altMobileNumber,
  setAltMobileNumber,
  streetAddress,
  setStreetAddress,
  availableStations,
  pickupStation,
  setPickupStation,
  handleUseMyLocation,
  isDefaultAddress,
  setIsDefaultAddress,
  error,
  handleSaveAddress,
}: AddressDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white sm:max-w-[520px] p-0 gap-0 overflow-hidden rounded-[20px] flex flex-col max-h-[90vh] sm:max-h-[85vh]">
        <DialogHeader className="border-b border-[var(--color-border)] pb-4 pt-6 px-4 sm:px-6 relative shrink-0">
          <DialogTitle className="text-center text-[18px] text-[var(--color-text-heading)]">
            {locView !== 'none' ? 'Where To Ship Your Product' : 'Shipping Address'}
          </DialogTitle>
          <DialogDescription className="text-center text-[13px] text-[var(--color-text-muted)]">
            {locView !== 'none' ? 'Select your location below' : 'Enter your delivery details'}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto p-4 sm:p-6 space-y-5 flex-1">
          {/* Location Selector View */}
          {locView !== 'none' && (
            <div className="space-y-3">
              {locView === 'region' && (
                <>
                  <p className="text-[13px] font-bold text-[var(--color-text-heading)] mb-2">1. Select Region</p>
                  <div className="space-y-2">
                    {regions.map((r) => (
                      <button
                        key={r}
                        onClick={() => { setSelectedRegion(r); setLocView('district'); }}
                        className={cn(
                          'w-full flex items-center gap-3 p-3 rounded-[12px] border-2 text-left transition-all',
                          selectedRegion === r
                            ? 'border-[var(--color-primary)] bg-[var(--color-primary-bg)]'
                            : 'border-[var(--color-border)] bg-white hover:border-[var(--color-primary)]'
                        )}
                      >
                        <div className={cn(
                          'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                          selectedRegion === r ? 'border-[var(--color-primary)]' : 'border-[var(--color-text-muted)]'
                        )}>
                          {selectedRegion === r && <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />}
                        </div>
                        <span className={cn(
                          'text-[14px] font-semibold',
                          selectedRegion === r ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-heading)]'
                        )}>{r}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
              {locView === 'district' && (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <button onClick={() => setLocView('region')} className="text-[13px] text-[var(--color-primary)] font-bold">← Back</button>
                    <span className="text-[13px] text-[var(--color-text-muted)]">Region: {selectedRegion}</span>
                  </div>
                  <p className="text-[13px] font-bold text-[var(--color-text-heading)] mb-2">2. Select District</p>
                  <div className="space-y-2">
                    {districts.map((d) => (
                      <button
                        key={d}
                        onClick={() => { setSelectedDistrict(d); setLocView('ward'); }}
                        className={cn(
                          'w-full flex items-center gap-3 p-3 rounded-[12px] border-2 text-left transition-all',
                          selectedDistrict === d
                            ? 'border-[var(--color-primary)] bg-[var(--color-primary-bg)]'
                            : 'border-[var(--color-border)] bg-white hover:border-[var(--color-primary)]'
                        )}
                      >
                        <div className={cn(
                          'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                          selectedDistrict === d ? 'border-[var(--color-primary)]' : 'border-[var(--color-text-muted)]'
                        )}>
                          {selectedDistrict === d && <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />}
                        </div>
                        <span className={cn(
                          'text-[14px] font-semibold',
                          selectedDistrict === d ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-heading)]'
                        )}>{d}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
              {locView === 'ward' && (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <button onClick={() => setLocView('district')} className="text-[13px] text-[var(--color-primary)] font-bold">← Back</button>
                    <span className="text-[13px] text-[var(--color-text-muted)]">{selectedRegion} › {selectedDistrict}</span>
                  </div>
                  <p className="text-[13px] font-bold text-[var(--color-text-heading)] mb-2">3. Select Ward</p>
                  <div className="space-y-2">
                    {wards.map((w) => (
                      <button
                        key={w}
                        onClick={() => { setSelectedWard(w); setLocView('none'); }}
                        className={cn(
                          'w-full flex items-center gap-3 p-3 rounded-[12px] border-2 text-left transition-all',
                          selectedWard === w
                            ? 'border-[var(--color-primary)] bg-[var(--color-primary-bg)]'
                            : 'border-[var(--color-border)] bg-white hover:border-[var(--color-primary)]'
                        )}
                      >
                        <div className={cn(
                          'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                          selectedWard === w ? 'border-[var(--color-primary)]' : 'border-[var(--color-text-muted)]'
                        )}>
                          {selectedWard === w && <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />}
                        </div>
                        <span className={cn(
                          'text-[14px] font-semibold',
                          selectedWard === w ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-heading)]'
                        )}>{w}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Address Form */}
          {locView === 'none' && (
            <>
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-[var(--color-text-heading)] ml-1">Full Name <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                  <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="John Doe" className="pl-10" />
                </div>
              </div>

              {/* Mobile Number */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-[var(--color-text-heading)] ml-1">Mobile Number <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                  <Input type="tel" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} placeholder="+255 7XX XXX XXX" className="pl-10" />
                </div>
              </div>

              {/* Alternative Mobile */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-[var(--color-text-heading)] ml-1">Alternative Mobile Number <span className="text-[var(--color-text-muted)] font-normal">(Optional)</span></label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                  <Input type="tel" value={altMobileNumber} onChange={e => setAltMobileNumber(e.target.value)} placeholder="+255 7XX XXX XXX" className="pl-10" />
                </div>
              </div>

              {/* Street Address */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-[var(--color-text-heading)] ml-1">Street Address <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                  <Input value={streetAddress} onChange={e => setStreetAddress(e.target.value)} placeholder="Building, Floor, Apartment number" className="pl-10" />
                </div>
              </div>

              {/* Smart Location Input */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-[var(--color-text-heading)] ml-1">Region / District / Ward <span className="text-red-500">*</span></label>
                <button
                  onClick={() => setLocView('region')}
                  className={cn(
                    'w-full flex items-center justify-between p-3 rounded-[8px] border-2 text-left transition-all',
                    selectedRegion && selectedDistrict && selectedWard
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary-bg)]'
                      : 'border-[var(--color-border)] bg-white hover:border-[var(--color-primary)]'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[var(--color-text-muted)]" />
                    <span className="text-[14px] text-[var(--color-text-heading)]">
                      {selectedRegion && selectedDistrict && selectedWard
                        ? `${selectedWard}, ${selectedDistrict}, ${selectedRegion}`
                        : 'Tap to select location'}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)]" />
                </button>
              </div>

              {/* Pickup Station */}
              {selectedWard && (
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-[var(--color-text-heading)] ml-1 flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5" />
                    Select Your Pickup Station
                  </label>
                  {availableStations.length > 0 ? (
                    <div className="space-y-2">
                      {availableStations.some(s => s.ward !== selectedWard) && (
                        <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-[8px] px-3 py-2">
                          Showing nearest stations to {selectedWard}, {selectedDistrict}
                        </p>
                      )}
                      {availableStations.map((station) => (
                        <button
                          key={station.id}
                          onClick={() => setPickupStation(station)}
                          className={cn(
                            'w-full flex items-center gap-3 p-3 rounded-[12px] border-2 text-left transition-all',
                            pickupStation?.id === station.id
                              ? 'border-[var(--color-primary)] bg-[var(--color-primary-bg)]'
                              : 'border-[var(--color-border)] bg-white hover:border-[var(--color-primary)]'
                          )}
                        >
                          <div className={cn(
                            'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                            pickupStation?.id === station.id ? 'border-[var(--color-primary)]' : 'border-[var(--color-text-muted)]'
                          )}>
                            {pickupStation?.id === station.id && <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />}
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-[var(--color-text-heading)]">{station.name}</p>
                            <p className="text-[11px] text-[var(--color-text-muted)]">{station.ward}, {station.district}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[12px] text-[var(--color-text-muted)] bg-[var(--color-bg-page)] rounded-[8px] p-3">No pickup stations available for this area. The nearest station will be assigned automatically.</p>
                  )}
                </div>
              )}

              {/* Preview on Map (Optional) */}
              <div className="space-y-1">
                <button
                  onClick={handleUseMyLocation}
                  disabled={!selectedRegion || !selectedDistrict || !selectedWard}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 p-3 rounded-[12px] border-2 transition-all bg-white",
                    selectedRegion && selectedDistrict && selectedWard
                      ? "border-[var(--color-border)] text-[var(--color-text-heading)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                      : "border-[var(--color-border)] text-[var(--color-text-muted)] opacity-60 cursor-not-allowed"
                  )}
                >
                  <MapPinned className="w-4 h-4" />
                  <span className="text-[13px] font-semibold">Preview on Map</span>
                </button>
                <p className="text-[11px] text-[var(--color-text-muted)] text-center">Optional — verify where your order will be shipped</p>
              </div>

              {/* Default Address Toggle */}
              <div className="flex items-center justify-between bg-[var(--color-bg-page)] rounded-[12px] p-4">
                <span className="text-[13px] font-semibold text-[var(--color-text-heading)]">Set as Default Shipping Address</span>
                <Switch checked={isDefaultAddress} onCheckedChange={setIsDefaultAddress} />
              </div>

              {error && <div className="text-red-500 text-[14px] font-medium bg-red-50 rounded-[8px] p-3">{error}</div>}
            </>
          )}
        </div>

        {/* Footer */}
        {locView === 'none' && (
          <div className="border-t border-[var(--color-border)] p-4 sm:p-6 shrink-0 bg-white">
            <Button
              variant="primary"
              size="xl"
              className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] shadow-[var(--shadow-level-2)]"
              onClick={handleSaveAddress}
            >
              Save Address
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
