export type GithubContributionDay = {
  date: string;
  contributionCount: number;
};

export type GithubActivity = {
  total: number;
  days: GithubContributionDay[];
};

import { githubClient } from "@/lib/github";

type GithubContributionsResponse = {
  data?: {
    user?: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          weeks: Array<{ contributionDays: GithubContributionDay[] }>;
        };
      };
    };
  };
};

const CONTRIBUTIONS_QUERY = `
  query Contributions($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks { contributionDays { date contributionCount } }
        }
      }
    }
  }
`;

export async function getGithubActivity(): Promise<GithubActivity | null> {
  const login = process.env.GITHUB_USERNAME ?? "kaibelmo";
  if (!githubClient.isConfigured) return null;

  try {
    const payload = await githubClient.requestJson<GithubContributionsResponse>("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: CONTRIBUTIONS_QUERY, variables: { login } }),
      next: { revalidate: 86400 },
    });
    const calendar = payload.data?.user?.contributionsCollection.contributionCalendar;
    if (!calendar) return null;

    return { total: calendar.totalContributions, days: calendar.weeks.flatMap((week) => week.contributionDays) };
  } catch {
    return null;
  }
}
