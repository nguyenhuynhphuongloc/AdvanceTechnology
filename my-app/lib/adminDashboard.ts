export type DashboardMetric = {
  label: string;
  value: number;
};

export const getDashboardMetrics = async (): Promise<DashboardMetric[]> => {
  // TODO: Thay thế bằng API thực tế, lúc đầu giả lập tĩnh
  return [
    { label: "Total Users", value: 1248 },
    { label: "Active Orders", value: 57 },
    { label: "Inventory SKU", value: 6480 },
    { label: "Revenue (USD)", value: 120304 },
  ];
};
