import {
  BarChart3,
  FolderTree,
  LayoutDashboard,
  PackageSearch,
  ShoppingCart,
  Store,
  Tag,
  Users,
} from "lucide-react";

export const adminNavigation = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: PackageSearch,
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: FolderTree,
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    label: "Discount Codes",
    href: "/admin/discount-codes",
    icon: Tag,
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    label: "Browse as User",
    href: "/login",
    icon: Store,
    separator: true,
  },
];
