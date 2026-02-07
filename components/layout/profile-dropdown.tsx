"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, LogOut, HelpCircle, Mail } from "lucide-react";

export function ProfileDropdown() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  if (!session?.user) {
    return null;
  }

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/auth/signin");
  };

  const handleSettings = () => {
    router.push("/settings");
    setIsOpen(false);
  };

  const userInitials = session.user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || session.user.email?.[0]?.toUpperCase() || "U";

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-10 w-10 rounded-full p-0 hover:bg-white/10"
        >
          <Avatar className="h-10 w-10 cursor-pointer border-2 border-white/20">
            <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
            <AvatarFallback className="bg-purple-600 text-white font-semibold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-black/90 backdrop-blur-lg border-white/20">
        {/* User Info */}
        <div className="px-4 py-3">
          <p className="text-sm font-semibold text-white">
            {session.user.name || "Creator"}
          </p>
          <p className="text-xs text-gray-400">{session.user.email}</p>
        </div>

        <DropdownMenuSeparator className="bg-white/10" />

        {/* Settings */}
        <DropdownMenuItem onClick={handleSettings} className="cursor-pointer text-white hover:bg-white/10 focus:bg-white/10">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>

        {/* Documentation */}
        <DropdownMenuItem
          onClick={() => router.push("/documentation")}
          className="cursor-pointer text-white hover:bg-white/10 focus:bg-white/10"
        >
          <HelpCircle className="mr-2 h-4 w-4" />
          <span>Documentation</span>
        </DropdownMenuItem>

        {/* Contact/Feedback */}
        <DropdownMenuItem
          onClick={() => {
            window.open("mailto:support@creatormind.ai", "_blank");
            setIsOpen(false);
          }}
          className="cursor-pointer text-white hover:bg-white/10 focus:bg-white/10"
        >
          <Mail className="mr-2 h-4 w-4" />
          <span>Contact Support</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-white/10" />

        {/* Logout */}
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 hover:text-red-300">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}