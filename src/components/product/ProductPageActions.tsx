"use client";

import { useRef } from "react";
import StickyProductBar from "./StickyProductBar";

interface ProductPageActionsProps {
  productName: string;
  price: number;
  originalPrice?: number;
  productId: string;
  stock: number;
  children: React.ReactNode;
}

export default function ProductPageActions({
  productName,
  price,
  originalPrice,
  productId,
  stock,
  children,
}: ProductPageActionsProps) {
  const triggerRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div ref={triggerRef}>{children}</div>
      <StickyProductBar
        productName={productName}
        price={price}
        originalPrice={originalPrice}
        productId={productId}
        stock={stock}
        triggerRef={triggerRef}
      />
    </>
  );
}
