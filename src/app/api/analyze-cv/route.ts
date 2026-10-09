import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const body = await request.json();

  // Mock CV analysis result
  const analysisResult = {
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    skills: [
      "React",
      "TypeScript",
      "Node.js",
      "Python",
      "AWS",
      "Docker",
      "PostgreSQL",
      "GraphQL",
      "Next.js",
      "Tailwind CSS",
    ],
    experience:
      "5+ years as a Full-Stack Developer at leading tech companies. Led a team of 4 engineers. Shipped 12 production features in 2024.",
    education:
      "B.Sc. Computer Science — Stanford University, 2019. AWS Certified Solutions Architect.",
    summary:
      "Highly skilled full-stack developer with deep expertise in modern JavaScript frameworks and cloud infrastructure. Strong track record of delivering scalable applications and leading cross-functional teams.",
    matchScore: 92,
    parsedFrom: body.filename || "resume.pdf",
  };

  return NextResponse.json(analysisResult);
}
