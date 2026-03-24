"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Legacy route: unified product uses /register only. Preserve URL for old links.
 */
export default function SelectRoleRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/register");
  }, [router]);

  return (
    <div className="min-h-[40vh] flex items-center justify-center text-gray-500 text-sm">
      Redirecting…
    </div>
  );
}
