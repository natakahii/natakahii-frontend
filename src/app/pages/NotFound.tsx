import { Link } from "react-router";
import { ArrowLeft, Compass, Map } from "lucide-react";
import { Button } from "../components/ui/button";

export function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-page)] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        
        {/* Flat Geometric Illustration */}
        <div className="relative w-64 h-64 mx-auto">
          {/* Background shapes */}
          <div className="absolute inset-0 bg-[#E8EBFA] rounded-full animate-pulse opacity-50" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#F05A28]/10 rounded-full" />
          <div className="absolute bottom-8 left-8 w-16 h-16 bg-[#142490] rounded-tl-full rounded-br-full transform rotate-45" />
          <div className="absolute top-12 right-12 w-12 h-12 bg-[#F05A28] rounded-full" />
          <div className="absolute bottom-1/4 right-8 w-20 h-20 border-4 border-[#142490] rounded-lg transform -rotate-12" />
          
          {/* Foreground icons */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative bg-white p-6 rounded-2xl shadow-[var(--shadow-level-3)] z-10">
              <Map className="w-16 h-16 text-[#142490]" />
              <div className="absolute -top-3 -right-3 bg-[#DC2626] text-white text-[10px] font-extrabold px-2 py-1 rounded-full shadow-sm">
                404
              </div>
            </div>
          </div>
          
          {/* Compass floating */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-3 rounded-full shadow-lg">
            <Compass className="w-8 h-8 text-[#F05A28]" />
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#1A2035] tracking-tight">
            Samahani! Page not found
          </h1>
          <p className="text-[#4A5468] text-[15px] max-w-sm mx-auto leading-relaxed">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>

        {/* Action */}
        <div>
          <Link to="/">
            <Button className="bg-[#142490] hover:bg-[#0D1A6B] text-white px-8 py-6 rounded-xl text-lg font-bold shadow-[var(--shadow-level-2)] flex items-center gap-2 mx-auto">
              <ArrowLeft className="w-5 h-5" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
