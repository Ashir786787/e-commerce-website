import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import ComingSoon from "@/components/shared/ComingSoon";

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <div className="flex-1">
        <ComingSoon title="Contact Us" />
      </div>

      <SiteFooter />
    </div>
  );
}
