import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface InvoiceRedirectProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function InvoiceRedirect({
  params,
}: InvoiceRedirectProps) {
  const { id } = await params;

  redirect(`/orders/${id}`);
}