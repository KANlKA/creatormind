"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CTA } from "@/components/ui/cta";
import { ArrowRight, Brain, TrendingUp, Lightbulb, Mail } from "lucide-react";
import dynamic from "next/dynamic";
import BlurText from "@/components/ui/blur-text";

const Aurora = dynamic(() => import("@/components/Aurora"), { ssr: false });

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Aurora Background */}
      <div className="absolute top-0 left-0 right-0 z-0" style={{ height: '900px' }}>
        <Aurora
          colorStops={["#7306E0", "#A149E9", "#A8F5F5"]}
          blend={0.5}
          amplitude={1.0}
          speed={1}
        />
      </div>
      {/* Header */}
      <header className="container mx-auto px-4 py-6 relative z-10">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="CreatorMind Logo"
              width={56}
              height={56}
              className="object-contain"
            />
            <span className="text-2xl font-bold text-white">CreatorMind</span>
          </Link>
          <Link href="/auth/signin">
            <Button variant="outline" className="text-white border-white hover:bg-white/10">
              Sign In
            </Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-4">
            <BlurText
              text="Know exactly what to create next"
              delay={50}
              animateBy="words"
              direction="top"
              className="text-3xl md:text-5xl font-bold text-white justify-center"
            />
          </div>
          <div className="mb-8 space-y-2">
            <BlurText
              text="AI-powered insights from YOUR videos and audience."
              delay={30}
              animateBy="words"
              direction="top"
              className="text-xl md:text-2xl text-gray-300 justify-center"
            />
            <BlurText
              text="No guessing. No trends. Just data-driven ideas."
              delay={30}
              animateBy="words"
              direction="top"
              className="text-xl md:text-2xl text-gray-300 justify-center"
            />
          </div>
          <Link href="/auth/signin">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-3 py-4">
              Connect Your YouTube Channel
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="text-gray-400 mt-4">Free • No credit card required</p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-14 mt-20">
          <FeatureCard
            icon={<Brain className="h-10 w-10 text-purple-400" />}
            title="Deep Analysis"
            description="We analyze ALL your videos, comments, and patterns to understand what truly works for YOUR channel."
          />
          <FeatureCard
            icon={<Lightbulb className="h-10 w-10 text-yellow-400" />}
            title="Top 5 Ideas Weekly"
            description="Every week, get 5 video ideas backed by evidence from your own audience and performance data."
          />
          <FeatureCard
            icon={<TrendingUp className="h-10 w-10 text-green-400" />}
            title="Predict Performance"
            description="See predicted engagement for each idea with confidence scores based on your historical data."
          />
        </div>

        {/* How it works */}
        <div className="mt-32 text-center">
          <h2 className="text-4xl font-bold text-white mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <Step number={1} title="Connect" description="Link your YouTube channel in one click" />
            <Step number={2} title="Analyze" description="We study all your videos and comments" />
            <Step number={3} title="Discover" description="See what's working and what's not" />
            <Step number={4} title="Create" description="Get weekly ideas with proven potential" />
          </div>
        </div>

        {/* CTA */}
        <div className="mt-32">
          <CTA
            variant="solid"
            title="Ready to stop guessing?"
            description="Join creators who know exactly what their audience wants."
            primaryAction={{
              label: "Get Started Free",
              href: "/auth/signin"
            }}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-20 border-t border-white/10">
        <div className="text-center text-gray-400">
          <p>&copy; 2025 CreatorMind. Built for creators, by creators.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all">
      <div className="mb-4">{icon}</div>
      <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
}

function Step({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="relative">
      <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
}