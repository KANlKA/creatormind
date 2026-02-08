import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/mongodb";
import User from "@/models/User";
import Video from "@/models/Video";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get date range from query params
    const { searchParams } = new URL(request.url);
    const startMonth = searchParams.get("startMonth"); // Format: "2024-05"
    const endMonth = searchParams.get("endMonth"); // Format: "2024-08"

    let startDate: Date;
    let endDate: Date;

    if (startMonth && endMonth) {
      // Parse start month
      const [startYear, startMonthNum] = startMonth.split("-").map(Number);
      startDate = new Date(startYear, startMonthNum - 1, 1);

      // Parse end month and get last day
      const [endYear, endMonthNum] = endMonth.split("-").map(Number);
      endDate = new Date(endYear, endMonthNum, 0, 23, 59, 59, 999); // Last day of end month
    } else {
      // Default: last 90 days
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 90);
    }

    // Fetch videos within the date range
    const videos = await Video.find({
      userId: user._id,
      publishedAt: {
        $gte: startDate,
        $lte: endDate,
      },
    }).select("publishedAt engagementRate views likes commentCount title videoId");

    if (videos.length === 0) {
      return NextResponse.json({
        success: true,
        dailyData: [],
        availableMonths: [],
      });
    }

    // Group by day
    const dailyMap = new Map<string, any>();

    videos.forEach((video) => {
      const date = new Date(video.publishedAt);
      const dayKey = date.toISOString().split("T")[0]; // YYYY-MM-DD

      if (!dailyMap.has(dayKey)) {
        dailyMap.set(dayKey, {
          date: dayKey,
          engagements: [],
          views: 0,
          likes: 0,
          comments: 0,
          videos: [],
        });
      }

      const dayData = dailyMap.get(dayKey)!;
      dayData.engagements.push(video.engagementRate * 100);
      dayData.views += video.views;
      dayData.likes += video.likes;
      dayData.comments += video.commentCount;
      dayData.videos.push({
        title: video.title,
        videoId: video.videoId,
        engagement: video.engagementRate * 100,
        views: video.views,
        likes: video.likes,
        comments: video.commentCount,
      });
    });

    // Calculate daily averages and format data
    const dailyData = Array.from(dailyMap.values())
      .map((day) => ({
        date: day.date,
        engagement: Number(
          (
            day.engagements.reduce((sum: number, val: number) => sum + val, 0) /
            day.engagements.length
          ).toFixed(2)
        ),
        views: day.views,
        likes: day.likes,
        comments: day.comments,
        videosCount: day.videos.length,
        videos: day.videos,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Get available months for dropdown
    const allVideos = await Video.find({
      userId: user._id,
    }).select("publishedAt");

    const monthsSet = new Set<string>();
    allVideos.forEach((video) => {
      const date = new Date(video.publishedAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthsSet.add(monthKey);
    });

    const availableMonths = Array.from(monthsSet)
      .sort()
      .map((monthKey) => {
        const [year, month] = monthKey.split("-");
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return {
          value: monthKey,
          label: date.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          }),
        };
      });

    return NextResponse.json({
      success: true,
      dailyData,
      availableMonths,
    });
  } catch (error) {
    console.error("Error fetching daily engagement:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}