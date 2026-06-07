import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { MapPin, Clock, QrCode, Search, Navigation } from 'lucide-react';
import { fetchVendorDropoffs } from '../../services/dropoffService';

const fulfillmentCenters: Array<{ id: string; name: string; address: string; distance: string }> = [];

export function VendorDropoffs() {
  const [selectedCenter, setSelectedCenter] = useState<string | null>(null);
  const [dropoffs, setDropoffs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetchVendorDropoffs(15)
      .then((response) => {
        if (!isMounted) return;
        setDropoffs(response.dropoffs?.data ?? []);
      })
      .catch(() => {
        if (!isMounted) return;
        setDropoffs([]);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-[var(--color-text-heading)] tracking-tight">Dropoffs & Fulfillment</h1>
          <p className="text-[var(--color-text-muted)] mt-2 text-lg leading-relaxed">
            Manage your physical product handovers to our fulfillment centers efficiently.
          </p>
        </div>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <div className="flex justify-center mb-10">
          <TabsList className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-1.5 rounded-[20px] h-14">
            <TabsTrigger 
              value="list" 
              className="rounded-[16px] px-8 h-full data-[state=active]:bg-white data-[state=active]:text-[var(--color-text-heading)] data-[state=active]:shadow-xl font-bold text-[var(--color-text-muted)] transition-all"
            >
              Fulfillment History
            </TabsTrigger>
            <TabsTrigger 
              value="create" 
              className="rounded-[16px] px-8 h-full data-[state=active]:bg-[var(--vendor-accent-action)] data-[state=active]:text-white data-[state=active]:shadow-xl font-bold text-[var(--color-text-muted)] transition-all"
            >
              Create Dropoff
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="list" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <Input 
                placeholder="Search dropoff ID or fulfillment center..." 
                className="pl-12 h-14 bg-white border-[var(--color-border)] text-[var(--color-text-heading)] rounded-2xl focus:ring-[var(--vendor-accent-action)]/20" 
              />
            </div>
            <Button variant="outline" className="h-14 px-8 border-[var(--color-border)] text-[var(--color-text-heading)] hover:bg-[var(--color-bg-page)] rounded-2xl font-bold">
              Filter Records
            </Button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {isLoading ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="h-48 rounded-[32px] bg-[var(--color-bg-card)] animate-pulse border border-[var(--color-border)]" />
              ))
            ) : dropoffs.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-[var(--color-bg-card)] rounded-[40px] border border-dashed border-[var(--color-border)]">
                <MapPin className="w-16 h-16 text-[var(--color-border)] mx-auto mb-4" />
                <p className="text-xl font-bold text-[var(--color-text-heading)] mb-2">No Dropoff Records</p>
                <p className="text-[var(--color-text-muted)]">Start your first fulfillment dropoff to see history here.</p>
              </div>
            ) : (
              dropoffs.map((dropoff) => {
                const centerName = dropoff.fulfillment_center?.name || dropoff.fulfillmentCenter?.name || 'Main Hub Dar';
                const orderCount = dropoff.orders?.length ?? dropoff.order_count ?? 0;
                const status = dropoff.status || 'Pending';
                const dateLabel = new Date(dropoff.created_at || dropoff.createdAt || Date.now()).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });

                return (
                  <div key={dropoff.id} className="group bg-white border border-[var(--color-border)] rounded-[32px] p-6 hover:bg-[var(--color-bg-page)] hover:border-[var(--vendor-accent-action)]/30 transition-all duration-300 relative overflow-hidden">
                    <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl opacity-10 -mr-12 -mt-12 ${status === 'Processed' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    
                    <div className="flex justify-between items-start mb-8 relative z-10">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">Dropoff Reference</span>
                        <h3 className="text-2xl font-black text-[var(--color-text-heading)] font-mono">{dropoff.id.substring(0, 8)}</h3>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          status === 'Processed' 
                            ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                            : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                        }`}
                      >
                        {status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                      <div className="bg-[var(--color-bg-page)] rounded-2xl p-4 border border-[var(--color-border)]">
                        <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-1">Center</p>
                        <p className="text-sm font-bold text-[var(--color-text-heading)] truncate">{centerName}</p>
                      </div>
                      <div className="bg-[var(--color-bg-page)] rounded-2xl p-4 border border-[var(--color-border)]">
                        <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-1">Items</p>
                        <p className="text-sm font-bold text-[var(--color-text-heading)]">{orderCount} Orders</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">{dateLabel}</span>
                      </div>
                      {status === 'Pending' && (
                        <Button className="bg-[var(--vendor-accent-action)] hover:bg-[var(--vendor-accent-action)]/90 text-white rounded-xl px-6 font-bold shadow-lg shadow-[var(--vendor-accent-action)]/20">
                          <QrCode className="w-4 h-4 mr-2" />
                          Show QR
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="create" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8">
            <div className="space-y-8">
              {/* Step 1: Center */}
              <Card className="bg-white border border-[var(--color-border)] rounded-[40px] p-8 overflow-hidden">
                <CardHeader className="p-0 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--vendor-accent-action)]/10 text-[var(--vendor-accent-action)] flex items-center justify-center font-black text-xl">1</div>
                    <div>
                      <CardTitle className="text-2xl font-black text-[var(--color-text-heading)]">Select Fulfillment Center</CardTitle>
                      <CardDescription className="text-[var(--color-text-muted)] text-base">Where will you be dropping off your items?</CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  {fulfillmentCenters.length === 0 ? (
                    <div className="bg-[var(--color-bg-page)] rounded-3xl p-10 text-center border border-dashed border-[var(--color-border)]">
                      <p className="text-[var(--color-text-muted)] font-medium italic">Scanning for active centers in your region...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {fulfillmentCenters.map((fc) => (
                        <div
                          key={fc.id}
                          className={`group cursor-pointer rounded-3xl border-2 p-6 transition-all duration-300 ${
                            selectedCenter === fc.id
                              ? 'border-[var(--vendor-accent-action)] bg-white shadow-2xl'
                              : 'border-[var(--color-border)] bg-[var(--color-bg-page)] hover:border-[var(--vendor-accent-action)]/30'
                          }`}
                          onClick={() => setSelectedCenter(fc.id)}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <MapPin className={`w-6 h-6 ${selectedCenter === fc.id ? 'text-[var(--vendor-accent-action)]' : 'text-[var(--color-text-muted)]'}`} />
                            <Badge variant="outline" className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${selectedCenter === fc.id ? 'bg-[var(--vendor-accent-action)] text-white border-none' : 'bg-[var(--color-bg-card)] text-[var(--color-text-muted)] border-[var(--color-border)]'}`}>
                              <Navigation className="w-3 h-3" />
                              {fc.distance} away
                            </Badge>
                          </div>
                          <h4 className={`text-lg font-black mb-1 ${selectedCenter === fc.id ? 'text-[var(--color-text-heading)]' : 'text-[var(--color-text-heading)]'}`}>{fc.name}</h4>
                          <p className={`text-sm leading-relaxed ${selectedCenter === fc.id ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-text-muted)]'}`}>{fc.address}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Step 2: Orders */}
              <Card className="bg-white border border-[var(--color-border)] rounded-[40px] p-8 overflow-hidden">
                <CardHeader className="p-0 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--vendor-accent-action)]/10 text-[var(--vendor-accent-action)] flex items-center justify-center font-black text-xl">2</div>
                    <div>
                      <CardTitle className="text-2xl font-black text-[var(--color-text-heading)]">Consolidate Orders</CardTitle>
                      <CardDescription className="text-[var(--color-text-muted)] text-base">Scan or enter the Order IDs included in this batch.</CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <div className="space-y-6">
                    <div className="flex gap-3">
                      <Input 
                        placeholder="ORD-000000" 
                        className="h-14 flex-1 bg-white border-[var(--color-border)] text-[var(--color-text-heading)] rounded-2xl px-6 focus:ring-[var(--vendor-accent-action)]/20 text-lg font-mono tracking-widest" 
                      />
                      <Button className="h-14 px-8 bg-[var(--vendor-bg)] text-white hover:bg-[var(--vendor-bg)]/90 rounded-2xl font-black">
                        Add
                      </Button>
                      <Button variant="outline" size="icon" className="h-14 w-14 border-[var(--color-border)] text-[var(--color-text-heading)] hover:bg-[var(--color-bg-page)] rounded-2xl shrink-0">
                        <QrCode className="w-6 h-6" />
                      </Button>
                    </div>
                    
                    <div className="bg-[var(--color-bg-page)] border border-[var(--color-border)] rounded-3xl p-12 text-center">
                      <QrCode className="w-12 h-12 text-[var(--color-border)] mx-auto mb-4" />
                      <p className="text-[var(--color-text-muted)] font-bold">No orders staged for dropoff.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 3: Notes */}
              <Card className="bg-white border border-[var(--color-border)] rounded-[40px] p-8 overflow-hidden">
                <CardHeader className="p-0 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--vendor-accent-action)]/10 text-[var(--vendor-accent-action)] flex items-center justify-center font-black text-xl">3</div>
                    <CardTitle className="text-2xl font-black text-[var(--color-text-heading)]">Special Instructions</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Textarea 
                    placeholder="Fragile items, urgent handling, or other notes for the center staff..." 
                    className="min-h-[120px] bg-white border-[var(--color-border)] text-[var(--color-text-heading)] rounded-2xl p-6 focus:ring-[var(--vendor-accent-action)]/20"
                  />
                </CardContent>
                <CardFooter className="p-0 mt-4">
                  <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    Center staff will review these notes upon arrival.
                  </p>
                </CardFooter>
              </Card>
            </div>

            {/* Sidebar Summary */}
            <div className="space-y-6">
              <div className="sticky top-24">
                <div className="bg-white rounded-[40px] p-8 shadow-2xl border border-[var(--color-border)]">
                  <h3 className="text-2xl font-black text-[var(--color-text-heading)] mb-8">Batch Summary</h3>
                  
                  <div className="space-y-6 mb-10">
                    <div className="flex justify-between items-start py-4 border-b border-[var(--color-border)]">
                      <span className="text-[var(--color-text-muted)] font-medium">Selected Hub</span>
                      <span className="font-black text-[var(--color-text-heading)] text-right max-w-[150px]">
                        {selectedCenter ? fulfillmentCenters.find(fc => fc.id === selectedCenter)?.name : 'None'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b border-[var(--color-border)]">
                      <span className="text-[var(--color-text-muted)] font-medium">Total Orders</span>
                      <span className="font-black text-[var(--color-text-heading)] text-2xl">0</span>
                    </div>
                  </div>

                  <Button 
                    className={`w-full h-20 rounded-[24px] font-black text-xl transition-all duration-300 shadow-2xl ${
                      selectedCenter 
                        ? 'bg-[var(--vendor-accent-action)] hover:bg-[var(--vendor-accent-action)]/90 text-white shadow-[var(--vendor-accent-action)]/20' 
                        : 'bg-[var(--color-bg-page)] text-[var(--color-text-muted)] cursor-not-allowed'
                    }`}
                    disabled={!selectedCenter}
                  >
                    Authorize Batch
                  </Button>
                  
                  <div className="mt-8 flex gap-4 p-5 bg-[var(--color-bg-page)] rounded-3xl border border-[var(--color-border)]">
                    <div className="bg-[var(--color-bg-card)] p-2 rounded-xl h-fit shrink-0">
                      <Clock className="w-4 h-4 text-[var(--color-text-muted)]" />
                    </div>
                    <p className="text-[10px] font-bold text-[var(--color-text-muted)] leading-relaxed uppercase tracking-widest">
                      Batches must be delivered within 24 hours of authorization.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
