/**
 * Currency Display Component
 * Displays amount in local currency with CNY conversion below
 */

interface CurrencyDisplayProps {
  amount: number;
  currencySymbol: string;
  exchangeRateToCNY: number;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function CurrencyDisplay({
  amount,
  currencySymbol,
  exchangeRateToCNY,
  className = "",
  size = "md",
}: CurrencyDisplayProps) {
  const cnyAmount = amount * exchangeRateToCNY;
  
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
    xl: "text-3xl",
  };
  
  const cnySizeClasses = {
    sm: "text-xs",
    md: "text-xs",
    lg: "text-sm",
    xl: "text-base",
  };
  
  return (
    <div className={`flex flex-col items-end ${className}`}>
      <span className={`font-bold ${sizeClasses[size]}`}>
        {currencySymbol}{amount.toFixed(2)}
      </span>
      <span className={`text-muted-foreground ${cnySizeClasses[size]}`}>
        ≈ ¥{cnyAmount.toFixed(2)}
      </span>
    </div>
  );
}
