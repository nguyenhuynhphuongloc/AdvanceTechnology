"use client";

import { useState } from "react";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("Dữ liệu đăng nhập:", formData);
    alert("Đăng nhập thành công!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-md bg-white text-black p-8 rounded-3xl shadow-2xl border border-gray-200">
        <h1 className="text-3xl font-bold text-center mb-8">
          Chào mừng trở lại 
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 text-sm">Email</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black transition"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm">Mật khẩu</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black transition"
              placeholder="Nhập mật khẩu"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-black text-white font-semibold text-lg hover:bg-gray-800 transition duration-300 shadow-lg"
          >
            Đăng Nhập
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-gray-600">
          Chưa có tài khoản?{" "}
          <a
            href="/register"
            className="underline hover:text-black transition"
          >
            Đăng ký ngay
          </a>
        </p>
      </div>
    </div>
  );
}