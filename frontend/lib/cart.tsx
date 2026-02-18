"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
  name: string;
  size: string;
  color: string;
  imageUrl?: string;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper function to fix image URLs
const fixImageUrl = (imageUrl: string | undefined): string | undefined => {
  if (!imageUrl) return undefined;

  // If it's already a full URL with localhost:5000, return as is
  if (imageUrl.startsWith('http://localhost:5000/')) return imageUrl;

  // If it's a relative path starting with /uploads/, convert to full URL
  if (imageUrl.startsWith('/uploads/')) {
    return `http://localhost:5000${imageUrl}`;
  }

  // If it's just a filename or relative path, assume it's in uploads
  if (!imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
    return `http://localhost:5000/uploads/${imageUrl}`;
  }

  // If it's any other relative path, convert to full URL
  if (imageUrl.startsWith('/')) {
    return `http://localhost:5000${imageUrl}`;
  }

  return imageUrl;
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        // Fix image URLs for existing cart items
        const fixedCart = parsedCart.map((item: CartItem) => ({
          ...item,
          imageUrl: fixImageUrl(item.imageUrl)
        }));
        setItems(fixedCart);
      } catch (error) {
        console.error('Failed to load cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (newItem: Omit<CartItem, 'id'>) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(
        item => item.productId === newItem.productId &&
                item.variantId === newItem.variantId
      );

      if (existingItem) {
        // Update quantity if item already exists
        return currentItems.map(item =>
          item.id === existingItem.id
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      } else {
        // Add new item with fixed image URL
        const item: CartItem = {
          ...newItem,
          id: `${newItem.productId}-${newItem.variantId}-${Date.now()}`,
          imageUrl: fixImageUrl(newItem.imageUrl)
        };
        return [...currentItems, item];
      }
    });
  };

  const removeFromCart = (id: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setItems(currentItems =>
      currentItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const value: CartContextType = {
    items,
    totalItems,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isLoading,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}