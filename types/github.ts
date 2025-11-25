interface RepoStars {
    id: string,
    stars: string,
}

export interface GithubStarsResponse extends Array<RepoStars> {}