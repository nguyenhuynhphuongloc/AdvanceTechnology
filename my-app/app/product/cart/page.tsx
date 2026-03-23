'use client';

import { useCart } from '@/lib/shopping/cart-context';
import { useAuth } from '@/lib/shopping/auth-context';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CartPage() {
	const { items, removeFromCart, updateQuantity, totalPrice } = useCart();
	const { user } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!user) {
			router.replace('/product/account');
		}
	}, [user, router]);

	if (!user) return null;

	const shippingFee = items.length > 0 ? 4.99 : 0;
	const finalTotal = totalPrice + shippingFee;

	return (
		<main className="min-h-screen bg-[#0b0b0b] p-4 sm:p-6 lg:p-8 text-white">
			<div className="mx-auto max-w-[1400px]">
				<header className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
					<Link href="/product" className="flex items-center gap-3">
						<span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/70 text-lg font-bold text-white">
							▲
						</span>
						<span className="text-xl font-bold tracking-tight text-white sm:text-2xl">ACME STORE</span>
					</Link>

					<div className="flex items-center justify-between gap-3 sm:justify-end">
						<Link href="/product" className="text-sm text-white/70 hover:text-white">
							← Tiếp tục mua hàng
						</Link>
						<div className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-[11px] font-semibold text-white/85 sm:px-3 sm:text-xs">
							<span className="inline-flex h-5 w-5 items-center justify-center rounded border border-white/40 text-[10px]">▲</span>
							PRODUCT CART
						</div>
					</div>
				</header>

				<div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
					<div>
						<p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/50">Cart</p>
						<h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Giỏ hàng của bạn</h1>
					</div>
					<p className="text-sm text-white/60">{items.length} sản phẩm</p>
				</div>

				{items.length === 0 ? (
					<div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center sm:p-14">
						<p className="text-xl font-medium text-white/85 sm:text-2xl">Giỏ hàng trống.</p>
						<p className="mt-2 text-white/55">Thêm sản phẩm từ trang product để tiếp tục thanh toán.</p>
						<Link
							href="/product"
							className="mt-6 inline-block rounded-full bg-[#0052ff] px-7 py-3 text-sm font-semibold text-white hover:bg-[#0b46cc]"
						>
							Khám phá sản phẩm
						</Link>
					</div>
				) : (
					<div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
						<section className="space-y-4">
							{items.map(({ product, quantity }) => (
								<article
									key={product.id}
									className="grid grid-cols-[80px_minmax(0,1fr)] gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:grid-cols-[90px_minmax(0,1fr)] sm:gap-4 sm:p-4 md:grid-cols-[110px_minmax(0,1fr)_auto]"
								>
									<img
										src={product.image}
										alt={product.name}
										className="h-[80px] w-[80px] rounded-xl object-cover sm:h-[90px] sm:w-[90px] md:h-[110px] md:w-[110px]"
									/>

									<div className="min-w-0">
										<p className="truncate text-base font-medium text-white">{product.name}</p>
										<p className="mt-1 text-sm text-white/50">{product.category}</p>
										<p className="mt-3 text-sm font-semibold text-white">
											${product.price.toFixed(2)} USD
										</p>

										<div className="mt-3 flex w-fit items-center gap-2 rounded-xl border border-white/15 bg-black/30 p-1">
											<button
												onClick={() => updateQuantity(product.id, quantity - 1)}
												className="flex h-9 w-9 items-center justify-center rounded-lg text-lg font-medium text-white transition hover:bg-white/10"
												aria-label="Giảm"
											>
												−
											</button>
											<span className="w-7 text-center text-sm font-semibold text-white">{quantity}</span>
											<button
												onClick={() => updateQuantity(product.id, quantity + 1)}
												className="flex h-9 w-9 items-center justify-center rounded-lg text-lg font-medium text-white transition hover:bg-white/10"
												aria-label="Tăng"
											>
												+
											</button>
										</div>
									</div>

									<div className="mt-2 flex items-center justify-between gap-4 md:mt-0 md:flex-col md:items-end md:justify-between">
										<p className="text-base font-semibold text-white">
											${(product.price * quantity).toFixed(2)}
										</p>

										<button
											onClick={() => removeFromCart(product.id)}
											className="rounded-lg px-2 py-1 text-xs text-white/50 transition hover:bg-red-500/15 hover:text-red-300"
										>
											Xóa
										</button>
									</div>
								</article>
							))}
						</section>

						<aside className="h-fit rounded-2xl border border-white/10 bg-white/[0.03] p-6 lg:sticky lg:top-6">
							<h2 className="text-lg font-semibold text-white">Tóm tắt đơn hàng</h2>

							<div className="mt-5 space-y-3 text-sm">
								<div className="flex items-center justify-between text-white/70">
									<span>Tạm tính</span>
									<span>${totalPrice.toFixed(2)} USD</span>
								</div>
								<div className="flex items-center justify-between text-white/70">
									<span>Phí giao hàng</span>
									<span>{shippingFee === 0 ? 'Miễn phí' : `$${shippingFee.toFixed(2)} USD`}</span>
								</div>
							</div>

							<div className="my-4 border-t border-white/10" />

							<div className="flex items-center justify-between text-base font-semibold text-white">
								<span>Tổng cộng</span>
								<span>${finalTotal.toFixed(2)} USD</span>
							</div>

							<button className="mt-6 w-full rounded-full bg-[#0052ff] py-3 text-sm font-semibold text-white transition hover:bg-[#0b46cc]">
								Tiến hành thanh toán
							</button>
						</aside>
					</div>
				)}
			</div>
		</main>
	);
}
