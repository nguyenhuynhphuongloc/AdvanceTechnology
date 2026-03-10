export default function ShoppingHeader() {
  return (
    <div className="mb-6 rounded-2xl bg-white p-6 shadow">
      <h1 className="text-3xl font-bold text-gray-800">Trang mua hàng</h1>
      <p className="mt-2 text-gray-500">
        Chọn sản phẩm bạn muốn mua
      </p>

      <input
        type="text"
        placeholder="Tìm kiếm sản phẩm..."
        className="mt-4 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
      />
    </div>
  );
}
