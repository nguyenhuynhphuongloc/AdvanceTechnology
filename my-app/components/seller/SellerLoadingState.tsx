'use client';

export default function SellerLoadingState({ message = 'Loading...' }: { message?: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="h-10 w-10 border-2 border-zinc-700 border-t-orange-500 rounded-full animate-spin" />
            <p className="text-zinc-500 text-sm font-medium">{message}</p>
        </div>
    );
}
