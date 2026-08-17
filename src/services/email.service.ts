import { sendEmail } from "@/utils/email";
import { verifyEmailTemplate } from "@/templates/verify-email";
import { resetPasswordTemplate } from "@/templates/reset-password";
import { orderConfirmationTemplate } from "@/templates/order-confirmation";

interface SendVerificationEmailOptions {
  fullName: string;
  email: string;
  otp: string;
}

export async function sendVerificationEmail({
  fullName,
  email,
  otp,
}: SendVerificationEmailOptions) {
  await sendEmail({
    to: email,
    subject: "Your NovaCart verification code",
    html: verifyEmailTemplate({
      fullName,
      otp,
    }),
  });
}

interface SendResetPasswordEmailOptions {
  fullName: string;
  email: string;
  otp: string;
}

export async function sendResetPasswordEmail({
  fullName,
  email,
  otp,
}: SendResetPasswordEmailOptions) {
  await sendEmail({
    to: email,
    subject: "Your NovaCart password reset code",
    html: resetPasswordTemplate({
      fullName,
      otp,
    }),
  });
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface SendOrderConfirmationEmailOptions {
  fullName: string;
  email: string;
  orderNumber: string;
  trackingNumber: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: string;
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

export async function sendOrderConfirmationEmail({
  fullName,
  email,
  orderNumber,
  trackingNumber,
  items,
  subtotal,
  deliveryFee,
  discount,
  total,
  paymentMethod,
  shippingAddress,
}: SendOrderConfirmationEmailOptions) {
  await sendEmail({
    to: email,
    subject: `NovaCart Order Confirmed — ${orderNumber}`,
    html: orderConfirmationTemplate({
      fullName,
      orderNumber,
      trackingNumber,
      items,
      subtotal,
      deliveryFee,
      discount,
      total,
      paymentMethod,
      shippingAddress,
    }),
  });
}