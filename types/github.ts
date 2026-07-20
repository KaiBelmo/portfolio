interface RepoStars {
    id: string,
    stars: string | null,
    status: "success" | "missing" | "failed" | "unavailable",
}

export interface GithubStarsResponse extends Array<RepoStars> {}
