"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Brain, BarChart3, Lightbulb } from "lucide-react";
import { ProfileDropdown } from "@/components/layout/profile-dropdown";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { LayoutDashboard, TrendingUp} from "lucide-react";

export function Navbar() {
  const session = useSession();
  const pathname = usePathname();
  const router = useRouter();

  // Hide navbar on auth pages
  if (pathname?.startsWith("/auth") || pathname?.startsWith("/unsubscribe")) {
    return null;
  }

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href={session.data ? "/dashboard" : "/"}
            className="flex items-center gap-2 hover:opacity-80 transition"
          >
            <div className="relative">
              <Brain className="h-8 w-8 text-purple-600" />
              <div className="absolute inset-0 bg-purple-600 rounded-full opacity-10 animate-pulse" />
            </div>
            <span className="font-bold text-lg text-gray-900 hidden sm:inline">
              CreatorMind
            </span>
          </Link>

          {/* Navigation Links */}
          {session.data && (
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="/dashboard"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
                  isActive("/dashboard")
                    ? "bg-purple-100 text-purple-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </Link>

              <Link
                href="/ideas"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
                  isActive("/ideas")
                    ? "bg-purple-100 text-purple-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                <Lightbulb className="h-4 w-4" />
                Ideas
              </Link>

              <Link
                href="/insights"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
                  isActive("/insights")
                    ? "bg-purple-100 text-purple-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                <BarChart3 className="h-4 w-4" />
                Insights
              </Link>
            </div>
          )}

          {/* Profile Dropdown - Right Side */}
          <div className="flex items-center gap-4">
            {session.data && (
              <ProfileDropdown />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}