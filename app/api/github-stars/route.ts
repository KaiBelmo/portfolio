export const revalidate = 86400;
export const runtime = "nodejs";

import { projects } from "@/data/projects";
import { githubClient, getUsernameAndRepo } from "@/lib/github";
import { GithubStarsResponse } from "@/types/github";

export async function GET() {
  try {
    const results: GithubStarsResponse = await Promise.all(
      projects.map(async (p) => {
        try {
          const { userName, repoName } = getUsernameAndRepo(p.githubLink);

          const data = await githubClient.requestJson<{ stargazers_count?: number }>(
            `https://api.github.com/repos/${userName}/${repoName}`,
            { next: { revalidate: 86400 } },
          );
          return {
            id: p.id,
            stars: typeof data.stargazers_count === "number"
              ? data.stargazers_count.toString()
              : null,
            status: "success" as const,
          };
        } catch (error) {
          return {
            id: p.id,
            stars: p.stars ?? null,
            status: resStatus(error),
          };
        }
      })
    );

    return Response.json(results, {
      headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600" },
    });
  } catch (err) {
    console.error("GitHub fetch error:", err);
    return Response.json(
      projects.map((p) => ({ id: p.id, stars: p.stars ?? null, status: "unavailable" })),
      { headers: { "Cache-Control": "public, s-maxage=300" } }
    );
  }
}

function resStatus(error: unknown): "missing" | "failed" {
  const message = error instanceof Error ? error.message : "";
  return message.includes("404") ? "missing" : "failed";
}
