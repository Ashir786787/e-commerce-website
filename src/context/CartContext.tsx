"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type CartSummary = {
  totalItems: number;
};

type CartResponse = {
  success: boolean;
  data: {
    summary: CartSummary;
  };
};

type CartContextType = {
  totalItems: number;
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [totalItems, setTotalItems] = useState(0);

  const refreshCart = useCallback(async () => {
    try {
      const response = await fetch("/api/cart", { credentials: "include" });
      const result: CartResponse = await response.json();
      if (response.ok && result.success) {
        setTotalItems(result.data.summary.totalItems);
      } else {
        setTotalItems(0);
      }
    } catch {
      setTotalItems(0);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/cart", { credentials: "include" })
      .then((res) => res.json())
      .then((result: CartResponse) => {
        if (cancelled) return;
        setTotalItems(result.success ? result.data.summary.totalItems : 0);
      })
      .catch(() => {
        if (!cancelled) setTotalItems(0);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <CartContext.Provider value={{ totalItems, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
