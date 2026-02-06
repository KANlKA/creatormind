import { NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db/mongodb";
import User from "@/models/User";
import Video from "@/models/Video";
import Comment from "@/models/Comment";

interface BrandCollaborationData {
  industries: Array<{
    name: string;
    score: number;
    reason: string;
    videoCount: number;
  }>;
  potentialBrands: Array<{
    industry: string;
    brandExamples: string[];
    contentAlignment: string;
    fitScore: number;
    reasoning: string;
  }>;
  contentStyles: Array<{
    style: string;
    metric: string;
    value: string;
    sponsorshipAppeal: string;
  }>;
  audienceInsights: {
    topInterests: string[];
    demographicIndicators: string[];
    engagementPatterns: string[];
  };
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch all user's videos with analysis
    const videos = await Video.find({ userId: user._id });

    console.log(`[BRAND COLLAB] Found ${videos.length} videos for user`);
    console.log(`[BRAND COLLAB] Sample video analysis:`, videos[0]?.analysis);

    if (videos.length === 0) {
      return NextResponse.json({
        industries: [],
        potentialBrands: [],
        contentStyles: [],
        audienceInsights: {
          topInterests: [],
          demographicIndicators: [],
          engagementPatterns: [],
        },
      });
    }

    // Fetch all comments for analysis
    const videoIds = videos.map((v) => v._id);
    const comments = await Comment.find({ videoId: { $in: videoIds } });

    console.log(`[BRAND COLLAB] Found ${comments.length} comments`);

    // Analyze data
    const analysis = analyzeForBrandCollaboration(videos, comments);

    console.log(`[BRAND COLLAB] Analysis result - Industries: ${analysis.industries.length}, Brands: ${analysis.potentialBrands.length}`);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Error analyzing brand collaboration:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function analyzeForBrandCollaboration(
  videos: any[],
  comments: any[]
): BrandCollaborationData {
  // Enhanced topic-to-industry mapping with comprehensive keywords
  const enhancedTopicMap: Record<string, { keywords: string[]; industries: string[] }> = {
    tech: {
      keywords: ["tech", "software", "code", "coding", "programming", "developer", "dev", "app", "web", "website", "digital", "ai", "artificial intelligence", "ml", "machine learning", "python", "javascript", "js", "react", "node", "vue", "angular", "cloud", "data", "database", "api", "backend", "frontend", "fullstack", "computer", "IT", "cyber"],
      industries: ["Technology", "Software", "SaaS", "Developer Tools", "Cloud Services"]
    },
    gaming: {
      keywords: ["game", "gaming", "gamer", "esports", "e-sports", "stream", "streamer", "twitch", "console", "pc gaming", "mobile game", "fps", "mmo", "rpg", "minecraft", "fortnite", "valorant", "gameplay"],
      industries: ["Gaming", "Esports", "Gaming Hardware", "Game Development", "Streaming"]
    },
    education: {
      keywords: ["education", "learning", "tutorial", "teach", "lesson", "course", "study", "student", "school", "university", "college", "training", "guide", "how to", "beginner", "learn"],
      industries: ["Education", "EdTech", "E-learning", "Online Courses", "Publishing"]
    },
    fitness: {
      keywords: ["fitness", "workout", "exercise", "gym", "training", "health", "wellness", "muscle", "cardio", "yoga", "running", "weight", "nutrition", "diet", "bodybuilding"],
      industries: ["Health & Fitness", "Sports", "Nutrition", "Wellness", "Athletic Wear"]
    },
    beauty: {
      keywords: ["beauty", "makeup", "cosmetic", "skincare", "skin care", "hair", "nails", "fashion", "style", "glam", "tutorial", "product review"],
      industries: ["Beauty", "Cosmetics", "Skincare", "Fashion", "Lifestyle"]
    },
    food: {
      keywords: ["food", "cooking", "recipe", "chef", "kitchen", "meal", "eat", "restaurant", "baking", "cuisine", "dish", "cook", "culinary"],
      industries: ["Food & Beverage", "Restaurants", "Kitchen Appliances", "Cookware", "Meal Kits"]
    },
    travel: {
      keywords: ["travel", "trip", "vacation", "tour", "destination", "explore", "adventure", "flight", "hotel", "tourism", "visit", "journey"],
      industries: ["Travel", "Hospitality", "Tourism", "Transportation", "Hotels"]
    },
    finance: {
      keywords: ["finance", "money", "invest", "trading", "stock", "crypto", "bitcoin", "ethereum", "bank", "credit", "saving", "budget", "wealth", "financial"],
      industries: ["Finance", "FinTech", "Investment", "Banking", "Cryptocurrency"]
    },
    business: {
      keywords: ["business", "entrepreneur", "startup", "company", "marketing", "sales", "productivity", "management", "strategy", "growth", "brand"],
      industries: ["Business", "SaaS", "Productivity Tools", "Professional Services", "Marketing"]
    },
    entertainment: {
      keywords: ["entertainment", "movie", "film", "music", "celebrity", "show", "series", "tv", "comedy", "review", "reaction"],
      industries: ["Entertainment", "Media", "Streaming", "Events", "Production"]
    },
    fashion: {
      keywords: ["fashion", "style", "outfit", "clothing", "clothes", "wear", "dress", "trend", "designer", "wardrobe", "apparel"],
      industries: ["Fashion", "Apparel", "Accessories", "Retail", "Lifestyle"]
    },
    music: {
      keywords: ["music", "song", "audio", "sound", "beat", "producer", "dj", "instrument", "guitar", "piano", "vocal", "artist", "band"],
      industries: ["Music", "Audio Equipment", "Instruments", "Streaming", "Production"]
    },
    art: {
      keywords: ["art", "design", "creative", "draw", "paint", "graphic", "illustration", "artist", "digital art", "photoshop", "sketch"],
      industries: ["Art & Design", "Creative Tools", "Software", "Craft Supplies", "Publishing"]
    },
    science: {
      keywords: ["science", "research", "experiment", "biology", "chemistry", "physics", "engineering", "lab", "discovery", "theory"],
      industries: ["Science", "Education", "Research Tools", "Publishing", "Technology"]
    },
    sports: {
      keywords: ["sports", "athlete", "football", "basketball", "soccer", "tennis", "baseball", "competition", "team", "player", "match"],
      industries: ["Sports", "Athletic Wear", "Equipment", "Sports Media", "Health & Fitness"]
    },
    photography: {
      keywords: ["photo", "photography", "camera", "lens", "portrait", "photographer", "image", "picture", "shoot", "editing"],
      industries: ["Photography", "Camera Equipment", "Software", "Creative Tools"]
    },
    automotive: {
      keywords: ["car", "auto", "vehicle", "driving", "automotive", "engine", "motor", "truck", "racing", "tesla", "review"],
      industries: ["Automotive", "Transportation", "Auto Parts", "Electric Vehicles"]
    },
    home: {
      keywords: ["home", "house", "interior", "decor", "diy", "furniture", "garden", "cleaning", "organization", "renovation"],
      industries: ["Home & Garden", "Furniture", "DIY Tools", "Home Improvement", "Lifestyle"]
    }
  };

  // Industry scoring with enhanced matching
  const industryScores: Record<string, { score: number; videos: number; topics: Set<string>; subtopics: Set<string> }> = {};

  // Analyze video topics with subtopics
  videos.forEach((video, index) => {
    // Use AI analysis if available AND meaningful, otherwise fall back to title + description
    let allTopics: string[] = [];
    const vagueTopics = ["general", "content", "video", "n/a", "various", "other", "misc"];

    if (video.analysis?.topic && !vagueTopics.includes(video.analysis.topic.toLowerCase())) {
      const topic = video.analysis.topic.toLowerCase();
      const subtopics = (video.analysis.subtopics || []).map((s: string) => s.toLowerCase());
      allTopics = [topic, ...subtopics];

      if (index === 0) {
        console.log(`[BRAND COLLAB] Using AI analysis - Topic: "${topic}"`);
        console.log(`[BRAND COLLAB] Subtopics:`, subtopics);
      }
    } else {
      // Fallback: use title and description when no analysis OR topic is too vague
      const titleAndDesc = `${video.title || ""} ${video.description || ""}`.toLowerCase();
      allTopics = [titleAndDesc];

      if (index === 0) {
        console.log(`[BRAND COLLAB] Topic too vague or missing, using title/description fallback`);
        console.log(`[BRAND COLLAB] Title: "${video.title}"`);
      }
    }

    if (allTopics.length === 0 || allTopics[0].trim() === "") {
      return; // Skip videos with no data
    }

    const matchedIndustries = new Set<string>();

      // Enhanced matching: check if ANY keyword matches ANY topic or subtopic
      for (const topicText of allTopics) {
        for (const [category, data] of Object.entries(enhancedTopicMap)) {
          const hasMatch = data.keywords.some(keyword => {
            // Bidirectional matching: keyword in topic OR topic in keyword
            return topicText.includes(keyword) || keyword.includes(topicText.split(' ')[0]);
          });

          if (hasMatch && index === 0) {
            console.log(`[BRAND COLLAB] Matched category "${category}" for topic "${topicText}"`);
          }

          if (hasMatch) {
            data.industries.forEach(industry => matchedIndustries.add(industry));
          }
        }
      }

      if (index === 0) {
        console.log(`[BRAND COLLAB] First video matched industries:`, Array.from(matchedIndustries));
      }

      // Score based on engagement and views
      const engagementScore = video.engagementRate || 0;
      const viewScore = Math.min(video.views / 10000, 10); // Cap at 10

      matchedIndustries.forEach((industry) => {
        if (!industryScores[industry]) {
          industryScores[industry] = { score: 0, videos: 0, topics: new Set(), subtopics: new Set() };
        }
        industryScores[industry].score += engagementScore * 100 + viewScore;
        industryScores[industry].videos += 1;

        // Add the actual topic text (from allTopics array)
        allTopics.forEach(t => {
          if (t && t.length > 0) {
            industryScores[industry].topics.add(t.substring(0, 50)); // Limit length for display
          }
        });
      });
  });

  // Analyze comment topics for audience interests
  const commentTopicCounts: Record<string, number> = {};
  comments.forEach((comment) => {
    comment.topics?.forEach((topic: string) => {
      commentTopicCounts[topic] = (commentTopicCounts[topic] || 0) + 1;
    });
  });

  const topCommentTopics = Object.entries(commentTopicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([topic]) => topic);

  // Build industries list with detailed reasons
  const industries = Object.entries(industryScores)
    .map(([name, data]) => {
      const allTopics = Array.from(new Set([...data.topics, ...data.subtopics]));
      const topicList = allTopics.slice(0, 5).join(", ");
      const moreCount = allTopics.length > 5 ? ` +${allTopics.length - 5} more` : "";

      return {
        name,
        score: Math.round(data.score),
        reason: `${data.videos} video${data.videos > 1 ? "s" : ""} covering: ${topicList}${moreCount}`,
        videoCount: data.videos,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  // Generate detailed brand recommendations with fit scores
  const enhancedBrandMap: Record<string, string[]> = {
    Technology: ["Microsoft", "Google", "Adobe", "Notion", "Figma"],
    Software: ["GitHub", "JetBrains", "VS Code", "Atlassian", "MongoDB"],
    SaaS: ["Slack", "Notion", "Airtable", "ClickUp", "monday.com"],
    "Developer Tools": ["GitHub", "GitLab", "Vercel", "Docker", "Postman"],
    "Cloud Services": ["AWS", "Google Cloud", "Azure", "DigitalOcean", "Cloudflare"],
    Gaming: ["Razer", "Logitech G", "HyperX", "SteelSeries", "Corsair"],
    Esports: ["Discord", "Twitch", "Red Bull Gaming", "GFuel", "Scuf Gaming"],
    "Gaming Hardware": ["NVIDIA", "AMD", "ASUS ROG", "MSI", "Alienware"],
    "Health & Fitness": ["Nike Training Club", "Adidas", "MyFitnessPal", "Peloton", "Fitbit"],
    Sports: ["Nike", "Adidas", "Under Armour", "Puma", "Reebok"],
    "Athletic Wear": ["Gymshark", "Lululemon", "Nike", "Adidas", "Fabletics"],
    Beauty: ["Sephora", "Ulta", "Glossier", "Fenty Beauty", "The Ordinary"],
    Cosmetics: ["Maybelline", "L'Oréal", "e.l.f.", "NYX", "ColourPop"],
    Skincare: ["CeraVe", "The Ordinary", "Paula's Choice", "La Roche-Posay", "Neutrogena"],
    "Food & Beverage": ["HelloFresh", "Factor", "Thrive Market", "Athletic Greens", "Magic Spoon"],
    "Meal Kits": ["HelloFresh", "Blue Apron", "Factor", "Sunbasket", "Home Chef"],
    Education: ["Skillshare", "Brilliant", "MasterClass", "Coursera", "Udemy"],
    "E-learning": ["Duolingo", "Babbel", "Rosetta Stone", "Khan Academy", "edX"],
    Fashion: ["Nordstrom", "ASOS", "Stitch Fix", "Revolve", "Zappos"],
    Apparel: ["H&M", "Zara", "Uniqlo", "Everlane", "Patagonia"],
    Finance: ["Credit Karma", "NerdWallet", "Robinhood", "Acorns", "SoFi"],
    FinTech: ["PayPal", "Venmo", "Cash App", "Coinbase", "Stripe"],
    Cryptocurrency: ["Coinbase", "Kraken", "Gemini", "Ledger", "Trezor"],
    Business: ["HubSpot", "Salesforce", "QuickBooks", "Shopify", "Square"],
    Marketing: ["Mailchimp", "Canva", "SEMrush", "Buffer", "Hootsuite"],
    "Productivity Tools": ["Notion", "Todoist", "Evernote", "Trello", "Asana"],
    Music: ["Spotify", "Apple Music", "FL Studio", "Ableton Live", "Native Instruments"],
    "Audio Equipment": ["Audio-Technica", "Shure", "Blue Microphones", "Rode", "Focusrite"],
    Photography: ["Adobe Lightroom", "Canon", "Sony", "Nikon", "Peak Design"],
    "Camera Equipment": ["Sony", "Canon", "Nikon", "Fujifilm", "DJI"],
    "Creative Tools": ["Adobe Creative Cloud", "Canva Pro", "Procreate", "Affinity", "Figma"],
    Automotive: ["Tesla", "Car Gurus", "Carvana", "eBay Motors", "AutoZone"],
    "Home & Garden": ["Wayfair", "Home Depot", "Lowe's", "IKEA", "Amazon Home"],
    Lifestyle: ["Amazon", "Target", "Walmart", "Best Buy", "Costco"],
  };

  const potentialBrands = industries.slice(0, 5).map((industry) => {
    // Calculate brand fit score (out of 10)
    const avgEngagementForIndustry = industryScores[industry.name].score / industryScores[industry.name].videos;
    const videoCountScore = Math.min(industry.videoCount / 5, 2); // Max 2 points for 5+ videos
    const engagementScore = Math.min(avgEngagementForIndustry / 20, 5); // Max 5 points
    const consistencyScore = industry.videoCount > 3 ? 3 : industry.videoCount; // Max 3 points
    const fitScore = (videoCountScore + engagementScore + consistencyScore).toFixed(1);

    // Get relevant comment topics for this industry's videos
    const relevantTopics = Array.from(industryScores[industry.name].topics).slice(0, 3).join(", ");

    return {
      industry: industry.name,
      brandExamples: enhancedBrandMap[industry.name] || enhancedBrandMap["Technology"] || ["Brands in this sector"],
      contentAlignment: `${industry.videoCount} video${industry.videoCount > 1 ? "s" : ""} averaging ${(avgEngagementForIndustry / 10).toFixed(1)}% engagement. Topics: ${relevantTopics}`,
      fitScore: parseFloat(fitScore),
      reasoning: fitScore >= "7" ? "Strong brand fit - consistent content with good engagement" : fitScore >= "5" ? "Moderate brand fit - growing presence in this category" : "Emerging opportunity - continue building content in this space",
    };
  });

  // Analyze content styles
  const formatCounts: Record<string, number> = {};
  const toneCounts: Record<string, number> = {};
  const hookCounts: Record<string, number> = {};
  let totalEngagement = 0;

  videos.forEach((video) => {
    if (video.analysis) {
      formatCounts[video.analysis.format] = (formatCounts[video.analysis.format] || 0) + 1;
      toneCounts[video.analysis.tone] = (toneCounts[video.analysis.tone] || 0) + 1;
      hookCounts[video.analysis.hookType] = (hookCounts[video.analysis.hookType] || 0) + 1;
    }
    totalEngagement += video.engagementRate || 0;
  });

  const avgEngagement = ((totalEngagement / videos.length) * 100).toFixed(2);

  const contentStyles = [
    {
      style: "Most Common Format",
      metric: Object.entries(formatCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A",
      value: `${Object.entries(formatCounts).sort((a, b) => b[1] - a[1])[0]?.[1] || 0} videos`,
      sponsorshipAppeal: "Brands prefer consistent, proven content formats",
    },
    {
      style: "Dominant Tone",
      metric: Object.entries(toneCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A",
      value: `${Object.entries(toneCounts).sort((a, b) => b[1] - a[1])[0]?.[1] || 0} videos`,
      sponsorshipAppeal: "Tone consistency builds brand trust",
    },
    {
      style: "Top Hook Strategy",
      metric: Object.entries(hookCounts).sort((a, b) => b[1] - a[1])[0]?.[0]?.replace("-", " ") || "N/A",
      value: `${Object.entries(hookCounts).sort((a, b) => b[1] - a[1])[0]?.[1] || 0} videos`,
      sponsorshipAppeal: "Strong hooks increase sponsored content performance",
    },
    {
      style: "Engagement Rate",
      metric: `${avgEngagement}%`,
      value: `Across ${videos.length} videos`,
      sponsorshipAppeal: "High engagement attracts premium brand partnerships",
    },
  ];

  // Analyze audience insights from comments with real demographic extraction
  const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
  const intentCounts: Record<string, number> = {};

  // Demographic keyword extraction
  const ageIndicators: Record<string, number> = {};
  const professionIndicators: Record<string, number> = {};
  const skillIndicators: Record<string, number> = {};

  const ageKeywords = {
    "teen/young adult (13-24)": ["school", "college", "student", "homework", "exam", "class", "teen", "young"],
    "young professional (25-34)": ["career", "job", "workplace", "professional", "first job", "entry level", "starting"],
    "established professional (35-49)": ["experience", "senior", "manager", "lead", "director", "expert"],
    "parent/family": ["kid", "children", "family", "parent", "son", "daughter", "baby", "child"],
  };

  const professionKeywords = {
    "developers/engineers": ["developer", "engineer", "coding", "programmer", "tech", "software", "code"],
    "creatives/designers": ["designer", "artist", "creative", "design", "art", "graphic"],
    "business professionals": ["entrepreneur", "business", "manager", "ceo", "founder", "startup"],
    "educators/students": ["teacher", "professor", "instructor", "educator", "student", "learner"],
    "content creators": ["youtuber", "creator", "influencer", "content", "channel", "video maker"],
  };

  const skillKeywords = {
    "beginner": ["beginner", "new", "start", "first time", "learning", "basic", "intro"],
    "intermediate": ["trying", "practicing", "working on", "getting better", "improving"],
    "advanced": ["expert", "advanced", "professional", "master", "years of", "experienced"],
  };

  comments.forEach((comment) => {
    sentimentCounts[comment.sentiment as keyof typeof sentimentCounts]++;
    intentCounts[comment.intent] = (intentCounts[comment.intent] || 0) + 1;

    const commentText = comment.text?.toLowerCase() || "";

    // Extract age indicators
    Object.entries(ageKeywords).forEach(([ageGroup, keywords]) => {
      if (keywords.some(kw => commentText.includes(kw))) {
        ageIndicators[ageGroup] = (ageIndicators[ageGroup] || 0) + 1;
      }
    });

    // Extract profession indicators
    Object.entries(professionKeywords).forEach(([profession, keywords]) => {
      if (keywords.some(kw => commentText.includes(kw))) {
        professionIndicators[profession] = (professionIndicators[profession] || 0) + 1;
      }
    });

    // Extract skill level indicators
    Object.entries(skillKeywords).forEach(([skill, keywords]) => {
      if (keywords.some(kw => commentText.includes(kw))) {
        skillIndicators[skill] = (skillIndicators[skill] || 0) + 1;
      }
    });
  });

  const totalComments = comments.length;
  const positiveRatio = totalComments > 0 ? ((sentimentCounts.positive / totalComments) * 100).toFixed(1) : "0";

  const topIntents = Object.entries(intentCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([intent]) => intent);

  // Build demographic indicators from extracted data
  const demographicIndicators: string[] = [];

  // Add age demographics if found
  const topAgeGroups = Object.entries(ageIndicators)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2);

  if (topAgeGroups.length > 0 && totalComments > 0) {
    const percentages = topAgeGroups.map(([group, count]) => {
      const pct = ((count / totalComments) * 100).toFixed(0);
      return `${group} (${pct}%)`;
    });
    demographicIndicators.push(`Age distribution: ${percentages.join(", ")} based on comment patterns`);
  }

  // Add profession demographics if found
  const topProfessions = Object.entries(professionIndicators)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  if (topProfessions.length > 0 && totalComments > 0) {
    const profList = topProfessions.map(([prof, count]) => {
      const pct = ((count / totalComments) * 100).toFixed(0);
      return `${prof} (${pct}%)`;
    }).join(", ");
    demographicIndicators.push(`Professional segments: ${profList}`);
  }

  // Add skill level distribution
  const totalSkillMentions = Object.values(skillIndicators).reduce((sum, count) => sum + count, 0);
  if (totalSkillMentions > 0) {
    const skillDist = Object.entries(skillIndicators)
      .sort((a, b) => b[1] - a[1])
      .map(([level, count]) => {
        const pct = ((count / totalSkillMentions) * 100).toFixed(0);
        return `${level} ${pct}%`;
      })
      .join(", ");
    demographicIndicators.push(`Skill distribution: ${skillDist} (from comment analysis)`);
  }

  // Add engagement quality indicator
  demographicIndicators.push(`Audience sentiment: ${positiveRatio}% positive, indicating ${parseFloat(positiveRatio) > 70 ? "highly engaged and loyal" : parseFloat(positiveRatio) > 50 ? "engaged" : "mixed"} community`);

  // Add interest clusters from comment topics
  if (topCommentTopics.length > 0) {
    const topInterestsStr = topCommentTopics.slice(0, 3).join(", ");
    demographicIndicators.push(`Primary interests: ${topInterestsStr} (from comment topics)`);
  }

  // Add intent-based insights
  if (topIntents.length > 0) {
    const intentStr = topIntents.join(", ");
    demographicIndicators.push(`Audience behavior: ${intentStr} comments dominate, showing ${topIntents[0] === "question" ? "active learning mindset" : topIntents[0] === "praise" ? "satisfied community" : "engaged participation"}`);
  }

  // If no demographics found, provide helpful message
  if (demographicIndicators.length === 0) {
    demographicIndicators.push("Building demographic insights... Sync more videos and comments for detailed audience analysis");
  }

  const audienceInsights = {
    topInterests: topCommentTopics,
    demographicIndicators,
    engagementPatterns: [
      `${avgEngagement}% average engagement rate${parseFloat(avgEngagement) > 5 ? " (strong performance)" : parseFloat(avgEngagement) > 2 ? " (good performance)" : " (room for growth)"}`,
      `${totalComments} comments across ${videos.length} videos${totalComments > 100 ? " showing active community" : ""}`,
      videos.length > 10 ? `Consistent content production with ${videos.length} videos analyzed` : `Growing content library with ${videos.length} videos`,
      `${sentimentCounts.positive} positive, ${sentimentCounts.neutral} neutral, ${sentimentCounts.negative} negative comments`,
    ],
  };

  return {
    industries,
    potentialBrands,
    contentStyles,
    audienceInsights,
  };
}
