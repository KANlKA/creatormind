import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/mongodb";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userEmail = session.user?.email;
    if (!userEmail) {
      return NextResponse.json(
        { error: "User email not found in session" },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return NextResponse.json(
        { error: "User profile not found. Please log in again." },
        { status: 404 }
      );
    }

    // Ensure settings object exists
    if (!user.settings) {
      user.settings = {
        emailEnabled: false,
        emailFrequency: "weekly",
        emailDay: "sunday",
        emailTime: "09:00",
        timezone: "UTC",
        ideaCount: 5,
        preferences: {
          focusAreas: [],
          avoidTopics: [],
          preferredFormats: [],
        },
      };
      await user.save();
    }

    // Return user settings with defaults
    return NextResponse.json({
      success: true,
      settings: {
        emailEnabled: user.settings?.emailEnabled ?? false,
        emailFrequency: user.settings?.emailFrequency ?? "weekly",
        emailDay: user.settings?.emailDay ?? "sunday",
        emailTime: user.settings?.emailTime ?? "09:00",
        timezone: user.settings?.timezone ?? "UTC",
        ideaCount: user.settings?.ideaCount ?? 5,
        preferences: {
          focusAreas: user.settings?.preferences?.focusAreas ?? [],
          avoidTopics: user.settings?.preferences?.avoidTopics ?? [],
          preferredFormats: user.settings?.preferences?.preferredFormats ?? [],
        },
      },
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name || "User",
      },
    });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return NextResponse.json(
      {
        error: "Failed to load settings",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userEmail = session.user?.email;
    if (!userEmail) {
      return NextResponse.json(
        { error: "User email not found in session" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { settings } = body;

    if (!settings) {
      return NextResponse.json(
        { error: "Settings data required" },
        { status: 400 }
      );
    }

    // Validate settings
    if (
      settings.ideaCount &&
      ![3, 5, 10].includes(parseInt(settings.ideaCount))
    ) {
      return NextResponse.json(
        { error: "Invalid idea count. Must be 3, 5, or 10." },
        { status: 400 }
      );
    }

    if (
      settings.emailFrequency &&
      !["weekly", "biweekly", "monthly"].includes(settings.emailFrequency)
    ) {
      return NextResponse.json(
        { error: "Invalid frequency. Must be weekly, biweekly, or monthly." },
        { status: 400 }
      );
    }

    // Update user settings
    const user = await User.findOneAndUpdate(
      { email: userEmail },
      {
        $set: {
          "settings.emailEnabled":
            settings.emailEnabled !== undefined ? settings.emailEnabled : false,
          "settings.emailFrequency":
            settings.emailFrequency || "weekly",
          "settings.emailDay": settings.emailDay || "sunday",
          "settings.emailTime": settings.emailTime || "09:00",
          "settings.timezone": settings.timezone || "UTC",
          "settings.ideaCount": settings.ideaCount || 5,
          "settings.preferences.focusAreas":
            settings.preferences?.focusAreas || [],
          "settings.preferences.avoidTopics":
            settings.preferences?.avoidTopics || [],
          "settings.preferences.preferredFormats":
            settings.preferences?.preferredFormats || [],
          "settings.updatedAt": new Date(),
        },
      },
      { new: true, upsert: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: "Failed to update user settings" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Settings saved successfully",
      settings: {
        emailEnabled: user.settings?.emailEnabled ?? false,
        emailFrequency: user.settings?.emailFrequency ?? "weekly",
        emailDay: user.settings?.emailDay ?? "sunday",
        emailTime: user.settings?.emailTime ?? "09:00",
        timezone: user.settings?.timezone ?? "UTC",
        ideaCount: user.settings?.ideaCount ?? 5,
        preferences: {
          focusAreas: user.settings?.preferences?.focusAreas ?? [],
          avoidTopics: user.settings?.preferences?.avoidTopics ?? [],
          preferredFormats: user.settings?.preferences?.preferredFormats ?? [],
        },
      },
    });
  } catch (error) {
    console.error("Error saving preferences:", error);
    return NextResponse.json(
      {
        error: "Failed to save settings",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}