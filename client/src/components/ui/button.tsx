import cn from "classnames";
import { LoaderCircle } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "danger";
}

export function Button({
  loading = false,
  size = "md",
  variant = "default",
  disabled,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const variantClasses = {
    default:
      "bg-black text-white border-2 border-black hover:bg-cyan-200 hover:text-black dark:bg-white dark:text-black dark:border-white dark:hover:bg-cyan-800 dark:hover:text-white",
    danger:
      "bg-red-600 text-white border-2 border-red-600 hover:bg-white hover:text-red-600",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm shadow",
    md: "px-5 py-2.5 text-base shadow-md",
    lg: "px-7 py-3.5 text-lg shadow-lg",
  };

  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg font-medium transition-all",
        variantClasses[variant],
        sizeClasses[size],
        isDisabled && "pointer-events-none opacity-50",
        className,
      )}
      {...props}
    >
      {loading && <LoaderCircle className="size-4 animate-spin" />}
      {children}
    </button>
  );
}
