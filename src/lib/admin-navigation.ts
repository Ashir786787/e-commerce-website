import {
  BarChart3,
  FolderTree,
  LayoutDashboard,
  MessagesSquare,
  PackageSearch,
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
  { label: "Messages", href: "/admin/messages", icon: MessagesSquare },
  { label: "Discount Codes", href: "/admin/discount-codes", icon: Tag },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Browse as User", href: "/login", icon: Store, separator: true },
];
