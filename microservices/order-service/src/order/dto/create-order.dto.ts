export class CreateOrderDto {
  paymentMethod: string;
  totalAmount: number;
  recipientEmail?: string;
  simulatePaymentFailure?: boolean;
  items: Array<{
    variantId: string;
    quantity: number;
    unitPrice: number;
  }>;
}
