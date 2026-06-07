import { useRouteError, Link } from "react-router";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "../components/ui/button";

export function ErrorBoundary() {
  const error = useRouteError() as any;
  console.error("Application Error:", error);

  return (
    <div className="min-h-screen bg-[var(--color-bg-page)] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8 bg-white p-10 rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)]">
        
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-12 h-12 text-red-500" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-black text-[var(--color-text-heading)] tracking-tight">
            Unexpected Error
          </h1>
          <p className="text-[var(--color-text-body)] text-[15px] font-medium leading-relaxed">
            Something went wrong while loading this page. Our team has been notified.
          </p>
          <div className="mt-4 p-4 bg-gray-50 rounded-2xl text-left overflow-auto max-h-32">
            <p className="text-xs font-mono text-red-600">
              {error?.message || "Unknown Application Error"}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button 
            onClick={() => window.location.reload()}
            className="h-14 bg-[var(--color-primary)] hover:bg-[var(--color-primary-darker)] text-white rounded-2xl font-black flex items-center justify-center gap-2 w-full shadow-lg shadow-[var(--color-primary)]/20"
          >
            <RefreshCw className="w-5 h-5" />
            Try Refreshing
          </Button>
          
          <Link to="/" className="w-full">
            <Button 
              variant="outline"
              className="h-14 border-[var(--color-border)] text-[var(--color-text-heading)] hover:bg-[var(--color-bg-page)] rounded-2xl font-black flex items-center justify-center gap-2 w-full"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
