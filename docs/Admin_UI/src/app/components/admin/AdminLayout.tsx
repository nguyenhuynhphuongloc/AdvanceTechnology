import { Link, Outlet, useLocation } from "react-router";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  UserCog,
  CheckCircle,
  Package,
  FolderTree,
  Warehouse,
  Images,
  ShoppingCart,
  Store,
  CreditCard,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Bell,
  Settings,
  Search,
  LogOut
} from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

const menuGroups = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", icon: LayoutDashboard, path: "/admin" },
      { title: "Analytics", icon: BarChart3, path: "/admin/analytics" },
    ]
  },
  {
    label: "Users & Sellers",
    items: [
      { title: "Users", icon: Users, path: "/admin/users" },
      { title: "Sellers", icon: UserCog, path: "/admin/sellers" },
      { title: "Seller Profiles", icon: UserCog, path: "/admin/seller-profiles" },
    ]
  },
  {
    label: "Moderation",
    items: [
      { title: "Shop Approvals", icon: CheckCircle, path: "/admin/shop-approvals" },
      { title: "Product Approvals", icon: CheckCircle, path: "/admin/product-approvals" },
    ]
  },
  {
    label: "Catalog",
    items: [
      { title: "Products", icon: Package, path: "/admin/products" },
      { title: "Categories", icon: FolderTree, path: "/admin/categories" },
      { title: "Inventory", icon: Warehouse, path: "/admin/inventory" },
      { title: "Media Library", icon: Images, path: "/admin/media-library" },
    ]
  },
  {
    label: "Commerce",
    items: [
      { title: "Orders", icon: ShoppingCart, path: "/admin/orders" },
      { title: "Shop Orders", icon: Store, path: "/admin/shop-orders" },
      { title: "Payments", icon: CreditCard, path: "/admin/payments" },
      { title: "Carts", icon: ShoppingBag, path: "/admin/carts" },
    ]
  },
  {
    label: "Finance",
    items: [
      { title: "Refunds", icon: DollarSign, path: "/admin/refunds" },
      { title: "Commissions", icon: TrendingUp, path: "/admin/commissions" },
    ]
  },
  {
    label: "System",
    items: [
      { title: "Notifications", icon: Bell, path: "/admin/notifications" },
      { title: "Settings", icon: Settings, path: "/admin/settings" },
    ]
  },
];

export function AdminLayout() {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <div className="p-4 border-b">
            <h2 className="font-bold text-lg">Admin Panel</h2>
            <p className="text-xs text-muted-foreground">Marketplace Management</p>
          </div>

          <SidebarContent>
            {menuGroups.map((group) => (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <SidebarMenuItem key={item.path}>
                          <SidebarMenuButton asChild isActive={isActive}>
                            <Link to={item.path}>
                              <item.icon className="size-4" />
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger />

              <div className="flex-1 flex items-center gap-4">
                <div className="relative w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search admin..."
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="size-4" />
                  <Badge className="absolute -top-1 -right-1 size-5 flex items-center justify-center p-0 text-xs">
                    3
                  </Badge>
                </Button>

                <Button variant="ghost" size="icon">
                  <LogOut className="size-4" />
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
