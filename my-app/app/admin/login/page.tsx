"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminApiError, loginAdmin } from "@/lib/admin/api";
import { setAdminSessionToken } from "@/lib/admin/session";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Enter both email and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await loginAdmin(email.trim(), password);
      setAdminSessionToken(response.accessToken);

      const redirectTarget = searchParams.get("redirect");
      router.replace(
        redirectTarget && redirectTarget.startsWith("/admin")
          ? redirectTarget
          : "/admin",
      );
      router.refresh();
    } catch (error) {
      if (error instanceof AdminApiError) {
        setError(error.message);
      } else {
        setError("Could not sign in right now. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f7f7f7] p-6">
      <div className="w-full max-w-sm rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="mt-2 text-3xl font-black tracking-tight text-black">Admin Login</h1>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-xs font-medium text-black/60">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-black/15 px-4 py-3 text-sm outline-none focus:border-black/40 text-black"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-black/60">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-black/15 px-4 py-3 text-sm outline-none focus:border-black/40 text-black"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-black py-3 text-sm font-semibold text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:bg-black/50"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-black/60">
          No account? Please contact IT support.
        </p>
      </div>
    </main>
  );
}
