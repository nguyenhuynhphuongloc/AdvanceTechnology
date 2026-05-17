'use client';

interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  className?: string;
  disabled?: boolean;
}

export function QuantityStepper({
  value,
  min = 1,
  max = 999,
  onChange,
  className = '',
  disabled = false,
}: QuantityStepperProps) {
  const decrease = () => {
    if (disabled) return;
    onChange(Math.max(min, value - 1));
  };
  const increase = () => {
    if (disabled) return;
    onChange(Math.min(max, value + 1));
  };

  return (
    <div className={`flex items-center border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={decrease}
        disabled={disabled || value <= min}
        className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Decrease quantity"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>

      <span className="w-10 h-9 flex items-center justify-center text-sm font-semibold text-gray-900 border-x border-gray-200">
        {value}
      </span>

      <button
        type="button"
        onClick={increase}
        disabled={disabled || value >= max}
        className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Increase quantity"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}
