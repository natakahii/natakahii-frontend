import { Link } from 'react-router';
import { Facebook, Instagram, Youtube } from 'lucide-react';
import TikTokIcon from './icons/TikTok';


export function Footer() {
  return (
    <footer className="bg-[var(--color-primary-darker)] text-white pt-16 pb-24 lg:pb-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Col */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-6">
              <img 
                src="/Nataka Hii footer.png"
                alt="Nataka Hii" 
                className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto max-w-[120px] sm:max-w-[140px] md:max-w-[160px] lg:max-w-[180px] object-contain"
              />
            </Link>
            <p className="text-[14px] text-[var(--color-text-muted)] leading-relaxed mb-6 max-w-sm">
              The next-generation e-commerce platform for East Africa. 
              Find what you want. Sell what you make. Trust every transaction.
            </p>
            <p className="text-[14px] font-semibold text-white mb-3">Follow us for updates</p>
            <div className="flex items-center gap-4">
              <a href="https://www.facebook.com/share/18aHYoFPCi/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#1877F2] hover:scale-110 hover:shadow-[0_4px_20px_rgba(24,119,242,0.5)] transition-all duration-300 group">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://www.tiktok.com/@natakahii_tz?_r=1&_t=ZS-95bDoX500Bs" target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-gradient-to-r hover:from-[#00f2ea] hover:to-[#ff0050] hover:scale-110 hover:shadow-[0_4px_20px_rgba(255,0,80,0.4)] transition-all duration-300 group">
                <TikTokIcon className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/natakahii_tz?igsh=ZGU0cnM1eTh6Yngy&utm_source=qr" target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:scale-110 hover:shadow-[0_4px_20px_rgba(220,39,67,0.4)] transition-all duration-300 group">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://youtube.com/@natakahii_tz?si=jKXY8uFhm180URrW" target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#FF0000] hover:scale-110 hover:shadow-[0_4px_20px_rgba(255,0,0,0.5)] transition-all duration-300 group">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-[16px] mb-6 text-white" style={{ color: '#FFFFFF' }}>Explore</h4>
            <ul className="space-y-4">
              <li><Link to="/explore" className="text-[14px] text-[var(--color-text-muted)] hover:text-[var(--color-accent)]">All Categories</Link></li>
              <li><Link to="/deals" className="text-[14px] text-[var(--color-text-muted)] hover:text-[var(--color-accent)]">Flash Deals</Link></li>
              <li><Link to="/video" className="text-[14px] text-[var(--color-text-muted)] hover:text-[var(--color-accent)]">Video Feed</Link></li>
              <li><Link to="/vendors" className="text-[14px] text-[var(--color-text-muted)] hover:text-[var(--color-accent)]">Top Vendors</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[16px] mb-6 text-white" style={{ color: '#FFFFFF' }}>Make Money</h4>
            <ul className="space-y-4">
              <li><Link to="/vendor/apply" className="text-[14px] text-[var(--color-text-muted)] hover:text-[var(--color-accent)]">Sell on Nataka Hii</Link></li>
              <li><Link to="/affiliate" className="text-[14px] text-[var(--color-text-muted)] hover:text-[var(--color-accent)]">Affiliate Program</Link></li>
              <li><Link to="/creator" className="text-[14px] text-[var(--color-text-muted)] hover:text-[var(--color-accent)]">Creator Portal</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[16px] mb-6 text-white" style={{ color: '#FFFFFF' }}>Support & Trust</h4>
            <ul className="space-y-4">
              <li><Link to="/escrow" className="text-[14px] text-[var(--color-text-muted)] hover:text-[var(--color-accent)]">Escrow Protection</Link></li>
              <li><Link to="/dispute" className="text-[14px] text-[var(--color-text-muted)] hover:text-[var(--color-accent)]">Dispute Resolution</Link></li>
              <li><Link to="/tracking" className="text-[14px] text-[var(--color-text-muted)] hover:text-[var(--color-accent)]">Track Cargo</Link></li>
              <li><Link to="/help" className="text-[14px] text-[var(--color-text-muted)] hover:text-[var(--color-accent)]">Help Center</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[13px] text-[var(--color-text-muted)] text-center md:text-left">
            © {new Date().getFullYear()} Nataka Hii Platform. All rights reserved.
          </p>
          <div className="flex gap-4">
            <span className="text-[12px] font-medium tracking-[0.5px] uppercase text-white/50">Powered by Nataka Hii</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
