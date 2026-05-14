import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { CartProvider, useCart } from '../cart-context';
import { useAuth } from '../auth-context';
import { cartApi } from '../cart-api';

// Mock dependencies
jest.mock('../auth-context', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../cart-api', () => ({
  cartApi: {
    getCart: jest.fn(),
    addItem: jest.fn(),
    removeItem: jest.fn(),
    clearCart: jest.fn(),
    mergeCart: jest.fn(),
  },
}));

const mockUseAuth = useAuth as jest.Mock;
const mockCartApi = cartApi as jest.Mocked<typeof cartApi>;

const TestComponent = () => {
  const { items, addToCart, totalCount, totalPrice, removeFromCart } = useCart();
  return (
    <div>
      <div data-testid="total-count">{totalCount}</div>
      <div data-testid="total-price">{totalPrice}</div>
      <button
        data-testid="add-button"
        onClick={() =>
          addToCart(
            { id: 'prod1', name: 'Product 1', price: 100 },
            { id: 'var1', sku: 'SKU1', price: 100 }
          )
        }
      >
        Add Product
      </button>
      <div data-testid="items-length">{items.length}</div>
      {items.map((item) => (
        <div key={item.id}>
          <span data-testid={`item-qty-${item.id}`}>{item.quantity}</span>
          <button data-testid={`remove-${item.id}`} onClick={() => removeFromCart(item.id)}>
            Remove
          </button>
        </div>
      ))}
    </div>
  );
};

describe('CartContext Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    mockUseAuth.mockReturnValue({
      user: null,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    });
    mockCartApi.getCart.mockResolvedValue({ items: [] } as any);
    mockCartApi.addItem.mockResolvedValue({ items: [] } as any);
  });

  it('should initialize with empty cart', async () => {
    await act(async () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );
    });

    expect(screen.getByTestId('total-count')).toHaveTextContent('0');
    expect(screen.getByTestId('items-length')).toHaveTextContent('0');
  });

  it('should add item to cart and update totals', async () => {
    await act(async () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );
    });

    const addButton = screen.getByTestId('add-button');
    
    await act(async () => {
      fireEvent.click(addButton);
    });

    expect(screen.getByTestId('total-count')).toHaveTextContent('1');
    expect(screen.getByTestId('total-price')).toHaveTextContent('100');
    expect(screen.getByTestId('items-length')).toHaveTextContent('1');
    
    // Check if API was called
    expect(mockCartApi.addItem).toHaveBeenCalled();
  });

  it('should remove item from cart', async () => {
    await act(async () => {
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );
    });

    const addButton = screen.getByTestId('add-button');
    
    await act(async () => {
      fireEvent.click(addButton);
    });

    expect(screen.getByTestId('items-length')).toHaveTextContent('1');

    const removeButton = screen.getByTestId('remove-prod1::var1');
    
    await act(async () => {
      fireEvent.click(removeButton);
    });

    expect(screen.getByTestId('items-length')).toHaveTextContent('0');
    expect(mockCartApi.removeItem).toHaveBeenCalledWith('var1', undefined, 'test-uuid');
  });
});
