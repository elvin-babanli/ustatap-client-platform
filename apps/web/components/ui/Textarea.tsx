"use client";

import { clsx } from "clsx";

export function Textarea({
  className,
  error,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }) {
  return (
    <textarea
      className={clsx(
        "w-full px-4 py-2.5 rounded-lg border bg-white text-gray-900 placeholder:text-gray-400 resize-y",
        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
        error ? "border-red-300" : "border-gray-200",
        className
      )}
      {...props}
    />
  );
}
