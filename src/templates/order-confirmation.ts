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
      return "Credit / Debit Card";
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
  const invoiceNumber = `INV-${orderNumber}`;
  const orderDate = new Date().toLocaleDateString("en-PK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding:14px 16px; border-bottom:1px solid #e5e7eb; color:#111827; font-size:14px; font-weight:600;">
          ${item.name}
        </td>
        <td style="padding:14px 16px; border-bottom:1px solid #e5e7eb; color:#6b7280; font-size:14px; text-align:center;">
          ${item.quantity}
        </td>
        <td style="padding:14px 16px; border-bottom:1px solid #e5e7eb; color:#6b7280; font-size:14px; text-align:right;">
          Rs. ${formatPrice(item.price)}
        </td>
        <td style="padding:14px 16px; border-bottom:1px solid #e5e7eb; color:#111827; font-size:14px; text-align:right; font-weight:600;">
          Rs. ${formatPrice(item.price * item.quantity)}
        </td>
      </tr>
    `
    )
    .join("");

  const discountRow =
    discount > 0
      ? `<tr>
          <td colspan="3" style="padding:10px 16px; color:#6b7280; font-size:14px;">Discount</td>
          <td style="padding:10px 16px; color:#16a34a; font-size:14px; text-align:right; font-weight:600;">- Rs. ${formatPrice(discount)}</td>
        </tr>`
      : "";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Confirmed — ${orderNumber}</title>
</head>
<body style="margin:0; padding:0; background-color:#f3f4f6; font-family:Arial, Helvetica, sans-serif; -webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f3f4f6;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:640px; background-color:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e5e7eb;">

          <!-- HEADER -->
          <tr>
            <td style="background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); padding:32px 40px; text-align:center;">
              <h1 style="margin:0; color:#ffffff; font-size:28px; font-weight:800; letter-spacing:-0.5px;">NovaCart</h1>
              <p style="margin:6px 0 0; color:rgba(255,255,255,0.8); font-size:13px; letter-spacing:2px; text-transform:uppercase;">Order Confirmed</p>
            </td>
          </tr>

          <!-- GREETING -->
          <tr>
            <td style="padding:32px 40px 0;">
              <p style="margin:0; color:#374151; font-size:16px; line-height:1.6;">Hi <strong>${fullName}</strong>,</p>
              <p style="margin:12px 0 0; color:#374151; font-size:15px; line-height:1.6;">
                Thank you for your order! We've received it and it's now being processed. Here's your invoice.
              </p>
            </td>
          </tr>

          <!-- ORDER INFO CARD -->
          <tr>
            <td style="padding:24px 40px 0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f9fafb; border-radius:12px; border:1px solid #e5e7eb;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td width="50%" style="vertical-align:top; padding-right:12px;">
                          <p style="margin:0 0 4px; color:#9ca3af; font-size:11px; text-transform:uppercase; letter-spacing:1.5px; font-weight:600;">Invoice Number</p>
                          <p style="margin:0; color:#4f46e5; font-size:16px; font-weight:700;">${invoiceNumber}</p>
                        </td>
                        <td width="50%" style="vertical-align:top; padding-left:12px;">
                          <p style="margin:0 0 4px; color:#9ca3af; font-size:11px; text-transform:uppercase; letter-spacing:1.5px; font-weight:600;">Order Date</p>
                          <p style="margin:0; color:#111827; font-size:14px; font-weight:600;">${orderDate}</p>
                        </td>
                      </tr>
                      <tr>
                        <td width="50%" style="vertical-align:top; padding-right:12px; padding-top:16px;">
                          <p style="margin:0 0 4px; color:#9ca3af; font-size:11px; text-transform:uppercase; letter-spacing:1.5px; font-weight:600;">Order Number</p>
                          <p style="margin:0; color:#111827; font-size:14px; font-weight:600;">${orderNumber}</p>
                        </td>
                        <td width="50%" style="vertical-align:top; padding-left:12px; padding-top:16px;">
                          <p style="margin:0 0 4px; color:#9ca3af; font-size:11px; text-transform:uppercase; letter-spacing:1.5px; font-weight:600;">Tracking Number</p>
                          <p style="margin:0; color:#4f46e5; font-size:14px; font-weight:600;">${trackingNumber}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BILL TO & SHIPPING -->
          <tr>
            <td style="padding:24px 40px 0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td width="50%" style="vertical-align:top; padding-right:16px;">
                    <p style="margin:0 0 8px; color:#9ca3af; font-size:11px; text-transform:uppercase; letter-spacing:1.5px; font-weight:600;">Bill To</p>
                    <p style="margin:0; color:#111827; font-size:14px; font-weight:600;">${fullName}</p>
                    <p style="margin:4px 0 0; color:#6b7280; font-size:13px; line-height:1.5;">
                      ${shippingAddress.address}<br/>
                      ${shippingAddress.city}, ${shippingAddress.postalCode}<br/>
                      ${shippingAddress.country}
                    </p>
                  </td>
                  <td width="50%" style="vertical-align:top; padding-left:16px;">
                    <p style="margin:0 0 8px; color:#9ca3af; font-size:11px; text-transform:uppercase; letter-spacing:1.5px; font-weight:600;">Payment Method</p>
                    <p style="margin:0; color:#111827; font-size:14px; font-weight:600;">${paymentMethodLabel(paymentMethod)}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ITEMS TABLE -->
          <tr>
            <td style="padding:28px 40px 0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <thead>
                  <tr>
                    <th style="padding:10px 16px; text-align:left; border-bottom:2px solid #e5e7eb; color:#9ca3af; font-size:11px; text-transform:uppercase; letter-spacing:1.5px; font-weight:600;">Product</th>
                    <th style="padding:10px 16px; text-align:center; border-bottom:2px solid #e5e7eb; color:#9ca3af; font-size:11px; text-transform:uppercase; letter-spacing:1.5px; font-weight:600;">Qty</th>
                    <th style="padding:10px 16px; text-align:right; border-bottom:2px solid #e5e7eb; color:#9ca3af; font-size:11px; text-transform:uppercase; letter-spacing:1.5px; font-weight:600;">Price</th>
                    <th style="padding:10px 16px; text-align:right; border-bottom:2px solid #e5e7eb; color:#9ca3af; font-size:11px; text-transform:uppercase; letter-spacing:1.5px; font-weight:600;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- TOTALS -->
          <tr>
            <td style="padding:24px 40px 0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding:8px 0; color:#6b7280; font-size:14px;">Subtotal</td>
                  <td style="padding:8px 0; color:#111827; font-size:14px; text-align:right; font-weight:500;">Rs. ${formatPrice(subtotal)}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0; color:#6b7280; font-size:14px;">Delivery</td>
                  <td style="padding:8px 0; color:#111827; font-size:14px; text-align:right; font-weight:500;">${deliveryFee === 0 ? '<span style="color:#16a34a;">Free</span>' : `Rs. ${formatPrice(deliveryFee)}`}</td>
                </tr>
                ${discountRow}
                <tr>
                  <td colspan="2" style="padding:0;"></td>
                </tr>
                <tr>
                  <td style="padding:14px 0 0; border-top:2px solid #111827; color:#111827; font-size:16px; font-weight:700;">Grand Total</td>
                  <td style="padding:14px 0 0; border-top:2px solid #111827; color:#4f46e5; font-size:20px; font-weight:800; text-align:right;">Rs. ${formatPrice(total)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- TRACKING CTA -->
          <tr>
            <td style="padding:28px 40px 0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#eef2ff; border-radius:12px; border:1px solid #c7d2fe;">
                <tr>
                  <td style="padding:20px 24px; text-align:center;">
                    <p style="margin:0 0 4px; color:#4338ca; font-size:12px; text-transform:uppercase; letter-spacing:1.5px; font-weight:700;">What&apos;s Next</p>
                    <p style="margin:0; color:#3730a3; font-size:14px; line-height:1.6;">
                      Track your order anytime from your NovaCart account.<br/>
                      We&apos;ll also notify you when your order ships.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:32px 40px 0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top:1px solid #e5e7eb;">
                <tr>
                  <td style="padding:24px 0 0; text-align:center;">
                    <p style="margin:0; color:#9ca3af; font-size:12px; line-height:1.6;">
                      NovaCart — Premium Marketplace<br/>
                      If you have any questions, contact us at <a href="mailto:support@novacart.com" style="color:#4f46e5; text-decoration:none;">support@novacart.com</a>
                    </p>
                    <p style="margin:16px 0 0; color:#d1d5db; font-size:11px;">
                      This invoice was generated electronically and does not require a signature.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 0 32px;"></td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
