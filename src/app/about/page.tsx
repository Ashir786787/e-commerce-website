import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import AboutContent from "@/components/about/AboutContent";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <div className="flex-1">
        <AboutContent />
      </div>

      <SiteFooter />
    </div>
  );
}