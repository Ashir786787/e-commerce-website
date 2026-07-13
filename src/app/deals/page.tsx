import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import ComingSoon from "@/components/shared/ComingSoon";

export default function DealsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <div className="flex-1">
        <ComingSoon title="Deals Page" />
      </div>

      <SiteFooter />
    </div>
  );
}
