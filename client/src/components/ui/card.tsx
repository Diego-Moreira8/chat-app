import type React from "react";

interface CardProps {
  children: React.ReactNode;
}

export function Card({ children }: CardProps) {
  return (
    <div className="w-fit rounded-xl border-2 border-black bg-white/50 p-4 shadow-xl dark:border-white dark:bg-black/50">
      {children}
    </div>
  );
}
