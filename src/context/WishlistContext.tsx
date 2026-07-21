"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface Product {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  images: string[];
}

interface Wishlist {
  products: Product[];
}

interface WishlistContextType {
  wishlist: Wishlist | null;
  totalItems: number;
  refreshWishlist: () => Promise<void>;
  isWishlisted: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

export function WishlistProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);

  const refreshWishlist = async () => {
    try {
      const response = await fetch("/api/wishlist/get", {
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        setWishlist(data.wishlist);
      }
    } catch {
      // silently ignore — user doesn't need to see this
    }
  };

  useEffect(() => {
    refreshWishlist();
  }, []);

  const isWishlisted = (productId: string) => {
    if (!wishlist) return false;

    return wishlist.products.some(
      (product) => product._id === productId
    );
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        totalItems: wishlist?.products.length || 0,
        refreshWishlist,
        isWishlisted,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error(
      "useWishlist must be used within WishlistProvider"
    );
  }

  return context;
}
