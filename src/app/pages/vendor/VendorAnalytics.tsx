import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar, Download, TrendingUp, Users } from 'lucide-react';

const revenueData = [
  { date: '1 Apr', revenue: 4000, target: 3000 },
  { date: '5 Apr', revenue: 3000, target: 3500 },
  { date: '10 Apr', revenue: 5500, target: 4000 },
  { date: '15 Apr', revenue: 4500, target: 4500 },
  { date: '20 Apr', revenue: 7000, target: 5000 },
  { date: '25 Apr', revenue: 6500, target: 5500 },
  { date: '30 Apr', revenue: 8500, target: 6000 },
];

const ordersData = [
  { date: '1 Apr', orders: 12 },
  { date: '5 Apr', orders: 15 },
  { date: '10 Apr', orders: 25 },
  { date: '15 Apr', orders: 18 },
  { date: '20 Apr', orders: 35 },
  { date: '25 Apr', orders: 30 },
  { date: '30 Apr', orders: 42 },
];

const trafficData = [
  { name: 'Organic Search', value: 45, color: 'var(--color-primary)' },
  { name: 'Video Feed', value: 35, color: 'var(--color-accent)' },
  { name: 'Direct URL', value: 15, color: 'var(--color-info)' },
  { name: 'Social Media', value: 5, color: 'var(--color-warning)' },
];

const topProducts = [
  { rank: 1, name: 'African Print Maxi Dress', units: 145, revenue: 'KES 652,500', trend: '+12%', image: 'https://images.unsplash.com/photo-1550614000-4b95d4ed79ea?w=200&h=200&fit=crop' },
  { rank: 2, name: 'Handwoven Sisal Basket', units: 89, revenue: 'KES 249,200', trend: '+5%', image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=200&h=200&fit=crop' },
  { rank: 3, name: 'Maasai Shuka Blanket', units: 64, revenue: 'KES 160,000', trend: '-2%', image: 'https://images.unsplash.com/photo-1602164945488-322a0e0a09e4?w=200&h=200&fit=crop' },
  { rank: 4, name: 'Organic Honey (500g)', units: 42, revenue: 'KES 33,600', trend: '+18%', image: 'https://images.unsplash.com/photo-1587049352847-4d4b12b1413e?w=200&h=200&fit=crop' },
];

export function VendorAnalytics() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-heading)]">Analytics</h1>
          <p className="text-[var(--color-text-muted)]">Gain insights into your store's performance.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select defaultValue="30d">
            <SelectTrigger className="w-[140px] bg-white border-[var(--color-border)]">
              <Calendar className="w-4 h-4 mr-2 text-[var(--color-text-muted)]" />
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-[var(--color-primary)] text-[var(--color-primary)] bg-white hover:bg-[var(--color-primary-bg)]">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Area Chart */}
        <Card className="border-[var(--color-border)] shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Revenue Trend</CardTitle>
                <CardDescription>Total sales over time vs target</CardDescription>
              </div>
              <div className="text-right">
                <span className="block text-2xl font-bold text-[var(--color-primary-darker)]">KES 452.3K</span>
                <span className="text-sm font-medium text-[var(--color-success)] flex items-center justify-end gap-1">
                  <TrendingUp className="w-3 h-3" /> +12.5%
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenueBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} tickFormatter={(val) => `K${val/1000}k`} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area type="monotone" name="Revenue" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenueBlue)" />
                  <Area type="monotone" name="Target" dataKey="target" stroke="var(--color-text-muted)" strokeDasharray="5 5" strokeWidth={2} fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Orders Bar Chart */}
        <Card className="border-[var(--color-border)] shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Order Volume</CardTitle>
                <CardDescription>Number of orders placed daily</CardDescription>
              </div>
              <div className="text-right">
                <span className="block text-2xl font-bold text-[var(--color-accent-darker)]">177</span>
                <span className="text-sm font-medium text-[var(--color-success)] flex items-center justify-end gap-1">
                  <TrendingUp className="w-3 h-3" /> +8.2%
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ordersData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} />
                  <Tooltip cursor={{ fill: 'var(--color-bg-card)' }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                  <Bar dataKey="orders" name="Orders" fill="var(--color-accent)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top Products Table */}
        <Card className="lg:col-span-2 border-[var(--color-border)] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Top Performing Products</CardTitle>
              <CardDescription>Ranked by revenue</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-[var(--color-primary)]">View All</Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[var(--color-bg-card)]">
                  <TableRow>
                    <TableHead className="w-[50px]">Rank</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Units Sold</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((product) => (
                    <TableRow key={product.rank}>
                      <TableCell className="font-bold text-[var(--color-text-muted)]">#{product.rank}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img src={product.image} alt={product.name} className="w-10 h-10 rounded object-cover border border-[var(--color-border)]" />
                          <span className="font-semibold text-sm text-[var(--color-text-heading)] line-clamp-1">{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">{product.units}</TableCell>
                      <TableCell className="text-right font-bold text-[var(--color-text-heading)]">{product.revenue}</TableCell>
                      <TableCell className="text-right">
                        <span className={`text-sm font-medium ${product.trend.startsWith('+') ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}`}>
                          {product.trend}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Traffic Sources Pie Chart */}
        <Card className="border-[var(--color-border)] shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Traffic Sources</CardTitle>
            <CardDescription>Where your customers are coming from</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            <div className="h-[200px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={trafficData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {trafficData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)' }}
                    itemStyle={{ color: 'var(--color-text-heading)' }}
                    formatter={(value: number) => `${value}%`}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-[var(--color-text-heading)]">12.4K</span>
                <span className="text-xs text-[var(--color-text-muted)]">Visits</span>
              </div>
            </div>
            
            {/* Custom Legend */}
            <div className="mt-4 grid grid-cols-2 gap-y-2">
              {trafficData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-xs text-[var(--color-text-body)]">{entry.name}</span>
                  <span className="text-xs font-bold ml-auto">{entry.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
