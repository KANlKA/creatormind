"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Mail,
  Settings as SettingsIcon,
  RotateCcw,
  Trash2,
  AlertCircle,
  BookOpen,
  Edit3,
  Save,
  X,
  CheckCircle,
  LogIn,
  RefreshCw,
} from "lucide-react";

type Settings = {
  emailEnabled: boolean;
  emailFrequency: "weekly" | "biweekly" | "monthly";
  emailDay: string;
  emailTime: string;
  timezone: string;
  ideaCount: number;
  preferences?: {
    focusAreas?: string[];
    avoidTopics?: string[];
    preferredFormats?: string[];
  };
};


type EmailLog = {
  id: string;
  subject: string;
  recipientEmail: string;
  status: "sent" | "delivered" | "opened" | "clicked" | "bounced" | "failed";
  ideaCount: number;
  sentAt: string;
  deliveredAt?: string;
  openedAt?: string;
  failureReason?: string;
};

type SyncStatus = {
  syncStatus: string;
  lastSyncedAt: string;
  channelName?: string;
  isConnected: boolean;
};

const joinList = (values?: string[]) =>
  values && values.length > 0 ? values.join(", ") : "";

const splitList = (value: string) =>
  value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);


export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [editedSettings, setEditedSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sending, setSending] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [disconnectMessage, setDisconnectMessage] = useState<string | null>(null);
  const [emailHistory, setEmailHistory] = useState<EmailLog[]>([]);
  const [syncData, setSyncData] = useState<SyncStatus | null>(null);
  const [alertMessage, setAlertMessage] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);
  const [loadAttempts, setLoadAttempts] = useState(0);

  const timezones = useMemo(
    () => [
      "UTC",
      "America/New_York",
      "America/Chicago",
      "America/Denver",
      "America/Los_Angeles",
      "Europe/London",
      "Europe/Paris",
      "Asia/Kolkata",
      "Asia/Singapore",
      "Australia/Sydney",
    ],
    []
  );

  // Monitor session changes
  useEffect(() => {
    console.log("Session status:", status, "Session data:", session?.user?.email);

    if (status === "authenticated" && session?.user?.email) {
      // Try to load settings when session is available
      loadSettings();
    } else if (status === "unauthenticated") {
      setLoading(false);
      setAlertMessage({
        type: "info",
        message: "Please sign in to access settings.",
      });
    }
  }, [status, session?.user?.email]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setAlertMessage(null);

      // Wait a bit for session to be fully established
      await new Promise((resolve) => setTimeout(resolve, 500));

      const response = await fetch("/api/settings/preferences", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important: include credentials
      });

      console.log("Settings response status:", response.status);

      if (response.status === 401) {
        // Session expired, try to refresh
        if (loadAttempts < 2) {
          console.log("Got 401, retrying...");
          setLoadAttempts((prev) => prev + 1);
          await new Promise((resolve) => setTimeout(resolve, 1000));
          loadSettings();
          return;
        } else {
          // After 2 attempts, sign out and sign in again
          await signIn();
          return;
        }
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to load settings");
      }

      const data = await response.json();

      if (!data.settings) {
        throw new Error("No settings data received");
      }

      setSettings(data.settings);
      setEditedSettings(data.settings);
      setLoadAttempts(0); // Reset attempts on success
    } catch (error) {
      console.error("Error loading settings:", error);
      const errorMsg = (error as Error).message || "Failed to load settings";

      if (loadAttempts < 1) {
        setAlertMessage({
          type: "info",
          message: "Refreshing session...",
        });
        setLoadAttempts((prev) => prev + 1);
        setTimeout(() => loadSettings(), 1000);
      } else {
        setAlertMessage({
          type: "error",
          message: errorMsg,
        });
      }
    } finally {
      setLoading(false);
    }
  };
    useEffect(() => {
      const loadData = async () => {
        try {
          const [prefRes, historyRes, syncRes] = await Promise.all([
            fetch("/api/settings/preferences"),
            fetch("/api/email/history?limit=10&page=1"),
            fetch("/api/youtube/history"),
          ]);
  
          if (prefRes.ok) {
            const prefData = await prefRes.json();
            setSettings(prefData.settings);
          }
  
          if (historyRes.ok) {
            const historyData = await historyRes.json();
            setEmailHistory(historyData.emails);
            setTotalPages(historyData.pagination.pages);
          }
  
          if (syncRes.ok) {
            const syncData = await syncRes.json();
            setSyncData(syncData);
          }
        } catch (error) {
          console.error("Error loading settings:", error);
        } finally {
          setLoading(false);
        }
      };
  
      loadData();
    }, []);
  
    // Load email history for different page
  useEffect(() => {
      const loadHistory = async () => {
        try {
          const res = await fetch(
            `/api/email/history?limit=10&page=${historyPage}`
          );
          if (res.ok) {
            const data = await res.json();
            setEmailHistory(data.emails);
          }
        } catch (error) {
          console.error("Error loading email history:", error);
        }
      };
  
      loadHistory();
    }, [historyPage]);

  const handleSaveSettings = async () => {
    if (!editedSettings) return;
    setSaving(true);
    try {
      const response = await fetch("/api/settings/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ settings: editedSettings }),
      });

      if (response.status === 401) {
        setAlertMessage({
          type: "error",
          message: "Session expired. Please sign in again.",
        });
        await signIn();
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      const data = await response.json();
      setSettings(data.settings);
      setEditedSettings(data.settings);
      setIsEditMode(false);
      setAlertMessage({
        type: "success",
        message: "✓ Changes have been saved!",
      });
      setTimeout(() => setAlertMessage(null), 4000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setAlertMessage({
        type: "error",
        message: (error as Error).message || "Failed to save settings",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedSettings(settings);
    setIsEditMode(false);
  };

  const handleDisconnectChannel = async () => {
    if (
      !confirm(
        "Are you sure you want to disconnect your YouTube channel? You'll need to reconnect to continue using the app."
      )
    ) {
      return;
    }

    try {
      const res = await fetch("/api/youtube/disconnect", {
        method: "POST",
      });

      if (res.ok) {
        setDisconnectMessage("Channel disconnected successfully");
        setSyncData({
          syncStatus: "disconnected",
          lastSyncedAt: "",
          channelName: "",
          isConnected: false,
        });
        setTimeout(() => {
          setDisconnectMessage(null);
          router.push("/dashboard");
        }, 2000);
      }
    } catch (error) {
      setDisconnectMessage("Error disconnecting channel");
    }
  };

  const getStatusColor = (
    status: "sent" | "delivered" | "opened" | "clicked" | "bounced" | "failed"
  ) => {
      switch (status) {
        case "delivered":
          return "bg-blue-100 text-blue-800";
        case "opened":
          return "bg-green-100 text-green-800";
        case "clicked":
          return "bg-green-100 text-green-800";
        case "bounced":
          return "bg-orange-100 text-orange-800";
        case "failed":
          return "bg-red-100 text-red-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };

  // Show loading
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  // Show unauthenticated
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <LogIn className="h-5 w-5" />
                Authentication Required
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-red-700">
                You need to be logged in to access settings.
              </p>
              <Button
                onClick={() => signIn()}
                className="bg-red-600 hover:bg-red-700 gap-2"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (!settings || !editedSettings) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                Error Loading Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-red-700">
                {alertMessage?.message ||
                  "There was a problem loading your settings."}
              </p>
              <div className="flex gap-3 flex-wrap">
                <Button
                  onClick={() => {
                    setLoadAttempts(0);
                    loadSettings();
                  }}
                  className="bg-red-600 hover:bg-red-700 gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
                <Button
                  onClick={() => signIn()}
                  variant="outline"
                  className="gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">Settings</h1>
            <p className="text-gray-600 mt-2">
              Manage your email preferences
            </p>
          </div>
          {!isEditMode ? (
            <Button
              onClick={() => setIsEditMode(true)}
              size="lg"
              className="gap-2 bg-purple-600 hover:bg-purple-700"
            >
              <Edit3 className="h-4 w-4" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleSaveSettings}
                disabled={saving}
                size="lg"
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Alerts */}
        {alertMessage && (
          <Card
            className={
              alertMessage.type === "success"
                ? "border-green-200 bg-green-50"
                : alertMessage.type === "error"
                ? "border-red-200 bg-red-50"
                : "border-blue-200 bg-blue-50"
            }
          >
            <CardContent className="pt-6 flex items-center gap-3">
              {alertMessage.type === "success" ? (
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              ) : alertMessage.type === "error" ? (
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
              )}
              <p
                className={
                  alertMessage.type === "success"
                    ? "text-green-800"
                    : alertMessage.type === "error"
                    ? "text-red-800"
                    : "text-blue-800"
                }
              >
                {alertMessage.message}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Email Preferences */}
        <Card className="border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-purple-600" />
              Email Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isEditMode ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg border border-slate-200">
                  <span className="font-semibold text-gray-900">
                    Weekly Emails
                  </span>
                  <Badge
                    className={
                      editedSettings.emailEnabled
                        ? "bg-green-100 text-green-800 px-3 py-1"
                        : "bg-gray-100 text-gray-800 px-3 py-1"
                    }
                  >
                    {editedSettings.emailEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>

                {editedSettings.emailEnabled && (
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-xs font-medium text-gray-600 uppercase">
                        Frequency
                      </p>
                      <p className="font-semibold text-gray-900 mt-2 capitalize">
                        {editedSettings.emailFrequency}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-xs font-medium text-gray-600 uppercase">
                        Day
                      </p>
                      <p className="font-semibold text-gray-900 mt-2 capitalize">
                        {editedSettings.emailDay}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-xs font-medium text-gray-600 uppercase">
                        Time
                      </p>
                      <p className="font-semibold text-gray-900 mt-2">
                        {editedSettings.emailTime}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <label className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-100 transition">
                  <input
                    type="checkbox"
                    checked={editedSettings.emailEnabled}
                    onChange={(e) =>
                      setEditedSettings({
                        ...editedSettings,
                        emailEnabled: e.target.checked,
                      })
                    }
                    className="w-5 h-5 rounded cursor-pointer accent-purple-600"
                  />
                  <span className="font-semibold text-gray-900">
                    Enable weekly email insights
                  </span>
                </label>

                {editedSettings.emailEnabled && (
                  <div className="grid md:grid-cols-2 gap-4 p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border-2 border-dashed border-slate-300">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Frequency
                      </label>
                      <select
                        value={editedSettings.emailFrequency}
                        onChange={(e) =>
                          setEditedSettings({
                            ...editedSettings,
                            emailFrequency: e.target.value as any,
                          })
                        }
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:border-purple-500"
                      >
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Bi-Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Day of Week
                      </label>
                      <select
                        value={editedSettings.emailDay}
                        onChange={(e) =>
                          setEditedSettings({
                            ...editedSettings,
                            emailDay: e.target.value,
                          })
                        }
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:border-purple-500"
                      >
                        {[
                          "sunday",
                          "monday",
                          "tuesday",
                          "wednesday",
                          "thursday",
                          "friday",
                          "saturday",
                        ].map((d) => (
                          <option key={d} value={d}>
                            {d.charAt(0).toUpperCase() + d.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Time of Day
                      </label>
                      <input
                        type="time"
                        value={editedSettings.emailTime}
                        onChange={(e) =>
                          setEditedSettings({
                            ...editedSettings,
                            emailTime: e.target.value,
                          })
                        }
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Timezone
                      </label>
                      <select
                        value={editedSettings.timezone}
                        onChange={(e) =>
                          setEditedSettings({
                            ...editedSettings,
                            timezone: e.target.value,
                          })
                        }
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:border-purple-500"
                      >
                        {timezones.map((tz) => (
                          <option key={tz} value={tz}>
                            {tz}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Number of Ideas per Email
                      </label>
                      <select
                        value={editedSettings.ideaCount}
                        onChange={(e) =>
                          setEditedSettings({
                            ...editedSettings,
                            ideaCount: parseInt(e.target.value),
                          })
                        }
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:border-purple-500"
                      >
                        <option value={3}>3 ideas</option>
                        <option value={5}>5 ideas</option>
                        <option value={10}>10 ideas</option>
                      </select>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Content Preferences */}
        <Card className="border-2 border-gray-200 bg-gradient-to-br from-white to-blue-50">
          <CardHeader>
            <CardTitle>🎯 Content Preferences (Applied to Emails)</CardTitle>
            <p className="text-sm text-gray-600 mt-3">
              These preferences filter which video ideas are sent to you in emails.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isEditMode ? (
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
                  <p className="text-xs font-bold text-gray-700 uppercase mb-2">
                    📌 Focus Areas
                  </p>
                  <p className="font-medium text-gray-900 text-sm">
                    {joinList(editedSettings.preferences?.focusAreas) ||
                      "None set"}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border-2 border-red-200">
                  <p className="text-xs font-bold text-gray-700 uppercase mb-2">
                    🚫 Avoid Topics
                  </p>
                  <p className="font-medium text-gray-900 text-sm">
                    {joinList(editedSettings.preferences?.avoidTopics) ||
                      "None set"}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                  <p className="text-xs font-bold text-gray-700 uppercase mb-2">
                    📹 Formats
                  </p>
                  <p className="font-medium text-gray-900 text-sm">
                    {joinList(editedSettings.preferences?.preferredFormats) ||
                      "None set"}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    📌 Focus Areas
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., AI, Machine Learning"
                    value={joinList(editedSettings.preferences?.focusAreas)}
                    onChange={(e) =>
                      setEditedSettings({
                        ...editedSettings,
                        preferences: {
                          ...editedSettings.preferences,
                          focusAreas: splitList(e.target.value),
                        },
                      })
                    }
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    🚫 Avoid Topics
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Politics, Religion"
                    value={joinList(editedSettings.preferences?.avoidTopics)}
                    onChange={(e) =>
                      setEditedSettings({
                        ...editedSettings,
                        preferences: {
                          ...editedSettings.preferences,
                          avoidTopics: splitList(e.target.value),
                        },
                      })
                    }
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    📹 Preferred Formats
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., tutorial, vlog, deep-dive"
                    value={joinList(
                      editedSettings.preferences?.preferredFormats
                    )}
                    onChange={(e) =>
                      setEditedSettings({
                        ...editedSettings,
                        preferences: {
                          ...editedSettings.preferences,
                          preferredFormats: splitList(e.target.value),
                        },
                      })
                    }
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
        {/* Email History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {emailHistory.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-600">No emails sent yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-3 font-semibold">
                        Status
                      </th>
                      <th className="text-left py-3 px-3 font-semibold">
                        Subject
                      </th>
                      <th className="text-left py-3 px-3 font-semibold">
                        Ideas Sent
                      </th>
                      <th className="text-left py-3 px-3 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emailHistory.map((email) => (
                      <tr key={email.id} className="border-b hover:bg-slate-50">
                        <td className="py-3 px-3">
                          <Badge className={getStatusColor(email.status)}>
                            {email.status.charAt(0).toUpperCase() +
                              email.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-3 px-3">
                          <div>
                            <p className="font-medium">{email.subject}</p>
                            <p className="text-xs text-gray-500">
                              {email.recipientEmail}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-3">{email.ideaCount}</td>
                        <td className="py-3 px-3">
                          <div>
                            <p>
                              {new Date(email.sentAt).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(email.sentAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={historyPage === 1}
                      onClick={() =>
                        setHistoryPage(Math.max(1, historyPage - 1))
                      }
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-3 text-sm">
                      Page {historyPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={historyPage === totalPages}
                      onClick={() =>
                        setHistoryPage(
                          Math.min(totalPages, historyPage + 1)
                        )
                      }
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Channel Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Channel Management
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Status box */}
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-medium">Sync Status:</span>{" "}
                {syncData?.syncStatus || "unknown"}
              </p>

              <p className="text-sm text-gray-700">
                <span className="font-medium">Last Synced:</span>{" "}
                {syncData?.lastSyncedAt
                  ? new Date(syncData.lastSyncedAt).toLocaleString()
                  : "Never"}
              </p>

              {/* Disconnected text — shown ONLY when disconnected */}
              {!syncData?.isConnected && (
                <p className="text-sm text-gray-700 mt-3">
                  <strong>Your YouTube channel is disconnected.</strong>{" "}
                  Connect again to keep using CreatorMind and receive personalized video
                  ideas in your emails.
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 flex-wrap">
              {/* Re-sync button (always visible) */}
              <Button
                onClick={async () => {
                  await fetch("/api/youtube/sync", { method: "POST" });
                  const res = await fetch("/api/youtube/history");
                  const data = await res.json();
                  setSyncData(data);
                }}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Re-sync Channel
              </Button>

              {/* Toggle Connect / Disconnect button */}
              <Button
                onClick={async () => {
                  if (syncData?.isConnected) {
                    // DISCONNECT
                    if (
                      confirm(
                        "Are you sure you want to disconnect your YouTube channel?"
                      )
                    ) {
                      await fetch("/api/youtube/disconnect", { method: "POST" });
                      alert("Channel disconnected");

                      // 🔥 update UI immediately
                      setSyncData((prev) => ({
                        ...(prev as SyncStatus),
                        isConnected: false,
                        syncStatus: "disconnected",
                      }));
                    }
                  } else {
                    // CONNECT
                    await fetch("/api/youtube/connect", { method: "POST" });
                    alert("Channel connected");

                    // 🔥 update UI immediately
                    setSyncData((prev) => ({
                      ...(prev as SyncStatus),
                      isConnected: true,
                      syncStatus: "connected",
                      lastSyncedAt: new Date().toISOString(),
                    }));
                  }
                }}
                variant="outline"
                className={
                  syncData?.isConnected
                    ? "text-red-600 hover:text-red-700 border-red-200"
                    : "text-purple-600 hover:text-purple-700 border-purple-200"
                }
              >
                {syncData?.isConnected ? (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Disconnect Channel
                  </>
                ) : (
                  <>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Connect Channel
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}