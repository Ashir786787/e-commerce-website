import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import ContactContent from "@/components/contact/ContactContent";

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <div className="flex-1">
        <ContactContent />
      </div>

      <SiteFooter />
    </div>
  );
}
