import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import User from "@/models/User";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const uid = searchParams.get("uid");
    const token = searchParams.get("token");

    if (!uid || !token) {
      return NextResponse.json(
        { error: "Missing unsubscribe parameters" },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify token
    const secret = process.env.UNSUBSCRIBE_SECRET || "default_unsub_secret";
    const expectedToken = crypto
      .createHmac("sha256", secret)
      .update(uid)
      .digest("hex");

    if (token !== expectedToken) {
      return NextResponse.json(
        { error: "Invalid unsubscribe token" },
        { status: 401 }
      );
    }

    // Update user - disable emails
    const user = await User.findByIdAndUpdate(
      uid,
      {
        "settings.emailEnabled": false,
        "settings.emailDisabledAt": new Date(),
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Return HTML page
    return new NextResponse(
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CreatorMind - Unsubscribed</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: linear-gradient(to br, #f8fafc via #ffffff to #f1f5f9);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      max-width: 500px;
      width: 100%;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      padding: 40px;
      text-align: center;
    }
    .icon {
      width: 64px;
      height: 64px;
      background: #fee2e2;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      font-size: 32px;
    }
    h1 {
      font-size: 28px;
      color: #0f172a;
      margin-bottom: 12px;
    }
    .subtitle {
      font-size: 16px;
      color: #64748b;
      margin-bottom: 24px;
      line-height: 1.6;
    }
    .message {
      background: #f1f5f9;
      border-left: 4px solid #6366f1;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;
      text-align: left;
      font-size: 14px;
      color: #334155;
    }
    .actions {
      display: flex;
      gap: 12px;
      flex-direction: column;
    }
    button {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .btn-primary {
      background: #6366f1;
      color: white;
    }
    .btn-primary:hover {
      background: #4f46e5;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
    }
    .btn-secondary {
      background: #e2e8f0;
      color: #0f172a;
    }
    .btn-secondary:hover {
      background: #cbd5e1;
    }
    .footer {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">✓</div>
    <h1>You're unsubscribed</h1>
    <p class="subtitle">We've stopped sending you weekly emails. You can re-enable them anytime from your settings.</p>
    
    <div class="message">
      <strong>What happens next:</strong><br/>
      • No more weekly emails will be sent<br/>
      • Your account and data remain intact<br/>
      • You can re-enable emails anytime in settings
    </div>

    <div class="actions">
      <button class="btn-primary" onclick="goToSettings()">Go to Settings to Re-enable</button>
      <button class="btn-secondary" onclick="goHome()">Back to Home</button>
    </div>

    <div class="footer">
      <p>CreatorMind © 2025 | Need help? <a href="mailto:support@creatormind.ai" style="color: #6366f1; text-decoration: none;">Contact Support</a></p>
    </div>
  </div>

  <script>
    function goToSettings() {
      // Wait 1 second for smooth transition
      setTimeout(() => {
        window.location.href = '/settings';
      }, 300);
    }

    function goHome() {
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 300);
    }
  </script>
</body>
</html>`,
      {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      }
    );
  } catch (error) {
    console.error("Error processing unsubscribe:", error);
    return new NextResponse(
      `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #f8fafc;
      margin: 0;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      text-align: center;
      max-width: 400px;
    }
    h1 { color: #dc2626; margin-bottom: 10px; }
    p { color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <h1>❌ Unsubscribe Failed</h1>
    <p>There was an error processing your unsubscribe request. Please try again or contact support.</p>
  </div>
</body>
</html>`,
      {
        status: 500,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      }
    );
  }
}