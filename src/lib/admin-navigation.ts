import {
  BarChart3,
  BellRing,
  FolderTree,
  LayoutDashboard,
  Mail,
  MessagesSquare,
  PackageSearch,
  Star,
  ShoppingCart,
  Store,
  Tag,
  Users,
} from "lucide-react";

export function isAdminNavActive(href: string, pathname: string): boolean {
  return pathname === href || pathname.startsWith(href.replace(/\/$/, "") + "/");
}

export const adminNavigation = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Products", href: "/admin/products", icon: PackageSearch },
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Reviews", href: "/admin/reviews", icon: Star },
  { label: "Messages", href: "/admin/messages", icon: MessagesSquare },
  { label: "Discount Codes", href: "/admin/discount-codes", icon: Tag },
  { label: "Newsletter", href: "/admin/newsletter", icon: Mail },
  { label: "Notifications", href: "/admin/notifications", icon: BellRing },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Browse as User", href: "/login", icon: Store, separator: true },
];
