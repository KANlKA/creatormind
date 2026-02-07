"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, TrendingUp, Lightbulb, Mail } from "lucide-react";
import dynamic from "next/dynamic";

const Orb = dynamic(() => import("@/components/Orb"), { ssr: false });

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Orb Background */}
      <div className="absolute inset-0 flex items-start justify-center pt-20" style={{ pointerEvents: 'none' }}>
        <div style={{ width: '600px', height: '600px', position: 'relative', pointerEvents: 'auto' }}>
          <Orb
            hoverIntensity={2}
            rotateOnHover
            hue={0}
            forceHoverState={false}
            backgroundColor="#000000"
          />
        </div>
      </div>
      {/* Header */}
      <header className="container mx-auto px-4 py-6 relative z-10">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">CreatorMind</span>
          </div>
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
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Know <span className="text-purple-400">exactly</span> what to create next
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            AI-powered insights from YOUR videos and audience.
            <br />
            No guessing. No trends. Just data-driven ideas.
          </p>
          <Link href="/auth/signin">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 py-6">
              Connect Your YouTube Channel
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="text-gray-400 mt-4">Free • No credit card required</p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
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
        <div className="mt-32 text-center bg-purple-900/30 backdrop-blur-sm rounded-3xl p-12">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to stop guessing?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join creators who know exactly what their audience wants.
          </p>
          <Link href="/auth/signin">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 py-6">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
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