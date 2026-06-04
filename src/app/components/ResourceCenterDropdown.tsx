import { Link } from 'react-router';
import { ExternalLink } from 'lucide-react';

interface ResourceCenterDropdownProps {
  onClose: () => void;
}

const SOCIAL_LINKS = {
  facebook: 'https://www.facebook.com/share/18aHYoFPCi/?mibextid=wwXIfr',
  youtube: 'https://youtube.com/@natakahii_tz?si=jKXY8uFhm180URrW',
  instagram: 'https://www.instagram.com/natakahii_tz?igsh=ZGU0cnM1eTh6Yngy&utm_source=qr',
};

function InternalLink({ to, label, onClose }: { to: string; label: string; onClose: () => void }) {
  return (
    <li>
      <Link
        to={to}
        onClick={onClose}
        className="text-[14px] text-[var(--color-text-body)] hover:text-[var(--color-primary)] transition-colors"
      >
        {label}
      </Link>
    </li>
  );
}

function ExternalAnchor({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-[14px] text-[var(--color-text-body)] hover:text-[var(--color-primary)] transition-colors"
      >
        {label}
        <ExternalLink className="w-3 h-3 opacity-50" />
      </a>
    </li>
  );
}

export function ResourceCenterDropdown({ onClose }: ResourceCenterDropdownProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 p-8">
      {/* Why choose natakahii */}
      <div>
        <h4 className="text-[15px] font-bold text-[var(--color-text-heading)] mb-4">
          Why choose natakahii
        </h4>
        <ul className="space-y-3">
          <InternalLink to="/about" label="About natakahii" onClose={onClose} />
          <ExternalAnchor href={SOCIAL_LINKS.facebook} label="Facebook Trust" />
          <ExternalAnchor href={SOCIAL_LINKS.youtube} label="Youtube" />
          <ExternalAnchor href={SOCIAL_LINKS.instagram} label="Instagram" />
          <InternalLink to="/blog" label="Blogs" onClose={onClose} />
        </ul>
      </div>

      {/* Trade services */}
      <div>
        <h4 className="text-[15px] font-bold text-[var(--color-text-heading)] mb-4">
          Trade services
        </h4>
        <ul className="space-y-3">
          <InternalLink to="/escrow" label="Order protections" onClose={onClose} />
          <InternalLink to="/vendor/apply" label="Natakahii Business Edge" onClose={onClose} />
          <InternalLink to="/tracking" label="Production monitoring & inspection services" onClose={onClose} />
        </ul>
      </div>

      {/* Help Center */}
      <div>
        <h4 className="text-[15px] font-bold text-[var(--color-text-heading)] mb-4">
          Help Center
        </h4>
        <ul className="space-y-3">
          <InternalLink to="/help" label="Quick AI Assistant" onClose={onClose} />
          <InternalLink to="/help" label="For Buyer/Customers" onClose={onClose} />
          <InternalLink to="/dispute" label="Open a dispute" onClose={onClose} />
          <InternalLink to="/help" label="Report Abuse" onClose={onClose} />
        </ul>
      </div>

      {/* Our terms and privacy */}
      <div className="lg:border-l lg:border-[var(--color-border)] lg:pl-8">
        <h4 className="text-[15px] font-bold text-[var(--color-text-heading)] mb-4">
          Our terms and privacy
        </h4>
        <ul className="space-y-3">
          <InternalLink to="/terms" label="Terms of Use" onClose={onClose} />
          <InternalLink to="/privacy" label="Privacy Policy" onClose={onClose} />
          <InternalLink to="/cookies" label="Cookie Policy" onClose={onClose} />
          <InternalLink to="/refund" label="Refund Policy" onClose={onClose} />
        </ul>
      </div>
    </div>
  );
}
