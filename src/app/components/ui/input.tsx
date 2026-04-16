import { InputHTMLAttributes, forwardRef, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from './button';
import { Search } from 'lucide-react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  success?: boolean;
}

const baseInputStyles = "w-full rounded-[8px] border-2 border-[var(--color-border)] bg-white px-4 py-3 text-[14px] text-[var(--color-text-heading)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary-lighter)] focus:ring-1 focus:ring-[var(--color-primary-lighter)] transition-shadow disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[var(--color-bg-page)]";

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, success, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          baseInputStyles,
          error && "border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]",
          success && "border-[var(--color-success)] focus:border-[var(--color-success)] focus:ring-[var(--color-success)]",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export const SearchInput = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <Search className="w-5 h-5 text-[var(--color-text-muted)]" />
        </div>
        <input
          type="text"
          className={cn(
            baseInputStyles,
            "pl-11 pr-12 rounded-full",
            className
          )}
          ref={ref}
          {...props}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
          {/* Voice Search Icon mock */}
          <button type="button" className="text-[var(--color-primary)] hover:text-[var(--color-accent)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
          </button>
        </div>
      </div>
    );
  }
);
SearchInput.displayName = "SearchInput";
