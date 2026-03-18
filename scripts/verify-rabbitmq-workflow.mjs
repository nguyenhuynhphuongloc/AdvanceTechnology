const baseUrls = {
  inventory: process.env.INVENTORY_URL ?? 'http://localhost:3006',
  order: process.env.ORDER_URL ?? 'http://localhost:3004',
  payment: process.env.PAYMENT_URL ?? 'http://localhost:3003',
  notification: process.env.NOTIFICATION_URL ?? 'http://localhost:3005',
};

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'content-type': 'application/json', ...(options.headers ?? {}) },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`${options.method ?? 'GET'} ${url} failed with ${response.status}`);
  }

  return response.json();
}

async function main() {
  await fetchJson(`${baseUrls.inventory}/api/v1/inventory/items`, {
    method: 'POST',
    body: JSON.stringify({ variantId: 'sku-live-1', stock: 5 }),
  });

  const order = await fetchJson(`${baseUrls.order}/api/v1/orders`, {
    method: 'POST',
    body: JSON.stringify({
      paymentMethod: 'cod',
      totalAmount: 49.99,
      recipientEmail: 'buyer@example.com',
      items: [{ variantId: 'sku-live-1', quantity: 1, unitPrice: 49.99 }],
    }),
  });

  const startedAt = Date.now();
  while (Date.now() - startedAt < 15000) {
    const currentOrder = await fetchJson(`${baseUrls.order}/api/v1/orders/${order.id}`);
    const transactions = await fetchJson(`${baseUrls.payment}/api/v1/payments/transactions`);
    const logs = await fetchJson(`${baseUrls.notification}/api/v1/notifications/logs`);

    if (
      currentOrder.status === 'confirmed' &&
      transactions.some((entry) => entry.orderId === order.id && entry.status === 'success') &&
      logs.some((entry) => entry.orderId === order.id)
    ) {
      console.log('Workflow verified:', {
        orderId: order.id,
        orderStatus: currentOrder.status,
      });
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error('Timed out waiting for RabbitMQ workflow completion.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
