"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { fetchAdminSession, isAdminUnauthorizedError } from "@/lib/admin/api";
import { ADMIN_LOGIN_PATH } from "@/lib/admin/constants";
import {
  clearAdminSessionToken,
  getAdminSessionToken,
} from "@/lib/admin/session";
import type { AdminSessionUser } from "@/lib/admin/types";

type AdminSessionContextValue = {
  token: string;
  user: AdminSessionUser;
};

const AdminSessionContext = createContext<AdminSessionContextValue | null>(null);

export function useAdminSession() {
  const context = useContext(AdminSessionContext);
  if (!context) {
    throw new Error("useAdminSession must be used within AdminSessionGate.");
  }
  return context;
}

function AdminSessionLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center rounded-3xl border border-black/10 bg-white px-6 py-12 text-center shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/45">
          Admin session
        </p>
        <h1 className="mt-3 text-2xl font-black tracking-tight text-black">
          Verifying access...
        </h1>
      </div>
    </div>
  );
}

export default function AdminSessionGate({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<"checking" | "authenticated" | "unauthenticated">(
    "checking",
  );
  const [session, setSession] = useState<AdminSessionContextValue | null>(null);

  useEffect(() => {
    const isLoginPage = pathname === ADMIN_LOGIN_PATH;
    const token = getAdminSessionToken();
    let cancelled = false;

    const applyUnauthenticated = () => {
      if (cancelled) {
        return;
      }

      setSession(null);
      setStatus("unauthenticated");

      if (!isLoginPage) {
        router.replace(`${ADMIN_LOGIN_PATH}?redirect=${encodeURIComponent(pathname)}`);
      }
    };

    if (!token) {
      queueMicrotask(applyUnauthenticated);
      return;
    }

    fetchAdminSession(token)
      .then((user) => {
        if (cancelled) {
          return;
        }

        setSession({ token, user });
        setStatus("authenticated");

        if (isLoginPage) {
          router.replace("/admin");
        }
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        clearAdminSessionToken();
        applyUnauthenticated();

        if (isLoginPage && !isAdminUnauthorizedError(error)) {
          return;
        }
      });

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  const contextValue = useMemo(() => session, [session]);
  const isLoginPage = pathname === ADMIN_LOGIN_PATH;

  if (isLoginPage) {
    if (status === "checking" || status === "authenticated") {
      return <AdminSessionLoading />;
    }

    return <>{children}</>;
  }

  if (status !== "authenticated" || !contextValue) {
    return <AdminSessionLoading />;
  }

  return (
    <AdminSessionContext.Provider value={contextValue}>
      {children}
    </AdminSessionContext.Provider>
  );
}
