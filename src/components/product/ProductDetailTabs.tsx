"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface ProductDetailTabsProps {
  description: string;
  brand: string;
}

export default function ProductDetailTabs({
  description,
  brand,
}: ProductDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<"description" | "shipping">(
    "description"
  );

  const tabs = [
    { id: "description" as const, label: "Description" },
    { id: "shipping" as const, label: "Shipping & Returns" },
  ];

  return (
    <div>
      <div className="flex gap-1 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative px-5 py-3 text-sm font-semibold transition-colors",
              activeTab === tab.id
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      <div className="py-6">
        {activeTab === "description" && (
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <p className="whitespace-pre-line leading-relaxed">
              {description}
            </p>
            <div className="mt-4 rounded-xl border bg-muted/30 p-4">
              <p className="text-sm font-semibold text-foreground">
                Brand
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{brand}</p>
            </div>
          </div>
        )}

        {activeTab === "shipping" && (
          <div className="space-y-4">
            <div className="rounded-xl border bg-muted/30 p-4">
              <p className="text-sm font-semibold text-foreground">
                Fast Delivery
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Free delivery on orders over Rs. 5,000. Standard delivery
                takes 3-5 business days across Pakistan.
              </p>
            </div>
            <div className="rounded-xl border bg-muted/30 p-4">
              <p className="text-sm font-semibold text-foreground">
                Easy Returns
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Not satisfied? Return within 7 days of delivery for a full
                refund. Items must be in original condition.
              </p>
            </div>
            <div className="rounded-xl border bg-muted/30 p-4">
              <p className="text-sm font-semibold text-foreground">
                Secure Packaging
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Every order is carefully packaged to ensure it arrives
                safely at your doorstep.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
