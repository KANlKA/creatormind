import { sendEmailViaMailjet } from "./mailjet";
import { render } from "@react-email/render";
import { WeeklyInsightsEmailTemplate } from "./weekly-insights-template";
import GeneratedIdea from "@/models/GeneratedIdea";
import User from "@/models/User";
import connectDB from "@/lib/db/mongodb";
import crypto from "crypto";

export async function sendWeeklyEmail({
  user,
  ideasDoc,
  ideas,
}: {
  user: any;
  ideasDoc: any;
  ideas: any[];
}) {
  await connectDB();

  const secret = process.env.UNSUBSCRIBE_SECRET || "default_unsub_secret";
  const unsubscribeToken = crypto
    .createHmac("sha256", secret)
    .update(user._id.toString())
    .digest("hex");

  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/unsubscribe?uid=${user._id.toString()}&token=${unsubscribeToken}`;

  // ONLY send ideas, no insights or patterns
  // Render email template with ONLY ideas
  const emailHtml = await render(
    <WeeklyInsightsEmailTemplate
      userName={user.name || "Creator"}
      ideas={ideas}
      insights={[]} // Empty insights
      patterns={[]} // Empty patterns
      actions={[]} // Empty actions
      unsubscribeUrl={unsubscribeUrl}
    />
  );

  // Send via Mailjet
  const result = await sendEmailViaMailjet({
    to: user.email,
    subject: `Your Weekly Video Ideas - ${ideas.length} Ideas to Create This Week`,
    htmlContent: emailHtml,
    unsubscribeUrl,
  });

  if (result.success) {
    // Log the email send
    const EmailLog = (await import("@/models/EmailLog")).default;
    await EmailLog.create({
      userId: user._id,
      recipientEmail: user.email,
      subject: `Your Weekly Video Ideas - ${ideas.length} Ideas to Create This Week`,
      status: "sent",
      mailjetMessageId: result.messageId,
      ideaCount: ideas.length,
      sentAt: new Date(),
    });

    // Update GeneratedIdea status if exists
    if (ideasDoc?._id) {
      await GeneratedIdea.findByIdAndUpdate(ideasDoc._id, {
        emailStatus: "sent",
        emailSentAt: new Date(),
      });
    }
  }

  return result;
}