
"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../stores/auth-store";

const subscribe = () => () => {};

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  const accessToken = useAuthStore(
    (state) => state.accessToken
  );

  useEffect(() => {
    if (mounted && !accessToken) {
      router.replace("/login");
    }
  }, [mounted, accessToken, router]);

  if (!mounted || !accessToken) {
    return <p>로그인 상태를 확인하는 중...</p>;
  }

  return <>{children}</>;
}
