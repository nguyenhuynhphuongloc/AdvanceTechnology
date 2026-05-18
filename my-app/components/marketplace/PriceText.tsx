interface PriceTextProps {
  value: number;
  className?: string;
}

export function PriceText({ value, className = '' }: PriceTextProps) {
  const formatted = new Intl.NumberFormat('vi-VN').format(value);
  return (
    <span className={`font-bold text-orange-500 ${className}`}>
      {formatted}
      <span className="text-xs font-normal text-gray-400 ml-0.5">VND</span>
    </span>
  );
}
