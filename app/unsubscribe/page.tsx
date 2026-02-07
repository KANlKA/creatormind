"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Mail, CheckCircle } from "lucide-react";

export default function UnsubscribeSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/settings");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader className="text-center">
          <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <CardTitle className="text-2xl text-white">
            You're Unsubscribed
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="text-gray-300">
            <p className="mb-2">We've stopped sending you weekly emails.</p>
            <p>You can re-enable them anytime from your settings.</p>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-sm text-gray-300">
              Redirecting to settings in{" "}
              <span className="font-bold text-white">{countdown}s</span>...
            </p>
          </div>

          <Button
            onClick={() => router.push("/settings")}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            <Mail className="mr-2 h-4 w-4" />
            Go to Settings Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}