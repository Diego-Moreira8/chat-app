import type React from "react";

interface CardProps {
  centered?: boolean;
  color?: "default" | "alert";
  size?: "sm" | "md";
  children: React.ReactNode;
}

export function Card({
  centered = false,
  color = "default",
  size = "md",
  children,
}: CardProps) {
  const variantClasses = {
    default: "border-black bg-white/50 dark:border-white dark:bg-black/50",
    alert:
      "border-yellow-600 bg-yellow-100/50 dark:border-yellow-500 dark:bg-yellow-900/50",
  };

  const sizeClasses = {
    sm: "rounded-lg border-2 px-4 py-1 shadow",
    md: "rounded-xl border-3 p-4 shadow-xl",
  };

  return (
    <div
      className={`w-fit ${sizeClasses[size]} ${variantClasses[color]} ${centered ? "mx-auto" : ""}`}
    >
      {children}
    </div>
  );
}
