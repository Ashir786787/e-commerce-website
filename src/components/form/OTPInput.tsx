"use client";

import { useRef } from "react";

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function OTPInput({
  value,
  onChange,
}: OTPInputProps) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  function handleChange(index: number, digit: string) {
    if (!/^\d?$/.test(digit)) return;

    const otp = value.split("");
    otp[index] = digit;
    onChange(otp.join(""));

    if (digit && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }
  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          aria-label={`Digit ${index + 1}`}
          className="h-12 w-11 rounded-lg border text-center text-xl font-bold outline-none focus:border-primary"
        />
      ))}
    </div>
  );
}