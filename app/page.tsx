"use client";

import { CTA } from "@/components/ui/cta";
import { useScroll, useTransform } from "motion/react";
import React from "react";
import { GoogleGeminiEffect } from "@/components/ui/google-gemini-effect";
import { HeroSection } from "@/components/ui/hero-section";
import { TestimonialsSection } from "@/components/ui/testimonials-with-marquee";
import { ContactUs } from "@/components/ui/contact-us";
import { AnimatedFeatures } from "@/components/ui/animated-features";

export default function HomePage() {
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const pathLengthFirst = useTransform(scrollYProgress, [0, 0.8], [0.2, 1.2]);
  const pathLengthSecond = useTransform(scrollYProgress, [0, 0.8], [0.15, 1.2]);
  const pathLengthThird = useTransform(scrollYProgress, [0, 0.8], [0.1, 1.2]);
  const pathLengthFourth = useTransform(scrollYProgress, [0, 0.8], [0.05, 1.2]);
  const pathLengthFifth = useTransform(scrollYProgress, [0, 0.8], [0, 1.2]);

  return (
    <div className="h-[400vh] bg-black w-full relative overflow-clip" ref={ref}>
      <GoogleGeminiEffect
        pathLengths={[
          pathLengthFirst,
          pathLengthSecond,
          pathLengthThird,
          pathLengthFourth,
          pathLengthFifth,
        ]}
      />

      <main className="absolute top-0 left-0 right-0 pt-28 pb-20 z-10 pointer-events-none">
        <div className="container mx-auto px-4">
          <div className="pointer-events-auto">
            <HeroSection />
          </div>

          {/* Animated Feature Cards Section */}
          <div className="mt-[450px] max-w-6xl mx-auto pointer-events-auto">
            <AnimatedFeatures />
          </div>

          {/* MASSIVE SCROLL GAP BEFORE TESTIMONIALS */}
          <div className="h-[40vh] w-full" />

          {/* Testimonials */}
          <div className="max-w-2xl mx-auto pointer-events-auto">
            <TestimonialsSection
              title="Trusted by creators worldwide"
              description=""
              testimonials={[
                {
                  author: {
                    name: "Sarah Johnson",
                    handle: "@sarahtech",
                    avatar:
                      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
                  },
                  text:
                    "CreatorMind helped me identify what my audience really wanted. My engagement increased by 40% in just two months!",
                },
                {
                  author: {
                    name: "Mike Chen",
                    handle: "@mikegaming",
                    avatar:
                      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
                  },
                  text:
                    "The weekly video ideas are spot-on. It's like having a data analyst on my team who actually understands my niche.",
                },
                {
                  author: {
                    name: "Emily Rodriguez",
                    handle: "@emilylifestyle",
                    avatar:
                      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
                  },
                  text:
                    "I used to spend hours brainstorming. Now I just check CreatorMind and create content I know will perform well.",
                },
                {
                  author: {
                    name: "David Kim",
                    handle: "@davidcooks",
                    avatar:
                      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
                  },
                  text:
                    "The insights are incredibly accurate. I've doubled my subscriber growth rate in 3 months.",
                },
                {
                  author: {
                    name: "Lisa Wang",
                    handle: "@lisafitness",
                    avatar:
                      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
                  },
                  text:
                    "Finally, data-driven content creation that actually works. My audience retention has never been better.",
                },
              ]}
            />
          </div>

          <div className="mt-16 max-w-6xl mx-auto pointer-events-auto">
            <CTA
              title="Ready to stop guessing?"
              description="Join creators who know exactly what their audience wants."
              primaryAction={{
                label: "Get Started Free",
                href: "/auth/signin",
              }}
            />
          </div>

          <div className="mt-32 mb-16 max-w-6xl mx-auto pointer-events-auto">
            <ContactUs />
          </div>

          <footer className="py-8 mt-20 border-t border-white/10 max-w-6xl mx-auto pointer-events-auto">
            <div className="text-center text-gray-400">
              <p>&copy; 2025 CreatorMind. Built for creators, by creators.</p>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
