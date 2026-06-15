import { useState, type InputHTMLAttributes } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  registration: UseFormRegisterReturn;
}

export function Input({ label, error, registration, ...props }: InputProps) {
  const [inFocus, setInFocus] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  return (
    <div
      className={`rounded-lg border-2 border-black shadow-md dark:border-white ${inFocus ? "bg-cyan-50 dark:bg-cyan-950" : "bg-white dark:bg-black"} ${props.disabled ? "opacity-50" : "opacity-100"}`}
    >
      <label className={`relative block h-15 w-full rounded-lg`}>
        <span
          className={`absolute left-4 z-10 transition-all ${inFocus || hasValue ? "top-3 translate-y-0 text-xs" : "top-1/2 -translate-y-1/2 text-base"}`}
        >
          {label}
        </span>

        <input
          className={`absolute bottom-3 left-4 w-[calc(100%-2rem)] text-base outline-none`}
          {...registration}
          {...props}
          onChange={(e) => {
            registration.onChange(e);
            setHasValue(e.target.value.length > 0);
          }}
          onFocus={() => setInFocus(true)}
          onBlur={(e) => {
            registration.onBlur(e);
            setInFocus(false);
          }}
        />

        <span className="absolute top-0.5 right-0.5 rounded-sm bg-red-100 px-1 text-xs text-red-800 italic dark:bg-red-900 dark:text-red-100">
          {error}
        </span>
      </label>
    </div>
  );
}
