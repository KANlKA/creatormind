"use client";
import { useEffect, useMemo, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
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
  Edit3,
  Save,
  X,
  CheckCircle,
  LogIn,
  RefreshCw,
  Clock,
  Calendar,
  Globe,
  Target,
  Filter,
  Film,
  Shield,
  Link2,
  Unlink,
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

type ChannelStatus = {
  isConnected: boolean;
  channelName?: string;
  syncStatus?: "syncing" | "synced" | "failed" | "disconnected";
  lastSyncedAt?: string;
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
  const [settings, setSettings] = useState<Settings | null>(null);
  const [editedSettings, setEditedSettings] = useState<Settings | null>(null);
  const [emailHistory, setEmailHistory] = useState<EmailLog[]>([]);
  const [channelStatus, setChannelStatus] = useState<ChannelStatus>({
    isConnected: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [clientTimezone, setClientTimezone] = useState<string>("UTC");
  const [alertMessage, setAlertMessage] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);
  const [loadAttempts, setLoadAttempts] = useState(0);

  const getClientTimezone = () => {
    if (typeof window === "undefined") return "UTC";
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
      return "UTC";
    }
  };

  const timezones = useMemo(() => {
    if (typeof Intl !== "undefined" && "supportedValuesOf" in Intl) {
      return (Intl as any).supportedValuesOf("timeZone") as string[];
    }
    return [
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
      "Asia/Calcutta",
    ];
  }, []);

  // Load settings
  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
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

      await new Promise((resolve) => setTimeout(resolve, 500));

      const response = await fetch("/api/settings/preferences", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.status === 401) {
        if (loadAttempts < 2) {
          setLoadAttempts((prev) => prev + 1);
          await new Promise((resolve) => setTimeout(resolve, 1000));
          loadSettings();
          return;
        } else {
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
      setLoadAttempts(0);
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

  // Auto-detect timezone on mount
  useEffect(() => {
    const tz = getClientTimezone();
    setClientTimezone(tz);
  }, []);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [prefRes, historyRes, channelRes] = await Promise.all([
          fetch("/api/settings/preferences"),
          fetch("/api/email/history?limit=5&page=1"),
          fetch("/api/youtube/connect"),
        ]);

        if (prefRes.ok) {
          const prefData = await prefRes.json();
          const defaultTimezone = prefData.settings.timezone || clientTimezone;
          setSettings({
            ...prefData.settings,
            timezone: defaultTimezone,
          });
          setEditedSettings({
            ...prefData.settings,
            timezone: defaultTimezone,
          });
        }

        if (historyRes.ok) {
          const historyData = await historyRes.json();
          setEmailHistory(historyData.emails);
          setTotalPages(historyData.pagination.pages);
        }

        if (channelRes.ok) {
          const channelData = await channelRes.json();
          setChannelStatus({
            isConnected: channelData.connected,
            channelName: channelData.channelName,
            syncStatus: channelData.connected ? (channelData.syncStatus || "synced") : "disconnected",
            lastSyncedAt: channelData.lastSyncedAt,
          });
        }
      } catch (error) {
        console.error("Error loading settings:", error);
        setAlertMessage({
          type: "error",
          message: "Error loading settings",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [clientTimezone]);

  // Load email history for different pages
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await fetch(`/api/email/history?limit=5&page=${historyPage}`);
        if (res.ok) {
          const data = await res.json();
          setEmailHistory(data.emails);
        }
      } catch (error) {
        console.error("Error loading email history:", error);
      }
    };

    if (status === "authenticated") {
      loadHistory();
    }
  }, [historyPage, status]);

  const handleSaveSettings = async () => {
    if (!editedSettings) return;

    // Use client timezone if not manually changed
    const settingsToSave = {
      ...editedSettings,
      timezone: editedSettings.timezone || clientTimezone,
    };

    try {
      setSaving(true);
      const response = await fetch("/api/settings/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: settingsToSave }),
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
        message: "Settings saved successfully!",
      });
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

  const handleSendTestEmail = async () => {
    try {
      const res = await fetch("/api/debug/send-email-now");
      const data = await res.json();
      if (data.success) {
        setAlertMessage({
          type: "success",
          message: "Test email sent! Check your inbox.",
        });
        // Refresh email history
        const historyRes = await fetch("/api/email/history?limit=5&page=1");
        if (historyRes.ok) {
          const historyData = await historyRes.json();
          setEmailHistory(historyData.emails);
          setTotalPages(historyData.pagination.pages);
          setHistoryPage(1);
        }
      } else {
        setAlertMessage({
          type: "error",
          message: `Error: ${data.error}`,
        });
      }
    } catch (error) {
      setAlertMessage({
        type: "error",
        message: "Error sending test email",
      });
    }
  };

  const handleResyncChannel = async () => {
    if (!channelStatus.isConnected) {
      setAlertMessage({
        type: "error",
        message: "Channel not connected",
      });
      return;
    }

    setSyncing(true);
    setChannelStatus((prev) => ({
      ...prev,
      syncStatus: "syncing",
    }));

    try {
      const res = await fetch("/api/youtube/sync", { method: "POST" });
      if (res.ok) {
        setAlertMessage({
          type: "success",
          message: "Channel sync started!",
        });

        // Refresh channel status after a delay
        setTimeout(async () => {
          const channelRes = await fetch("/api/youtube/connect");
          if (channelRes.ok) {
            const data = await channelRes.json();
            setChannelStatus({
              isConnected: data.connected,
              channelName: data.channelName,
              syncStatus: data.connected ? (data.syncStatus || "synced") : "disconnected",
              lastSyncedAt: data.lastSyncedAt,
            });
          }
        }, 3000);
      } else {
        setAlertMessage({
          type: "error",
          message: "Error syncing channel",
        });
        setChannelStatus((prev) => ({
          ...prev,
          syncStatus: "failed",
        }));
      }
    } catch (error) {
      setAlertMessage({
        type: "error",
        message: "Error syncing channel",
      });
      setChannelStatus((prev) => ({
        ...prev,
        syncStatus: "failed",
      }));
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnectChannel = async () => {
    if (!confirm("Are you sure you want to disconnect your YouTube channel?")) {
      return;
    }

    setDisconnecting(true);
    try {
      const res = await fetch("/api/youtube/disconnect", { method: "POST" });
      if (res.ok) {
        setChannelStatus({
          isConnected: false,
          syncStatus: "disconnected",
          lastSyncedAt: undefined,
        });
        setAlertMessage({
          type: "success",
          message: "Channel disconnected successfully",
        });
      } else {
        setAlertMessage({
          type: "error",
          message: "Error disconnecting channel",
        });
      }
    } catch (error) {
      setAlertMessage({
        type: "error",
        message: "Error disconnecting channel",
      });
    } finally {
      setDisconnecting(false);
    }
  };

  const handleConnectChannel = () => {
    router.push("/dashboard");
  };

  const getStatusColor = (status: EmailLog["status"]) => {
    switch (status) {
      case "delivered":
        return "bg-blue-600 text-white";
      case "opened":
        return "bg-green-600 text-white";
      case "clicked":
        return "bg-green-700 text-white";
      case "bounced":
        return "bg-orange-600 text-white";
      case "failed":
        return "bg-red-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  const getSyncStatusColor = (status?: string) => {
    switch (status) {
      case "synced":
        return "bg-green-100 text-green-800";
      case "syncing":
        return "bg-blue-100 text-blue-800 animate-pulse";
      case "failed":
        return "bg-red-100 text-red-800";
      case "disconnected":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="h-20" />
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
          <Skeleton className="h-12 w-64 bg-zinc-800" />
          <Skeleton className="h-96 bg-zinc-800" />
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-black">
        <div className="h-20" />
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Card className="bg-red-950/20 border-red-900/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <Shield className="h-5 w-5" />
                Authentication Required
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-400">
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

  if (!settings || !editedSettings) {
    return (
      <div className="min-h-screen bg-black">
        <div className="h-20" />
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Card className="bg-red-950/20 border-red-900/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <AlertCircle className="h-5 w-5" />
                Error Loading Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-400">
                {alertMessage?.message || "There was a problem loading your settings."}
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
                  className="gap-2 border-zinc-700 text-gray-300"
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
    <div className="min-h-screen bg-black">
      {/* Navbar space */}
      <div className="h-20" />

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50">
              <SettingsIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Settings</h1>
              <p className="text-gray-400 mt-1">
                Manage your preferences and email notifications
              </p>
            </div>
          </div>
          {!isEditMode ? (
            <Button
              onClick={() => setIsEditMode(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleSaveSettings}
                className="bg-green-600 hover:bg-green-700"
              >
                Save
              </Button>
              <Button onClick={handleCancel} variant="outline">
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
                ? "bg-green-950/20 border-green-900/50"
                : alertMessage.type === "error"
                ? "bg-red-950/20 border-red-900/50"
                : "bg-blue-950/20 border-blue-900/50"
            }
          >
            <CardContent className="pt-6 flex items-center gap-3">
              {alertMessage.type === "success" ? (
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
              ) : alertMessage.type === "error" ? (
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0" />
              )}
              <p
                className={
                  alertMessage.type === "success"
                    ? "text-green-400"
                    : alertMessage.type === "error"
                    ? "text-red-400"
                    : "text-blue-400"
                }
              >
                {alertMessage.message}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Email Preferences */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="border-b border-zinc-800">
            <CardTitle className="flex items-center gap-2 text-white text-2xl">
              <Mail className="h-6 w-6 text-purple-400" />
              Email Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isEditMode ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg border border-slate-200">
                  <span className="font-semibold">Weekly Emails</span>
                  <Badge
                    className={
                      editedSettings.emailEnabled
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }
                  >
                    {editedSettings.emailEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>

                {editedSettings.emailEnabled && (
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-xs text-gray-600 uppercase font-medium">Frequency</p>
                      <p className="font-semibold mt-2 capitalize">
                        {editedSettings.emailFrequency === "weekly" && "Every Week"}
                        {editedSettings.emailFrequency === "biweekly" && "Every 2 Weeks"}
                        {editedSettings.emailFrequency === "monthly" && "Every Month"}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-xs text-gray-600 uppercase font-medium">Day</p>
                      <p className="font-semibold mt-2 capitalize">
                        {editedSettings.emailDay}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-xs text-gray-600 uppercase font-medium">Time</p>
                      <p className="font-semibold mt-2">{editedSettings.emailTime}</p>
                    </div>

                    <div className="p-5 bg-zinc-800/50 rounded-xl border border-zinc-700">
                      <div className="flex items-center gap-2 mb-3">
                        <Globe className="h-5 w-5 text-orange-400" />
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          Timezone
                        </p>
                      </div>
                      <p className="font-semibold text-white text-sm">
                        {editedSettings.timezone}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <label className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editedSettings.emailEnabled}
                    onChange={(e) =>
                      setEditedSettings({
                        ...editedSettings,
                        emailEnabled: e.target.checked,
                      })
                    }
                    className="w-5 h-5 rounded accent-purple-600"
                  />
                  <span className="font-semibold text-white text-lg">
                    Enable weekly email insights
                  </span>
                </label>

                {editedSettings.emailEnabled && (
                  <div className="grid md:grid-cols-2 gap-6 p-6 bg-zinc-800/30 rounded-xl border-2 border-zinc-700">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-400" />
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
                        className="w-full bg-zinc-900 border-2 border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Bi-Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-green-400" />
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
                        className="w-full bg-zinc-900 border-2 border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
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
                      <label className="block text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-purple-400" />
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
                        className="w-full bg-zinc-900 border-2 border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                        <Globe className="h-4 w-4 text-orange-400" />
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
                        className="w-full bg-zinc-900 border-2 border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                      >
                        {timezones.map((tz) => (
                          <option key={tz} value={tz}>
                            {tz}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                        <Target className="h-4 w-4 text-pink-400" />
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
                        className="w-full bg-zinc-900 border-2 border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value={3}>3 ideas</option>
                        <option value={5}>5 ideas</option>
                        <option value={10}>10 ideas</option>
                      </select>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleSendTestEmail}
                  disabled={sending}
                  variant="outline"
                  className="w-full"
                >
                  {sending ? "Sending..." : "Send Test Email"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Content Preferences */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="border-b border-zinc-800">
            <div>
              <CardTitle className="flex items-center gap-2 text-white text-2xl mb-2">
                <Filter className="h-6 w-6 text-blue-400" />
                Content Preferences
              </CardTitle>
              <p className="text-sm text-gray-400">
                Filter which video ideas are sent to you in emails
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {!isEditMode ? (
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-5 bg-blue-950/20 rounded-xl border-2 border-blue-900/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="h-5 w-5 text-blue-400" />
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      Focus Areas
                    </p>
                  </div>
                  <p className="font-medium text-white text-sm">
                    {joinList(editedSettings.preferences?.focusAreas) || "None set"}
                  </p>
                </div>

                <div className="p-5 bg-red-950/20 rounded-xl border-2 border-red-900/30">
                  <div className="flex items-center gap-2 mb-3">
                    <X className="h-5 w-5 text-red-400" />
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      Avoid Topics
                    </p>
                  </div>
                  <p className="font-medium text-white text-sm">
                    {joinList(editedSettings.preferences?.avoidTopics) || "None set"}
                  </p>
                </div>

                <div className="p-5 bg-green-950/20 rounded-xl border-2 border-green-900/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Film className="h-5 w-5 text-green-400" />
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      Preferred Formats
                    </p>
                  </div>
                  <p className="font-medium text-white text-sm">
                    {joinList(editedSettings.preferences?.preferredFormats) || "None set"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-400" />
                    Focus Areas
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., AI, Machine Learning, Python"
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
                    className="w-full bg-zinc-900 border-2 border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-2">Comma-separated list</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                    <X className="h-4 w-4 text-red-400" />
                    Avoid Topics
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
                    className="w-full bg-zinc-900 border-2 border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                  />
                  <p className="text-xs text-gray-500 mt-2">Comma-separated list</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                    <Film className="h-4 w-4 text-green-400" />
                    Preferred Formats
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., tutorial, vlog, deep-dive"
                    value={joinList(editedSettings.preferences?.preferredFormats)}
                    onChange={(e) =>
                      setEditedSettings({
                        ...editedSettings,
                        preferences: {
                          ...editedSettings.preferences,
                          preferredFormats: splitList(e.target.value),
                        },
                      })
                    }
                    className="w-full bg-zinc-900 border-2 border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                  />
                  <p className="text-xs text-gray-500 mt-2">Comma-separated list</p>
                </div>
              </div>
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
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-3 px-3 font-semibold">Status</th>
                        <th className="text-left py-3 px-3 font-semibold">Subject</th>
                        <th className="text-left py-3 px-3 font-semibold">Ideas</th>
                        <th className="text-left py-3 px-3 font-semibold">Date & Time</th>
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
                              {email.failureReason && (
                                <p className="text-xs text-red-600 mt-1">
                                  ⚠️ {email.failureReason}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center font-semibold">{email.ideaCount}</td>
                          <td className="py-3 px-3">
                            <p className="text-sm">{new Date(email.sentAt).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(email.sentAt).toLocaleTimeString()}
                            </p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={historyPage === 1}
                      onClick={() => setHistoryPage(Math.max(1, historyPage - 1))}
                    >
                      ◀ Previous
                    </Button>
                    
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={historyPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setHistoryPage(page)}
                          className={historyPage === page ? "min-w-[40px] bg-purple-600 hover:bg-purple-700" : "min-w-[40px]"}
                        >
                          {page}
                        </Button>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={historyPage === totalPages}
                      onClick={() =>
                        setHistoryPage(Math.min(totalPages, historyPage + 1))
                      }
                    >
                      Next ▶
                    </Button>
                  </div>
                )}

                <div className="text-center text-xs text-gray-500 mt-4">
                  Page {historyPage} of {totalPages} • Showing 5 emails per page
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Channel Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              YouTube Channel Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {channelStatus.isConnected ? (
              <>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800 font-semibold">
                    {channelStatus.channelName}
                  </p>
                  <div className="text-sm text-blue-700 mt-3">
                    <span className="font-medium">Sync Status:</span>{" "}
                    <Badge className={getSyncStatusColor(channelStatus.syncStatus) + " ml-2"}>
                      {channelStatus.syncStatus?.charAt(0).toUpperCase() +
                        (channelStatus.syncStatus?.slice(1) || "")}
                    </Badge>
                  </div>
                  {channelStatus.lastSyncedAt && (
                    <p className="text-sm text-blue-700 mt-2">
                      <span className="font-medium">Last Synced:</span>{" "}
                      {new Date(channelStatus.lastSyncedAt).toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={handleResyncChannel}
                    disabled={syncing || !channelStatus.isConnected}
                    className={syncing || !channelStatus.isConnected ? "bg-gray-400 text-gray-700 cursor-not-allowed opacity-60 hover:bg-gray-400" : "bg-purple-600 hover:bg-purple-700"}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    {syncing ? "Syncing..." : "Re-sync Channel"}
                  </Button>
                  <Button
                    onClick={handleDisconnectChannel}
                    disabled={disconnecting}
                    className={disconnecting ? "bg-gray-400 text-gray-700 cursor-not-allowed opacity-60 hover:bg-gray-400" : "bg-purple-600 hover:bg-purple-700"}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {disconnecting ? "Disconnecting..." : "Disconnect Channel"}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-800 font-semibold flex items-center gap-2">
                    Sync Status:
                    <Badge className={getSyncStatusColor(channelStatus.syncStatus)}>
                      Disconnected
                    </Badge>
                  </div>
                </div>

                <Button
                  onClick={handleConnectChannel}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  Connect YouTube Channel
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}