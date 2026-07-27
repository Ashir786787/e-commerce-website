import { Truck } from "lucide-react";

export default function AnnouncementBar() {
  return (
    <div className="bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2 text-xs font-medium sm:text-sm">
        <Truck className="h-4 w-4 shrink-0" />
        <p>
          Free delivery on qualifying orders over Rs. 5,000 &middot; Easy
          returns within 30 days
        </p>
      </div>
    </div>
  );
}
