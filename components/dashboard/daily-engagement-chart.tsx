"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import { TrendingUp, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DailyData {
  date: string;
  engagement: number;
  views: number;
  likes: number;
  comments: number;
  videosCount: number;
  videos: Array<{
    title: string;
    videoId: string;
    engagement: number;
    views: number;
    likes: number;
    comments: number;
  }>;
}

interface MonthOption {
  value: string;
  label: string;
}

const chartConfig = {
  engagement: {
    label: "Engagement Score",
    color: "#3b82f6", // Beautiful blue color like reference
  },
} satisfies ChartConfig;

export function DailyEngagementChart() {
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [availableMonths, setAvailableMonths] = useState<MonthOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [startMonth, setStartMonth] = useState<string>("");
  const [endMonth, setEndMonth] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (startMonth && endMonth) {
      fetchData(startMonth, endMonth);
    }
  }, [startMonth, endMonth]);

  const fetchData = async (start?: string, end?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (start) params.append("startMonth", start);
      if (end) params.append("endMonth", end);

      const res = await fetch(`/api/daily-engagement?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setDailyData(data.dailyData);
        setAvailableMonths(data.availableMonths);

        // Set default months if not already set
        if (!startMonth && data.availableMonths.length > 0) {
          const months = data.availableMonths;
          // Default to last 3 months or available range
          const defaultEnd = months[months.length - 1]?.value;
          const defaultStart =
            months.length >= 3
              ? months[months.length - 3]?.value
              : months[0]?.value;
          setStartMonth(defaultStart || "");
          setEndMonth(defaultEnd || "");
        }
      }
    } catch (error) {
      console.error("Error fetching daily engagement:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatFullDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading && dailyData.length === 0) {
    return (
      <Card className="mb-8 bg-slate-950 border-slate-800">
        <CardHeader>
          <Skeleton className="h-6 w-48 bg-slate-800" />
          <Skeleton className="h-4 w-64 mt-2 bg-slate-800" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full bg-slate-800" />
        </CardContent>
      </Card>
    );
  }

  if (dailyData.length === 0) {
    return (
      <Card className="mb-8 bg-slate-950 border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Daily Engagement Tracker
          </CardTitle>
          <CardDescription className="text-slate-400">
            No data available for selected range
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 text-center py-8">
            Try selecting a different date range or upload more videos!
          </p>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data
  const chartData = dailyData.map((day) => ({
    date: day.date,
    engagement: day.engagement,
    label: formatDate(day.date),
  }));

  // Calculate average engagement for display
  const avgEngagement =
    dailyData.reduce((sum, day) => sum + day.engagement, 0) / dailyData.length;

  return (
    <Card className="mb-8 bg-slate-950 border-slate-800 overflow-hidden">
      <CardHeader className="flex flex-col items-stretch border-b border-slate-800 !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:py-6">
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Daily Engagement Tracker
          </CardTitle>
          <CardDescription className="text-slate-400">
            Showing daily performance for selected period
          </CardDescription>
        </div>

        {/* Date Range Filters */}
        <div className="flex flex-col sm:flex-row gap-2 px-6 pb-4 sm:py-6 border-t border-slate-800 sm:border-t-0 sm:border-l sm:border-l-slate-800">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">From</label>
            <Select value={startMonth} onValueChange={setStartMonth}>
              <SelectTrigger className="w-[160px] bg-slate-900 border-slate-700 text-white">
                <SelectValue placeholder="Start month" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                {availableMonths.map((month) => (
                  <SelectItem 
                    key={month.value} 
                    value={month.value}
                    className="text-white hover:bg-slate-800"
                  >
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">To</label>
            <Select value={endMonth} onValueChange={setEndMonth}>
              <SelectTrigger className="w-[160px] bg-slate-900 border-slate-700 text-white">
                <SelectValue placeholder="End month" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                {availableMonths.map((month) => (
                  <SelectItem 
                    key={month.value} 
                    value={month.value}
                    className="text-white hover:bg-slate-800"
                  >
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Average Engagement Display */}
        <div className="flex flex-col justify-center gap-1 border-t border-slate-800 px-6 py-4 text-left sm:border-t-0 sm:border-l sm:border-l-slate-800 sm:px-8 sm:py-6">
          <span className="text-xs text-slate-400">
            Avg Engagement
          </span>
          <span className="text-lg leading-none font-bold sm:text-3xl text-white">
            {avgEngagement.toFixed(2)}%
          </span>
        </div>
      </CardHeader>

      <CardContent className="px-2 sm:p-6 bg-slate-950">
        <ChartContainer config={chartConfig} className="aspect-auto h-[400px] w-full">
          <BarChart
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
            barCategoryGap="20%"
          >
            <CartesianGrid 
              strokeDasharray="0" 
              stroke="#1e293b"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tick={{ fontSize: 12, fill: "#94a3b8" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 12, fill: "#94a3b8" }}
              domain={[0, 'auto']}
            />
            <ChartTooltip
              cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
              content={<CustomTooltip dailyData={dailyData} formatFullDate={formatFullDate} />}
            />
            <Bar
              dataKey="engagement"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// Custom Tooltip Component - Exactly as requested
function CustomTooltip({
  active,
  payload,
  dailyData,
  formatFullDate,
}: any) {
  if (!active || !payload || !payload[0]) {
    return null;
  }

  const data = payload[0].payload;
  const dayData = dailyData.find((d: DailyData) => d.date === data.date);

  if (!dayData) return null;

  return (
    <div className="rounded-lg bg-slate-900 border border-slate-700 p-4 shadow-2xl min-w-[200px]">
      {/* Date Header */}
      <div className="mb-3 pb-3 border-b border-slate-700">
        <p className="font-semibold text-white text-sm">
          {formatFullDate(data.date)}
        </p>
      </div>

      {/* Metrics - Exactly as specified */}
      <div className="space-y-2">
        <div className="flex justify-between items-center gap-8">
          <span className="text-sm text-slate-400">Views:</span>
          <span className="font-semibold text-white">
            {dayData.views.toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between items-center gap-8">
          <span className="text-sm text-slate-400">Comments:</span>
          <span className="font-semibold text-white">
            {dayData.comments.toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between items-center gap-8">
          <span className="text-sm text-slate-400">Likes:</span>
          <span className="font-semibold text-white">
            {dayData.likes.toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between items-center gap-8 pt-2 border-t border-slate-700">
          <span className="text-sm text-slate-400">Engagement:</span>
          <span className="font-bold text-blue-400">
            {dayData.engagement.toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
}