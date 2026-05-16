import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import CheckoutPage from '../page';
import { useSearchParams, useRouter } from 'next/navigation';
import { fetchOrderById } from '@/lib/shopping/order-api';
import { notification } from 'antd';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

// Mock order-api
jest.mock('@/lib/shopping/order-api', () => ({
  fetchOrderById: jest.fn(),
  createPaymentIntent: jest.fn(),
}));

// Mock antd
jest.mock('antd', () => ({
  notification: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock components
jest.mock('@/components/storefront/StorefrontHeader', () => ({
  StorefrontHeader: () => <div data-testid="header" />,
}));
jest.mock('@/components/storefront/StorefrontFooter', () => ({
  StorefrontFooter: () => <div data-testid="footer" />,
}));
jest.mock('@/components/shopping/CheckoutForm', () => ({
  CheckoutForm: () => <div data-testid="checkout-form" />,
}));
jest.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(),
}));

describe('CheckoutPage Notification', () => {
  const mockRouter = { push: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('should show success notification when status is confirmed via polling', async () => {
    const mockSearchParams = new URLSearchParams('orderId=test-order-123');
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

    (fetchOrderById as jest.Mock).mockResolvedValue({
      id: 'test-order-123',
      status: 'confirmed',
      totalAmount: 100,
    });

    render(<CheckoutPage />);

    await waitFor(() => {
      expect(notification.success).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Payment successful',
      }));
    });

    expect(screen.getByText('Payment successful')).toBeInTheDocument();
  });

  it('should show success notification when payment_success param is true', async () => {
    const mockSearchParams = new URLSearchParams('orderId=test-order-456&payment_success=true');
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

    (fetchOrderById as jest.Mock).mockResolvedValue({
      id: 'test-order-456',
      status: 'confirmed',
      totalAmount: 100,
    });

    render(<CheckoutPage />);

    await waitFor(() => {
      expect(notification.success).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Payment successful',
      }));
    });
  });
});
