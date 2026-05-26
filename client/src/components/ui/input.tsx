import type { InputHTMLAttributes } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  registration: UseFormRegisterReturn;
}

export function Input({ label, error, registration, ...props }: InputProps) {
  return (
    <div>
      <label htmlFor={registration.name}>{label}</label>
      <input id={registration.name} {...registration} {...props} />
      <p>{error}</p>
    </div>
  );
}
