export function generateGeoRecommendations(insights: any) {

  const results = [];

  const intent = insights?.audience?.primaryIntent || "";
  const skill = insights?.audience?.skillLevel || "";
  const tone = insights?.patterns?.bestTones?.[0]?.tone || "";

  // Education-heavy content → global English audiences
  if (intent.includes("learn") || tone === "educational") {
    results.push({
      country: "United States",
      reason: "Educational content performs strongly in US long-form audience segments.",
      confidence: 0.82
    });

    results.push({
      country: "United Kingdom",
      reason: "High retention for informational and tutorial content.",
      confidence: 0.75
    });
  }

  // Beginner audience → emerging markets
  if (skill === "beginner") {
    results.push({
      country: "India",
      reason: "Large beginner audience segment consuming learning-focused videos.",
      confidence: 0.78
    });

    results.push({
      country: "Philippines",
      reason: "Strong engagement patterns for accessible educational content.",
      confidence: 0.68
    });
  }

  // fallback (IMPORTANT)
  if (results.length === 0) {
    results.push({
      country: "Global English-speaking audience",
      reason: "Based on tone and topic accessibility.",
      confidence: 0.6
    });
  }

  return results;
}
