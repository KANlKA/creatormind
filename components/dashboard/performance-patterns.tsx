"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Video,
  Target,
  MessageSquare,
  Clock,
  Lightbulb,
  BarChart,
  Hash,
  Mic,
  Zap,
  Calendar,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface PerformancePattern {
  bestFormats: FormatPerformance[];
  bestTopics: TopicPerformance[];
  bestTones: TonePerformance[];
  bestHooks: HookPerformance[];
  uploadTimeOptimization: UploadTimeAnalysis;
  overallMetrics: OverallMetrics;
  insights: string[];
}

interface FormatPerformance {
  format: string;
  videoCount: number;
  avgEngagement: number;
  avgViews: number;
  totalViews: number;
  topVideo: {
    title: string;
    videoId: string;
    engagement: number;
    views: number;
  } | null;
  comparisonToAverage: number;
}

interface TopicPerformance {
  topic: string;
  videoCount: number;
  avgEngagement: number;
  avgViews: number;
  totalViews: number;
  rank: number;
}

interface TonePerformance {
  tone: string;
  videoCount: number;
  avgEngagement: number;
  avgViews: number;
  comparisonToAverage: number;
}

interface HookPerformance {
  hookType: string;
  videoCount: number;
  avgEngagement: number;
  comparisonToAverage: number;
}

interface UploadTimeAnalysis {
  byDayOfWeek: DayPerformance[];
  byTimeOfDay: TimeOfDayPerformance[];
  bestDay: string;
  bestTime: string;
  bestCombination: {
    day: string;
    time: string;
    avgEngagement: number;
  };
}

interface DayPerformance {
  day: string;
  videoCount: number;
  avgEngagement: number;
  avgViews: number;
  totalViews: number;
}

interface TimeOfDayPerformance {
  timeSlot: string;
  timeRange: string;
  videoCount: number;
  avgEngagement: number;
  avgViews: number;
}

interface OverallMetrics {
  totalVideos: number;
  avgEngagement: number;
  totalViews: number;
  totalLikes: number;
  avgViewsPerVideo: number;
  engagementTrend: "up" | "down" | "stable";
}

export function PerformancePatterns() {
  const [patterns, setPatterns] = useState<PerformancePattern | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPatterns();
  }, []);

  const fetchPatterns = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/patterns");
      if (!res.ok) throw new Error("Failed to fetch patterns");
      const data = await res.json();
      setPatterns(data.patterns);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-40 bg-zinc-800 rounded-lg" />
        ))}
      </div>
    );
  }

  if (error || !patterns) {
    return (
      <Card className="bg-zinc-900 border-zinc-700 hover:bg-zinc-800 transition-colors">
        <CardContent className="pt-6">
          <p className="text-gray-400 text-center py-8">
            {error || "No pattern data available"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Insights */}
      <Card className="bg-zinc-900 border-zinc-700 hover:bg-zinc-800 transition-colors">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Lightbulb className="h-5 w-5 text-purple-400" />
            Key Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {patterns.insights.map((insight, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 rounded-lg"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                    <span className="text-xs text-gray-400">{i + 1}</span>
                  </div>
                </div>
                <p className="text-white">{insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Overall Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Total Videos"
          value={patterns.overallMetrics.totalVideos.toLocaleString()}
          icon={<Video className="h-4 w-4 text-purple-400" />}
        />
        <MetricCard
          label="Avg Engagement"
          value={`${(patterns.overallMetrics.avgEngagement * 100).toFixed(1)}%`}
          icon={<Target className="h-4 w-4 text-blue-400" />}
          trend={patterns.overallMetrics.engagementTrend}
        />
        <MetricCard
          label="Total Views"
          value={formatNumber(patterns.overallMetrics.totalViews)}
          icon={<TrendingUp className="h-4 w-4 text-green-400" />}
        />
        <MetricCard
          label="Avg Views/Video"
          value={formatNumber(patterns.overallMetrics.avgViewsPerVideo)}
          icon={<BarChart className="h-4 w-4 text-orange-400" />}
        />
      </div>

      {/* Detailed Patterns */}
      <Tabs defaultValue="formats" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-zinc-900 border border-zinc-700 p-1 rounded-lg">
          <TabsTrigger 
            value="formats" 
            className="text-gray-400 data-[state=active]:bg-zinc-700 data-[state=active]:text-white data-[state=active]:border-zinc-600"
          >
            Formats
          </TabsTrigger>
          <TabsTrigger 
            value="topics" 
            className="text-gray-400 data-[state=active]:bg-zinc-700 data-[state=active]:text-white data-[state=active]:border-zinc-600"
          >
            Topics
          </TabsTrigger>
          <TabsTrigger 
            value="tones" 
            className="text-gray-400 data-[state=active]:bg-zinc-700 data-[state=active]:text-white data-[state=active]:border-zinc-600"
          >
            Tones
          </TabsTrigger>
          <TabsTrigger 
            value="hooks" 
            className="text-gray-400 data-[state=active]:bg-zinc-700 data-[state=active]:text-white data-[state=active]:border-zinc-600"
          >
            Hooks
          </TabsTrigger>
          <TabsTrigger 
            value="timing" 
            className="text-gray-400 data-[state=active]:bg-zinc-700 data-[state=active]:text-white data-[state=active]:border-zinc-600"
          >
            Timing
          </TabsTrigger>
        </TabsList>

        {/* Formats Tab */}
        <TabsContent value="formats" className="space-y-4">
          <Card className="bg-zinc-900 border-zinc-700 hover:bg-zinc-800 transition-colors">
            <CardHeader>
              <CardTitle className="text-white">Best Performing Formats</CardTitle>
              <p className="text-sm text-gray-400">
                Which content formats get the highest engagement
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {patterns.bestFormats.map((format, i) => (
                  <FormatCard key={i} format={format} rank={i + 1} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Topics Tab */}
        <TabsContent value="topics" className="space-y-4">
          <Card className="bg-zinc-900 border-zinc-700 hover:bg-zinc-800 transition-colors">
            <CardHeader>
              <CardTitle className="text-white">Best Performing Topics</CardTitle>
              <p className="text-sm text-gray-400">
                Topics ranked by average engagement rate
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {patterns.bestTopics.slice(0, 10).map((topic, i) => (
                  <TopicCard key={i} topic={topic} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tones Tab */}
        <TabsContent value="tones" className="space-y-4">
          <Card className="bg-zinc-900 border-zinc-700 hover:bg-zinc-800 transition-colors">
            <CardHeader>
              <CardTitle className="text-white">Best Performing Tones</CardTitle>
              <p className="text-sm text-gray-400">
                Which tone resonates most with your audience
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {patterns.bestTones.map((tone, i) => (
                  <ToneCard key={i} tone={tone} rank={i + 1} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hooks Tab */}
        <TabsContent value="hooks" className="space-y-4">
          <Card className="bg-zinc-900 border-zinc-700 hover:bg-zinc-800 transition-colors">
            <CardHeader>
              <CardTitle className="text-white">Best Hook Types</CardTitle>
              <p className="text-sm text-gray-400">
                What gets people to click and watch
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {patterns.bestHooks.map((hook, i) => (
                  <HookCard key={i} hook={hook} rank={i + 1} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timing Tab */}
        <TabsContent value="timing" className="space-y-4">
          <Card className="bg-zinc-900 border-zinc-700 hover:bg-zinc-800 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Clock className="h-5 w-5 text-gray-400" />
                Upload Time Optimization
              </CardTitle>
              <p className="text-sm text-gray-400">
                When your videos perform best
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Best Combination */}
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 hover:bg-zinc-750 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center border border-zinc-600">
                    <Target className="h-4 w-4 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 font-medium">Optimal Upload Time</p>
                    <p className="text-xl font-bold text-white capitalize">
                      {patterns.uploadTimeOptimization.bestCombination.day}{" "}
                      {patterns.uploadTimeOptimization.bestCombination.time}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-white">
                  Avg engagement:{" "}
                  {(
                    patterns.uploadTimeOptimization.bestCombination
                      .avgEngagement * 100
                  ).toFixed(1)}
                  %
                </p>
              </div>

              {/* By Day of Week */}
              <div>
                <h3 className="font-semibold mb-3 text-white flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-400" />
                  By Day of Week
                </h3>
                <div className="space-y-2">
                  {patterns.uploadTimeOptimization.byDayOfWeek.map((day) => (
                    <DayCard key={day.day} day={day} />
                  ))}
                </div>
              </div>

              {/* By Time of Day */}
              <div>
                <h3 className="font-semibold mb-3 text-white flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-400" />
                  By Time of Day
                </h3>
                <div className="space-y-2">
                  {patterns.uploadTimeOptimization.byTimeOfDay.map((time) => (
                    <TimeSlotCard key={time.timeSlot} timeSlot={time} />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  trend,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "stable";
}) {
  return (
    <Card className="bg-zinc-900 border-zinc-700 hover:bg-zinc-800 transition-colors">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">{label}</span>
          <span className="text-gray-500">{icon}</span>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-2xl font-bold text-white">{value}</p>
          {trend && (
            <span className="text-sm">
              {trend === "up" && <TrendingUp className="h-4 w-4 text-green-400" />}
              {trend === "down" && (
                <TrendingDown className="h-4 w-4 text-red-400" />
              )}
              {trend === "stable" && <Minus className="h-4 w-4 text-gray-500" />}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function FormatCard({
  format,
  rank,
}: {
  format: FormatPerformance;
  rank: number;
}) {
  return (
    <div className="border border-zinc-700 rounded-lg p-4 hover:bg-zinc-800 transition-colors bg-zinc-900">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge variant={rank === 1 ? "default" : "secondary"} className={rank === 1 ? "bg-zinc-700 text-white border border-zinc-600" : "bg-zinc-800 text-gray-300 border border-zinc-700"}>
            #{rank}
          </Badge>
          <div className="flex items-center gap-2">
            <Video className="h-4 w-4 text-purple-400" />
            <h4 className="font-semibold text-white capitalize">{format.format}</h4>
          </div>
        </div>
        <span className="text-sm font-medium text-white bg-zinc-800 px-2 py-1 rounded-full border border-zinc-700">
          {format.comparisonToAverage.toFixed(1)}× avg
        </span>
      </div>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-gray-400">Videos</p>
          <p className="font-semibold text-white">{format.videoCount}</p>
        </div>
        <div>
          <p className="text-gray-400">Avg Engagement</p>
          <p className="font-semibold text-white">
            {(format.avgEngagement * 100).toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-gray-400">Avg Views</p>
          <p className="font-semibold text-white">{formatNumber(format.avgViews)}</p>
        </div>
      </div>
      {format.topVideo && (
        <div className="mt-4 pt-4 border-t border-zinc-700 text-sm">
          <p className="text-gray-400 mb-1">Top video:</p>
          <p className="font-medium text-white truncate">{format.topVideo.title}</p>
        </div>
      )}
    </div>
  );
}

function TopicCard({ topic }: { topic: TopicPerformance }) {
  return (
    <div className="border border-zinc-700 rounded-lg p-4 hover:bg-zinc-800 transition-colors bg-zinc-900">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge className="bg-zinc-800 text-gray-300 border border-zinc-700">
            #{topic.rank}
          </Badge>
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-blue-400" />
            <h4 className="font-semibold text-white">{topic.topic}</h4>
          </div>
        </div>
        <span className="text-sm font-medium text-white bg-zinc-800 px-2 py-1 rounded-full border border-zinc-700">
          {(topic.avgEngagement * 100).toFixed(1)}%
        </span>
      </div>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-gray-400">Videos</p>
          <p className="font-semibold text-white">{topic.videoCount}</p>
        </div>
        <div>
          <p className="text-gray-400">Avg Views</p>
          <p className="font-semibold text-white">{formatNumber(topic.avgViews)}</p>
        </div>
        <div>
          <p className="text-gray-400">Total Views</p>
          <p className="font-semibold text-white">{formatNumber(topic.totalViews)}</p>
        </div>
      </div>
    </div>
  );
}

function ToneCard({ tone, rank }: { tone: TonePerformance; rank: number }) {
  return (
    <div className="border border-zinc-700 rounded-lg p-4 hover:bg-zinc-800 transition-colors bg-zinc-900">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge variant={rank === 1 ? "default" : "secondary"} className={rank === 1 ? "bg-zinc-700 text-white border border-zinc-600" : "bg-zinc-800 text-gray-300 border border-zinc-700"}>
            #{rank}
          </Badge>
          <div className="flex items-center gap-2">
            <Mic className="h-4 w-4 text-green-400" />
            <h4 className="font-semibold text-white capitalize">{tone.tone}</h4>
          </div>
        </div>
        <span className="text-sm font-medium text-white bg-zinc-800 px-2 py-1 rounded-full border border-zinc-700">
          {tone.comparisonToAverage.toFixed(1)}× avg
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-400">Videos</p>
          <p className="font-semibold text-white">{tone.videoCount}</p>
        </div>
        <div>
          <p className="text-gray-400">Avg Engagement</p>
          <p className="font-semibold text-white">
            {(tone.avgEngagement * 100).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
}

function HookCard({ hook, rank }: { hook: HookPerformance; rank: number }) {
  return (
    <div className="border border-zinc-700 rounded-lg p-4 hover:bg-zinc-800 transition-colors bg-zinc-900">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge variant={rank === 1 ? "default" : "secondary"} className={rank === 1 ? "bg-zinc-700 text-white border border-zinc-600" : "bg-zinc-800 text-gray-300 border border-zinc-700"}>
            #{rank}
          </Badge>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-400" />
            <h4 className="font-semibold text-white capitalize">
              {hook.hookType.replace("-", " ")}
            </h4>
          </div>
        </div>
        <span className="text-sm font-medium text-white bg-zinc-800 px-2 py-1 rounded-full border border-zinc-700">
          {hook.comparisonToAverage.toFixed(1)}× avg
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-400">Videos</p>
          <p className="font-semibold text-white">{hook.videoCount}</p>
        </div>
        <div>
          <p className="text-gray-400">Avg Engagement</p>
          <p className="font-semibold text-white">
            {(hook.avgEngagement * 100).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
}

function DayCard({ day }: { day: DayPerformance }) {
  const maxEngagement = 0.15;
  const widthPercent = (day.avgEngagement / maxEngagement) * 100;

  return (
    <div className="border border-zinc-700 rounded-lg p-3 bg-zinc-900 hover:bg-zinc-800 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-white capitalize">{day.day}</span>
        <span className="text-sm text-gray-400">
          {(day.avgEngagement * 100).toFixed(1)}%
        </span>
      </div>
      <div className="w-full bg-zinc-800 rounded-full h-1.5">
        <div
          className="bg-purple-500 h-1.5 rounded-full transition-all"
          style={{ width: `${Math.min(widthPercent, 100)}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>{day.videoCount} videos</span>
        <span>{formatNumber(day.avgViews)} avg views</span>
      </div>
    </div>
  );
}

function TimeSlotCard({ timeSlot }: { timeSlot: TimeOfDayPerformance }) {
  const maxEngagement = 0.15;
  const widthPercent = (timeSlot.avgEngagement / maxEngagement) * 100;

  return (
    <div className="border border-zinc-700 rounded-lg p-3 bg-zinc-900 hover:bg-zinc-800 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="font-medium text-white capitalize">{timeSlot.timeSlot}</span>
          <p className="text-xs text-gray-500">{timeSlot.timeRange}</p>
        </div>
        <span className="text-sm text-gray-400">
          {(timeSlot.avgEngagement * 100).toFixed(1)}%
        </span>
      </div>
      <div className="w-full bg-zinc-800 rounded-full h-1.5">
        <div
          className="bg-purple-500 h-1.5 rounded-full transition-all"
          style={{ width: `${Math.min(widthPercent, 100)}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>{timeSlot.videoCount} videos</span>
        <span>{formatNumber(timeSlot.avgViews)} avg views</span>
      </div>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toFixed(0);
}