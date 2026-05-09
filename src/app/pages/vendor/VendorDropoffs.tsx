import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-heading)]">Dropoffs</h1>
          <p className="text-[var(--color-text-muted)]">Manage your physical product dropoffs to our fulfillment centers.</p>
        </div>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <div className="flex justify-between items-center bg-[var(--color-bg-card)] p-1 rounded-lg border border-[var(--color-border)] max-w-sm mb-6">
          <TabsList className="grid w-full grid-cols-2 bg-transparent h-10">
            <TabsTrigger value="list" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">History</TabsTrigger>
            <TabsTrigger value="create" className="rounded-md data-[state=active]:bg-[var(--color-accent)] data-[state=active]:text-white">Create New</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="list" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <Input placeholder="Search dropoff ID..." className="pl-9" />
            </div>
            <Button variant="outline" className="border-[var(--color-primary)] text-[var(--color-primary)]">Filter</Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isLoading ? (
              <div className="col-span-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-8">
                <p className="text-sm text-[var(--color-text-muted)]">Loading dropoff history...</p>
              </div>
            ) : dropoffs.length === 0 ? (
              <div className="col-span-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-8 text-center">
                <p className="text-sm text-[var(--color-text-muted)]">No dropoff records found yet.</p>
              </div>
            ) : (
              dropoffs.map((dropoff) => {
                const centerName = dropoff.fulfillment_center?.name || dropoff.fulfillmentCenter?.name || 'Unknown Center';
                const orderCount = dropoff.orders?.length ?? dropoff.order_count ?? 0;
                const status = dropoff.status || 'Pending';
                const dateLabel = new Date(dropoff.created_at || dropoff.createdAt || Date.now()).toLocaleString();

                return (
                  <Card key={dropoff.id} className="border-[var(--color-border)] shadow-sm overflow-hidden">
                    <div className={`h-1 w-full ${status === 'Processed' ? 'bg-[var(--color-success)]' : 'bg-[var(--color-warning)]'}`} />
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg font-bold font-mono text-[var(--color-text-heading)]">{dropoff.id}</CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" /> {dateLabel}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className={
                          `${status === 'Processed' ? 'text-[var(--color-success)] border-[var(--color-success)] bg-[var(--color-success-bg)]' : 
                            'text-[var(--color-warning)] border-[var(--color-warning)] bg-[var(--color-warning-bg)]'}
                        `}>
                          {status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex justify-between items-center bg-[var(--color-bg-page)] p-3 rounded-lg border border-[var(--color-border)]">
                        <div className="flex gap-3 items-center">
                          <div className="w-10 h-10 rounded-full bg-[var(--color-primary-bg)] flex items-center justify-center text-[var(--color-primary)]">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-[var(--color-text-heading)]">{centerName}</p>
                            <p className="text-xs text-[var(--color-text-muted)]">{orderCount} orders included</p>
                          </div>
                        </div>
                        {status === 'Pending' && (
                          <Button variant="outline" size="icon" className="h-10 w-10 border-[var(--color-primary)] text-[var(--color-primary)]">
                            <QrCode className="w-5 h-5" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                    {status === 'Pending' && (
                      <CardFooter className="pt-0 pb-4 border-t border-[var(--color-border)] mt-4 p-4">
                        <Button className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white gap-2">
                          <QrCode className="w-4 h-4" /> Show Dropoff QR Code
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-[var(--color-border)] shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">1. Select Fulfillment Center</CardTitle>
                  <CardDescription>Choose where you want to drop off your products.</CardDescription>
                </CardHeader>
                <CardContent>
                  {fulfillmentCenters.length === 0 ? (
                    <div className="text-sm text-[var(--color-text-muted)]">No fulfillment centers are currently configured. Please check back later.</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {fulfillmentCenters.map((fc) => (
                        <div
                          key={fc.id}
                          className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                            selectedCenter === fc.id
                              ? 'border-[var(--color-accent)] bg-[var(--color-accent-bg)]'
                              : 'border-[var(--color-border)] hover:border-[var(--color-primary)] bg-white'
                          }`}
                          onClick={() => setSelectedCenter(fc.id)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <MapPin className={`w-5 h-5 ${selectedCenter === fc.id ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'}`} />
                            <Badge variant="outline" className="bg-white/50 text-[10px] gap-1 border border-black/5 border-transparent">
                              <Navigation className="w-3 h-3" /> {fc.distance}
                            </Badge>
                          </div>
                          <h4 className="font-bold text-[var(--color-text-heading)]">{fc.name}</h4>
                          <p className="text-sm text-[var(--color-text-muted)] mt-1">{fc.address}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-[var(--color-border)] shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">2. Add Orders</CardTitle>
                  <CardDescription>Scan or enter order IDs to include in this dropoff.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input placeholder="Enter Order ID (e.g. ORD-7291)" className="flex-1" />
                    <Button variant="secondary" className="bg-[var(--color-primary-bg)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white">
                      Add
                    </Button>
                    <Button variant="outline" size="icon" className="border-[var(--color-primary)] text-[var(--color-primary)] shrink-0">
                      <QrCode className="w-5 h-5" />
                    </Button>
                  </div>
                  
                  {/* Added orders will appear here after scanning/entering order IDs */}
                  <div className="border border-[var(--color-border)] rounded-md overflow-hidden bg-[var(--color-bg-page)]">
                    <div className="p-3 text-xs text-[var(--color-text-muted)] text-center">
                      No orders added yet. Scan or enter order IDs above.
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[var(--color-border)] shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">3. Additional Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea placeholder="Any special handling instructions for the FC staff?" />
                </CardContent>
              </Card>
            </div>

            {/* Summary Sticky Panel */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <Card className="border-[var(--color-border)] shadow-sm bg-[var(--color-bg-card)]">
                  <CardHeader>
                    <CardTitle className="text-lg text-[var(--color-text-heading)]">Dropoff Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-start text-sm">
                      <span className="text-[var(--color-text-muted)]">Center:</span>
                      <span className="font-medium text-right max-w-[150px]">
                        {selectedCenter ? fulfillmentCenters.find(fc => fc.id === selectedCenter)?.name : 'Not selected'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-t border-[var(--color-border)] pt-4">
                      <span className="text-[var(--color-text-muted)]">Total Orders:</span>
                      <span className="font-bold text-lg">2</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[var(--color-text-muted)]">Total Items:</span>
                      <span className="font-bold text-lg">4</span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-4 border-t border-[var(--color-border)] flex-col gap-3">
                    <Button 
                      className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-white font-bold h-12"
                      disabled={!selectedCenter}
                    >
                      Generate Dropoff QR
                    </Button>
                    <p className="text-xs text-center text-[var(--color-text-muted)]">
                      You must present the QR code at the FC.
                    </p>
                  </CardFooter>
                </Card>
              </div>
            </div>

          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function X(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}
