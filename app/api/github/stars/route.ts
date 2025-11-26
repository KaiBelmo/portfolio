export const revalidate = 86400;

import { projects } from "@/data/projects";
import { getUsernameAndRepo } from "@/lib/github";
import { GithubStarsResponse } from "@/types/github";

export async function GET() {
  try {
    const githubInfo = projects.map(p => ({
      id: p.id,
      githubLink: p.githubLink,
      localStars: p.stars ? parseInt(p.stars) : 0
    }));

    const results: GithubStarsResponse = await Promise.all(
      githubInfo.map(async (repo) => {
        try {
          const { userName, repoName } = getUsernameAndRepo(repo.githubLink);

          const res = await fetch(`https://api.github.com/repos/${userName}/${repoName}`, {
            headers: {
              "User-Agent": "Personal-Website",
              "Accept": "application/vnd.github+json"
            },
            next: { revalidate: 3600 * 24 } // Cache for 1 hour
          });

          if (!res.ok) {
            throw new Error(`GitHub API returned ${res.status}`);
          }

          const data = await res.json();
          
          return {
            id: repo.id,
            stars: data.stargazers_count?.toString() || repo.localStars.toString()
          };
        } catch (error) {
          console.error(`Error fetching stars for ${repo.id}:`, error);
          // Return local stars as fallback
          return {
            id: repo.id,
            stars: repo.localStars.toString()
          };
        }
      })
    );

    return Response.json(results);

  } catch (err) {
    console.error("GitHub fetch error:", err);
    // Return local stars for all projects if there's a global error
    const fallbackResults = projects.map(project => ({
      id: project.id,
      stars: project.stars || "0"
    }));
    return Response.json(fallbackResults);
  }
}
