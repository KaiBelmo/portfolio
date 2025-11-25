export const revalidate = 86400;

import { projects } from "@/data/projects";
import { getUsernameAndRepo } from "@/lib/github";
import { GithubStarsResponse } from "@/types/github";

export async function GET() {
  try {
    const githubInfo = projects.map(p => ({
      id: p.id,
      githubLink: p.githubLink
    }));

    const results: GithubStarsResponse = await Promise.all(
      githubInfo.map(async (repo) => {
        const { userName, repoName } = getUsernameAndRepo(repo.githubLink);

        const res = await fetch(`https://api.github.com/repos/${userName}/${repoName}`, {
          headers: {
            "User-Agent": "Personal-Website",
            "Accept": "application/vnd.github+json"
          }
        });

        const data = await res.json();

        return {
          id: repo.id,
          stars: data.stargazers_count ?? 0
        };
      })
    );

    return Response.json(results);

  } catch (err) {
    console.error("GitHub fetch error:", err);
    return new Response("Failed to fetch GitHub data", { status: 500 });
  }
}
