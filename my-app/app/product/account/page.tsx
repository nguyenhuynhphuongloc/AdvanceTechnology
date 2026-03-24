'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/shopping/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';

export default function AccountPage() {
	const { user, login, register, logout } = useAuth();
	const router = useRouter();
	const searchParams = useSearchParams();
	const modeParam = searchParams.get('mode');

	const [mode, setMode] = useState<'login' | 'register'>('login');
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');

	useEffect(() => {
		if (modeParam === 'register') {
			setMode('register');
			return;
		}

		if (modeParam === 'login') {
			setMode('login');
		}
	}, [modeParam]);

	const handleLogin = (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		const ok = login(email, password);
		if (ok) {
			router.push('/product');
		} else {
			setError('Email hoặc mật khẩu không đúng.');
		}
	};

	const handleRegister = (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		if (password.length < 6) {
			setError('Password must be at least 6 characters.');
			return;
		}
		const ok = register(name, email, password);
		if (ok) {
			router.push('/product');
		} else {
			setError('Email này đã được đăng ký.');
		}
	};

	if (user) {
		return (
			<main className="flex min-h-screen items-center justify-center bg-[#f7f7f7] p-6">
				<div className="w-full max-w-sm rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
					<Link
						href="/"
						className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/20 bg-white px-4 py-2 text-sm font-bold text-black transition hover:border-black/40 hover:bg-white hover:text-black"
						style={{ color: "#000000" }}
					>
						← Back to store
					</Link>

					<div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-black/5">
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
						</svg>
					</div>

					<h1 className="text-xl font-semibold text-black">Xin chào, {user.name}!</h1>
					<p className="mt-1 text-sm text-black/50">{user.email}</p>

					<button
						onClick={logout}
						className="mt-8 w-full rounded-xl border border-black/10 py-3 text-sm font-medium text-black transition hover:bg-black hover:text-white"
					>
						Đăng xuất
					</button>
				</div>
			</main>
		);
	}

	return (
		<main className="flex min-h-screen items-center justify-center bg-[#f7f7f7] p-6">
			<div className="w-full max-w-sm rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
				<Link
					href="/"
					className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/20 bg-white px-4 py-2 text-sm font-bold text-black transition hover:border-black/40 hover:bg-white hover:text-black"
					style={{ color: "#000000" }}
				>
					← Back to store
				</Link>

				<div className="mb-6 rounded-2xl border border-black/10 bg-black/[0.03] px-4 py-4">
					<div className="flex items-center gap-3">
						<span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-black/20 bg-white text-base font-bold shadow-sm">
							▲
						</span>
						<div>
							<p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/45">Store</p>
							<p className="text-2xl font-black tracking-[0.18em] text-black sm:text-[1.8rem]">ADVENCE TECH</p>
						</div>
					</div>
				</div>

				<div className="mb-6 flex rounded-xl border border-black/10 p-1">
					<button
						onClick={() => { setMode('login'); setError(''); }}
						className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${mode === 'login' ? 'bg-black text-white' : 'text-black/50 hover:text-black'}`}
					>
						Login
					</button>
					<button
						onClick={() => { setMode('register'); setError(''); }}
						className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${mode === 'register' ? 'bg-black text-white' : 'text-black/50 hover:text-black'}`}
					>
						Register
					</button>
				</div>

				{mode === 'login' ? (
					<form onSubmit={handleLogin} className="space-y-4">
						<div>
							<label className="mb-1 block text-xs font-medium text-black/60">Email</label>
							<input
								type="email"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="you@example.com"
								className="w-full rounded-xl border border-black/15 px-4 py-3 text-sm outline-none focus:border-black/40"
							/>
						</div>
						<div>
							<label className="mb-1 block text-xs font-medium text-black/60">Password</label>
							<input
								type="password"
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="••••••••"
								className="w-full rounded-xl border border-black/15 px-4 py-3 text-sm outline-none focus:border-black/40"
							/>
						</div>

						{error && <p className="text-sm text-red-500">{error}</p>}

						<button
							type="submit"
							className="w-full rounded-xl bg-black py-3 text-sm font-semibold text-white transition hover:bg-black/80"
						>
							Login
						</button>
					</form>
				) : (
					<form onSubmit={handleRegister} className="space-y-4">
						<div>
							<label className="mb-1 block text-xs font-medium text-black/60">Full name</label>
							<input
								type="text"
								required
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="John Doe"
								className="w-full rounded-xl border border-black/15 px-4 py-3 text-sm outline-none focus:border-black/40"
							/>
						</div>
						<div>
							<label className="mb-1 block text-xs font-medium text-black/60">Email</label>
							<input
								type="email"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="you@example.com"
								className="w-full rounded-xl border border-black/15 px-4 py-3 text-sm outline-none focus:border-black/40"
							/>
						</div>
						<div>
							<label className="mb-1 block text-xs font-medium text-black/60">Password</label>
							<input
								type="password"
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="At least 6 characters"
								className="w-full rounded-xl border border-black/15 px-4 py-3 text-sm outline-none focus:border-black/40"
							/>
						</div>

						{error && <p className="text-sm text-red-500">{error}</p>}

						<button
							type="submit"
							className="w-full rounded-xl bg-black py-3 text-sm font-semibold text-white transition hover:bg-black/80"
						>
							Register
						</button>
					</form>
				)}
			</div>
		</main>
	);
}
