export const revalidate = 86400; 

import { projects } from "@/data/projects";
import { getUsernameAndRepo } from "@/lib/github";
// import { GithubStarsResponse } from "@/types/github";
import { GithubStarsResponse } from "@/types/github";

export async function FetchGithubStars() {
  try {
    const githubInfo = projects.map(p => ({
      id: p.id,
      githubLink: p.githubLink
    }));

    const results: GithubStarsResponse = await Promise.all(
      githubInfo.map(async (repo) => {
        const {userName, repoName} = getUsernameAndRepo(repo.githubLink);
        console.log("https://api.github.com/repos/${username}/${repoName}");
        console.log(`https://api.github.com/repos/${userName}/${repoName}`);
        console.log("https://api.github.com/repos/${username}/${repoName}");
        
        const res = await fetch(`https://api.github.com/repos/${userName}/${repoName}`, {
          headers: {
            "User-Agent": "Personal-Website",
            "Accept": "application/vnd.github+json"
          }
        });

        if (!res.ok) {
          console.error(`GitHub API failed for ${repo.id}: ${res.status}`);
        }

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
