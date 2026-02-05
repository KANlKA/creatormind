import { NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { getSyncProgress } from "@/lib/youtube/sync";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const progress = getSyncProgress(session.user.id);

    if (!progress) {
      return NextResponse.json({
        status: 'idle',
        message: 'No sync in progress'
      });
    }

    return NextResponse.json(progress);
  } catch (error) {
    console.error("Error fetching sync progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
