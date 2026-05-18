'use client';

import { useSellerAuth } from '@/lib/seller/auth-context';
import SellerPageHeader from '@/components/seller/SellerPageHeader';

export default function SellerProfilePage() {
    const { user, logout } = useSellerAuth();

    if (!user) return null;

    const initials = user.email.charAt(0).toUpperCase();

    return (
        <div className="max-w-2xl">
            <SellerPageHeader
                title="Profile"
                subtitle="Your account details and settings"
            />

            {/* Avatar + basic info */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-5">
                <div className="flex items-center gap-5">
                    <div className="h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center text-2xl font-black text-orange-600 flex-shrink-0 border-2 border-orange-200">
                        {initials}
                    </div>
                    <div>
                        <p className="text-lg font-bold text-gray-900">{user.email.split('@')[0]}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <span className="inline-flex items-center mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-orange-50 text-orange-700 border border-orange-200">
                            {user.role}
                        </span>
                    </div>
                </div>
            </div>

            {/* Account details */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-5 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-sm font-semibold text-gray-700">Account Details</h2>
                </div>
                <div className="divide-y divide-gray-100">
                    <div className="flex items-center justify-between px-6 py-4">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</span>
                        <span className="text-sm text-gray-900 font-medium">{user.email}</span>
                    </div>
                    <div className="flex items-center justify-between px-6 py-4">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</span>
                        <span className="text-sm text-gray-900 font-medium capitalize">{user.role}</span>
                    </div>
                    <div className="flex items-center justify-between px-6 py-4">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">User ID</span>
                        <span className="text-xs font-mono text-gray-400">{user.id}</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-sm font-semibold text-gray-700">Session</h2>
                </div>
                <div className="px-6 py-5">
                    <p className="text-sm text-gray-500 mb-4">
                        Sign out of your seller account on this device.
                    </p>
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-100 transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
