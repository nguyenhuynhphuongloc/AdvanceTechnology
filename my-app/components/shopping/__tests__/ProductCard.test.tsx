import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ProductCard from '../ProductCard';
import { CartProvider } from '@/lib/shopping/cart-context';
import { useAuth } from '@/lib/shopping/auth-context';
import { cartApi } from '@/lib/shopping/cart-api';

// Mock dependencies
jest.mock('@/lib/shopping/auth-context', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/shopping/cart-api', () => ({
  cartApi: {
    getCart: jest.fn().mockResolvedValue({ items: [] }),
    addItem: jest.fn().mockResolvedValue({ items: [] }),
  },
}));

const mockProduct = {
  id: 1,
  name: 'Test Product',
  price: 99.99,
  image: '/test.jpg',
  category: 'Test Category',
};

describe('ProductCard Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: null });
  });

  it('should render product information correctly', () => {
    render(
      <CartProvider>
        <ProductCard product={mockProduct} />
      </CartProvider>
    );

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$99.99 USD')).toBeInTheDocument();
  });

  it('should change button text when added to cart', async () => {
    render(
      <CartProvider>
        <ProductCard product={mockProduct} />
      </CartProvider>
    );

    const button = screen.getByRole('button', { name: /add to cart/i });
    
    await act(async () => {
      fireEvent.click(button);
    });

    expect(screen.getByText('Added to Cart')).toBeInTheDocument();
  });
});
