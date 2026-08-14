import React, { createContext, useContext, useMemo, useState } from 'react';
import { ProductDto } from '@bookstore/shared';

export interface CartItem {
  product: ProductDto;
  amount: number;
}

interface CartState {
  items: CartItem[];
  add: (product: ProductDto, amount?: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
  setAmount: (productId: number, amount: number) => void;
}

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const value = useMemo<CartState>(
    () => ({
      items,
      add(product, amount = 1) {
        setItems((prev) => {
          const found = prev.find((i) => i.product.id === product.id);
          if (found) {
            return prev.map((i) =>
              i.product.id === product.id
                ? { ...i, amount: i.amount + amount }
                : i,
            );
          }
          return [...prev, { product, amount }];
        });
      },
      remove(productId) {
        setItems((prev) => prev.filter((i) => i.product.id !== productId));
      },
      clear() {
        setItems([]);
      },
      setAmount(productId, amount) {
        setItems((prev) =>
          prev.map((i) =>
            i.product.id === productId ? { ...i, amount: Math.max(1, amount) } : i,
          ),
        );
      },
    }),
    [items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart outside provider');
  return ctx;
}
