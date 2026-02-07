import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Heading,
  Text,
  Section,
  Hr,
  Button,
  Link,
} from "@react-email/components";

export function WeeklyInsightsEmailTemplate({
  userName,
  ideas,
  insights = [],
  patterns = [],
  actions = [],
  unsubscribeUrl,
}: {
  userName: string;
  ideas: any[];
  insights?: string[];
  patterns?: string[];
  actions?: string[];
  unsubscribeUrl: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>{`Your weekly creator intelligence - ${ideas.length} new ideas`}</Preview>
      <Body style={{ backgroundColor: "#f8fafc", margin: 0, padding: 0 }}>
        <Container style={container}>
          {/* Header */}
          <Section style={headerSection}>
            <Section style={headerContent}>
              <Heading style={mainTitle}>
                💡 Your Weekly Video Ideas
              </Heading>
              <Text style={subtitle}>
                {ideas.length} ideas to create this week
              </Text>
            </Section>
          </Section>

          {/* Top Ideas Section */}
          <Section style={cardSection}>
            <Heading as="h2" style={sectionHeading}>
              Ideas Ready to Create
            </Heading>

            {ideas.map((idea, idx) => {
              const confidence = Math.round(idea.confidence * 100);
              const engagement = Math.round(idea.predictedEngagement * 100);

              return (
                <Section key={idx} style={ideaCard}>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <div style={rankBadgeContainer}>
                      <Text style={rankBadge}>{String(idx + 1)}</Text>
                    </div>
                    <div style={{ flex: 1 }}>
                      <Text style={ideaTitle}>{idea.title}</Text>
                      <Text style={ideaMeta}>
                        📊 {String(engagement)}% engagement • 🎯 {String(confidence)}% confidence
                      </Text>
                    </div>
                  </div>

                  {/* Why It Works */}
                  {idea.reasoning && (
                    <Section style={reasonSection}>
                      <Text style={reasonTitle}>Why it will work:</Text>
                      {idea.reasoning.commentDemand && (
                        <Text style={bulletPoint}>
                          ✓ {idea.reasoning.commentDemand}
                        </Text>
                      )}
                      {idea.reasoning.pastPerformance && (
                        <Text style={bulletPoint}>
                          ✓ {idea.reasoning.pastPerformance}
                        </Text>
                      )}
                      {idea.reasoning.audienceFit && (
                        <Text style={bulletPoint}>
                          ✓ {idea.reasoning.audienceFit}
                        </Text>
                      )}
                    </Section>
                  )}

                  {/* Suggested Structure */}
                  {idea.suggestedStructure && (
                    <Section style={structureSection}>
                      <Text style={structureTitle}>Content Structure</Text>
                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        {idea.suggestedStructure.format && (
                          <Text style={structureTag}>
                            📹 {idea.suggestedStructure.format}
                          </Text>
                        )}
                        {idea.suggestedStructure.length && (
                          <Text style={structureTag}>
                            ⏱️ {idea.suggestedStructure.length}
                          </Text>
                        )}
                        {idea.suggestedStructure.tone && (
                          <Text style={structureTag}>
                            🎨 {idea.suggestedStructure.tone}
                          </Text>
                        )}
                      </div>
                    </Section>
                  )}
                </Section>
              );
            })}
          </Section>

          {/* CTA Button */}
          <Section style={ctaSection}>
            <Button
              href={`${process.env.NEXT_PUBLIC_APP_URL}/ideas`}
              style={ctaButton}
            >
              View All Ideas in Dashboard
            </Button>
          </Section>

          {/* Footer */}
          <Hr style={divider} />
          <Section style={footerSection}>
            <Text style={footerText}>
              You're receiving this because weekly email insights are enabled in your
              <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/settings`} style={footerLink}>
                {" "}settings{" "}
              </Link>
              .
            </Text>
            <Text style={footerText}>
              <Link href={unsubscribeUrl} style={unsubscribeLink}>
                Unsubscribe from emails
              </Link>
              {" • "}© 2025 CreatorMind. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const container = {
  maxWidth: "600px",
  margin: "0 auto",
  padding: "20px",
  fontFamily:
    'Inter, -apple-system, "Segoe UI", "Helvetica Neue", sans-serif',
};

const headerSection = {
  backgroundColor: "#ffffff",
  borderRadius: "12px 12px 0 0",
  padding: "32px 24px",
  borderBottom: "3px solid #6366f1",
  marginBottom: "0",
};

const headerContent = {
  textAlign: "center" as const,
};

const mainTitle = {
  margin: "0 0 8px 0",
  fontSize: "28px",
  fontWeight: "700",
  color: "#0f172a",
  lineHeight: "1.2",
};

const subtitle = {
  margin: "0",
  fontSize: "16px",
  color: "#475569",
  lineHeight: "1.5",
};

const cardSection = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  padding: "24px",
  marginBottom: "16px",
  border: "1px solid #e2e8f0",
};

const sectionHeading = {
  margin: "0 0 16px 0",
  fontSize: "18px",
  fontWeight: "600",
  color: "#0f172a",
};

const ideaCard = {
  backgroundColor: "#f8fafc",
  borderRadius: "10px",
  padding: "16px",
  marginBottom: "12px",
  border: "1px solid #e2e8f0",
};

const rankBadgeContainer = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const rankBadge = {
  backgroundColor: "#6366f1",
  color: "#ffffff",
  padding: "8px 10px",
  borderRadius: "6px",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0",
  textAlign: "center" as const,
  lineHeight: "1",
  minWidth: "40px",
};

const ideaTitle = {
  margin: "0 0 6px 0",
  fontSize: "15px",
  fontWeight: "600",
  color: "#0f172a",
  lineHeight: "1.4",
};

const ideaMeta = {
  margin: "0",
  fontSize: "12px",
  color: "#64748b",
  lineHeight: "1.4",
};

const reasonSection = {
  marginTop: "12px",
  paddingTop: "12px",
  borderTop: "1px solid #e2e8f0",
};

const reasonTitle = {
  margin: "0 0 8px 0",
  fontSize: "13px",
  fontWeight: "600",
  color: "#0f172a",
};

const bulletPoint = {
  margin: "0 0 6px 0",
  fontSize: "13px",
  color: "#334155",
  lineHeight: "1.5",
};

const structureSection = {
  marginTop: "12px",
  paddingTop: "12px",
  borderTop: "1px solid #e2e8f0",
};

const structureTitle = {
  margin: "0 0 8px 0",
  fontSize: "13px",
  fontWeight: "600",
  color: "#0f172a",
};

const structureTag = {
  display: "inline-block",
  backgroundColor: "#e2e8f0",
  padding: "4px 8px",
  borderRadius: "4px",
  fontSize: "12px",
  color: "#334155",
  margin: "0",
};

const ctaSection = {
  textAlign: "center" as const,
  padding: "24px",
};

const ctaButton = {
  backgroundColor: "#6366f1",
  color: "#ffffff",
  padding: "12px 32px",
  borderRadius: "8px",
  textDecoration: "none",
  fontSize: "14px",
  fontWeight: "600",
  display: "inline-block",
};

const divider = {
  borderColor: "#e2e8f0",
  borderTop: "1px solid #e2e8f0",
  margin: "12px 0",
};

const footerSection = {
  textAlign: "center" as const,
  padding: "20px 24px",
};

const footerText = {
  margin: "0 0 8px 0",
  fontSize: "12px",
  color: "#64748b",
  lineHeight: "1.5",
};

const footerLink = {
  color: "#6366f1",
  textDecoration: "underline",
};

const unsubscribeLink = {
  color: "#6366f1",
  textDecoration: "underline",
};