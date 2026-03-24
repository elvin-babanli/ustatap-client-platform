"use client";

import { forwardRef } from "react";
import { clsx } from "clsx";

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }
>(function Input({ className, error, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={clsx(
        "w-full px-4 py-2.5 rounded-lg border bg-white text-gray-900 placeholder:text-gray-400",
        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
        error ? "border-red-300" : "border-gray-200",
        className
      )}
      {...props}
    />
  );
});
