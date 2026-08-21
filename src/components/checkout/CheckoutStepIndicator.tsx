"use client";

import { Check, CreditCard, MapPin } from "lucide-react";

type Step = {
  label: string;
  icon: React.ElementType;
};

const steps: Step[] = [
  { label: "Shipping", icon: MapPin },
  { label: "Payment", icon: CreditCard },
  { label: "Confirm", icon: Check },
];

export default function CheckoutStepIndicator({ currentStep = 0 }: { currentStep?: number }) {
  return (
    <div className="mb-8 flex items-center justify-center">
      <div className="flex items-center gap-0">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <div key={step.label} className="flex items-center">
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex size-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition ${
                    isCompleted
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : isActive
                        ? "border-indigo-600 bg-indigo-50 text-indigo-600"
                        : "border-neutral-200 bg-white text-neutral-400"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <span
                  className={`hidden text-sm font-medium sm:inline ${
                    isActive
                      ? "text-indigo-600"
                      : isCompleted
                        ? "text-neutral-900"
                        : "text-neutral-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`mx-3 h-0.5 w-8 sm:w-14 ${
                    index < currentStep ? "bg-indigo-600" : "bg-neutral-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
