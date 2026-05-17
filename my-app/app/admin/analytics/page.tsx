"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdminToken } from "@/components/admin/AdminSessionGate";
import {
  fetchAdminOrders,
  fetchAdminUsers,
  fetchAdminProducts,
  fetchAdminPayments,
} from "@/lib/admin/api";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminStatCard from "@/components/admin/AdminStatCard";
import AdminLoadingState from "@/components/admin/AdminLoadingState";
import type { AdminOrderRecord } from "@/lib/admin/types";

interface AnalyticsData {
  orders: { total: number; revenue: number; items: AdminOrderRecord[] };
  users: { total: number };
  products: { total: number };
  payments: { total: number; completed: number; pending: number };
}

export default function AnalyticsPage() {
  const token = useAdminToken();
  const [data, setData] = useState<AnalyticsData>({
    orders: { total: 0, revenue: 0, items: [] },
    users: { total: 0 },
    products: { total: 0 },
    payments: { total: 0, completed: 0, pending: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const loadAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setErrors({});

    const results = await Promise.allSettled([
      fetchAdminOrders(token),
      fetchAdminUsers(token),
      fetchAdminProducts(token),
      fetchAdminPayments(token),
    ]);

    const [ordersResult, usersResult, productsResult, paymentsResult] = results;

    const newData: AnalyticsData = {
      orders: { total: 0, revenue: 0, items: [] },
      users: { total: 0 },
      products: { total: 0 },
      payments: { total: 0, completed: 0, pending: 0 },
    };

    if (ordersResult.status === "fulfilled") {
      const orders = ordersResult.value;
      newData.orders = {
        total: orders.total,
        revenue: orders.items.reduce((sum, o) => sum + Number(o.totalAmount), 0),
        items: orders.items.slice(0, 5),
      };
    } else {
      setErrors((e) => ({ ...e, orders: true }));
    }

    if (usersResult.status === "fulfilled") {
      newData.users = { total: usersResult.value.total };
    } else {
      setErrors((e) => ({ ...e, users: true }));
    }

    if (productsResult.status === "fulfilled") {
      newData.products = { total: productsResult.value.total };
    } else {
      setErrors((e) => ({ ...e, products: true }));
    }

    if (paymentsResult.status === "fulfilled") {
      const payments = paymentsResult.value;
      newData.payments = {
        total: payments.total,
        completed: payments.items.filter((p) => p.status === "completed").length,
        pending: payments.items.filter((p) => p.status === "pending").length,
      };
    } else {
      setErrors((e) => ({ ...e, payments: true }));
    }

    setData(newData);
    setLoading(false);
  }, [token]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  if (loading) return <AdminLoadingState label="Loading analytics..." />;

  const statCards = [
    {
      label: "Total Orders",
      value: errors.orders ? "Unavailable" : data.orders.total.toLocaleString(),
      error: !!errors.orders,
    },
    {
      label: "Total Revenue",
      value: errors.orders
        ? "Unavailable"
        : `$${data.orders.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      error: !!errors.orders,
    },
    {
      label: "Total Users",
      value: errors.users ? "Unavailable" : data.users.total.toLocaleString(),
      error: !!errors.users,
    },
    {
      label: "Total Products",
      value: errors.products ? "Unavailable" : data.products.total.toLocaleString(),
      error: !!errors.products,
    },
    {
      label: "Total Payments",
      value: errors.payments ? "Unavailable" : data.payments.total.toLocaleString(),
      error: !!errors.payments,
    },
    {
      label: "Payments Completed",
      value: errors.payments ? "Unavailable" : `${data.payments.completed}`,
      error: !!errors.payments,
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Analytics"
        subtitle="Overview"
        description="Platform-wide metrics and insights."
        actions={
          <button
            type="button"
            onClick={() => loadAll()}
            className="rounded-lg border border-admin-border bg-white px-3 py-1.5 text-sm font-semibold text-admin-text transition hover:bg-slate-50"
          >
            Refresh
          </button>
        }
      />

      {/* Stat Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => (
          <AdminStatCard
            key={card.label}
            label={card.label}
            value={card.value}
            loading={loading}
          />
        ))}
      </div>

      {/* Recent Orders */}
      <div className="rounded-xl border border-admin-border bg-white">
        <div className="border-b border-admin-border px-6 py-4">
          <h2 className="text-base font-bold text-admin-text">Recent Orders</h2>
        </div>
        {errors.orders ? (
          <div className="p-6 text-center text-sm text-admin-muted">
            Unable to load recent orders.
          </div>
        ) : data.orders.items.length === 0 ? (
          <div className="p-6 text-center text-sm text-admin-muted">
            No orders found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-admin-border">
              <thead className="bg-admin-surface-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-admin-soft">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-admin-soft">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-admin-soft">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-admin-soft">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-admin-soft">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {data.orders.items.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-6 py-3 text-xs font-mono text-admin-text">
                      {order.orderNumber}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                          order.status === "completed"
                            ? "bg-green-50 text-green-700 ring-green-200"
                            : order.status === "pending"
                              ? "bg-amber-50 text-amber-700 ring-amber-200"
                              : order.status === "cancelled"
                                ? "bg-red-50 text-red-700 ring-red-200"
                                : "bg-slate-100 text-slate-700 ring-slate-200"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-xs text-admin-muted">
                      {order.paymentStatus}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-right text-sm font-medium text-admin-text">
                      ${Number(order.totalAmount).toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-xs text-admin-muted">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
