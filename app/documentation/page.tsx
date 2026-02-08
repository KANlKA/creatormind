"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Video,
  Brain,
  Mail,
  BarChart3,
  Settings,
  Zap,
  Shield,
  HelpCircle,
} from "lucide-react";

export default function DocumentationPage() {
  const router = useRouter();

  const features = [
    {
      icon: <Brain className="h-8 w-8 text-white" />,
      title: "AI-Powered Video Ideas",
      description:
        "Get intelligent video content suggestions based on your channel's performance, audience comments, and trending topics. Each idea includes predicted engagement rates and confidence scores.",
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-white" />,
      title: "Performance Analytics",
      description:
        "Analyze your top-performing content formats, tones, hooks, and upload times. Discover patterns in what resonates with your audience and optimize your content strategy.",
    },
    {
      icon: <Mail className="h-8 w-8 text-white" />,
      title: "Weekly Email Insights",
      description:
        "Receive personalized weekly emails with your top 5 video ideas, key insights from your data, performance patterns, and actionable recommendations. Fully customizable frequency and preferences.",
    },
    {
      icon: <Video className="h-8 w-8 text-white" />,
      title: "Channel Management",
      description:
        "Connect your YouTube channel, manage your content, and control how often we sync your data. Monitor sync status and keep your information up-to-date.",
    },
    {
      icon: <Zap className="h-8 w-8 text-white" />,
      title: "Real-Time Recommendations",
      description:
        "Get instant access to video ideas and insights based on your latest video performance and audience feedback. Powered by advanced AI analysis.",
    },
    {
      icon: <Shield className="h-8 w-8 text-white" />,
      title: "Privacy & Security",
      description:
        "Your data is secure and encrypted. We only access publicly available YouTube data and use industry-standard security practices to protect your information.",
    },
  ];

  const emailFeatures = [
    {
      title: "Top Video Ideas",
      description: "Get 3-10 AI-generated video ideas based on your preferences",
    },
    {
      title: "Confidence Scores",
      description: "Each idea includes predicted engagement and confidence metrics",
    },
    {
      title: "Why It Works",
      description: "Understand the reasoning behind each recommendation",
    },
    {
      title: "Action Items",
      description: "Get practical steps to implement and track your new video content",
    },
    {
      title: "Content Filtering",
      description:
        "Ideas are filtered based on your focus areas, avoided topics, and preferred formats",
    },
    {
      title: "One-Click Unsubscribe",
      description: "Manage your email preferences anytime with a single click",
    },
  ];

  const contentPreferences = [
    {
      title: "Focus Areas",
      description:
        "Specify topics you want to focus on. Ideas will prioritize these subjects (e.g., AI, Machine Learning, Python)",
    },
    {
      title: "Avoid Topics",
      description:
        "Tell us which topics to skip. We'll exclude these from all recommendations (e.g., Politics, Religion)",
    },
    {
      title: "Preferred Formats",
      description:
        "Choose the video formats you like creating (e.g., tutorials, vlogs, deep-dives, shorts, compilations)",
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Navbar space */}
      <div className="h-20" />

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-10 w-10 text-white" />
            <h1 className="text-4xl font-bold text-white">CreatorMind Documentation</h1>
          </div>
          <p className="text-xl text-gray-400">
            Master the features that help you create better content
          </p>
        </div>

        {/* Quick Navigation */}
        <Card className="bg-zinc-900 border-zinc-700 hover:bg-zinc-800 transition-colors">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-4 gap-3">
              <Button
                variant="outline"
                className="border-zinc-600 text-gray-300 hover:bg-zinc-800"
                onClick={() =>
                  document
                    .getElementById("getting-started")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Getting Started
              </Button>
              <Button
                variant="outline"
                className="border-zinc-600 text-gray-300 hover:bg-zinc-800"
                onClick={() =>
                  document
                    .getElementById("features")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Features
              </Button>
              <Button
                variant="outline"
                className="border-zinc-600 text-gray-300 hover:bg-zinc-800"
                onClick={() =>
                  document
                    .getElementById("email-setup")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Email Setup
              </Button>
              <Button
                variant="outline"
                className="border-zinc-600 text-gray-300 hover:bg-zinc-800"
                onClick={() =>
                  document
                    .getElementById("faq")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                FAQ
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started */}
        <section id="getting-started" className="scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4 text-white">Getting Started</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-zinc-900 border-zinc-700 hover:bg-zinc-800 transition-colors">
              <CardHeader>
                <div className="text-3xl font-bold text-white">1</div>
                <CardTitle className="text-white">Connect Your Channel</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-400">
                Go to Dashboard and click "Connect YouTube Channel" to link your
                YouTube account. You'll need to authorize CreatorMind to access
                your channel data.
              </CardContent>
            </Card>
            <Card className="bg-zinc-900 border-zinc-700 hover:bg-zinc-800 transition-colors">
              <CardHeader>
                <div className="text-3xl font-bold text-white">2</div>
                <CardTitle className="text-white">Set Your Preferences</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-400">
                Visit Settings to customize your email frequency, content
                preferences, focus areas, and avoided topics. These settings
                directly impact the ideas you receive.
              </CardContent>
            </Card>
            <Card className="bg-zinc-900 border-zinc-700 hover:bg-zinc-800 transition-colors">
              <CardHeader>
                <div className="text-3xl font-bold text-white">3</div>
                <CardTitle className="text-white">Receive Ideas</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-400">
                Get personalized video ideas via email on your chosen schedule.
                Every idea includes why it will work and how to implement it.
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Core Features */}
        <section id="features" className="scroll-mt-20">
          <h2 className="text-2xl font-bold mb-6 text-white">Core Features</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature, idx) => (
              <Card key={idx} className="bg-zinc-900 border-zinc-700 hover:bg-zinc-800 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {feature.icon}
                    <CardTitle className="text-lg text-white">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-gray-400">
                  {feature.description}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Email Features */}
        <section id="email-setup" className="scroll-mt-20">
          <h2 className="text-2xl font-bold mb-6 text-white">Weekly Email Insights</h2>
          <p className="text-gray-400 mb-6">
            Your weekly emails include everything you need to plan your next
            videos. Here's what you'll receive:
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {emailFeatures.map((feature, idx) => (
              <Card key={idx} className="bg-zinc-900 border-zinc-700 hover:bg-zinc-800 transition-colors">
                <CardHeader>
                  <CardTitle className="text-base text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-400">
                  {feature.description}
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-zinc-900 border-zinc-700 hover:bg-zinc-800 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Mail className="h-5 w-5 text-white" />
                Content Preferences in Emails
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-300">
                Your content preferences (focus areas, avoided topics, and
                preferred formats) are applied to all ideas sent via email. This
                ensures you only receive relevant suggestions.
              </p>
              <p className="text-sm font-medium text-white">
                Update your preferences in Settings anytime:
              </p>
              <div className="grid gap-3">
                {contentPreferences.map((pref, idx) => (
                  <div key={idx} className="text-sm">
                    <span className="font-medium text-white">
                      {pref.title}:
                    </span>{" "}
                    <span className="text-gray-400">{pref.description}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Email Customization */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-white">Customize Your Emails</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-zinc-900 border-zinc-700 hover:bg-zinc-800 transition-colors">
              <CardHeader>
                <CardTitle className="text-base text-white">
                  Email Frequency Options
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-400 space-y-2">
                <p>
                  <span className="font-medium text-white">Weekly:</span> Get fresh ideas
                  every 7 days
                </p>
                <p>
                  <span className="font-medium text-white">Bi-Weekly:</span> Receive ideas
                  every 14 days
                </p>
                <p>
                  <span className="font-medium text-white">Monthly:</span> Monthly digest
                  of ideas
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-700 hover:bg-zinc-800 transition-colors">
              <CardHeader>
                <CardTitle className="text-base text-white">
                  Scheduling Your Emails
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-400 space-y-2">
                <p>
                  <span className="font-medium text-white">Day:</span> Choose any day of
                  the week
                </p>
                <p>
                  <span className="font-medium text-white">Time:</span> Set your preferred
                  time
                </p>
                <p>
                  <span className="font-medium text-white">Timezone:</span> Automatic
                  timezone detection
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-20">
          <h2 className="text-2xl font-bold mb-6 text-white">Frequently Asked Questions</h2>
          <div className="space-y-3">
            <Card className="bg-zinc-900 border-zinc-700 hover:bg-zinc-800 transition-colors">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-white">
                  <HelpCircle className="h-5 w-5 text-white" />
                  How often is my channel data updated?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-400">
                Your channel data syncs automatically. You can manually refresh
                by clicking "Re-sync Channel" in Settings at any time.
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-700 hover:bg-zinc-800 transition-colors">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-white">
                  <HelpCircle className="h-5 w-5 text-white" />
                  Can I change my content preferences anytime?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-400">
                Yes! Your content preferences update immediately. Future ideas
                will reflect your new focus areas, avoided topics, and preferred
                formats.
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-700 hover:bg-zinc-800 transition-colors">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-white">
                  <HelpCircle className="h-5 w-5 text-white" />
                  What if I want to unsubscribe from emails?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-400">
                You can disable emails in Settings, or click the unsubscribe
                link at the bottom of any email. No questions asked!
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-700 hover:bg-zinc-800 transition-colors">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-white">
                  <HelpCircle className="h-5 w-5 text-white" />
                  How are video ideas generated?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-400">
                Ideas are generated using AI analysis of your channel's
                performance, audience comments, trending topics, and your
                content preferences. Each idea includes a confidence score and
                reasoning.
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-700 hover:bg-zinc-800 transition-colors">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-white">
                  <HelpCircle className="h-5 w-5 text-white" />
                  Is my data secure?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-400">
                Yes! We use industry-standard encryption and only access publicly
                available YouTube data. Your privacy is our priority.
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Support */}
        <Card className="bg-zinc-900 border-zinc-700 hover:bg-zinc-800 transition-colors">
          <CardHeader>
            <CardTitle className="text-white">Need Help?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300">
              Can't find what you're looking for? Check out our support channels:
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button
                onClick={() =>
                  (window.location.href = "mailto:support@creatormind.ai")
                }
                className="bg-zinc-700 hover:bg-zinc-600 border border-zinc-600 text-white"
              >
                Contact Support
              </Button>
              <Button
                variant="outline"
                className="border-zinc-600 text-gray-300 hover:bg-zinc-800"
                onClick={() => router.push("/settings")}
              >
                Go to Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="flex justify-center pt-6">
          <Button
            variant="outline"
            className="gap-2 border-zinc-600 text-gray-300 hover:bg-zinc-800"
            onClick={() => router.back()}
          >
            ← Back
          </Button>
        </div>
      </div>
    </div>
  );
}