"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

import api from "@/lib/api";
import { loginFormSchema, LoginFormValues } from "@/validations/login-form";

export default function AdminLoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
  });

  async function onSubmit(values: LoginFormValues) {
    try {
      const response = await api.post("/auth/login", values);
      const user = response.data?.data;

      if (user?.role !== "admin") {
        await api.post("/auth/logout");
        toast.error("This account does not have admin access.");
        return;
      }

      toast.success("Welcome back, Admin.");
      router.push("/admin/dashboard");
      router.refresh();
    } catch (error: unknown) {
      toast.error(
        error instanceof AxiosError
          ? error.response?.data?.message
          : "Login failed. Please try again."
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-neutral-300"
        >
          Email
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="admin@novacart.com"
            {...register("email")}
            className="h-11 w-full rounded-xl border border-white/10 bg-neutral-800 pl-10 pr-4 text-sm text-white placeholder:text-neutral-500 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
          />
        </div>
        {errors.email?.message && (
          <p className="text-xs text-red-400">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-neutral-300"
        >
          Password
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            {...register("password")}
            className="h-11 w-full rounded-xl border border-white/10 bg-neutral-800 pl-10 pr-11 text-sm text-white placeholder:text-neutral-500 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-neutral-400 transition hover:text-white"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password?.message && (
          <p className="text-xs text-red-400">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Signing in..." : "Sign in to Admin"}
      </button>
    </form>
  );
}
