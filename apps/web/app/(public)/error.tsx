"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8">
      <h2 className="text-xl font-semibold text-red-600 mb-2">Something went wrong</h2>
      <pre className="text-left text-sm bg-gray-100 p-4 rounded-lg overflow-auto max-w-2xl mb-4 font-mono">
        {error.message}
        {error.stack && `\n\n${error.stack}`}
      </pre>
      <button
        onClick={reset}
        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
      >
        Try again
      </button>
    </div>
  );
}
