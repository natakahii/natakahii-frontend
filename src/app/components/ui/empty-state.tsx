import { ReactNode } from "react";
import { Link } from "react-router";
import { ShoppingCart, Package, Search, Bell, Tag, ArrowRight } from "lucide-react";
import { Button } from "./button";

type EmptyStateVariant = "cart" | "orders" | "products" | "notifications" | "search";

interface EmptyStateProps {
  variant: EmptyStateVariant;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  actionOnClick?: () => void;
  className?: string;
}

const variantConfig = {
  cart: {
    icon: ShoppingCart,
    shapes: [
      { type: "circle", bg: "bg-[#F05A28]", top: "10%", left: "10%", w: "w-16", h: "h-16" },
      { type: "square", bg: "bg-[#142490]", top: "60%", right: "20%", w: "w-20", h: "h-20", rotate: "rotate-12" },
      { type: "pill", bg: "bg-[#0284C7]", bottom: "10%", left: "30%", w: "w-24", h: "h-12", rotate: "-rotate-6" },
    ],
  },
  orders: {
    icon: Package,
    shapes: [
      { type: "square", bg: "bg-[#16A34A]", top: "20%", right: "10%", w: "w-24", h: "h-24", rotate: "rotate-45" },
      { type: "circle", bg: "bg-[#142490]", bottom: "20%", left: "20%", w: "w-20", h: "h-20" },
      { type: "pill", bg: "bg-[#F05A28]", top: "40%", left: "5%", w: "w-16", h: "h-8", rotate: "-rotate-12" },
    ],
  },
  products: {
    icon: Tag,
    shapes: [
      { type: "pill", bg: "bg-[#142490]", top: "15%", right: "15%", w: "w-32", h: "h-16", rotate: "-rotate-45" },
      { type: "square", bg: "bg-[#F05A28]", bottom: "15%", left: "15%", w: "w-24", h: "h-24", rotate: "rotate-12" },
      { type: "circle", bg: "bg-[#D97706]", top: "50%", right: "5%", w: "w-12", h: "h-12" },
    ],
  },
  notifications: {
    icon: Bell,
    shapes: [
      { type: "circle", bg: "bg-[#D97706]", top: "10%", right: "30%", w: "w-16", h: "h-16" },
      { type: "square", bg: "bg-[#142490]", bottom: "30%", left: "15%", w: "w-20", h: "h-20", rotate: "-rotate-12" },
      { type: "pill", bg: "bg-[#F05A28]", top: "50%", right: "10%", w: "w-24", h: "h-12", rotate: "rotate-45" },
    ],
  },
  search: {
    icon: Search,
    shapes: [
      { type: "circle", bg: "bg-[#0284C7]", top: "20%", left: "20%", w: "w-24", h: "h-24" },
      { type: "square", bg: "bg-[#142490]", bottom: "10%", right: "20%", w: "w-16", h: "h-16", rotate: "rotate-45" },
      { type: "pill", bg: "bg-[#F05A28]", top: "30%", right: "10%", w: "w-20", h: "h-10", rotate: "-rotate-12" },
    ],
  },
};

export function EmptyState({
  variant,
  title,
  description,
  actionLabel,
  actionHref,
  actionOnClick,
  className = "",
}: EmptyStateProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      {/* Custom Geometric Illustration */}
      <div className="relative w-64 h-64 mb-8 mx-auto flex items-center justify-center">
        {/* Background Base */}
        <div className="absolute inset-0 bg-[#F8F9FC] rounded-full scale-75 opacity-50 border-4 border-[#E2E6F0] border-dashed animate-[spin_60s_linear_infinite]" />
        
        {/* Geometric Shapes */}
        {config.shapes.map((shape, idx) => (
          <div
            key={idx}
            className={`absolute ${shape.bg} ${shape.w} ${shape.h} ${shape.top ? `top-[${shape.top}]` : ""} ${shape.bottom ? `bottom-[${shape.bottom}]` : ""} ${shape.left ? `left-[${shape.left}]` : ""} ${shape.right ? `right-[${shape.right}]` : ""} ${shape.rotate || ""} opacity-10`}
            style={{
              borderRadius: shape.type === "circle" ? "9999px" : shape.type === "pill" ? "9999px" : "16px",
              top: shape.top, bottom: shape.bottom, left: shape.left, right: shape.right
            }}
          />
        ))}

        {/* Foreground Card */}
        <div className="relative z-10 bg-white p-6 rounded-[24px] shadow-[var(--shadow-level-3)] border border-[#E2E6F0]">
          <div className="w-16 h-16 bg-[#F0F2F8] rounded-full flex items-center justify-center mb-0">
            <Icon className="w-8 h-8 text-[#142490]" strokeWidth={2.5} />
          </div>
        </div>
      </div>

      <h3 className="text-xl md:text-2xl font-extrabold text-[#1A2035] tracking-tight mb-2">
        {title}
      </h3>
      <p className="text-[15px] text-[#4A5468] max-w-sm mb-8 leading-relaxed">
        {description}
      </p>

      {/* Action CTA */}
      {(actionLabel) && (
        actionHref ? (
          <Link to={actionHref}>
            <Button className="bg-[#142490] hover:bg-[#0D1A6B] text-white px-8 py-6 rounded-xl font-bold flex items-center gap-2 shadow-[var(--shadow-level-2)] text-[15px]">
              {actionLabel} <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        ) : (
          <Button onClick={actionOnClick} className="bg-[#142490] hover:bg-[#0D1A6B] text-white px-8 py-6 rounded-xl font-bold flex items-center gap-2 shadow-[var(--shadow-level-2)] text-[15px]">
            {actionLabel} <ArrowRight className="w-4 h-4" />
          </Button>
        )
      )}
    </div>
  );
}
