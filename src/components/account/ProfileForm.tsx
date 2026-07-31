"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { z } from "zod";

import api from "@/lib/api";
import FormField from "@/components/form/FormField";
import SubmitButton from "@/components/form/SubmitButton";

interface ProfileFormProps {
  user: {
    fullName: string;
    email: string;
    avatar: string;
  };
}

const profileFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Full name must be at least 3 characters.")
    .max(50, "Full name cannot exceed 50 characters."),
  avatar: z
    .string()
    .trim()
    .url("Please enter a valid image URL.")
    .max(500, "Avatar URL cannot exceed 500 characters.")
    .or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: user.fullName,
      avatar: user.avatar || "",
    },
  });

  async function onSubmit(values: ProfileFormValues) {
    try {
      await api.patch("/auth/profile", {
        fullName: values.fullName,
        avatar: values.avatar,
      });

      toast.success("Profile updated successfully.");
      router.refresh();
    } catch (error: unknown) {
      toast.error(
        error instanceof AxiosError
          ? error.response?.data?.message
          : "Unable to update profile."
      );
    }
  }

  const avatarValue =
    useWatch({ control, name: "avatar" }) || "";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {avatarValue && (
        <div className="mt-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarValue}
            alt="Profile preview"
            className="h-20 w-20 rounded-full object-cover ring-2 ring-border"
          />
        </div>
      )}

      <FormField
        id="fullName"
        label="Full Name"
        placeholder="Your full name"
        maxLength={50}
        registration={register("fullName")}
        error={errors.fullName?.message}
      />

      <FormField
        id="avatar"
        label="Profile Photo URL"
        type="url"
        placeholder="https://example.com/avatar.jpg"
        registration={register("avatar")}
        error={errors.avatar?.message}
      />

      <div className="space-y-2">
        <p className="text-sm font-medium">Email</p>
        <div className="rounded-lg border bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground">
          {user.email}
        </div>
        <p className="text-xs text-muted-foreground">
          Email cannot be changed at the moment.
        </p>
      </div>

      <SubmitButton isLoading={isSubmitting}>
        Save Changes
      </SubmitButton>
    </form>
  );
}
