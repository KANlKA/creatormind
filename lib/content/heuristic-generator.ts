// lib/content/heuristic-generator.ts

export function generateHeuristicContent(idea: any, insights?: any) {

  const topicWords = idea.title
    ?.toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(" ")
    .filter((w: string) => w.length > 3) || [];

  const uniqueWords: string[] = Array.from(new Set(topicWords));


  // ====================
  // HASHTAGS
  // ====================

  const hashtags = uniqueWords
    .slice(0, 15)
    .map((w: string) => `#${w}`);

  // ====================
  // TITLE VARIANTS
  // ====================

  const topic = idea.title;

  const titleTemplates = [
    `5 Mistakes Beginners Make in ${topic}`,
    `The Ultimate Guide to ${topic}`,
    `${topic} Explained Simply`,
    `What Nobody Tells You About ${topic}`,
    `Beginner to Pro: ${topic}`,
    `I Tried ${topic} So You Don't Have To`,
    `Stop Doing This in ${topic}`,
    `${topic} — Complete Breakdown`,
    `How I Mastered ${topic}`,
    `${topic}: Step-by-Step Tutorial`
  ];

  // ====================
  // SCRIPT BUILDER
  // ====================

  const hook = idea.suggestedStructure?.hook || "";
  const format = idea.suggestedStructure?.format || "educational";
  const tone = idea.suggestedStructure?.tone || "friendly";

  const script = `
HOOK:
${hook}

INTRO:
Today we're covering ${topic}. If you've been struggling with this, you're in the right place.

SECTION 1:
Explain the core concept of ${topic} simply.

SECTION 2:
Common mistakes people make and how to avoid them.

SECTION 3:
Advanced insights based on creator experience.

ENGAGEMENT:
Ask viewers about their biggest challenge with ${topic}.

OUTRO:
Subscribe for more ${format} content delivered in a ${tone} tone.
`;

  return {
    hashtags,
    titleVariants: titleTemplates,
    script
  };
}
