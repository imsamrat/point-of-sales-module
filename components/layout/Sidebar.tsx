"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  DollarSign,
  Users,
  LogOut,
  Sun,
  Moon,
  Monitor,
  Tag,
  FileText,
  UserCheck,
  Truck,
  Receipt,
  Menu,
  Home,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useState } from "react";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    roles: ["admin"],
  },
  {
    name: "Sales",
    href: "/sales",
    icon: ShoppingCart,
    roles: ["admin", "user"],
  },
  {
    name: "Sales Management",
    href: "/sales-management",
    icon: FileText,
    roles: ["admin"],
  },
  {
    name: "Inventory",
    href: "/inventory",
    icon: Package,
    roles: ["admin", "user"],
  },
  {
    name: "Categories",
    href: "/categories",
    icon: Tag,
    roles: ["admin", "user"],
  },
  {
    name: "Suppliers",
    href: "/suppliers",
    icon: Truck,
    roles: ["admin"],
  },
  {
    name: "Purchases",
    href: "/purchases",
    icon: Receipt,
    roles: ["admin"],
  },
  {
    name: "Dues",
    href: "/dues",
    icon: DollarSign,
    roles: ["admin"],
  },
  {
    name: "User Management",
    href: "/users",
    icon: Users,
    roles: ["admin"],
  },
  { name: "Expenses", href: "/expenses", icon: DollarSign, roles: ["admin"] },
  { name: "HR", href: "/hr", icon: UserCheck, roles: ["admin"] },
];

// Bottom navigation items for mobile
const bottomNavigation = [
  {
    name: "Home",
    href: "/admin",
    icon: Home,
    roles: ["admin"],
  },
  {
    name: "Sales",
    href: "/sales",
    icon: ShoppingCart,
    roles: ["admin", "user"],
  },
  {
    name: "Inventory",
    href: "/inventory",
    icon: Package,
    roles: ["admin", "user"],
  },
  {
    name: "Dues",
    href: "/dues",
    icon: DollarSign,
    roles: ["admin"],
  },
  {
    name: "Expense",
    href: "/expenses",
    icon: DollarSign,
    roles: ["admin"],
  },
  {
    name: "Menu",
    href: "#",
    icon: Menu,
    roles: ["admin", "user"],
    isMenu: true,
  },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(session?.user?.role || "")
  );

  const filteredBottomNavigation = bottomNavigation.filter((item) =>
    item.roles.includes(session?.user?.role || "")
  );

  // Menu items for the "Menu" dropdown (excluding bottom nav items)
  const menuItems = filteredNavigation.filter(
    (item) =>
      !["/admin", "/sales", "/inventory", "/dues", "/expenses"].includes(
        item.href
      )
  );

  const handleMenuClick = () => {
    setShowMenu(!showMenu);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            POS System
          </h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                )}
                onClick={onNavigate}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Theme
            </span>
            <div className="flex space-x-1">
              <button
                onClick={() => setTheme("light")}
                className={cn(
                  "p-1 rounded-md transition-colors",
                  theme === "light"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                    : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                )}
              >
                <Sun className="h-4 w-4" />
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={cn(
                  "p-1 rounded-md transition-colors",
                  theme === "dark"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                    : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                )}
              >
                <Moon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setTheme("system")}
                className={cn(
                  "p-1 rounded-md transition-colors",
                  theme === "system"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                    : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                )}
              >
                <Monitor className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0 flex-1">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {session?.user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {session?.user?.role}
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0 ml-2"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
        <div className="flex items-center justify-around px-2 py-2">
          {filteredBottomNavigation.map((item) => {
            const isActive = item.isMenu
              ? showMenu
              : pathname === item.href ||
                (item.href === "/admin" && pathname === "/");
            return (
              <button
                key={item.name}
                onClick={() => {
                  if (item.isMenu) {
                    handleMenuClick();
                  } else {
                    setShowMenu(false);
                    router.push(item.href);
                    if (onNavigate) onNavigate();
                  }
                }}
                className={cn(
                  "flex flex-col items-center justify-center px-2 py-1 rounded-lg transition-colors min-w-0 flex-1",
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 mb-1",
                    isActive && "text-blue-600 dark:text-blue-400"
                  )}
                />
                <span className="text-xs font-medium truncate">
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Menu Overlay */}
        {showMenu && (
          <div className="absolute bottom-full left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Menu
              </h3>
              <div className="space-y-1">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => {
                        setShowMenu(false);
                        if (onNavigate) onNavigate();
                      }}
                      className={cn(
                        "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                        isActive
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                      )}
                    >
                      <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Theme
                  </span>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setTheme("light")}
                      className={cn(
                        "p-1 rounded transition-colors",
                        theme === "light"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                          : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                      )}
                    >
                      <Sun className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setTheme("dark")}
                      className={cn(
                        "p-1 rounded transition-colors",
                        theme === "dark"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                          : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                      )}
                    >
                      <Moon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setTheme("system")}
                      className={cn(
                        "p-1 rounded transition-colors",
                        theme === "system"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                          : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                      )}
                    >
                      <Monitor className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/auth/login" })}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white rounded-md transition-colors"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
