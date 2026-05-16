"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { notification } from "antd";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";
import { StorefrontHeader } from "@/components/storefront/StorefrontHeader";
import { CheckoutForm } from "@/components/shopping/CheckoutForm";
import { PRODUCT_LIST_PATH } from "@/lib/products/routes";
import {
  createPaymentIntent,
  fetchOrderById,
  type OrderResponse,
} from "@/lib/shopping/order-api";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

type CheckoutStatus = "processing" | "confirmed" | "failed" | "awaiting_payment";

const initialShippingInfo = {
  fullName: "",
  email: "",
  phone: "",
  city: "",
  address: "",
};

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const paymentSuccess = searchParams.get("payment_success");

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [status, setStatus] = useState<CheckoutStatus>("processing");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shippingInfo, setShippingInfo] = useState(initialShippingInfo);
  const [shippingComplete, setShippingComplete] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      router.push(PRODUCT_LIST_PATH);
      return;
    }

    if (paymentSuccess === "true") {
      setStatus("confirmed");
      return;
    }

    const checkStatus = async () => {
      try {
        const data = await fetchOrderById(orderId);
        setOrder(data);

        if (data.status === "awaiting_payment" && !clientSecret) {
          setStatus("awaiting_payment");
          const { clientSecret: secret } = await createPaymentIntent(orderId, data.totalAmount);
          setClientSecret(secret);
          clearInterval(intervalId);
          return;
        }

        if (data.status === "awaiting_approval" || data.status === "confirmed") {
          setStatus("confirmed");
          clearInterval(intervalId);
          return;
        }

        if (data.status === "failed") {
          setStatus("failed");
          setError(data.failureReason || "Order processing failed.");
          clearInterval(intervalId);
        }
      } catch (pollError) {
        console.error("Checkout polling error:", pollError);
      }
    };

    void checkStatus();
    const intervalId = setInterval(checkStatus, 2000);

    return () => clearInterval(intervalId);
  }, [clientSecret, orderId, paymentSuccess, router]);

  useEffect(() => {
    if (status === "confirmed") {
      notification.success({
        message: "Payment successful",
        description: `Order #${orderId?.slice(0, 8)} has been confirmed.`,
        placement: "topRight",
        duration: 5,
      });
    }

    if (status === "failed" && error) {
      notification.error({
        message: "Payment failed",
        description: error,
        placement: "topRight",
      });
    }
  }, [error, orderId, status]);

  const stripeOptions = useMemo(
    () => ({
      clientSecret: clientSecret || "",
      appearance: {
        theme: "night" as const,
        variables: { colorPrimary: "#ff4d00" },
      },
    }),
    [clientSecret],
  );

<<<<<<< HEAD
                            <Elements stripe={stripePromise} options={options}>
                                <CheckoutForm 
                                    orderId={orderId!} 
                                    onSuccess={async () => {
                                        setStatus('confirmed');
                                        try {
                                            // Finalize order in backend after payment
                                            await (await import('@/lib/shopping/order-api')).approveOrder(orderId!);
                                        } catch (err) {
                                            console.error("Order finalization failed:", err);
                                        }
                                    }}
                                    onError={(msg) => setError(msg)}
                                />
                            </Elements>
                        </div>
                    )}
=======
  function updateShippingField(field: keyof typeof initialShippingInfo, value: string) {
    setShippingInfo((current) => ({ ...current, [field]: value }));
    setShippingError(null);
  }
>>>>>>> 17b0ab4d97f1fdec0c5f816cbdd3ac2e63a14651

  function handleShippingSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const hasMissingField = Object.values(shippingInfo).some((value) => !value.trim());
    if (hasMissingField) {
      setShippingError("Complete all shipping fields before payment.");
      return;
    }

    setShippingComplete(true);
    setShippingError(null);
  }

<<<<<<< HEAD
                            <div className="pt-4 space-y-3">
                                <Link 
                                    href="/product/orders"
                                    className="block w-full bg-white !text-black py-4 rounded-2xl font-black text-sm hover:bg-zinc-200 transition-all text-center"
                                >
                                    VIEW MY ORDERS
                                </Link>
                                <Link 
                                    href={PRODUCT_LIST_PATH}
                                    className="block w-full border border-zinc-700 py-4 rounded-2xl font-bold text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
                                >
                                    CONTINUE SHOPPING
                                </Link>
                            </div>
                        </div>
                    )}
=======
  return (
    <div className="storefront-page min-h-screen bg-black text-white">
      <StorefrontHeader showSearch={false} />
>>>>>>> 17b0ab4d97f1fdec0c5f816cbdd3ac2e63a14651

      <main className="storefront-container py-12">
        <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
            <div className="mb-8 flex flex-wrap items-center gap-3 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
              <span className={shippingComplete ? "text-green-400" : "text-accent"}>Shipping</span>
              <span>/</span>
              <span className={shippingComplete ? "text-accent" : ""}>Payment</span>
              <span>/</span>
              <span>Confirmation</span>
            </div>

            {status === "processing" ? (
              <div className="space-y-8 py-10 text-center">
                <div className="relative mx-auto h-24 w-24">
                  <div className="absolute inset-0 rounded-full border-4 border-accent/20" />
                  <div className="absolute inset-0 animate-spin rounded-full border-4 border-t-accent" />
                </div>
                <div>
                  <h1 className="mb-3 text-3xl font-black tracking-tight">Processing order</h1>
                  <p className="font-medium leading-relaxed text-zinc-400">
                    We are validating the order and preparing the payment step.
                  </p>
                </div>
              </div>
            ) : null}

            {status === "awaiting_payment" && clientSecret && !shippingComplete ? (
              <form className="space-y-6" onSubmit={handleShippingSubmit}>
                <div>
                  <h1 className="text-3xl font-black tracking-tight">Shipping information</h1>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Confirm delivery details before payment. This keeps checkout validation visible before the final payment step.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    ["fullName", "Full name"],
                    ["email", "Email"],
                    ["phone", "Phone"],
                    ["city", "City"],
                  ].map(([field, label]) => (
                    <label key={field} className="grid gap-2 text-sm font-bold text-zinc-300">
                      {label}
                      <input
                        value={shippingInfo[field as keyof typeof initialShippingInfo]}
                        onChange={(event) =>
                          updateShippingField(field as keyof typeof initialShippingInfo, event.target.value)
                        }
                        className="rounded-2xl border border-zinc-700 bg-black/30 px-4 py-3 text-white outline-none focus:border-accent"
                      />
                    </label>
                  ))}
                  <label className="grid gap-2 text-sm font-bold text-zinc-300 sm:col-span-2">
                    Shipping address
                    <textarea
                      value={shippingInfo.address}
                      onChange={(event) => updateShippingField("address", event.target.value)}
                      className="min-h-24 rounded-2xl border border-zinc-700 bg-black/30 px-4 py-3 text-white outline-none focus:border-accent"
                    />
                  </label>
                </div>

                {shippingError ? (
                  <p className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">
                    {shippingError}
                  </p>
                ) : null}

                <button className="w-full rounded-2xl bg-accent py-4 text-sm font-black text-accent-contrast transition hover:bg-accent-strong">
                  Continue to payment
                </button>
              </form>
            ) : null}

            {status === "awaiting_payment" && clientSecret && shippingComplete ? (
              <div className="space-y-8 py-4">
                <div>
                  <h1 className="mb-3 text-3xl font-black tracking-tight">Complete payment</h1>
                  <p className="font-medium leading-relaxed text-zinc-400">
                    Shipping details are complete. Finish payment to place the order.
                  </p>
                  <div className="mt-6 inline-block rounded-full border border-accent/20 bg-accent/10 px-4 py-2">
                    <span className="text-lg font-black text-accent">
                      ${(order?.totalAmount ?? 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                <Elements stripe={stripePromise} options={stripeOptions}>
                  <CheckoutForm
                    orderId={orderId!}
                    onSuccess={() => setStatus("confirmed")}
                    onError={(message) => setError(message)}
                  />
                </Elements>
              </div>
            ) : null}

            {status === "confirmed" ? (
              <div className="space-y-8 py-10 text-center">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-500 shadow-2xl shadow-green-500/20">
                  <span className="text-4xl font-black text-white">✓</span>
                </div>
                <div>
                  <h1 className="mb-3 text-3xl font-black tracking-tight">Payment successful</h1>
                  <p className="font-medium leading-relaxed text-zinc-400">
                    Order <span className="font-bold text-white">#{orderId?.slice(0, 8)}</span> is confirmed.
                  </p>
                </div>
                <div className="space-y-3 pt-4">
                  <Link href="/product/orders" className="block w-full rounded-2xl bg-white py-4 text-sm font-black text-black transition hover:bg-zinc-200">
                    View my orders
                  </Link>
                  <Link href={PRODUCT_LIST_PATH} className="block w-full rounded-2xl border border-zinc-700 py-4 text-sm font-bold text-zinc-400 transition hover:bg-zinc-800 hover:text-white">
                    Continue shopping
                  </Link>
                </div>
              </div>
            ) : null}

            {status === "failed" ? (
              <div className="space-y-8 py-10 text-center">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-500 shadow-2xl shadow-red-500/20">
                  <span className="text-4xl font-black text-white">!</span>
                </div>
                <div>
                  <h1 className="mb-3 text-3xl font-black tracking-tight">Order failed</h1>
                  <p className="font-medium leading-relaxed text-zinc-400">
                    {error || "We could not process your order. Please try again."}
                  </p>
                </div>
                <Link href="/product/cart" className="block w-full rounded-2xl bg-white py-4 text-sm font-black text-black transition hover:bg-zinc-200">
                  Back to cart
                </Link>
              </div>
            ) : null}
          </section>

          <aside className="h-fit rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 lg:sticky lg:top-24">
            <h2 className="text-lg font-black">Order review</h2>
            <div className="mt-5 space-y-3 text-sm text-zinc-400">
              <div className="flex justify-between gap-4">
                <span>Order ID</span>
                <span className="font-mono text-xs text-white">{orderId?.slice(0, 12) ?? "Pending"}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Status</span>
                <span className="font-bold capitalize text-accent">{status.replace("_", " ")}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Total</span>
                <span className="font-black text-white">${(order?.totalAmount ?? 0).toFixed(2)}</span>
              </div>
            </div>
            {shippingComplete ? (
              <div className="mt-6 rounded-2xl border border-green-500/20 bg-green-500/10 p-4 text-xs leading-5 text-green-200">
                Shipping details are complete for {shippingInfo.fullName}.
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-zinc-800 bg-black/20 p-4 text-xs leading-5 text-zinc-500">
                Complete shipping details to unlock payment.
              </div>
            )}
          </aside>
        </div>
      </main>

      <StorefrontFooter />
    </div>
  );
}
