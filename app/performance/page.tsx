"use client";

import { PerformancePatterns } from "@/components/dashboard/performance-patterns";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PerformancePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Spacer for navbar */}
      <div className="h-24" />

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">

        {/* Back button */}
        <div>
          <Button
            variant="outline"
            className="
              border-white/30 
              text-gray-300 
              bg-transparent
              hover:bg-white 
              hover:text-black 
              hover:border-white
              transition-all
            "
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-light tracking-tight">
            Performance Patterns
          </h1>
          <p className="text-gray-400 max-w-2xl">
            Deep analysis of what actually works for your channel across formats,
            topics, hooks, and timing.
          </p>
        </div>

        {/* Content container */}
        <div
          className="
            bg-black 
            border 
            border-white/20 
            rounded-2xl 
            p-6
          "
        >
          <PerformancePatterns />
        </div>

      </div>
    </div>
  );
}
