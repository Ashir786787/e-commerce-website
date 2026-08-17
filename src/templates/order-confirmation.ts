interface OrderConfirmationTemplateOptions {
  fullName: string;
  orderNumber: string;
  trackingNumber: string;
  items: { name: string; quantity: number; price: number }[];
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

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-PK").format(price);
}

function paymentMethodLabel(method: string) {
  switch (method) {
    case "cod":
      return "Cash on Delivery";
    case "card":
      return "Credit/Debit Card";
    case "bank":
      return "Bank Transfer";
    default:
      return method;
  }
}

export function orderConfirmationTemplate({
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
}: OrderConfirmationTemplateOptions) {
  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #334155; font-size: 14px;">
          ${item.name}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #334155; font-size: 14px; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #334155; font-size: 14px; text-align: right;">
          Rs. ${formatPrice(item.price * item.quantity)}
        </td>
      </tr>
    `
    )
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 40px;">
      <div style="max-width: 600px; margin: auto; background: white; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #0f172a; margin: 0; font-size: 24px;">Order Confirmed!</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 8px;">Thank you for shopping with NovaCart</p>
        </div>

        <p style="color: #334155; font-size: 16px;">Hi ${fullName},</p>
        <p style="color: #334155; font-size: 16px;">We've received your order and it's being processed.</p>

        <div style="background: #f1f5f9; border-radius: 8px; padding: 16px; margin: 24px 0;">
          <p style="color: #64748b; font-size: 12px; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Order Number</p>
          <p style="color: #4f46e5; font-size: 18px; font-weight: bold; margin: 4px 0 0 0;">${orderNumber}</p>
          <p style="color: #64748b; font-size: 12px; margin: 12px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">Tracking Number</p>
          <p style="color: #4f46e5; font-size: 16px; font-weight: bold; margin: 4px 0 0 0;">${trackingNumber}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
          <thead>
            <tr>
              <th style="text-align: left; padding: 8px 0; border-bottom: 2px solid #e2e8f0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Item</th>
              <th style="text-align: center; padding: 8px 0; border-bottom: 2px solid #e2e8f0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Qty</th>
              <th style="text-align: right; padding: 8px 0; border-bottom: 2px solid #e2e8f0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="border-top: 2px solid #e2e8f0; padding-top: 16px; margin-top: 16px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #64748b; font-size: 14px;">Subtotal</span>
            <span style="color: #334155; font-size: 14px;">Rs. ${formatPrice(subtotal)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #64748b; font-size: 14px;">Delivery</span>
            <span style="color: #334155; font-size: 14px;">${deliveryFee === 0 ? "Free" : `Rs. ${formatPrice(deliveryFee)}`}</span>
          </div>
          ${
            discount > 0
              ? `<div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="color: #16a34a; font-size: 14px;">Discount</span>
                  <span style="color: #16a34a; font-size: 14px;">- Rs. ${formatPrice(discount)}</span>
                </div>`
              : ""
          }
          <div style="display: flex; justify-content: space-between; border-top: 2px solid #e2e8f0; padding-top: 12px; margin-top: 12px;">
            <span style="color: #0f172a; font-size: 16px; font-weight: bold;">Total</span>
            <span style="color: #4f46e5; font-size: 16px; font-weight: bold;">Rs. ${formatPrice(total)}</span>
          </div>
        </div>

        <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin: 24px 0;">
          <p style="color: #64748b; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Payment Method</p>
          <p style="color: #334155; font-size: 14px; margin: 0;">${paymentMethodLabel(paymentMethod)}</p>

          <p style="color: #64748b; font-size: 12px; margin: 16px 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Shipping Address</p>
          <p style="color: #334155; font-size: 14px; margin: 0;">
            ${shippingAddress.address}<br/>
            ${shippingAddress.city}, ${shippingAddress.postalCode}<br/>
            ${shippingAddress.country}
          </p>
        </div>

        <p style="color: #64748b; font-size: 14px; text-align: center; margin-top: 24px;">
          You can track your order status in your NovaCart account.
        </p>

        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 24px;">
          If you have any questions, contact us at support@novacart.com
        </p>
      </div>
    </div>
  `;
}
