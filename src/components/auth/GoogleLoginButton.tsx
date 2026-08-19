"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { toast } from "sonner";

import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface GoogleLoginButtonProps {
  mode: "login" | "link";
}

export default function GoogleLoginButton({ mode }: GoogleLoginButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { refreshAuth } = useAuth();

  async function handleSuccess(response: CredentialResponse) {
    if (!response.credential) return;

    setLoading(true);
    try {
      const endpoint =
        mode === "login" ? "/auth/google" : "/auth/google/link";

      const result = await api.post(endpoint, {
        idToken: response.credential,
      });

      if (mode === "login") {
        await refreshAuth();
        toast.success("Logged in with Google.");
        router.push("/");
        router.refresh();
      } else {
        toast.success("Google account linked successfully.");
        await refreshAuth();
      }
    } catch (error: unknown) {
      const message =
        mode === "login"
          ? "Google login failed. Please try again."
          : "Failed to link Google account.";

      toast.error(
        error instanceof Error ? error.message : message
      );
    } finally {
      setLoading(false);
    }
  }

  function handleError() {
    toast.error("Google authentication was cancelled or failed.");
  }

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) return null;

  return (
    <div className={loading ? "opacity-50 pointer-events-none" : ""}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        text={mode === "login" ? "continue_with" : "signup_with"}
        shape="rectangular"
        size="large"
        width="100%"
        logo_alignment="left"
      />
    </div>
  );
}
