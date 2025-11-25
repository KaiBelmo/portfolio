// File: app/_components/FeatureWithLinks.tsx
import React from "react";
import Link from "next/link";
import { parsePullRequestNumbers, fetchPR } from "@/lib/github";

interface FeatureWithLinksProps {
  feature: string;
  githubLink?: string;
}

export default async function FeatureWithLinks({
  feature,
  githubLink,
}: FeatureWithLinksProps) {
  const prNumbers = parsePullRequestNumbers([feature]);

  if (prNumbers.length === 0 || !githubLink) {
    return <span className="pl-2">{feature}</span>;
  }

  let prLinks: string[];
  try {
    prLinks = fetchPR(prNumbers, githubLink);
  } catch (error) {
    console.error("Failed to parse GitHub link or fetch PRs:", error);
    return <span className="pl-2">{feature}</span>;
  }

  const prMap = new Map<string, string>();
  prNumbers.forEach((num, index) => {
    prMap.set(num.toString(), prLinks[index]);
  });

  const parts = feature.split(/(#\d+)/g);

  return (
    <span className="pl-2">
      {parts.map((part, index) => {
        const prRegex = /#(\d+)/;
        const match = part.match(prRegex);

        if (match) {
          const prNumber = match[1]; // e.g., "47"
          const link = prMap.get(prNumber);

          if (link) {
            return (
              <Link
                key={index}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium"
              >
                {part}
              </Link>
            );
          }
        }

        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
}