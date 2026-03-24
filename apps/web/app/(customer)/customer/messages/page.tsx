"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CustomerMessagesPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/messages");
  }, [router]);
  return <p className="p-4 text-gray-500">Redirecting to messages...</p>;
}
