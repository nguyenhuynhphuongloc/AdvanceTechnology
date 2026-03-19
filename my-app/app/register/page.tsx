"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Mật khẩu không khớp!");
      return;
    }

    alert("Đăng ký thành công!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-md bg-white text-black p-8 rounded-3xl shadow-2xl border border-gray-200">
        <h1 className="text-3xl font-bold text-center mb-8">
          Tạo Tài Khoản
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 text-sm">Họ và tên</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black transition"
              placeholder="Nhập họ và tên"
            />
          </div>

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

          <div>
            <label className="block mb-1 text-sm">Xác nhận mật khẩu</label>
            <input
              type="password"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black transition"
              placeholder="Nhập lại mật khẩu"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-black text-white font-semibold text-lg hover:bg-gray-800 transition duration-300 shadow-lg"
          >
            Đăng Ký
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-gray-600">
          Đã có tài khoản?{" "}
          <a
            href="/login"
            className="underline hover:text-black transition"
          >
            Đăng nhập
          </a>
        </p>
      </div>
    </div>
  );
}